(() => {
  'use strict';

  const STORAGE_KEY = 'learnquest-theme';
  const styles = `
    :root.dark-theme { color-scheme: dark; --text: #edf4ff; }
    html.dark-theme, html.dark-theme body { background: linear-gradient(#101a2d 0%, #17243b 65%, #1d382b 65%, #13251d 100%); color: var(--text); }
    html.dark-theme .title-screen { background: linear-gradient(#15243d, #263d5a 62%, #27432e 62%, #172d22 100%); }
    html.dark-theme .pixel-box, html.dark-theme .game-shell { background: linear-gradient(#203956, #304d68 58%, #31583a 58%, #23432d 100%); }
    html.dark-theme .selection-screen, html.dark-theme .game-screen { background: linear-gradient(#17263d 0%, #263b56 62%, #27432e 62%, #172d22 100%); }
    html.dark-theme .panel, html.dark-theme .classic-panel, html.dark-theme .modal-box { background: linear-gradient(#26354b, #1d293b); border-color: #7085a0; color: var(--text); }
    html.dark-theme .option-card, html.dark-theme .mode-btn, html.dark-theme .secondary-btn, html.dark-theme .menu-btn { background: linear-gradient(#354760, #29384d); border-color: #8295ad; color: var(--text); }
    html.dark-theme .option-card.active { background: linear-gradient(#60413f, #49343a); border-color: #ff8585; }
    html.dark-theme .option-sub { color: #c2d0e0; }
    html.dark-theme .classic-answer, html.dark-theme .answer-btn, html.dark-theme .close-btn { background: #27374c; border-color: #8295ad; color: var(--text); }
    html.dark-theme .hud-box { background: rgba(15, 25, 40, .72); border-color: rgba(204, 220, 240, .42); color: var(--text); }
    .theme-toggle { position: fixed; top: 14px; right: 14px; z-index: 100; padding: 10px 14px; border: 3px solid #7c5c3d; border-radius: 6px; background: #fff7d6; color: #18314a; font: 12px 'Press Start 2P', monospace; cursor: pointer; box-shadow: 0 4px 0 #0004; }
    html.dark-theme .theme-toggle { background: #29384d; border-color: #8295ad; color: #edf4ff; }
    .theme-toggle:focus-visible { outline: 3px solid #4fa3ff; outline-offset: 3px; }
    @media (max-width: 600px) { .theme-toggle { top: 8px; right: 8px; padding: 8px; font-size: 9px; } }
  `;

  function readTheme() {
    try { return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  }

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark-theme', dark);
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch { /* Storage can be disabled; theme still works for this page. */ }
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.textContent = dark ? '☀ Light mode' : '🌙 Dark mode';
      toggle.setAttribute('aria-pressed', String(dark));
    }
  }

  function initialize() {
    if (document.querySelector('.theme-toggle')) return;
    const style = document.createElement('style');
    style.id = 'learnquest-theme-styles';
    style.textContent = styles;
    document.head.appendChild(style);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle color theme');
    toggle.addEventListener('click', () => {
      applyTheme(document.documentElement.classList.contains('dark-theme') ? 'light' : 'dark');
    });
    document.body.appendChild(toggle);
    applyTheme(readTheme());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
