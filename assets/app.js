// Tabs
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Elements
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('track-title');
const trackSub = document.getElementById('track-sub');
const playlistList = document.getElementById('playlist-list');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const seek = document.getElementById('seek');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const volume = document.getElementById('volume');
const msg = document.getElementById('msg');

let playlist = []; // {title, url}
let index = 0;

// Utils
const fmtTime = (s) => {
  s = Math.floor(s || 0);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
};

const setMessage = (text) => { msg.textContent = text || ''; };

function loadTrack(i) {
  if (!playlist.length) return;
  index = (i + playlist.length) % playlist.length;
  const item = playlist[index];
  audio.src = item.url;
  trackTitle.textContent = item.title || item.url;
  trackSub.textContent = `${index+1}/${playlist.length}`;
  audio.play().catch(()=>{});
  highlightActive();
}

function highlightActive() {
  [...playlistList.children].forEach((li, i)=>{
    li.style.background = i===index ? '#182045' : 'transparent';
  });
}

function renderPlaylist() {
  playlistList.innerHTML = '';
  playlist.forEach((item, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = item.title || item.url;
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const playB = document.createElement('button');
    playB.textContent = 'Play';
    playB.addEventListener('click', ()=> loadTrack(i));
    actions.appendChild(playB); // Removed "Remove" button
    li.appendChild(span);
    li.appendChild(actions);
    playlistList.appendChild(li);
  });
  highlightActive();
}

// Controls
playBtn.addEventListener('click', ()=> audio.play());
pauseBtn.addEventListener('click', ()=> audio.pause());
nextBtn.addEventListener('click', ()=> loadTrack(index+1));
prevBtn.addEventListener('click', ()=> loadTrack(index-1));
volume.addEventListener('input', ()=> audio.volume = volume.value);

audio.addEventListener('timeupdate', ()=> {
  seek.value = (audio.currentTime / (audio.duration || 1)) * 100;
  currentTimeEl.textContent = fmtTime(audio.currentTime);
  durationEl.textContent = isFinite(audio.duration) ? fmtTime(audio.duration) : 'LIVE';
});
seek.addEventListener('input', ()=> {
  if (isFinite(audio.duration)) audio.currentTime = (seek.value/100) * audio.duration;
});
audio.addEventListener('ended', ()=> loadTrack(index+1));

// Parse M3U/PLS
function parsePlaylistText(text) {
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const entries = [];
  let pendingTitle = null;
  for (const line of lines) {
    if (/^#EXTINF/i.test(line)) {
      const t = line.split(',', 2)[1] || '';
      pendingTitle = t.trim();
    } else if (!line.startsWith('#')) {
      entries.push({title: pendingTitle, url: line});
      pendingTitle = null;
    }
  }
  if (!entries.length) {
    for (const line of lines) {
      if (!line.startsWith('#')) entries.push({title: '', url: line});
    }
  }
  return entries;
}

// Fetch M3U from URL
document.getElementById('fetch-m3u').addEventListener('click', async ()=> {
  const url = document.getElementById('m3u-url').value.trim();
  if (!url) return alert('Enter an M3U/PLS URL.');
  await fetchIntoPlayer(url);
  localStorage.setItem('lastM3U', url);
});

async function fetchIntoPlayer(url) {
  try {
    setMessage('Fetching playlist...');
    const res = await fetch(url, {cache:'no-cache'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const entries = parsePlaylistText(text);
    if (!entries.length) { setMessage('Playlist is empty.'); return; }
    playlist = entries;
    renderPlaylist();
    loadTrack(0);
    setMessage('Loaded.');
  } catch(e) {
    setMessage('Failed to fetch playlist: ' + e.message);
  }
}

// Playlist Picker logic
const pills = document.querySelectorAll('.pill');
pills.forEach(p => p.addEventListener('click', async ()=> {
  pills.forEach(x => x.classList.remove('active'));
  p.classList.add('active');
  await fetchIntoPlayer(p.dataset.pl);
  localStorage.setItem('lastPL', p.dataset.pl);
}));

// My Radio (single stream)
const radioStatus = document.getElementById('myradio-status');
document.getElementById('set-radio').addEventListener('click', ()=> {
  const url = document.getElementById('radio-url').value.trim();
  if (!url) return alert('Enter your radio stream URL.');
  localStorage.setItem('myRadioURL', url);
  radioStatus.textContent = 'Saved: ' + url;
  playlist = [{title: 'My Radio', url}];
  renderPlaylist();
  loadTrack(0);
});

// Free radios
async function loadFreeRadios() {
  const list = document.getElementById('radio-list');
  list.innerHTML = 'Loading...';
  try {
    const res = await fetch('data/free-radios.json', {cache:'no-cache'});
    const items = await res.json();
    list.innerHTML = '';
    items.forEach(st => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = `${st.name} — ${st.genre}`;
      const actions = document.createElement('div');
      actions.className = 'item-actions';
      const playB = document.createElement('button');
      playB.textContent = 'Play';
      playB.addEventListener('click', ()=> {
        playlist = [{title: st.name, url: st.url}];
        renderPlaylist();
        loadTrack(0);
      });
      actions.appendChild(playB);
      li.appendChild(span);
      li.appendChild(actions);
      list.appendChild(li);
    });
  } catch(e) {
    list.innerHTML = 'Failed to load stations.';
  }
}
document.getElementById('reload-radios').addEventListener('click', loadFreeRadios);

// Init — auto-load SmartDocsRadio or last used
(async function init() {
  const lastPL = localStorage.getItem('lastPL') || 'SmartDocsRadio.m3u';
  const btn = [...document.querySelectorAll('.pill')].find(b => b.dataset.pl === lastPL);
  if (btn) {
    pills.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
  }
  await fetchIntoPlayer(lastPL);
  loadFreeRadios();
})();