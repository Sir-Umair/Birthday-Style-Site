import { birthdayConfig } from '../config/birthday';

export interface FeedbackPayload {
  starCount: number;
  feedback: string;
  madeMeSmile: string;
}

export interface FeedbackResult {
  ok: boolean;
  starCount?: number;
  cause?: string;
  message?: string;
  error?: string;
}

const SUBMITTED_STORAGE_KEY = 'baybo_birthday_feedback_submitted_v1';
const LAST_SUBMIT_HASH_KEY = 'baybo_birthday_feedback_hash_v1';
const MAX_FEEDBACK_LENGTH = 1500;

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isValidAppsScriptUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
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

export function getFeedbackEndpoint(): string {
  const viteUrl = stripWrappingQuotes(import.meta.env.VITE_FEEDBACK_API_URL || '');
  const nextPublicUrl = stripWrappingQuotes(import.meta.env.NEXT_PUBLIC_FEEDBACK_API_URL || '');
  const configUrl = stripWrappingQuotes(birthdayConfig.feedback.apiUrl || '');

  const candidates = [viteUrl, nextPublicUrl, configUrl];
  const validEndpoint = candidates.find(isValidAppsScriptUrl);
  if (validEndpoint) return validEndpoint;

  return viteUrl || nextPublicUrl || configUrl || '';
}

