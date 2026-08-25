document.documentElement.classList.add('js');

const header = document.querySelector('#site-header');
const menu = document.querySelector('#nav-menu');
const menuButton = document.querySelector('.menu');
const hero = document.querySelector('.hero');
const stage = document.querySelector('.stage');
const browser = document.querySelector('.browser');
const main = document.querySelector('main');
const footer = document.querySelector('.footer');
const headerBrand = header.querySelector('.brand');
const headerCta = header.querySelector('.header-cta');
const mobileQuery = matchMedia('(max-width: 760px)');
const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = matchMedia('(pointer: fine)');

let menuOpen = false;

if (reducedMotionQuery.matches) {
  hero.classList.add('hero-ready');
} else {
  requestAnimationFrame(() => hero.classList.add('hero-ready'));
}

function setBackgroundInert(inert) {
  main.inert = inert;
  footer.inert = inert;
  headerBrand.inert = inert;
  headerCta.inert = inert;
}

function syncMenuAvailability() {
  menu.inert = mobileQuery.matches && !menuOpen;
}

function openMenu() {
  if (!mobileQuery.matches) return;

  menuOpen = true;
  menu.inert = false;
  menu.classList.add('open');
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close menu');
  document.body.classList.add('menu-open');
  setBackgroundInert(true);
  menu.querySelector('a')?.focus();
}

function closeMenu({ restoreFocus = false } = {}) {
  const wasOpen = menuOpen;

  menuOpen = false;
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
  setBackgroundInert(false);
  syncMenuAvailability();

  if (wasOpen && restoreFocus && mobileQuery.matches) {
    menuButton.focus();
  }
}

menuButton.addEventListener('click', () => {
  if (menuOpen) {
    closeMenu({ restoreFocus: true });
  } else {
    openMenu();
  }
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeMenu());
});

document.addEventListener('keydown', (event) => {
  if (!menuOpen) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
    return;
  }

  if (event.key !== 'Tab') return;

  const focusable = [menuButton, ...menu.querySelectorAll('a')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileQuery.addEventListener('change', () => {
  closeMenu();
  syncMenuAvailability();
});

syncMenuAvailability();

let headerFrame = 0;

function updateHeader() {
  headerFrame = 0;
  header.classList.toggle('scrolled', scrollY > 12);
}

function scheduleHeaderUpdate() {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}

addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
updateHeader();

const reveals = document.querySelectorAll('.reveal');

if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-revealed'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -35px'
  });

  reveals.forEach((element) => observer.observe(element));
}

const navigationLinks = [...menu.querySelectorAll('a[href^="#"]')];
const navigationSections = [...new Set(navigationLinks.map((link) => link.hash))]
  .map((hash) => document.querySelector(hash))
  .filter(Boolean);

function setActiveNavigation(id) {
  navigationLinks.forEach((link) => {
    const active = link.hash === `#${id}`;
    link.classList.toggle('is-active', active);

    if (active) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (id === 'contact') {
    headerCta.setAttribute('aria-current', 'location');
  } else {
    headerCta.removeAttribute('aria-current');
  }
}

if ('IntersectionObserver' in window) {
  const activeSections = new Set();
  const navigationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSections.add(entry.target);
      } else {
        activeSections.delete(entry.target);
      }
    });

    const current = [...activeSections].sort((a, b) => {
      return Math.abs(a.getBoundingClientRect().top - header.offsetHeight) -
        Math.abs(b.getBoundingClientRect().top - header.offsetHeight);
    })[0];

    if (current) setActiveNavigation(current.id);
  }, {
    rootMargin: '-24% 0px -66% 0px'
  });

  navigationSections.forEach((section) => navigationObserver.observe(section));
}

let pointerEffectsEnabled = false;
let pointerFrame = 0;
let pointerEvent;
let stageFrame = 0;
let stagePointerEvent;

function updateHeroPointer() {
  pointerFrame = 0;
  if (!pointerEvent) return;

  const bounds = hero.getBoundingClientRect();
  const x = ((pointerEvent.clientX - bounds.left) / bounds.width) * 100;
  const y = ((pointerEvent.clientY - bounds.top) / bounds.height) * 100;
  hero.style.setProperty('--mx', `${x}%`);
  hero.style.setProperty('--my', `${y}%`);
}

function handleHeroPointer(event) {
  pointerEvent = event;
  if (!pointerFrame) pointerFrame = requestAnimationFrame(updateHeroPointer);
}

function updateStagePointer() {
  stageFrame = 0;
  if (!stagePointerEvent) return;

  const bounds = stage.getBoundingClientRect();
  const x = (stagePointerEvent.clientX - bounds.left) / bounds.width - 0.5;
  const y = (stagePointerEvent.clientY - bounds.top) / bounds.height - 0.5;
  browser.style.setProperty('--stage-x', `${x * 3}deg`);
  browser.style.setProperty('--stage-y', `${y * -3}deg`);
}

function handleStagePointer(event) {
  stagePointerEvent = event;
  if (!stageFrame) stageFrame = requestAnimationFrame(updateStagePointer);
}

function resetStagePointer() {
  browser.style.setProperty('--stage-x', '0deg');
  browser.style.setProperty('--stage-y', '0deg');
}

function syncPointerEffects() {
  const shouldEnable = finePointerQuery.matches && !reducedMotionQuery.matches;
  if (shouldEnable === pointerEffectsEnabled) return;

  pointerEffectsEnabled = shouldEnable;

  if (shouldEnable) {
    hero.addEventListener('pointermove', handleHeroPointer, { passive: true });
    stage.addEventListener('pointermove', handleStagePointer, { passive: true });
    stage.addEventListener('pointerleave', resetStagePointer);
  } else {
    hero.removeEventListener('pointermove', handleHeroPointer);
    stage.removeEventListener('pointermove', handleStagePointer);
    stage.removeEventListener('pointerleave', resetStagePointer);
    cancelAnimationFrame(pointerFrame);
    cancelAnimationFrame(stageFrame);
    pointerFrame = 0;
    stageFrame = 0;
    hero.style.removeProperty('--mx');
    hero.style.removeProperty('--my');
    resetStagePointer();
  }
}

finePointerQuery.addEventListener('change', syncPointerEffects);
reducedMotionQuery.addEventListener('change', syncPointerEffects);
syncPointerEffects();

const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
let copyStatusTimer;

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.setAttribute('aria-hidden', 'true');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();

  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Copy command failed');
}

copyButton.addEventListener('click', async () => {
  clearTimeout(copyStatusTimer);

  try {
    await copyText(copyButton.dataset.email);
    copyStatus.textContent = 'Email copied';
    copyButton.classList.add('is-copied');
  } catch {
    copyStatus.textContent = 'Copy unavailable';
    copyButton.classList.remove('is-copied');
  }

  copyStatusTimer = setTimeout(() => {
    copyStatus.textContent = '';
    copyButton.classList.remove('is-copied');
  }, 3000);
});
