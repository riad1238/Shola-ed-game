/*
 * Level progression add-on for Shola-ed-game.
 *
 * To enable it, add this after the game's existing inline <script>:
 *   <script src="level-lock.js"></script>
 *
 * Progress is stored in this browser, separately for each subject.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'learnQuestUnlockedLevels';
  const completedLevels = new Set();
  let levelGridObserver;

  function gameIsReady() {
    return typeof state !== 'undefined'
      && typeof levels !== 'undefined'
      && typeof subjects !== 'undefined';
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  }

  function unlockedCount(subject = state.selectedSubject) {
    const progress = readProgress();
    const count = Number(progress[subject] || 1);
    return Number.isInteger(count) ? Math.max(1, Math.min(levels.length, count)) : 1;
  }

  function saveUnlockedCount(subject, count) {
    const progress = readProgress();
    progress[subject] = Math.max(1, Math.min(levels.length, count));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn('Could not save level progress.', error);
    }
  }

  function addStyles() {
    if (document.getElementById('level-lock-styles')) return;

    const style = document.createElement('style');
    style.id = 'level-lock-styles';
    style.textContent = `
      #levelGrid .option-card.locked,
      #levelGrid .option-card:disabled {
        cursor: not-allowed;
        opacity: 0.55;
        filter: grayscale(0.75);
      }
      #levelGrid .option-card.locked:hover,
      #levelGrid .option-card:disabled:hover {
        transform: none;
      }
    `;
    document.head.appendChild(style);
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
      card.disabled = locked;
      card.classList.toggle('locked', locked);
      card.setAttribute('aria-disabled', String(locked));
      card.title = locked ? 'Finish the previous level first' : '';

      if (title) {
        title.textContent = title.textContent.replace(/^🔒\s*/, '');
        if (locked) title.textContent = `🔒 ${title.textContent}`;
      }
    });

    // Keep the selected level valid when changing to a subject with less progress.
    const validSelection = Math.min(state.selectedLevel, count - 1);
    if (validSelection !== state.selectedLevel) {
      state.selectedLevel = validSelection;
      cards.forEach((card, index) => card.classList.toggle('active', index === validSelection));
    }
  }

  function guardStart(event) {
    if (!gameIsReady() || state.mode !== 'village') return;

    if (state.selectedLevel >= unlockedCount()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('Finish the previous level first!');
    }
  }

  function checkForLevelCompletion() {
    if (!gameIsReady() || state.mode !== 'village') return;
    if (!Number.isFinite(state.totalEnemiesNeeded) || state.totalEnemiesNeeded <= 0) return;
    if (state.enemiesDefeated < state.totalEnemiesNeeded) return;
    if (state.selectedLevel >= levels.length - 1) return;

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

    addStyles();
    renderLocks();

    const startButton = document.getElementById('startAdventureBtn');
    if (startButton) startButton.addEventListener('click', guardStart, true);

    const levelGrid = document.getElementById('levelGrid');
    if (levelGrid) {
      levelGridObserver = new MutationObserver(renderLocks);
      levelGridObserver.observe(levelGrid, { childList: true, subtree: true });
    }

    const subjectGrid = document.getElementById('subjectGrid');
    if (subjectGrid) {
      subjectGrid.addEventListener('click', () => setTimeout(renderLocks, 0));
    }

    // The existing game updates enemiesDefeated when the final enemy is answered.
    // Polling only observes that existing state; it does not change game behavior.
    window.setInterval(checkForLevelCompletion, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
