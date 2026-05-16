# Collocation Monster Battle - Source of Truth

## Goal

Build a classroom web game for reviewing sports collocations with `play`, `go`, and `do`.

Students join a teacher room by link, enter their names, and take turns fighting a monster. Each turn shows one sport and the selected student has 5 seconds to choose `play`, `go`, or `do`.

## Collocation Set

- `play`: football, basketball, volleyball, badminton, pickleball, tennis, chess
- `go`: cycling, jogging, fishing, swimming
- `do`: yoga, karate, aerobics

## Version 1 Scope

- Local web server with no package dependencies.
- Teacher can create/reset a room and copy a student join link.
- Student landing page accepts name and joins the room.
- Teacher battle screen randomly selects students.
- Each student gets 2 turns before the boss should be defeated when all answers are correct.
- 5-second timer per turn.
- Correct answer damages monster.
- Wrong answer or timeout damages class.
- AI-generated battle artwork stored in `assets/battle-arena.png`.

## Milestones

- [x] Create project source-of-truth log.
- [x] Generate project-bound battle arena artwork.
- [x] Implement static app shell.
- [x] Implement game state, room join, random turns, and timer.
- [x] Style responsive battle UI with progressive disclosure.
- [x] Verify locally.

## Decisions

- Keep V1 backend-free so the teacher can open and test instantly.
- Use a tiny Node server with Server-Sent Events for multi-device classroom play on the same network.
- Keep `localStorage` and `BroadcastChannel` as a file-open fallback.
- Use a single generated bitmap for the setting/characters, then layer deterministic UI on top.
- Avoid inline rule explanations in the main battle area; put roster, answer key, and admin actions into compact panels/details.

## Change Log

### 2026-05-16 12:39 +07 - Initial playable build

- Added a static browser game with teacher and student entry modes.
- Replaced a plain worksheet-style flow with a battle screen using generated arena artwork.
- Added room code handling, join-link copy, roster display, random turn selection, 5-second timer, and `play/go/do` answer options.
- Added boss/class HP logic: monster HP is based on `students x 2 turns`, so a perfect class run ends after every student has had two turns.
- Moved non-essential information into collapsible Answer Key and Teacher Controls panels to preserve the battle workspace.

### 2026-05-16 12:45 +07 - Classroom sync upgrade

- Replaced browser-only room sync with a dependency-free Node server.
- Added live room updates via Server-Sent Events so students on other devices can join the teacher room by link.
- Kept the original browser storage fallback for opening `index.html` directly.

### 2026-05-16 12:47 +07 - Verification

- Confirmed `app.js` and `server.js` parse successfully with Node syntax checks.
- Started the local server on port `4173`.
- Confirmed the homepage and room API respond successfully.

### 2026-05-16 12:51 +07 - Student UI and motion pass

- Hid Answer Key and Teacher Controls from the student battle interface.
- Added animated character/monster layers using the generated battle artwork so the scene no longer feels like a flat still image.
- Added idle charging, hero attack, monster attack, hurt shake, and impact burst states tied to active/resolved turns.

### 2026-05-16 18:57 +07 - Battle clarity and feedback pass

- Hid the Roster side panel from the student interface; it remains available to the teacher for classroom control.
- Increased the turn timer from 5 seconds to 10 seconds.
- Set monster max HP to match class max HP at `100/100`.
- Added projectile, slash, boom, monster counterattack, and crying `HUHU` visual feedback.
- Added Web Audio sound effects for hero attacks and monster counterattacks without adding external audio files.

### 2026-05-16 19:04 +07 - Command card polish

- Reworked the answer area from a plain form-like panel into a livelier battle command card.
- Added timer ring, animated card glow, sport-card label, pop-in prompt motion, and pressable answer buttons.
- Converted feedback text into a compact status banner so the card feels more interactive and less like a worksheet.

### 2026-05-16 19:14 +07 - Student avatar and sport illustrations

- Extracted sport illustrations from `Handout - Lesson C1.pdf` into `assets/handout-extract`.
- Cropped volleyball and pickleball from the rendered handout page into `assets/sports`.
- Added a generated initials avatar next to the active student's name.
- Increased the active student name size and weight for stronger classroom visibility.
- Added an animated sport illustration panel beside the sport prompt.

### 2026-05-16 19:19 +07 - Layout and character avatar pass

- Moved the question card to the lower center of the battle field so it no longer covers the hero team on the left.
- Reduced prompt card height and option spacing to preserve more stage area.
- Replaced initials avatars with stable student character avatars from the handout artwork.

### 2026-05-16 19:23 +07 - HUHU visibility fix

