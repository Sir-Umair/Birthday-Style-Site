import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwA_UIImBh_HSjgBAqoLYjgYW-ttEAT16_6c_x7bqm6D-5RrNw9qyqkR3MWE7FBaPkGcQ/exec';

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isValidAppsScriptExecUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (parsed.hostname === 'docs.google.com' || parsed.hostname.endsWith('.docs.google.com')) {
      return false;
    }
    if (parsed.hostname === 'script.google.com' && !parsed.pathname.endsWith('/exec')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function resolveAppsScriptEndpoint(): string {
  const candidates = [
    stripQuotes(process.env.VITE_FEEDBACK_API_URL || ''),
    stripQuotes(process.env.NEXT_PUBLIC_FEEDBACK_API_URL || ''),
    DEFAULT_APPS_SCRIPT_URL,
  ];
  for (const candidate of candidates) {
    if (candidate && !isValidAppsScriptExecUrl(candidate)) {
      console.warn(
        `[Feedback Proxy] Ignoring invalid endpoint candidate "${candidate}". Expected Apps Script .../exec URL.`
      );
      continue;
    }
    if (candidate) return candidate;
  }
  return DEFAULT_APPS_SCRIPT_URL;
}

function diagnoseHtmlResponse(html: string, finalUrl: string): { cause: string; message: string } {
  if (html.includes('Script function not found: doPost')) {
    return {
      cause: 'missing_doPost',
      message:
        'Apps Script deployment is missing doPost(e). Open your Google Sheet → Extensions → Apps Script, paste google-apps-script/Code.gs, save, and publish a New version under Deploy → Manage deployments.',
    };
  }
  if (
    finalUrl.includes('accounts.google.com') ||
    html.includes('ServiceLogin') ||
    html.includes('accounts.google.com')
  ) {
    return {
      cause: 'authorization_required',
      message:
        'Google authorization error: Apps Script Web App access is not set to "Anyone". In Apps Script, click Deploy → Manage deployments → Edit, set Execute as: "Me" and Who has access: "Anyone", then deploy a New version.',
    };
  }
  if (html.includes('Page not found') || html.includes('Sorry, unable to open the file')) {
    return {
      cause: 'invalid_endpoint',
      message:
        'Apps Script URL could not be opened. Verify the Web App deployment URL ends in /exec and still exists.',
    };
  }
  return {
    cause: 'unexpected_html_response',
    message:
      'Apps Script returned an HTML page instead of JSON. Check Apps Script → Executions logs and redeploy Code.gs as a Web App.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/feedback', async (req, res) => {
    const body = (req.body || {}) as {
      starCount?: unknown;
      feedback?: unknown;
      madeMeSmile?: unknown;
    };

    const starCount =
      typeof body.starCount === 'number'
        ? body.starCount
        : Number(String(body.starCount ?? '').trim());
    const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
    const madeMeSmile = typeof body.madeMeSmile === 'string' ? body.madeMeSmile.trim() : '';

    if (!Number.isInteger(starCount) || starCount < 1 || starCount > 5) {
      res.status(400).json({
        ok: false,
        cause: 'invalid_payload',
        error: 'Star_Count must be an integer between 1 and 5.',
      });
      return;
    }

    if (!feedback || feedback.length > 1500) {
      res.status(400).json({
        ok: false,
        cause: 'invalid_payload',
        error: 'Feedback message must be between 1 and 1500 characters.',
      });
      return;
    }

    const endpoint = resolveAppsScriptEndpoint();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.info('[Feedback Proxy] Forwarding POST to Apps Script:', endpoint);
      const upstream = await fetch(endpoint, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          starCount,
          feedback,
          madeMeSmile,
        }),
        signal: controller.signal,
      });

      const rawText = await upstream.text();

      if (!upstream.ok) {
        console.error(
          `[Feedback Proxy] Upstream HTTP error ${upstream.status} from ${upstream.url}:`,
          rawText.slice(0, 300)
        );
        res.status(502).json({
          ok: false,
          cause: `http_${upstream.status}`,
          error: `Google Apps Script returned HTTP ${upstream.status}. Check deployment permissions and URL.`,
        });
        return;
      }

      let parsed: { ok?: boolean; error?: string; message?: string; cause?: string; starCount?: number } | null = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const diag = diagnoseHtmlResponse(rawText, upstream.url);
        console.error(
          `[Feedback Proxy] Non-JSON response (${diag.cause}) from ${upstream.url}:`,
          rawText.slice(0, 300)
        );
        res.status(502).json({
          ok: false,
          cause: diag.cause,
          error: diag.message,
        });
        return;
      }

      if (!parsed || parsed.ok !== true) {
        console.error('[Feedback Proxy] Apps Script reported failure:', parsed);
        res.status(400).json({
          ok: false,
          cause: parsed?.cause || 'apps_script_error',
          error: parsed?.error || 'Apps Script did not confirm saving the feedback.',
        });
        return;
      }

      console.info('[Feedback Proxy] Confirmed insertion in Google Sheets:', parsed);
      res.status(200).json({
        ok: true,
        starCount: parsed.starCount ?? starCount,
        message: parsed.message || 'Feedback saved to Google Sheets.',
      });
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      console.error('[Feedback Proxy] Network/fetch error calling Apps Script:', err);
      res.status(502).json({
        ok: false,
        cause: isTimeout ? 'timeout' : 'network_error',
        error: isTimeout
          ? 'Google Apps Script timed out before confirming. Please try again.'
          : 'Could not connect to Google Apps Script from the server. Please try again.',
      });
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
