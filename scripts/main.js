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

const PDF_URL = 'Adad%20Al%20Shabab%E2%80%99s%20Resume.pdf';
const pdfViewer = document.getElementById('pdfViewer');
const status = document.getElementById('status');
let zoom = 0.7;
const zoomLabel = document.getElementById('zoomLabel');
let pdfDocument;

async function renderDocument(){
  if(!pdfDocument) return;
  pdfViewer.textContent = '';
  const availableWidth = Math.max(280, pdfViewer.clientWidth);
  for(let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++){
    const page = await pdfDocument.getPage(pageNumber);
    const baseViewport = page.getViewport({scale:1});
    const scale = (availableWidth / baseViewport.width) * zoom;
    const viewport = page.getViewport({scale});
    const outputScale = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    canvas.setAttribute('aria-label', `Resume page ${pageNumber}`);
    pdfViewer.appendChild(canvas);
    await page.render({
      canvasContext:canvas.getContext('2d'),
      viewport,
      transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
    }).promise;
  }
  status.hidden = true;
}

async function loadDocument(){
  try{
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfDocument = await pdfjsLib.getDocument(PDF_URL).promise;
    await renderDocument();
  }catch(error){
    status.textContent = 'Unable to display the resume. Use Download PDF instead.';
    console.error(error);
  }
}

function updateZoom(){
  zoomLabel.textContent = Math.round(zoom*100) + '%';
  renderDocument();
}
document.getElementById('zoomIn').addEventListener('click', ()=>{ zoom = Math.min(2, zoom + 0.1); updateZoom(); });
document.getElementById('zoomOut').addEventListener('click', ()=>{ zoom = Math.max(0.5, zoom - 0.1); updateZoom(); });
window.addEventListener('resize', ()=>{ if(pdfDocument) renderDocument(); });
loadDocument();
