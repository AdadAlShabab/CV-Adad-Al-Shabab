/**
 * Google Apps Script to collect events into a Google Sheet and return summaries.
 * Deployment instructions:
 * 1. Create a new Google Apps Script project at https://script.google.com
 * 2. Create a Google Sheet and note its ID (in the URL)
 * 3. Paste this code into Code.gs and set the SHEET_ID below.
 * 4. In Apps Script: Project Settings -> Script Properties, add ANALYTICS_ADMIN_TOKEN with a secret value.
 * 5. Deploy -> New deployment -> Web app. Execute as: Me. Who has access: Anyone.
 * 6. Use the deployed URL as ANALYTICS_ENDPOINT in the site scripts.
 */

const SHEET_ID = '1Z6ktxWKkDJfGXotiohChohWvisdRl2YMZ5n26CJXo24';

function doGet(e){
  const action = e.parameter.action;
  const token = e.parameter.token;
  if(action === 'summary'){
    const props = PropertiesService.getScriptProperties();
    const adminToken = props.getProperty('ANALYTICS_ADMIN_TOKEN');
    if(!adminToken || token !== adminToken){
      return ContentService.createTextOutput(JSON.stringify({error:'Unauthorized'})).setMimeType(ContentService.MimeType.JSON);
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('events');
    if(!sheet) return ContentService.createTextOutput(JSON.stringify({views:0,downloads:0})).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    // header: timestamp, event, ua, ref, extra
    const rows = data.slice(1);
    const views = rows.filter(r=>r[1]==='view').length;
    const downloads = rows.filter(r=>r[1]==='download').length;
    const agents = Array.from(new Set(rows.map(r=>r[2]||'').filter(Boolean))).length;
    const daily = {};
    rows.filter(r=>r[1]==='view').forEach(row=>{
      const date = String(row[0]).slice(0,10);
      if(date) daily[date] = (daily[date] || 0) + 1;
    });
    const daily_views = Object.keys(daily).sort().slice(-14).map(date=>({date, views:daily[date]}));
    return ContentService.createTextOutput(JSON.stringify({views,downloads,unique_agents:agents,daily_views})).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e){
  const body = e.postData && e.postData.contents;
  let payload = {};
  try{ payload = body ? JSON.parse(body) : {} }catch(err){ payload = {} }
  const event = payload.event || 'unknown';
  const extra = payload.extra || {};
  const ua = extra.ua || (e.postData && e.postData.type) || '';
  const ref = extra.ref || '';
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('events');
  if(!sheet){ sheet = ss.insertSheet('events'); sheet.appendRow(['timestamp','event','ua','ref','extra']); }
  const ts = new Date();
  sheet.appendRow([ts.toISOString(), event, ua, ref, JSON.stringify(extra)]);
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}
