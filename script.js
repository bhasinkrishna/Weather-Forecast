const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const API_KEY = 'ab4cca0f30c8d3eea4b86778b7e5f92b'; 

const qs = (s) => document.querySelector(s);
const el = (tag, cls) => { const n = document.createElement(tag); if(cls) n.className = cls; return n; };

const statusEl = qs('#status');

function setStatus(msg, type='info'){
  statusEl.textContent = msg || '';
  statusEl.style.color = type === 'error' ? '#e74c3c' : '#aaa';
}

function toTime(ts, tzOffsetSeconds){
  return new Date((ts + tzOffsetSeconds) * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function aqiLabel(idx){
  return ['Good','Fair','Moderate','Poor','Very Poor'][Math.max(1, Math.min(5, idx)) - 1];
}

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok){
    const t = await res.text().catch(()=> '');
    throw new Error(`HTTP ${res.status}: ${t || res.statusText}`);
  }
  return res.json();
}

async function loadByCity(city){
  setStatus('Loading...');
  try{
    const w = await fetchJSON(`${CURRENT_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    renderCurrent(w);

    const f = await fetchJSON(`${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    renderForecast(f);
    renderHourly(f);

    const { lat, lon } = w.coord || {};
    if(lat != null && lon != null){
      const aq = await fetchJSON(`${AIR_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      renderAir(aq);
    }

    setStatus('');
  }catch(err){
    console.error(err);
    setStatus(err.message.includes('404') ? 'City not found. Try another name.' : `Error: ${err.message}`, 'error');
    clearUI();
  }
}

async function loadByCoords(lat, lon){
  setStatus('Loading by location...');
  try{
    const w = await fetchJSON(`${CURRENT_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    renderCurrent(w);

    const f = await fetchJSON(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    renderForecast(f);
    renderHourly(f);

    const aq = await fetchJSON(`${AIR_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    renderAir(aq);

    setStatus('');
  }catch(err){
    console.error(err);
    setStatus(`Location error: ${err.message}`, 'error');
    clearUI();
  }
}

function clearUI(){
  qs('#location').textContent = '—';
  qs('#temperature').textContent = '—';
  qs('#description').textContent = '—';
  qs('#humidity').textContent = '—';
  qs('#feels').textContent = '—';
  qs('#wind').textContent = '—';
  qs('#visibility').textContent = '—';
  qs('#pressure').textContent = '—';
  qs('#sunrise').textContent = '—';
  qs('#sunset').textContent = '—';
  qs('#icon').src = '';
  qs('#forecast').innerHTML = '';
  qs('#airQuality').textContent = '—';
  qs('#aqBreakdown').innerHTML = '';
  qs('#alerts').textContent = '';
  qs('#hourlyForecast').innerHTML = '';
}

function renderCurrent(w){
  const loc = `${w.name ?? ''}${w.sys?.country ? ', ' + w.sys.country : ''}`;
  qs('#location').textContent = loc || 'Current Weather';
  qs('#temperature').textContent = `${Math.round(w.main?.temp)}°C`;
  qs('#description').textContent = w.weather?.[0]?.description ?? '—';
  qs('#feels').textContent = `Feels: ${Math.round(w.main?.feels_like)}°C`;
  qs('#humidity').textContent = `Humidity: ${w.main?.humidity}%`;
  qs('#wind').textContent = `Wind: ${w.wind?.speed} m/s`;
  qs('#visibility').textContent = `Visibility: ${((w.visibility ?? 0)/1000).toFixed(1)} km`;
  qs('#pressure').textContent = `Pressure: ${w.main?.pressure} hPa`;

  const tz = w.timezone ?? 0;
  if(w.sys?.sunrise && w.sys?.sunset){
    qs('#sunrise').textContent = `Sunrise: ${toTime(w.sys.sunrise, tz)}`;
    qs('#sunset').textContent  = `Sunset: ${toTime(w.sys.sunset, tz)}`;
  }

  const icon = w.weather?.[0]?.icon;
  if(icon){
    qs('#icon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    qs('#icon').alt = w.weather?.[0]?.main || 'weather';
  }
}

function renderForecast(f){
  const grid = qs('#forecast');
  grid.innerHTML = '';
  const days = f.list?.filter(x => x.dt_txt?.includes('12:00:00')) ?? [];
  days.forEach(d => {
    const card = el('div', 'forecast-day');
    const date = new Date(d.dt * 1000);
    const hi = Math.round(d.main?.temp_max ?? d.main?.temp);
    const lo = Math.round(d.main?.temp_min ?? d.main?.temp);
    const icon = d.weather?.[0]?.icon;
    card.innerHTML = `
      <div>${date.toLocaleDateString(undefined,{ weekday:'short', month:'short', day:'numeric' })}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="" />
      <div class="hi">${hi}°</div>
      <div class="lo">${lo}°</div>
      <div>${d.weather?.[0]?.main ?? ''}</div>
    `;
    grid.appendChild(card);
  });
}

function renderHourly(f){
  const container = qs('#hourlyForecast');
  container.innerHTML = '';
  const nextHours = f.list?.slice(0, 8) ?? [];
  nextHours.forEach(h => {
    const card = el('div', 'hour-card');
    const date = new Date(h.dt * 1000);
    const temp = Math.round(h.main?.temp);
    const icon = h.weather?.[0]?.icon;
    card.innerHTML = `
      <div>${date.toLocaleTimeString([], { hour: '2-digit'})}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" />
      <div>${temp}°C</div>
    `;
    container.appendChild(card);
  });
}

function renderAir(aq){
  const aqi = aq?.list?.[0]?.main?.aqi ?? 1;
  qs('#airQuality').textContent = `Air Quality: ${aqiLabel(aqi)} (Index ${aqi})`;
  const comp = aq?.list?.[0]?.components ?? {};
  const ul = qs('#aqBreakdown');
  ul.innerHTML = '';
  Object.entries(comp).forEach(([k,v])=>{
    const li = el('li');
    li.textContent = `${k}: ${v} µg/m³`;
    ul.appendChild(li);
  });
}

function geolocate(){
  if(!navigator.geolocation){
    setStatus('Geolocation not supported by this browser.', 'error');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => loadByCoords(pos.coords.latitude, pos.coords.longitude),
    err => setStatus(`Geolocation denied: ${err.message}`, 'error'),
    { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
  );
}

window.addEventListener('DOMContentLoaded', ()=>{
  qs('#searchBtn').addEventListener('click', ()=>{
    const city = qs('#cityInput').value.trim();
    if(city) loadByCity(city);
  });
  qs('#cityInput').addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      const city = qs('#cityInput').value.trim();
      if(city) loadByCity(city);
    }
  });
  qs('#locateBtn').addEventListener('click', geolocate);
  loadByCity('Pune');
});
