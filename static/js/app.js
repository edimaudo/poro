/* ═══════════════════════════════════════════════════════════
   PORO – Pomodoro Timer  |  app.js
   Timer · Music Player · Theme · Settings · Notifications
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Music Library from Flask (injected via JSON script tag) ── */
const MUSIC_LIBRARY = JSON.parse(
  document.getElementById('music-data').textContent
);

/* ── Storage Helpers ─────────────────────────────────────── */
const store = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

/* ── Defaults ────────────────────────────────────────────── */
const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15, interval: 4 };
const RING_CIRCUMFERENCE = 603.19; // 2π × 96

/* ═══════════════════════════════════════════════════════════
   TIMER STATE
═══════════════════════════════════════════════════════════ */
let timerState = {
  mode: 'work',          // 'work' | 'short' | 'long'
  timeLeft: 0,           // seconds
  totalTime: 0,          // seconds for current mode
  isRunning: false,
  sessionCount: 0,       // completed work sessions in cycle
  cycleComplete: 0,      // total completed work sessions ever
  intervalId: null,
  settings: { ...DEFAULT_SETTINGS, ...store.get('poro_settings', {}) },
};

/* ── DOM Refs ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const elTime       = $('timer-time');
const elModeLabel  = $('timer-mode-label');
const elRing       = $('ring-progress');
const elDots       = $('session-dots');
const elBtnStart   = $('btn-start-pause');
const elBtnReset   = $('btn-reset');
const elBtnSkip    = $('btn-skip');
const elTabWork    = $('tab-work');
const elTabShort   = $('tab-short');
const elTabLong    = $('tab-long');
const elSettToggle = $('settings-toggle');
const elSettings   = $('settings-panel');
const elForm       = $('settings-form');
const elSavedMsg   = $('settings-saved-msg');
const elNotifOver  = $('notification-overlay');
const elNotifIcon  = $('notif-icon');
const elNotifTitle = $('notif-title');
const elNotifDesc  = $('notif-desc');
const elNotifClose = $('notif-close');
const elThemeToggle= $('theme-toggle');
const elThemeLabel = $('theme-label');

/* ── Timer Helpers ───────────────────────────────────────── */
function modeDuration(mode) {
  const s = timerState.settings;
  return { work: s.work, short: s.short, long: s.long }[mode] * 60;
}

function modeLabel(mode) {
  return { work: 'Focus Time', short: 'Short Break', long: 'Long Break' }[mode];
}

function modeTabEmoji(mode) {
  return { work: '💼', short: '☕', long: '🛌' }[mode];
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing() {
  const pct = timerState.totalTime > 0 ? timerState.timeLeft / timerState.totalTime : 1;
  elRing.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - pct);
}

function updateDots() {
  const interval = timerState.settings.interval;
  elDots.innerHTML = '';
  for (let i = 0; i < interval; i++) {
    const li = document.createElement('li');
    li.className = 'session-dot';
    li.setAttribute('role', 'listitem');
    if (i < timerState.sessionCount) {
      li.classList.add('done');
      li.setAttribute('aria-label', `Session ${i + 1} completed`);
    } else if (i === timerState.sessionCount && timerState.mode === 'work') {
      li.classList.add('current');
      li.setAttribute('aria-label', `Session ${i + 1} in progress`);
    } else {
      li.setAttribute('aria-label', `Session ${i + 1} upcoming`);
    }
    elDots.appendChild(li);
  }
}

function setMode(mode, autoStart = false) {
  // Stop running timer
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;

  timerState.mode = mode;
  timerState.totalTime = modeDuration(mode);
  timerState.timeLeft = timerState.totalTime;

  // Update UI
  elTime.textContent = formatTime(timerState.timeLeft);
  elModeLabel.textContent = modeLabel(mode);
  document.title = `${formatTime(timerState.timeLeft)} – ${modeLabel(mode)} | Poro`;
  updateRing();
  updateDots();
  updateTabActive(mode);
  updateStartBtn(false);

  if (autoStart) startTimer();
}

function updateTabActive(mode) {
  [elTabWork, elTabShort, elTabLong].forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  const map = { work: elTabWork, short: elTabShort, long: elTabLong };
  map[mode].classList.add('active');
  map[mode].setAttribute('aria-selected', 'true');
}

function updateStartBtn(running) {
  const iconPlay  = elBtnStart.querySelector('.icon-play');
  const iconPause = elBtnStart.querySelector('.icon-pause');
  const label     = elBtnStart.querySelector('.btn-start-label');
  if (running) {
    iconPlay.style.display  = 'none';
    iconPause.style.display = '';
    label.textContent = 'Pause';
    elBtnStart.setAttribute('aria-label', 'Pause timer');
    elBtnStart.setAttribute('aria-pressed', 'true');
    elBtnStart.classList.add('running');
  } else {
    iconPlay.style.display  = '';
    iconPause.style.display = 'none';
    label.textContent = 'Start';
    elBtnStart.setAttribute('aria-label', 'Start timer');
    elBtnStart.setAttribute('aria-pressed', 'false');
    elBtnStart.classList.remove('running');
  }
}

