/**
 * Google Apps Script Backend for Birthday Surprise Feedback
 * Sheet columns: | Timestamp | Star_Count | Feedback | Made_Me_Smile |
 */

var SHEET_NAME = 'Feedback';
var HEADERS = ['Timestamp', 'Star_Count', 'Feedback', 'Made_Me_Smile'];

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCellText(value) {
  var str = String(value || '').trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function getOrCreateFeedbackSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No active Google Spreadsheet found. Make sure this script was opened from Extensions -> Apps Script inside a Google Sheet.');
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doGet() {
  return jsonResponse({
    ok: true,
    status: 'Birthday feedback endpoint is active and running.',
    columns: HEADERS
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse({
      ok: false,
      cause: 'lock_timeout',
      error: 'Server is busy. Please try again.'
    });
  }

  try {
    var rawBody = '';
    if (e && e.postData && e.postData.contents) {
      rawBody = e.postData.contents;
    } else if (e && e.parameter && e.parameter.payload) {
      rawBody = e.parameter.payload;
    }

    if (!rawBody) {
      return jsonResponse({
        ok: false,
        cause: 'empty_body',
        error: 'Empty request body received.'
      });
    }

    var body = JSON.parse(rawBody);

    var starCount = Number(body.starCount || body.rating || 5);
    if (isNaN(starCount) || starCount < 1 || starCount > 5) {
      starCount = 5;
    }

    var feedback = String(body.feedback || '').trim();
    if (!feedback) {
      return jsonResponse({
        ok: false,
        cause: 'empty_feedback',
        error: 'Feedback message cannot be empty.'
      });
    }

    var madeMeSmile = String(body.madeMeSmile || 'Yes').trim();

    var sheet = getOrCreateFeedbackSheet();
    var timestamp = new Date().toISOString();

    sheet.appendRow([
      timestamp,
      starCount,
      sanitizeCellText(feedback),
      sanitizeCellText(madeMeSmile)
    ]);

    return jsonResponse({
      ok: true,
      starCount: starCount,
      message: 'Feedback successfully saved to Google Sheets.'
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      cause: 'server_error',
      error: err && err.message ? err.message : String(err)
    });
  } finally {
    lock.releaseLock();
  }
}

// Helper test function you can run directly inside Apps Script editor
function testSubmission() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        starCount: 5,
        feedback: "Test message from Apps Script Editor",
        madeMeSmile: "Yes"
      })
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
