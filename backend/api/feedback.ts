const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwA_UIImBh_HSjgBAqoLYjgYW-ttEAT16_6c_x7bqm6D-5RrNw9qyqkR3MWE7FBaPkGcQ/exec';

interface VercelRequestLike {
  method?: string;
  body?: unknown;
}

interface VercelResponseLike {
  status: (code: number) => VercelResponseLike;
  json: (payload: unknown) => void;
}

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
    if (candidate && isValidAppsScriptExecUrl(candidate)) {
      return candidate;
    }
  }
  return DEFAULT_APPS_SCRIPT_URL;
}

function diagnoseHtmlResponse(html: string, finalUrl: string): { cause: string; message: string } {
  if (html.includes('Script function not found: doPost')) {
    return {
      cause: 'missing_doPost',
      message:
        'Apps Script deployment is missing doPost(e). Open Extensions → Apps Script, paste google-apps-script/Code.gs, save, and deploy a New version under Deploy → Manage deployments.',
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
        'Google authorization error: Apps Script Web App access is not set to "Anyone". Redeploy with Execute as: "Me" and Who has access: "Anyone".',
    };
  }
  return {
    cause: 'unexpected_html_response',
    message:
      'Apps Script returned an HTML page instead of JSON. Check Apps Script → Executions logs and redeploy Code.gs.',
  };
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, cause: 'method_not_allowed', error: 'Method not allowed.' });
    return;
  }

  let rawBody = req.body;
  if (typeof rawBody === 'string') {
    try {
      rawBody = JSON.parse(rawBody);
    } catch {
      res.status(400).json({ ok: false, cause: 'invalid_json', error: 'Invalid JSON request.' });
      return;
    }
  }

  const body = (rawBody || {}) as {
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
    const upstream = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ starCount, feedback, madeMeSmile }),
      signal: controller.signal,
    });

    const rawText = await upstream.text();
    if (!upstream.ok) {
      res.status(502).json({
        ok: false,
        cause: `http_${upstream.status}`,
        error: `Google Apps Script returned HTTP ${upstream.status}.`,
      });
      return;
    }

    let parsed: { ok?: boolean; error?: string; message?: string; cause?: string; starCount?: number } | null = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const diag = diagnoseHtmlResponse(rawText, upstream.url);
      res.status(502).json({ ok: false, cause: diag.cause, error: diag.message });
      return;
    }

    if (!parsed || parsed.ok !== true) {
      res.status(400).json({
        ok: false,
        cause: parsed?.cause || 'apps_script_error',
        error: parsed?.error || 'Apps Script did not confirm saving the feedback.',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      starCount: parsed.starCount ?? starCount,
      message: parsed.message || 'Feedback saved to Google Sheets.',
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    res.status(502).json({
      ok: false,
      cause: isTimeout ? 'timeout' : 'network_error',
      error: isTimeout
        ? 'Google Apps Script timed out before confirming.'
        : 'Could not connect to Google Apps Script.',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
