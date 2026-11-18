/**
 * Google Apps Script Backend for Baybo's Birthday Surprise
 * Sheet columns: | Timestamp | Star_Count | Feedback | Made_Me_Smile |
 *
 * Deployment steps:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this entire file into Code.gs and save.
 * 3. Click Deploy -> Manage deployments (or New deployment) -> Web app.
 * 4. Execute as: "Me" | Who has access: "Anyone".
 * 5. Copy the .../exec Web App URL into NEXT_PUBLIC_FEEDBACK_API_URL.
 */

var SHEET_NAME = 'Feedback';
var HEADERS = ['Timestamp', 'Star_Count', 'Feedback', 'Made_Me_Smile'];
var ALLOWED_SMILE_OPTIONS = [
  '',
  'Yes 💗',
  'Of course! ✨',
  'Definitely! 🎀',
  'Yes',
  'Of course!',
  'Definitely!',
];
var MAX_FEEDBACK_LENGTH = 1500;
var DUPLICATE_WINDOW_SECONDS = 300;
var BURST_LIMIT_PER_MINUTE = 10;

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCellText(value) {
  var str = String(value || '').trim();
  // Prevent spreadsheet formula injection (=, +, -, @, tab, carriage return)
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function isValidStarInteger(value) {
  return (
    typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value &&
    value >= 1 &&
    value <= 5
  );
}

function getOrCreateFeedbackSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No active Google Spreadsheet bound to this Apps Script project.');
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0] || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.setName(SHEET_NAME);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  }

  var existingWidth = Math.max(sheet.getLastColumn(), HEADERS.length);
  var firstRow = sheet.getRange(1, 1, 1, existingWidth).getValues()[0];
  if (firstRow[1] !== 'Star_Count') {
    if (firstRow[0] === 'Timestamp' && firstRow[1] === 'Rating') {
      sheet.getRange(1, 2).setValue('Star_Count');
    } else {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doGet() {
  console.log('[Feedback] GET health check invoked');
  return jsonResponse({
    ok: true,
    status: 'Baybo birthday feedback endpoint is active.',
    columns: HEADERS,
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.error('[Feedback] Could not acquire ScriptLock within 10s');
    return jsonResponse({
      ok: false,
      cause: 'lock_timeout',
      error: 'Server is busy. Please try again in a moment.',
    });
  }

  try {
    var rawBody = '';
    if (e && e.postData && typeof e.postData.contents === 'string' && e.postData.contents.trim()) {
      rawBody = e.postData.contents;
    } else if (e && e.parameter && typeof e.parameter.payload === 'string') {
      rawBody = e.parameter.payload;
    }

    if (!rawBody) {
      console.error('[Feedback] Empty POST request body');
      return jsonResponse({
        ok: false,
        cause: 'empty_body',
        error: 'Empty request body.',
      });
    }

    var body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('[Feedback] Invalid JSON payload: ' + parseErr);
      return jsonResponse({
        ok: false,
        cause: 'invalid_json',
        error: 'Invalid JSON payload.',
      });
    }

    // Star_Count is the authoritative numeric rating field (integer 1..5).
    var hasStarCount = body.starCount !== undefined && body.starCount !== null && body.starCount !== '';
    var hasLegacyRating = body.rating !== undefined && body.rating !== null && body.rating !== '';

    var rawStarCount = hasStarCount ? body.starCount : body.rating;
    var starCount =
      typeof rawStarCount === 'number'
        ? rawStarCount
        : Number(String(rawStarCount || '').trim());

    if (!isValidStarInteger(starCount)) {
      console.error('[Feedback] Invalid Star_Count received: ' + rawStarCount);
      return jsonResponse({
        ok: false,
        cause: 'invalid_star_count',
        error: 'Star_Count must be a numeric integer between 1 and 5.',
      });
    }

    if (hasStarCount && hasLegacyRating) {
      var legacyNumeric = Number(String(body.rating).trim());
      if (!isValidStarInteger(legacyNumeric) || legacyNumeric !== starCount) {
        console.error('[Feedback] Conflicting rating fields: starCount=' + starCount + ', rating=' + body.rating);
        return jsonResponse({
          ok: false,
          cause: 'conflicting_rating',
          error: 'Conflicting rating values received; Star_Count is authoritative.',
        });
      }
    }

    var feedbackRaw = typeof body.feedback === 'string' ? body.feedback.trim() : '';
    var madeMeSmile = typeof body.madeMeSmile === 'string' ? body.madeMeSmile.trim() : '';

    if (!feedbackRaw) {
      console.error('[Feedback] Empty feedback message rejected');
      return jsonResponse({
        ok: false,
        cause: 'empty_feedback',
        error: 'Feedback message cannot be empty.',
      });
    }

    if (feedbackRaw.length > MAX_FEEDBACK_LENGTH) {
      console.error('[Feedback] Feedback exceeded max length: ' + feedbackRaw.length);
      return jsonResponse({
        ok: false,
        cause: 'feedback_too_long',
        error: 'Feedback exceeds maximum length of ' + MAX_FEEDBACK_LENGTH + ' characters.',
      });
    }

    if (ALLOWED_SMILE_OPTIONS.indexOf(madeMeSmile) === -1) {
      console.error('[Feedback] Invalid Made_Me_Smile value: ' + madeMeSmile);
      return jsonResponse({
        ok: false,
        cause: 'invalid_smile_option',
        error: 'Invalid selection for Made_Me_Smile.',
      });
    }

    // Basic abuse & duplicate submission protection via ScriptCache (no PII stored)
    var cache = CacheService.getScriptCache();

    var burstCount = Number(cache.get('burst_count') || '0');
    if (burstCount >= BURST_LIMIT_PER_MINUTE) {
      console.warn('[Feedback] Burst rate limit reached');
      return jsonResponse({
        ok: false,
        cause: 'rate_limited',
        error: 'Too many requests right now. Please wait a minute and retry.',
      });
    }
    cache.put('burst_count', String(burstCount + 1), 60);

    var contentDigest = Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        starCount + '|' + feedbackRaw.toLowerCase() + '|' + madeMeSmile
      )
    ).slice(0, 32);

    var digestKey = 'dup_' + contentDigest;
    if (cache.get(digestKey)) {
      console.warn('[Feedback] Duplicate submission blocked for digest: ' + contentDigest);
      return jsonResponse({
        ok: false,
        cause: 'duplicate_submission',
        error: 'Duplicate feedback detected. Your previous note is already saved!',
      });
    }
    cache.put(digestKey, '1', DUPLICATE_WINDOW_SECONDS);

    var sheet = getOrCreateFeedbackSheet();
    var timestamp = new Date().toISOString();

    sheet.appendRow([
      timestamp,
      starCount,
      sanitizeCellText(feedbackRaw),
      sanitizeCellText(madeMeSmile || 'Not answered'),
    ]);

    console.log(
      '[Feedback] Row appended successfully -> sheet="' +
        sheet.getName() +
        '", row=' +
        sheet.getLastRow() +
        ', Star_Count=' +
        starCount
    );

    return jsonResponse({
      ok: true,
      starCount: starCount,
      rowNumber: sheet.getLastRow(),
      message: 'Feedback saved to Google Sheets.',
    });
  } catch (err) {
    console.error('[Feedback] Unhandled Apps Script error: ' + (err && err.stack ? err.stack : err));
    return jsonResponse({
      ok: false,
      cause: 'apps_script_exception',
      error: 'Unable to save feedback right now: ' + String(err && err.message ? err.message : err),
    });
  } finally {
    lock.releaseLock();
  }
}