function startTimer() {
  if (timerState.isRunning) return;
  timerState.isRunning = true;
  updateStartBtn(true);

  timerState.intervalId = setInterval(() => {
    timerState.timeLeft--;
    elTime.textContent = formatTime(timerState.timeLeft);
    document.title = `${formatTime(timerState.timeLeft)} – ${modeLabel(timerState.mode)} | Poro`;
    updateRing();

    if (timerState.timeLeft <= 0) {
      clearInterval(timerState.intervalId);
      timerState.isRunning = false;
      onTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  updateStartBtn(false);
}

function onTimerComplete() {
  playBeep();

  const mode = timerState.mode;
  let nextMode, icon, title, desc;

  if (mode === 'work') {
    timerState.sessionCount++;
    timerState.cycleComplete++;
    updateDots();

    if (timerState.sessionCount >= timerState.settings.interval) {
      timerState.sessionCount = 0;
      nextMode = 'long';
      icon = '🎉'; title = 'Cycle Complete!'; desc = 'Great work! Time for a long break.';
    } else {
      nextMode = 'short';
      icon = '☕'; title = 'Focus Session Done!'; desc = 'Take a short break, you\'ve earned it.';
    }
  } else {
    nextMode = 'work';
    icon = '💪'; title = 'Break\'s Over!'; desc = 'Ready to focus again?';
  }

  showNotification(icon, title, desc, () => setMode(nextMode, true));
}

/* ── Start / Pause toggle ─────────────────────────────────── */
elBtnStart.addEventListener('click', () => {
  if (timerState.isRunning) pauseTimer();
  else startTimer();
});

/* ── Reset ───────────────────────────────────────────────── */
elBtnReset.addEventListener('click', () => {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  timerState.timeLeft = timerState.totalTime;
  elTime.textContent = formatTime(timerState.timeLeft);
  document.title = `${formatTime(timerState.timeLeft)} – ${modeLabel(timerState.mode)} | Poro`;
  updateRing();
  updateStartBtn(false);
});

/* ── Skip ────────────────────────────────────────────────── */
elBtnSkip.addEventListener('click', () => {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  const nextMode = timerState.mode === 'work'
    ? (timerState.sessionCount + 1 >= timerState.settings.interval ? 'long' : 'short')
    : 'work';

  if (timerState.mode === 'work') {
    timerState.sessionCount++;
    if (timerState.sessionCount >= timerState.settings.interval) timerState.sessionCount = 0;
  }

  setMode(nextMode);
});

/* ── Mode tabs ───────────────────────────────────────────── */
[elTabWork, elTabShort, elTabLong].forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    if (timerState.isRunning) pauseTimer();
    setMode(mode);
  });
});

/* ── Notification ────────────────────────────────────────── */
let notifCallback = null;

function showNotification(icon, title, desc, callback) {
  elNotifIcon.textContent  = icon;
  elNotifTitle.textContent = title;
  elNotifDesc.textContent  = desc;
  elNotifOver.hidden = false;
  elNotifOver.removeAttribute('hidden');
  notifCallback = callback;
  elNotifClose.focus();
}

elNotifClose.addEventListener('click', () => {
  elNotifOver.hidden = true;
  if (notifCallback) { notifCallback(); notifCallback = null; }
});

elNotifOver.addEventListener('keydown', e => {
  if (e.key === 'Escape') elNotifClose.click();
});

/* ── Beep (Web Audio) ─────────────────────────────────────── */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tones = [523.25, 659.25, 783.99]; // C5-E5-G5
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.35);
    });
  } catch (e) {
    console.warn('Audio notification unavailable:', e);
  }
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════ */
function applySettingsToForm() {
  $('setting-work').value     = timerState.settings.work;
  $('setting-short').value    = timerState.settings.short;
  $('setting-long').value     = timerState.settings.long;
  $('setting-interval').value = timerState.settings.interval;
}

elSettToggle.addEventListener('click', () => {
  const expanded = elSettToggle.getAttribute('aria-expanded') === 'true';
  elSettToggle.setAttribute('aria-expanded', String(!expanded));
  elSettings.hidden = expanded;
  elSettings.setAttribute('aria-hidden', String(expanded));
  if (!expanded) applySettingsToForm();
});

