/* Per-subject level progression for the Village Run game. */
(() => {
  'use strict';

  const STORAGE_KEY = 'learnQuestUnlockedLevels';
  const completedLevels = new Set();

  function gameIsReady() {
    return typeof state !== 'undefined' && typeof levels !== 'undefined' && Array.isArray(levels);
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch { return {}; }
  }

  function unlockedCount(subject = state.selectedSubject) {
    const value = Number(readProgress()[subject] || 1);
    return Number.isInteger(value) ? Math.max(1, Math.min(levels.length, value)) : 1;
  }

  function saveUnlockedCount(subject, count) {
    const progress = readProgress();
    progress[subject] = Math.max(1, Math.min(levels.length, count));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch (error) { console.warn('Could not save level progress.', error); }
  }

  function renderLocks() {
    if (!gameIsReady()) return;
    const grid = document.getElementById('levelGrid');
    if (!grid) return;

    const count = unlockedCount();
    const cards = grid.querySelectorAll('.option-card');
    cards.forEach((card, index) => {
      const locked = index >= count;
      const title = card.querySelector('.option-title');
      if (title) {
        if (!title.dataset.levelName) title.dataset.levelName = title.textContent.replace(/^🔒\s*/, '');
        const text = `${locked ? '🔒 ' : ''}${title.dataset.levelName}`;
        if (title.textContent !== text) title.textContent = text;
      }
      if (card.disabled !== locked) card.disabled = locked;
      card.classList.toggle('locked', locked);
      card.setAttribute('aria-disabled', String(locked));
      card.title = locked ? 'Finish the previous level first' : '';
    });

    const validSelection = Math.min(state.selectedLevel, count - 1);
    if (validSelection !== state.selectedLevel) state.selectedLevel = validSelection;
    cards.forEach((card, index) => card.classList.toggle('active', index === state.selectedLevel));
  }

  function guardStart(event) {
    if (!gameIsReady() || state.mode !== 'village') return;
    if (state.selectedLevel >= unlockedCount()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.alert('Finish the previous level first!');
    }
  }

  function checkForLevelCompletion() {
    if (!gameIsReady() || state.mode !== 'village') return;
    if (!Number.isFinite(state.totalEnemiesNeeded) || state.totalEnemiesNeeded <= 0) return;
    if (state.enemiesDefeated < state.totalEnemiesNeeded || state.selectedLevel >= levels.length - 1) return;

    const subject = state.selectedSubject;
    const levelIndex = state.selectedLevel;
    const completionId = `${subject}:${levelIndex}`;
    if (completedLevels.has(completionId)) return;
    completedLevels.add(completionId);
    saveUnlockedCount(subject, Math.max(unlockedCount(subject), levelIndex + 2));
    renderLocks();
  }

  function initialize() {
    if (!gameIsReady()) return;
    const style = document.createElement('style');
    style.id = 'level-lock-styles';
    style.textContent = '#levelGrid .option-card.locked { cursor:not-allowed; opacity:.55; filter:grayscale(.75); } #levelGrid .option-card.locked:hover { transform:none; }';
    document.head.appendChild(style);
    renderLocks();

    const startButton = document.getElementById('startAdventureBtn');
    if (startButton) startButton.addEventListener('click', guardStart, true);

    const grid = document.getElementById('levelGrid');
    if (grid) new MutationObserver(renderLocks).observe(grid, { childList: true, subtree: true });
    const subjectGrid = document.getElementById('subjectGrid');
    if (subjectGrid) subjectGrid.addEventListener('click', () => window.setTimeout(renderLocks, 0));
    window.setInterval(checkForLevelCompletion, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
