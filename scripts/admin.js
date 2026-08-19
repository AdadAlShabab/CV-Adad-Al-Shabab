// Admin page fetches aggregated data from the Apps Script endpoint.
const ANALYTICS_ENDPOINT = process.env.ANALYTICS_ENDPOINT;

function qs(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

function renderChart(points){
  const chart = document.getElementById('chart');
  chart.textContent = '';
  const max = Math.max(...points.map(point=>point.views), 1);
  points.forEach(point=>{
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(2, point.views / max * 140)}px`;
    bar.title = `${point.date}: ${point.views} views`;
    const label = document.createElement('span');
    label.textContent = point.date.slice(5);
    wrap.append(bar, label);
    chart.appendChild(wrap);
  });
}

async function loadStats(){
  const token = sessionStorage.getItem('analytics_admin_token') || document.getElementById('tokenInput').value.trim();
  if(!token){ document.getElementById('loading').textContent = 'Admin token required'; return; }
  if(!ANALYTICS_ENDPOINT || ANALYTICS_ENDPOINT.startsWith('REPLACE')){ document.getElementById('loading').textContent = 'Set ANALYTICS_ENDPOINT in scripts/admin.js'; return; }
  document.getElementById('loading').textContent = 'Loading…';
  try{
    const res = await fetch(ANALYTICS_ENDPOINT + '?action=summary&token=' + encodeURIComponent(token));
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    document.getElementById('views').textContent = data.views || 0;
    document.getElementById('downloads').textContent = data.downloads || 0;
    document.getElementById('agents').textContent = data.unique_agents || 0;
    renderChart(data.daily_views || []);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.getElementById('authForm').style.display = 'none';
  }catch(e){
    sessionStorage.removeItem('analytics_admin_token');
    document.getElementById('loading').textContent = 'Invalid token or analytics unavailable';
  }
}

document.getElementById('authForm').addEventListener('submit', event=>{
  event.preventDefault();
  const token = document.getElementById('tokenInput').value.trim();
  if(token) sessionStorage.setItem('analytics_admin_token', token);
  loadStats();
});
document.getElementById('refresh').addEventListener('click', loadStats);
if(sessionStorage.getItem('analytics_admin_token')) loadStats();