elForm.addEventListener('submit', e => {
  e.preventDefault();
  const work     = parseInt($('setting-work').value, 10);
  const short    = parseInt($('setting-short').value, 10);
  const long     = parseInt($('setting-long').value, 10);
  const interval = parseInt($('setting-interval').value, 10);

  // Validate
  if (!work || !short || !long || !interval) return;

  timerState.settings = { work, short, long, interval };
  store.set('poro_settings', timerState.settings);

  // Apply to current mode if not running
  if (!timerState.isRunning) {
    timerState.totalTime = modeDuration(timerState.mode);
    timerState.timeLeft  = timerState.totalTime;
    elTime.textContent = formatTime(timerState.timeLeft);
    updateRing();
    updateDots();
  }

  // Show saved message
  elSavedMsg.hidden = false;
  elSavedMsg.removeAttribute('hidden');
  setTimeout(() => { elSavedMsg.hidden = true; }, 2000);
});

/* ═══════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  elThemeToggle.setAttribute('aria-checked', String(isDark));
  elThemeLabel.textContent = isDark ? 'Dark' : 'Light';
  store.set('poro_theme', theme);
}

elThemeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════════════════════
   MUSIC PLAYER
═══════════════════════════════════════════════════════════ */
const elAudio       = $('music-audio');
const elGenre       = $('genre-select');
const elTrackName   = $('track-name');
const elBtnPrev     = $('btn-prev');
const elBtnPlayM    = $('btn-play-music');
const elBtnNext     = $('btn-next');
const elVolSlider   = $('volume-slider');
const elBtnMute     = $('btn-mute');
const elTracklist   = $('tracklist');
const elTrackToggle = $('tracklist-toggle');
const elProgressFill= $('track-progress-fill');
const elMusicError  = $('music-error');

let musicState = {
  genre: store.get('poro_music_genre', Object.keys(MUSIC_LIBRARY)[0]),
  trackIndex: store.get('poro_music_track', 0),
  isPlaying: false,
  volume: store.get('poro_music_volume', 0.7),
  prevVolume: 0.7,
};

function currentPlaylist() { return MUSIC_LIBRARY[musicState.genre] || []; }
function currentTrack()    { return currentPlaylist()[musicState.trackIndex] || null; }

function loadTrack(autoPlay) {
  const track = currentTrack();
  if (!track) return;

  elAudio.src = track.url;
  elAudio.volume = musicState.volume;
  elTrackName.textContent = track.name;
  elMusicError.hidden = true;
  updateTracklistUI();

  if (autoPlay) {
    elAudio.play().catch(() => showMusicError());
  }
}

function updateMusicPlayBtn(playing) {
  const playIcon  = elBtnPlayM.querySelector('.icon-play');
  const pauseIcon = elBtnPlayM.querySelector('.icon-pause');
  if (playing) {
    playIcon.style.display  = 'none';
    pauseIcon.style.display = '';
    elBtnPlayM.setAttribute('aria-label', 'Pause music');
    elBtnPlayM.setAttribute('aria-pressed', 'true');
  } else {
    playIcon.style.display  = '';
    pauseIcon.style.display = 'none';
    elBtnPlayM.setAttribute('aria-label', 'Play music');
    elBtnPlayM.setAttribute('aria-pressed', 'false');
  }
}

function showMusicError() {
  elMusicError.hidden = false;
  elMusicError.removeAttribute('hidden');
  musicState.isPlaying = false;
  updateMusicPlayBtn(false);
}

function updateTracklistUI() {
  const playlist = currentPlaylist();
  elTracklist.innerHTML = '';
  playlist.forEach((track, i) => {
    const li = document.createElement('li');
    li.className = 'tracklist-item' + (i === musicState.trackIndex ? ' active' : '');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === musicState.trackIndex));
    li.setAttribute('data-index', i + 1);
    li.setAttribute('tabindex', '0');
    li.textContent = track.name;
    li.addEventListener('click', () => {
      musicState.trackIndex = i;
      store.set('poro_music_track', i);
      loadTrack(musicState.isPlaying);
    });
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); } });
    elTracklist.appendChild(li);
  });
}

function populateGenreOptions() {
  // Genre select already populated via Jinja; just set saved value
  elGenre.value = musicState.genre;
}

/* ── Playback controls ───────────────────────────────────── */
elBtnPlayM.addEventListener('click', () => {
  if (musicState.isPlaying) {
    elAudio.pause();
    musicState.isPlaying = false;
    updateMusicPlayBtn(false);
  } else {
    elMusicError.hidden = true;
    if (!elAudio.src || elAudio.readyState === 0) loadTrack(false);
    elAudio.play().catch(() => showMusicError());
  }
});

elBtnPrev.addEventListener('click', () => {
  const playlist = currentPlaylist();
  musicState.trackIndex = (musicState.trackIndex - 1 + playlist.length) % playlist.length;
  store.set('poro_music_track', musicState.trackIndex);
  loadTrack(musicState.isPlaying);
});