function hashPayload(starCount: number, feedback: string, madeMeSmile: string): string {
  const raw = `${starCount}|${feedback.trim().toLowerCase()}|${madeMeSmile}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function hasAlreadySubmittedFeedback(): boolean {
  try {
    return window.sessionStorage.getItem(SUBMITTED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function clearSubmittedFlagForTesting(): void {
  try {
    window.sessionStorage.removeItem(SUBMITTED_STORAGE_KEY);
    window.sessionStorage.removeItem(LAST_SUBMIT_HASH_KEY);
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function validateFeedbackInput(input: {
  starCount: number;
  feedback: string;
  madeMeSmile: string;
}): string | null {
  if (!Number.isInteger(input.starCount) || input.starCount < 1 || input.starCount > 5) {
    return 'Please tap a star rating from 1 to 5 before sending.';
  }

  const trimmed = input.feedback.trim();
  if (!trimmed) {
    return 'Please write a short note so I know what you thought.';
  }

  if (trimmed.length > MAX_FEEDBACK_LENGTH) {
    return `Please keep your message under ${MAX_FEEDBACK_LENGTH} characters.`;
  }

  return null;
}

function markSessionSubmitted(payloadHash: string): void {
  try {
    window.sessionStorage.setItem(SUBMITTED_STORAGE_KEY, 'true');
    window.sessionStorage.setItem(LAST_SUBMIT_HASH_KEY, payloadHash);
  } catch {
    // Ignore storage errors
  }
}

async function submitDirectToAppsScript(
  endpoint: string,
  payload: FeedbackPayload,
  signal: AbortSignal
): Promise<FeedbackResult> {
  if (!endpoint) {
    return {
      ok: false,
      cause: 'missing_endpoint',
      error:
        "Feedback delivery isn't connected yet. Once the Google Sheet link is added, your note will go straight through!",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(endpoint);
  } catch {
    return {
      ok: false,
      cause: 'invalid_endpoint',
      error: 'Invalid feedback endpoint URL format.',
    };
  }

  if (parsedUrl.hostname === 'docs.google.com' || parsedUrl.hostname.endsWith('.docs.google.com')) {
    return {
      ok: false,
      cause: 'sheet_url_instead_of_exec',
      error:
        'That link points to a Google Sheet instead of the Apps Script Web App. Open Extensions → Apps Script → Deploy → Web app and use the .../exec URL.',
    };
  }

  if (parsedUrl.hostname === 'script.google.com' && !parsedUrl.pathname.endsWith('/exec')) {
    return {
      ok: false,
      cause: 'non_exec_apps_script_url',
      error: 'Apps Script Web App URL must end with /exec.',
    };
  }

  // text/plain avoids CORS preflight OPTIONS requests, which Google Apps Script does not serve,
  // while following the Apps Script 302 redirect to read the confirmed JSON response.
  const response = await fetch(endpoint, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    console.error('[Feedback] Direct Apps Script HTTP error:', response.status, response.url);
    return {
      ok: false,
      cause: `http_${response.status}`,
      error: `Could not reach the feedback sheet (status ${response.status}). Please try again.`,
    };
  }

  const rawText = await response.text();
  let parsed: FeedbackResult | null = null;
  try {
    parsed = JSON.parse(rawText) as FeedbackResult;
  } catch {
    if (rawText.includes('Script function not found: doPost')) {
      return {
        ok: false,
        cause: 'missing_doPost',
        error:
          'Apps Script deployment is missing doPost(e). Paste google-apps-script/Code.gs into Apps Script, save, and deploy a New version.',
      };
    }
    return {
      ok: false,
      cause: 'unexpected_response',
      error: 'Received an unexpected response from Google Apps Script.',
    };
  }

  if (!parsed || parsed.ok !== true) {
    return {
      ok: false,
      cause: parsed?.cause || 'apps_script_error',
      error: parsed?.error || 'Submission could not be confirmed by Google Apps Script.',
    };
  }

  return {
    ok: true,
    starCount: parsed.starCount ?? payload.starCount,
    message: parsed.message || 'Feedback saved to Google Sheets.',
  };
}

export async function submitFeedback(input: {
  starCount: number;
  feedback: string;
  madeMeSmile: string;
}): Promise<FeedbackResult> {
  const validationError = validateFeedbackInput(input);
  if (validationError) {
    return { ok: false, cause: 'validation_error', error: validationError };
  }

  const payloadHash = hashPayload(input.starCount, input.feedback, input.madeMeSmile);
  try {
    if (
      window.sessionStorage.getItem(SUBMITTED_STORAGE_KEY) === 'true' &&
      window.sessionStorage.getItem(LAST_SUBMIT_HASH_KEY) === payloadHash
    ) {
      return {
        ok: false,
        cause: 'duplicate_submission',
        error: 'Your feedback was already sent! Thank you for sharing it.',
      };
    }
  } catch {
    // Continue if sessionStorage is unavailable
  }

  const payload: FeedbackPayload = {
    starCount: input.starCount,
    feedback: input.feedback.trim(),
    madeMeSmile: input.madeMeSmile.trim(),
  };

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 16000);

  try {
    console.info('[Feedback] Submitting payload:', {
      starCount: payload.starCount,
      feedbackLength: payload.feedback.length,
      madeMeSmile: payload.madeMeSmile || '(not answered)',
    });

    // Prefer same-origin /api/feedback proxy so Google Apps Script redirects and HTML errors
    // (which omit CORS headers) are accurately diagnosed rather than failing with opaque TypeError.
    let proxyResponse = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let proxyText = await proxyResponse.text();

    // If AI Studio's preview gateway returned the temporary "Starting Server..." splash page,
    // wait briefly and retry /api/feedback once.
    if (
      proxyResponse.ok &&
      (proxyText.includes('<title>Starting Server...</title>') ||
        proxyText.trimStart().startsWith('<!doctype html') ||
        proxyText.trimStart().startsWith('<html'))
    ) {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      proxyResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      proxyText = await proxyResponse.text();
    }

    const isHtmlResponse =
      proxyText.trimStart().startsWith('<!doctype html') ||
      proxyText.trimStart().startsWith('<html');

    if (proxyResponse.status === 404 || proxyResponse.status === 405 || isHtmlResponse) {
      console.info('[Feedback] /api/feedback unavailable; falling back to direct Apps Script POST');
      const directResult = await submitDirectToAppsScript(
        getFeedbackEndpoint(),
        payload,
        controller.signal
      );
      if (directResult.ok) {
        markSessionSubmitted(payloadHash);
      } else {
        console.warn('[Feedback] Direct Apps Script failure:', directResult.cause, directResult.error);
      }
      return directResult;
    }

    let parsed: FeedbackResult | null = null;
    try {
      parsed = JSON.parse(proxyText) as FeedbackResult;
    } catch {
      console.warn('[Feedback] Unexpected non-JSON response from /api/feedback:', proxyResponse.status);
      return {
        ok: false,
        cause: `proxy_invalid_json_${proxyResponse.status}`,
        error: 'The feedback server is still starting up. Please tap retry in a moment.',
      };
    }

    if (!proxyResponse.ok || !parsed || parsed.ok !== true) {
      console.warn('[Feedback] Submission failed:', {
        httpStatus: proxyResponse.status,
        cause: parsed?.cause,
        error: parsed?.error,
      });
      return {
        ok: false,
        cause: parsed?.cause || `http_${proxyResponse.status}`,
        error: parsed?.error || `Could not save feedback (status ${proxyResponse.status}).`,
      };
    }

    console.info('[Feedback] Confirmed saved to Google Sheets:', parsed);
    markSessionSubmitted(payloadHash);
    return {
      ok: true,
      starCount: parsed.starCount ?? payload.starCount,
      message: parsed.message || 'Feedback saved to Google Sheets.',
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('[Feedback] Request timed out after 16s');
      return {
        ok: false,
        cause: 'timeout',
        error: 'The request took too long to respond. Please check your connection and try again.',
      };
    }
    console.warn(
      '[Feedback] Network or CORS error during submission. When calling Apps Script directly, HTML error responses omit Access-Control-Allow-Origin headers:',
      err
    );
    return {
      ok: false,
      cause: 'network_or_cors_error',
      error:
        'Could not confirm delivery to Google Sheets (network or CORS restriction). Verify your Apps Script deployment has Code.gs saved and published as a New version.',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
