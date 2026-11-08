# Shola-ed-game

A small static learning-and-game project. Open `Shola-Apps.html` (or publish the repository with GitHub Pages) to use the app launcher.

## Apps

- `index.html` — Village Run and Classic quiz game.
- `Shola-Learning-App.html` — bilingual grade-based quiz.
- `Ask-AI.html` — student-friendly AI question form. It uses the service URL in `config.js`; the external service must be online and permit browser requests (CORS).
- `character-preview.html` — interactive hero preview.

The launcher adds `theme.js` and `level-lock.js` to the game page. Dark mode and unlocked-level progress are saved in the current browser. Level progress is local to that browser and is not an account-based save.

## Run locally

Serve the repository root with any static web server (for example, `python -m http.server`) and open `Shola-Apps.html`. Using a local server is recommended so iframe navigation and scripts behave consistently. The AI page requires network access to its configured backend.