elBtnNext.addEventListener('click', () => {
  const playlist = currentPlaylist();
  musicState.trackIndex = (musicState.trackIndex + 1) % playlist.length;
  store.set('poro_music_track', musicState.trackIndex);
  loadTrack(musicState.isPlaying);
});

/* ── Genre change ─────────────────────────────────────────── */
elGenre.addEventListener('change', () => {
  musicState.genre = elGenre.value;
  musicState.trackIndex = 0;
  store.set('poro_music_genre', musicState.genre);
  store.set('poro_music_track', 0);
  loadTrack(musicState.isPlaying);
});

/* ── Volume ───────────────────────────────────────────────── */
elVolSlider.addEventListener('input', () => {
  const vol = parseFloat(elVolSlider.value);
  musicState.volume = vol;
  elAudio.volume = vol;
  store.set('poro_music_volume', vol);
  elVolSlider.setAttribute('aria-valuenow', Math.round(vol * 100));
  updateMuteBtn(vol === 0);
});

elBtnMute.addEventListener('click', () => {
  if (elAudio.volume > 0) {
    musicState.prevVolume = elAudio.volume;
    elAudio.volume = 0;
    elVolSlider.value = 0;
    elVolSlider.setAttribute('aria-valuenow', 0);
    updateMuteBtn(true);
    elBtnMute.setAttribute('aria-pressed', 'true');
  } else {
    const vol = musicState.prevVolume || 0.7;
    elAudio.volume = vol;
    elVolSlider.value = vol;
    elVolSlider.setAttribute('aria-valuenow', Math.round(vol * 100));
    musicState.volume = vol;
    updateMuteBtn(false);
    elBtnMute.setAttribute('aria-pressed', 'false');
  }
});

function updateMuteBtn(muted) {
  const volOn  = elBtnMute.querySelector('.icon-vol-on');
  const volOff = elBtnMute.querySelector('.icon-vol-off');
  if (muted) {
    volOn.style.display  = 'none';
    volOff.style.display = '';
    elBtnMute.setAttribute('aria-label', 'Unmute');
  } else {
    volOn.style.display  = '';
    volOff.style.display = 'none';
    elBtnMute.setAttribute('aria-label', 'Mute');
  }
}

/* ── Track list toggle ────────────────────────────────────── */
elTrackToggle.addEventListener('click', () => {
  const expanded = elTrackToggle.getAttribute('aria-expanded') === 'true';
  elTrackToggle.setAttribute('aria-expanded', String(!expanded));
  elTracklist.hidden = expanded;
  elTracklist.setAttribute('aria-hidden', String(expanded));
});

// Close tracklist when clicking outside
document.addEventListener('click', e => {
  if (!elTrackToggle.contains(e.target) && !elTracklist.contains(e.target)) {
    elTrackToggle.setAttribute('aria-expanded', 'false');
    elTracklist.hidden = true;
    elTracklist.setAttribute('aria-hidden', 'true');
  }
});

/* ── Audio event listeners ───────────────────────────────── */
elAudio.addEventListener('play',  () => { musicState.isPlaying = true;  updateMusicPlayBtn(true);  });
elAudio.addEventListener('pause', () => { musicState.isPlaying = false; updateMusicPlayBtn(false); });
elAudio.addEventListener('ended', () => {
  const playlist = currentPlaylist();
  musicState.trackIndex = (musicState.trackIndex + 1) % playlist.length;
  store.set('poro_music_track', musicState.trackIndex);
  loadTrack(true);
});
elAudio.addEventListener('error', () => showMusicError());

/* ── Progress bar ─────────────────────────────────────────── */
elAudio.addEventListener('timeupdate', () => {
  if (elAudio.duration) {
    const pct = (elAudio.currentTime / elAudio.duration) * 100;
    elProgressFill.style.width = pct + '%';
  }
});

/* ── Keyboard shortcuts ───────────────────────────────────── */
document.addEventListener('keydown', e => {
  // Don't fire if focus is inside an input
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      elBtnStart.click();
      break;
    case 'r':
    case 'R':
      elBtnReset.click();
      break;
    case 'ArrowRight':
      elBtnSkip.click();
      break;
    case 'm':
    case 'M':
      elBtnMute.click();
      break;
    case 'p':
    case 'P':
      elBtnPlayM.click();
      break;
    case ',':
      elBtnPrev.click();
      break;
    case '.':
      elBtnNext.click();
      break;
  }
});

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
function init() {
  // Apply saved theme
  const savedTheme = store.get('poro_theme', 'light');
  applyTheme(savedTheme);

  // Apply saved settings
  applySettingsToForm();

  // Init timer (work mode)
  setMode('work');

  // Init music player
  populateGenreOptions();
  elVolSlider.value = musicState.volume;
  elVolSlider.setAttribute('aria-valuenow', Math.round(musicState.volume * 100));
  elAudio.volume = musicState.volume;
  loadTrack(false);
}

init();
