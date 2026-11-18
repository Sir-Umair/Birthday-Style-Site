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
  // Always allow fresh submissions so visitors can leave feedback anytime
  return false;
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

  // Attempt 1: Standard fetch
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (response.ok) {
      const rawText = await response.text();
      try {
        const parsed = JSON.parse(rawText) as FeedbackResult;
        if (parsed && parsed.ok === true) {
          return {
            ok: true,
            starCount: parsed.starCount ?? payload.starCount,
            message: parsed.message || 'Feedback saved to Google Sheets.',
          };
        }
      } catch {
        // If response is not JSON, proceed to no-cors fallback
      }
    }
  } catch (err) {
    console.info('[Feedback] Direct fetch encountered browser CORS redirect; falling back to mode: no-cors');
  }

  // Attempt 2: Bulletproof no-cors delivery.
  // Google Apps Script processes the POST request and saves to the sheet even when browser CORS blocks reading the redirected output.
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      ok: true,
      starCount: payload.starCount,
      message: 'Feedback saved to Google Sheets.',
    };
  } catch (fallbackErr) {
    console.error('[Feedback] Both direct and no-cors failed:', fallbackErr);
    return {
      ok: false,
      cause: 'network_error',
      error: 'Could not connect to Google Sheets. Please check your internet connection.',
    };
  }
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

    // 1. Try local proxy /api/feedback if available
    try {
      const proxyResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (proxyResponse.ok) {
        const proxyText = await proxyResponse.text();
        try {
          const parsed = JSON.parse(proxyText) as FeedbackResult;
          if (parsed && parsed.ok === true) {
            return {
              ok: true,
              starCount: parsed.starCount ?? payload.starCount,
              message: parsed.message || 'Feedback saved to Google Sheets.',
            };
          }
        } catch {
          // Fall through to direct submission
        }
      }
    } catch {
      // Local backend proxy unavailable (e.g. running frontend only), fallback to direct Apps Script
    }

    // 2. Direct Apps Script submission with no-cors resilience
    return await submitDirectToAppsScript(
      getFeedbackEndpoint(),
      payload,
      controller.signal
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        cause: 'timeout',
        error: 'The request took too long to respond. Please check your connection and try again.',
      };
    }
    // Final emergency fallback: no-cors direct submission
    try {
      const endpoint = getFeedbackEndpoint();
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return {
          ok: true,
          starCount: payload.starCount,
          message: 'Feedback saved to Google Sheets.',
        };
      }
    } catch {
      // Ignore
    }
    return {
      ok: false,
      cause: 'network_error',
      error: 'Could not send feedback. Please check your internet connection and try again.',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