- Moved the crying `HUHU` effect out of the background motion layer and into a foreground overlay.
- Repositioned the crying effect above the question card so it remains visible during monster counterattacks.

### 2026-05-16 19:26 +07 - Resolved-turn stage focus

- Changed the battle flow so the question card hides after a student answers or times out.
- Added a compact result overlay and teacher-only Next Turn button while attack/counterattack effects play.
- The question card appears again only when the teacher starts the next turn.

### 2026-05-16 19:29 +07 - Audio and longer attack timing

- Added a topbar music toggle button with generated background battle music.
- Added a spoken `hey ya` cue when attacks/counterattacks trigger.
- Extended attack and counterattack visual effects to 4 seconds.

### 2026-05-16 19:32 +07 - Sport-specific attack prototype

- Added a sport attack prop that uses the current sport illustration as the attack object.
- Added a basketball-specific dunk arc that drops onto the monster.
- Added grouped sport-specific motion styles: football kick, racket smash, speed rush, and generic strike.
- The sport-specific attack appears only on correct answers.

### 2026-05-16 23:05 +07 - Character rush and sad hit states

- Changed `cycling`, `jogging`, and `swimming` correct-answer attacks so the hero character layer rushes forward instead of sending a sport icon.
- Added sad face overlays for the monster when hit and the hero team when counterattacked.
- Dimmed/desaturated the side that gets hit during the 4-second attack window.
- Background music now pauses during attack/counterattack sound effects and resumes afterward if it was on.

### 2026-05-17 00:08 +07 - Flashcard cards and explicit sport attacks

- Upgraded sport cards to use the provided `Flashcard - Lesson 01` images.
- Updated attack mapping to match each requested action: football kick, basketball/volleyball dunk, racket/paddle smash, chess flick, cycling crash, swimming water whip, fishing fish-whack, and yoga/karate/aerobics kick strikes.
- Made hit reactions more physical by moving the full character/monster layer downward and sideways during sad/hurt states.

### 2026-05-17 00:17 +07 - Separate cards from character attacks

- Split question-card artwork from attack artwork so full flashcards no longer fly across the stage.
- Kept flashcards only inside the question card.
- Added hero-team movement variants for football, dunk sports, racket sports, chess, cycling, swimming, and fishing so the scene reads as characters performing the action.

### 2026-05-17 00:23 +07 - Restore visible sport cards

- Created trimmed versions of the flashcard images in `assets/flashcards-trimmed` to remove large white margins.
- Updated sport cards to use the trimmed images so the illustration appears clearly inside the card frame.
- Changed student avatar image fitting from cover to contain so character avatars do not crop into blank areas.

### 2026-05-17 00:55 +07 - Phaser migration checkpoint

- Added local Phaser runtime at `assets/phaser.min.js`.
- Added `phaser-scene.js` as the canvas-only battle/effects layer while keeping UI in DOM.
- Wired app state to Phaser with `battle:effect` events for correct/incorrect answers.
- Added generated-asset pipeline scripts:
  - `tools/generate-assets.mjs` reads `GEMINI_API_KEY` and `ELEVENLABS_API_KEY` from environment variables only.
  - `tools/audit-assets.mjs` checks required generated state sprites and writes `tmp/asset-audit.json`.
- Refactored turn logic toward the supplied queue/round/phase spec:
  - 3 target rounds per student.
  - shuffled queue each round.
  - HP calculation based on class size and assumed correct rate.
  - phase multiplier applied to monster damage on wrong answers.
- Added state normalization for older room payloads coming from the local server.

### 2026-05-17 01:15 +07 - API smoke test and asset audit hardening

- Smoke-tested Gemini image generation with `gemini-2.5-flash-image`; the API call succeeded for one sample asset.
- The generated sample failed the asset audit because it returned RGB with a fake checkerboard background instead of real alpha.
- Smoke-tested ElevenLabs and generated `assets/audio/hey-ya.mp3`.
- Updated the app to prefer the generated ElevenLabs `hey-ya.mp3` voice cue before falling back to browser speech synthesis.
- Updated the audit script to fail PNGs without alpha channels.
- Updated the Gemini prompt to request flat chroma-key fallback if true transparency is unavailable.

### 2026-05-17 01:35 +07 - Dokploy deployment setup

- Added `package.json` with `npm start` as the production entrypoint.
- Added a root `Dockerfile` using Node 22 Alpine, `PORT=3000`, non-root runtime, and a `/health` healthcheck.
- Added `.dockerignore` so local scratch files, secrets, and generated unaudited assets are not copied into the deploy image.
- Added `/health` to `server.js` for Dokploy/container health checks.
- Documented the Dokploy settings in `README.md`.
