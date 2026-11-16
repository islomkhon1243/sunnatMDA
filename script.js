const pages = document.getElementById('pages');
const sections = [...pages.querySelectorAll('.page')];
const navButtons = [...document.querySelectorAll('.page-nav button')];
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
function goTo(index) {
  const target = Math.max(0, Math.min(sections.length - 1, index));
  pages.scrollTo({ left: target * pages.clientWidth, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
}
function updateNavigation() {
  current = Math.round(pages.scrollLeft / pages.clientWidth);
  document.getElementById('currentPage').textContent = String(current + 1).padStart(2, '0');
  navButtons.forEach((button, i) => {
    if (i === current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  prev.disabled = current === 0;
  next.disabled = current === sections.length - 1;
}
pages.addEventListener('scroll', updateNavigation, { passive: true });
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.go))));
document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); goTo(0); });
prev.addEventListener('click', () => goTo(current - 1));
next.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', event => {
  if (document.body.classList.contains('invitation-locked')) return;
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let wheelLockedUntil = 0;
pages.addEventListener('wheel', event => {
  if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const section = sections[current];
  if (section.scrollHeight > section.clientHeight + 2 && ((event.deltaY > 0 && section.scrollTop + section.clientHeight < section.scrollHeight - 2) || (event.deltaY < 0 && section.scrollTop > 0))) return;
  event.preventDefault();
  if (Date.now() < wheelLockedUntil || Math.abs(event.deltaY) < 8) return;
  wheelLockedUntil = Date.now() + 800;
  goTo(current + Math.sign(event.deltaY));
}, { passive: false });
let resizeTimer;
window.addEventListener('resize', () => { const saved = current; clearTimeout(resizeTimer); resizeTimer = setTimeout(() => pages.scrollTo({ left: saved * pages.clientWidth, behavior: 'instant' }), 100); });
const music = document.getElementById('bgMusic');
const musicButton = document.getElementById('musicBtn');
function setMusicState() {
  musicButton.setAttribute('aria-pressed', String(!music.paused));
  musicButton.setAttribute('aria-label', music.paused ? 'Мусиқани ёқиш' : 'Мусиқани ўчириш');
  document.getElementById('musicLabel').textContent = music.paused ? 'Мусиқа' : 'Мусиқа ёқилган';
}
async function playMusic() {
  try { music.volume = .5; await music.play(); }
  catch { document.getElementById('musicLabel').textContent = 'Қайта урининг'; musicButton.setAttribute('aria-label', 'Мусиқа очилмади. Қайта урининг'); }
}
musicButton.addEventListener('click', () => {
  if (!music.paused) music.pause();
  else playMusic();
});
music.addEventListener('play', setMusicState);
music.addEventListener('pause', setMusicState);
const cover = document.getElementById('invitationCover');
const openInvitationButton = document.getElementById('openInvitationBtn');
const invitationSurfaces = [document.querySelector('.topbar'), pages, document.querySelector('.bottom-bar')];
invitationSurfaces.forEach(surface => { surface.inert = true; });
let invitationOpening = false;
openInvitationButton.addEventListener('click', () => {
  if (invitationOpening) return;
  invitationOpening = true;
  openInvitationButton.disabled = true;
  // Start playback in the click gesture, before any animation or timer.
  playMusic();
  pages.scrollTo({ left: 0, behavior: 'instant' });
  cover.classList.add('is-opening');
  window.setTimeout(() => {
    document.body.classList.remove('invitation-locked');
    invitationSurfaces.forEach(surface => { surface.inert = false; });
    cover.hidden = true;
    pages.focus({ preventScroll: true });
  }, reduceMotion.matches ? 0 : 1200);
});
// The invitation gives a date, so count down to midnight in Shymkent.
const eventDayStart = Date.parse('2026-11-20T00:00:00+05:00');
const countdownFields = ['daysLeft', 'hoursLeft', 'minutesLeft', 'secondsLeft']
  .map(id => document.getElementById(id));

function updateCountdown() {
  const total = Math.max(0, Math.ceil((eventDayStart - Date.now()) / 1000));
  const values = [
    Math.floor(total / 86400),
    Math.floor(total / 3600) % 24,
    Math.floor(total / 60) % 60,
    total % 60
  ];
  countdownFields.forEach((field, index) => {
    field.textContent = String(values[index]).padStart(2, '0');
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
updateNavigation();
