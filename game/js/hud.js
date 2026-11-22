// The DOM heads-up display: alarm meter, loot, smoke, timer, score and
// the overlay banner. The canvas draws the room; this module owns the
// chrome around it.

const $ = (id) => document.getElementById(id);

export function setLevelName(name) {
  $('level-name').textContent = name;
}

export function updateHUD(state) {
  const alarm = Math.round(state.alarm);
  $('alarm-fill').style.width = `${alarm}%`;
  $('alarm-pct').textContent = `${alarm}%`;
  $('alarm-pct').style.color = alarm >= 70 ? '#ff6b6b' : alarm >= 40 ? '#f5c542' : '#e8e4d8';
  $('loot-count').textContent = state.player.hasLoot ? '1/1' : '0/1';
  $('smoke-count').textContent = String(state.player.smokeLeft);
  const t = Math.floor(state.time);
  $('timer').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  $('score').textContent = state.score.toLocaleString('en-US');
}

export function showBanner(title, text, buttonLabel, onClick) {
  $('banner-title').textContent = title;
  $('banner-text').textContent = text;
  const btn = $('banner-btn');
  btn.textContent = buttonLabel;
  btn.onclick = onClick;
  $('banner').classList.remove('hidden');
}

export function hideBanner() {
  $('banner').classList.add('hidden');
}

export function showTitle() {
  $('title-card').classList.remove('hidden');
}

export function hideTitle() {
  $('title-card').classList.add('hidden');
}
