/**
 * Mars automation — Google Apps Script (bound to the Mars sheet).
 *
 * Setup (see docs/MARS_AUTOMATION.md):
 *   1. Extensions -> Apps Script, paste this file.
 *   2. Script Properties: GH_PAT (fine-grained PAT, repo Contents + Dispatch write),
 *      GH_OWNER, GH_REPO.
 *   3. Run setupSheet() once (writes header + dropdowns).
 *   4. Deploy -> New deployment -> Web app (execute as me, anyone with link).
 *      Put that URL in GitHub secret MARS_WEBAPP_URL.
 *   5. Triggers -> add time-driven daily trigger -> renderDueRows.
 *
 * Columns: A date | B language | C tts_model | D voice | E genre | F audience
 *          | G script | H yt_title | I yt_description | J yt_tags | K status | L url
 */

var COL = {
  date: 1, language: 2, tts_model: 3, voice: 4, genre: 5, audience: 6,
  script: 7, yt_title: 8, yt_description: 9, yt_tags: 10, status: 11, url: 12,
  job_id: 13
};
var HEADERS = ["date", "language", "tts_model", "voice", "genre", "audience",
  "script", "yt_title", "yt_description", "yt_tags", "status", "url", "job_id"];

// Cost guard: max rows the daily trigger dispatches in one run.
var MAX_PER_RUN = 10;

var DROPDOWNS = {
  language: ["English", "Hindi", "Hinglish", "Spanish", "French", "German", "Japanese", "Portuguese", "Arabic"],
  tts_model: ["gemini", "elevenlabs", "minimax", "kokoro"],
  genre: ["science", "education"],
  audience: ["kids", "teen", "general", "adult"],
  status: ["pending", "queued", "published", "error"]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Mars")
    .addItem("Render selected row", "renderSelectedRow")
    .addItem("Render due rows (today)", "renderDueRows")
    .addSeparator()
    .addItem("Setup sheet (header + dropdowns)", "setupSheet")
    .addToUi();
}

function setupSheet() {
  var sh = SpreadsheetApp.getActiveSheet();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sh.setFrozenRows(1);
  var maxRows = Math.max(sh.getMaxRows() - 1, 1);
  // date format
  sh.getRange(2, COL.date, maxRows, 1).setNumberFormat("yyyy-mm-dd");
  // dropdowns
  Object.keys(DROPDOWNS).forEach(function (field) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(DROPDOWNS[field], true).setAllowInvalid(false).build();
    sh.getRange(2, COL[field], maxRows, 1).setDataValidation(rule);
  });
  SpreadsheetApp.getUi().alert("Sheet ready. Fill rows and set status = pending.");
}

function _rowPayload(sh, row) {
  var v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  var date = v[COL.date - 1];
  if (date instanceof Date) {
    date = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return {
    row: row,
    date: String(date || ""),
    language: v[COL.language - 1] || "English",
    tts_model: v[COL.tts_model - 1] || "gemini",
    voice: v[COL.voice - 1] || "",
    genre: v[COL.genre - 1] || "science",
    audience: v[COL.audience - 1] || "general",
    script: v[COL.script - 1] || "",
    yt_title: v[COL.yt_title - 1] || "",
    yt_description: v[COL.yt_description - 1] || "",
    yt_tags: v[COL.yt_tags - 1] || "",
    job_id: v[COL.job_id - 1] || ""
  };
}

// Ensure the row has a stable job_id (survives row reorder/insert between
// dispatch and writeback). Generates + writes one if missing; returns it.
function _ensureJobId(sh, row, payload) {
  if (!payload.job_id) {
    payload.job_id = Utilities.getUuid();
    sh.getRange(row, COL.job_id).setValue(payload.job_id);
  }
  return payload.job_id;
}

// Find the row whose job_id matches (writeback). -1 if none.
function _findRowByJobId(sh, jobId) {
  if (!jobId) return -1;
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var vals = sh.getRange(2, COL.job_id, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(jobId)) return i + 2;
  }
  return -1;
}

function _dispatch(payload) {
  var props = PropertiesService.getScriptProperties();
  var pat = props.getProperty("GH_PAT");
  var owner = props.getProperty("GH_OWNER");
  var repo = props.getProperty("GH_REPO");
  if (!pat || !owner || !repo) {
    throw new Error("Set GH_PAT, GH_OWNER, GH_REPO in Script Properties.");
  }
  var res = UrlFetchApp.fetch("https://api.github.com/repos/" + owner + "/" + repo + "/dispatches", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "token " + pat, Accept: "application/vnd.github+json" },
    // Nest under one key: repository_dispatch allows <=10 top-level client_payload props.
    payload: JSON.stringify({ event_type: "mars-render", client_payload: { job: payload } }),
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error("GitHub dispatch failed (" + code + "): " + res.getContentText());
  }
}

function renderSelectedRow() {
  var sh = SpreadsheetApp.getActiveSheet();
  var row = sh.getActiveCell().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert("Select a data row (not the header)."); return; }
  var payload = _rowPayload(sh, row);
  if (!payload.script) { SpreadsheetApp.getUi().alert("Row has no script."); return; }
  _ensureJobId(sh, row, payload);
  _dispatch(payload);
  sh.getRange(row, COL.status).setValue("queued");
  SpreadsheetApp.getUi().alert("Dispatched row " + row + ".");
}

function renderDueRows() {
  var sh = SpreadsheetApp.getActiveSheet();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var last = sh.getLastRow();
  var dispatched = 0, skipped = 0;
  for (var row = 2; row <= last; row++) {
    var payload = _rowPayload(sh, row);
    var status = String(sh.getRange(row, COL.status).getValue() || "").toLowerCase();
    if (status === "pending" && payload.date === today && payload.script) {
      if (dispatched >= MAX_PER_RUN) { skipped++; continue; }  // cost guard
      _ensureJobId(sh, row, payload);
      _dispatch(payload);
      sh.getRange(row, COL.status).setValue("queued");
      dispatched++;
    }
  }
  Logger.log("renderDueRows " + today + ": dispatched " + dispatched +
    ", skipped " + skipped + " (cap " + MAX_PER_RUN + "/run)");
  if (skipped > 0) {
    Logger.log("NOTE: " + skipped + " due row(s) left pending — they run next trigger (raise MAX_PER_RUN to change).");
  }
}

/** Health check — opening the Web App URL in a browser (GET) lands here. */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: "mars-writeback" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Web App endpoint — GitHub Actions posts {token,row,status,url} back here.
 * Deployed as "Anyone with the link" (GitHub can't do Google OAuth), so the
 * endpoint is unauthenticated at the Google layer — we gate it with a shared
 * secret instead. Set Script Property WEBAPP_TOKEN to a long random string and
 * mirror it in the GitHub secret MARS_WEBAPP_TOKEN. Requests without the exact
 * token are rejected. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var expected = PropertiesService.getScriptProperties().getProperty("WEBAPP_TOKEN");
    if (!expected || body.token !== expected) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    // Prefer the stable job_id; fall back to row number only if no match.
    var row = _findRowByJobId(sh, body.job_id);
    if (row < 2) row = parseInt(body.row, 10);
    if (row >= 2) {
      if (body.status) sh.getRange(row, COL.status).setValue(body.status);
      if (body.url) sh.getRange(row, COL.url).setValue(body.url);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, row: row }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "row not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
