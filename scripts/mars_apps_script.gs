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
  script: 7, yt_title: 8, yt_description: 9, yt_tags: 10, status: 11, url: 12
};
var HEADERS = ["date", "language", "tts_model", "voice", "genre", "audience",
  "script", "yt_title", "yt_description", "yt_tags", "status", "url"];

var DROPDOWNS = {
  language: ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Portuguese", "Arabic"],
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
    yt_tags: v[COL.yt_tags - 1] || ""
  };
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
    payload: JSON.stringify({ event_type: "mars-render", client_payload: payload }),
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
  _dispatch(payload);
  sh.getRange(row, COL.status).setValue("queued");
  SpreadsheetApp.getUi().alert("Dispatched row " + row + ".");
}

function renderDueRows() {
  var sh = SpreadsheetApp.getActiveSheet();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var last = sh.getLastRow();
  var n = 0;
  for (var row = 2; row <= last; row++) {
    var payload = _rowPayload(sh, row);
    var status = String(sh.getRange(row, COL.status).getValue() || "").toLowerCase();
    if (status === "pending" && payload.date === today && payload.script) {
      _dispatch(payload);
      sh.getRange(row, COL.status).setValue("queued");
      n++;
    }
  }
  Logger.log("renderDueRows: dispatched " + n + " row(s) for " + today);
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
    var row = parseInt(body.row, 10);
    if (row >= 2) {
      if (body.status) sh.getRange(row, COL.status).setValue(body.status);
      if (body.url) sh.getRange(row, COL.url).setValue(body.url);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
