// Configuration: set your deployed Apps Script endpoint here (do not include token in public repo)
const ANALYTICS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2cK9a2hWdzKVU1zuLWCZU9jFeegG5NCFXyUQRTLPONtpQ0vqaPzJxnI9hfhsicD18/exec';
function sendEvent(type, extra={}){
  if(!ANALYTICS_ENDPOINT || ANALYTICS_ENDPOINT.startsWith('REPLACE')) return;
  try{
    const payload = JSON.stringify({event:type, extra});
    if(navigator.sendBeacon && navigator.sendBeacon(ANALYTICS_ENDPOINT, payload)) return;
    fetch(ANALYTICS_ENDPOINT, {method:'POST',headers:{'Content-Type':'application/json'},body:payload}).catch(()=>{});
  }catch(e){/*ignore*/}
}

// track view on load
window.addEventListener('load', ()=>{
  sendEvent('view', {url:location.href, ua:navigator.userAgent, ref:document.referrer});
});

// download tracking
const downloadBtn = document.getElementById('downloadBtn');
if(downloadBtn){
  downloadBtn.addEventListener('click', ()=>{
    sendEvent('download', {url:downloadBtn.href});
  });
}

// Zoom controls (simple): change iframe scale using CSS transform
let zoom = 1;
const zoomLabel = document.getElementById('zoomLabel');
const pdfFrame = document.getElementById('pdfFrame');
function updateZoom(){
  zoomLabel.textContent = Math.round(zoom*100) + '%';
  pdfFrame.style.transform = `scale(${zoom})`;
  pdfFrame.style.transformOrigin = 'top left';
  // adjust height so scaled content fits
  pdfFrame.style.height = (1100 / zoom) + 'px';
}
document.getElementById('zoomIn').addEventListener('click', ()=>{ zoom = Math.min(2, zoom + 0.1); updateZoom(); });
document.getElementById('zoomOut').addEventListener('click', ()=>{ zoom = Math.max(0.5, zoom - 0.1); updateZoom(); });
updateZoom();
