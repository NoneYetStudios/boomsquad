# BOOM SQUAD // Department of Boom Prevention (STF Arcade)

**BOOM SQUAD** is an industrial-themed, procedural bomb-disposal puzzle arcade game built for **STF Arcade**. As an operative in the Department of Boom Prevention, you respond to volatile incidents involving unauthorized countdown appliances, suspicious briefcases, explosive decorative gourds, and the legendary, self-relocating Corporate Breakroom Fish Container.

---

## Key Features

- **8 Procedural Tactile Modules**:
  - ✂️ **Wire Panel**: Color/stripe rules, last-digit serial parity checks, and battery constraints.
  - 🔢 **Keypad Decoder**: Greek/technical glyph sequence decoding across 5 cipher tiers.
  - 📡 **Frequency Dial**: Interactive oscilloscope matching MHz carrier frequencies and wave modes (Sine, Square, Triangle).
  - 🎛️ **Switch Matrix**: Voltage and KVA electrical sequencing.
  - 🧠 **Pattern Memory**: Multi-stage recall tracking both display positions and button labels.
  - 🔀 **Boolean Logic Gates**: Dual-gate signal chains evaluating AND, OR, NOT, XOR, and NAND truth tables.
  - 🚨 **Safety Override**: Color-coded keycard authentication with checksum arithmetic.
  - 💥 **Emergency Dial-11**: High-voltage surge stabilization under accelerated countdowns.

- **No Clue Leakage / Deductive Integrity**:
  - Normal gameplay presents rules, clues, and telemetry formulas without prematurely revealing computed solutions.
  - Dedicated `[TRAINING AID: ...]` worked examples appear strictly within Training Mode missions.

- **Bomb Tech Visor (Inspection Optics MK-IV)**:
  - Circular high-magnification lens with pass-through inspection optics.
  - Multi-level optical zoom (2x, 3x, 4x) adjusted via <kbd>+</kbd> and <kbd>-</kbd> keys.
  - Hotkey toggle via <kbd>M</kbd> or the chassis HUD button.
  - **Focus Inspection Mode** (<kbd>Shift</kbd> + <kbd>M</kbd>): Engages click protection to prevent accidental triggers while inspecting micro-labels, with 78% perimeter dimming and amber reticle alerts.
  - Smooth, flicker-free rendering with atomic DOM synchronization and zero countdown-clock thrashing.

- **Difficulty Dial (Tiers 1–11)**:
  - Adjustable difficulty scaling from Training (Dial 1) to "TURBO EXTREME // DANGER" (Dial 11).
  - Integrated **Dispatch Dial Advisory** panel displaying real-time situational guidance.
  - Interactive background radio chatter with optional Web Speech API voice synthesis.

- **Departmental Commendations (18 Achievements)**:
  - 18 distinct achievements covering defusal speed, streaks, ranks, fish container lore, and tactical optics.
  - Formatted in an even 6×3 grid with zero trailing blank slots.

- **Persistent Career Ranks & Leaderboard**:
  - 8 corporate promotions from *Junior Boom Technician (JBT-1)* to *Chief Executive of Not Booming (CENB-8)*.
  - Hybrid leaderboard architecture: Uses PHP file-backed storage (`api/` + `data/`) with automatic offline `localStorage` fallback.

---

## Project Architecture & Directory Structure

All asset and script references use strictly relative paths (`./assets/...`, `./api/...`), allowing the application to be hosted at the root or within any subdirectory.

```text
boomsquad/
├── index.html                        # Main single-page application entry point
├── favicon.svg                       # High-definition scalable SVG favicon (tactical bomb badge)
├── favicon.ico                       # Standard 32x32 multi-platform fallback favicon
├── .htaccess                         # Root Apache server rules (security & routing)
├── .gitignore                        # Git ignore patterns for OS, IDE & temporary files
├── README.md                         # Project documentation and deployment guide
├── assets/
│   ├── css/
│   │   └── style.css                 # Industrial tactical UI, chassis, visor & layout styles
│   └── js/
│       ├── core/
│       │   ├── config.js             # Engine config (ranks, dial tiers, difficulty & API endpoints)
│       │   ├── storage.js            # Client-side localStorage persistence manager
│       │   ├── audio.js              # Web Audio API synthesizer & SpeechSynthesis voice engine
│       │   └── leaderboard.js        # Leaderboard client with PHP API sync & local fallback
│       ├── content/
│       │   ├── universe.js           # Lore, locations, organizations, training missions & achievements
│       │   ├── dispatch-data.js      # Procedural dispatch lines, fish lore & conflicting pairs
│       │   ├── briefings-data.js     # Mission briefing templates & complexity profiles
│       │   ├── reports-data.js       # Comedic failure diagnostics & success after-action reports
│       │   └── content-registry.js   # ContentRegistry runtime extension API
│       └── game/
│           ├── dispatch.js           # Live Radio Dispatch controller & telemetry UI
│           ├── modules.js            # Module mechanics, chassis generator & validation
│           ├── visor.js              # Bomb Tech Visor (Inspection Optics) controller
│           └── game.js               # Core game loop, state machine & screen navigation
├── api/
│   ├── .htaccess                     # Restricts direct access to internal bootstrap
│   ├── bootstrap.php                 # PHP sanitizer, CORS headers & locked file I/O
│   ├── leaderboard_fetch.php         # GET endpoint returning top leaderboard entries
│   └── leaderboard_submit.php        # POST endpoint validating and persisting scores
└── data/
    ├── .htaccess                     # Denies all direct HTTP requests (403 Forbidden)
    ├── index.php                     # Secondary 403 Forbidden fallback for non-Apache servers
    └── leaderboard_data.json         # Server-side leaderboard store (protected file)
```

---

## Local Development & Testing

No package manager, compiler, or build steps are required.

### 1. Static Web Server (Python or Node)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```
*Note: On static servers, the leaderboard automatically uses `localStorage` for complete offline functionality.*

### 2. Local PHP Server (Enables Live API Endpoints)
```bash
php -S localhost:8000
```
Visit `http://localhost:8000` in your browser.

---

## Public Deployment Guide (JetHost / cPanel / Apache / PHP)

JetHost runs standard Linux-based cPanel hosting powered by Apache / LiteSpeed with PHP support. BOOM SQUAD is designed to deploy cleanly with zero build configuration.

### Deployment Steps:

1. **Package the Repository Files**:
   Ensure all files and folders are included:
   - `index.html`
   - `favicon.svg` and `favicon.ico`
   - `.htaccess` *(make sure hidden dotfiles are visible in your file manager or FTP client)*
   - `assets/` (all subdirectories: `css/`, `js/`)
   - `api/` (including `api/.htaccess`)
   - `data/` (including `data/.htaccess`, `data/index.php`, and `data/leaderboard_data.json`)

2. **Upload to JetHost**:
   - **Root Domain Deployment**: Upload all files directly into `/public_html/`.
   - **Subdirectory Deployment**: Create a folder (e.g. `/public_html/boomsquad/`) and upload all files into it. Because all paths are relative (`./assets/...`, `./api/...`), no URL configuration changes are required.

3. **Verify File & Directory Permissions**:
   Under cPanel / JetHost (suPHP / lsphp environments):
   - Directories: `755` (e.g., `chmod 755 data api assets`)
   - Files: `644` (e.g., `chmod 644 data/leaderboard_data.json`)
   - The web server user needs write permission on the `data/` directory so PHP's `leaderboard_submit.php` can persist scores.

4. **Verify Security Rules**:
   Test direct access in your browser to verify that server-side data files cannot be inspected or downloaded directly:
   - `https://yourdomain.com/boomsquad/data/leaderboard_data.json` → **403 Forbidden** (Blocked by `.htaccess` and `data/index.php`)
   - `https://yourdomain.com/boomsquad/api/bootstrap.php` → **403 Forbidden** (Blocked by `.htaccess`)
   - `https://yourdomain.com/boomsquad/api/leaderboard_fetch.php` → **200 OK** (Returns clean JSON array)

5. **Offline / Fallback Resilience**:
   If PHP is unavailable, misconfigured, or experiencing database issues, the game's frontend in `assets/js/core/leaderboard.js` automatically falls back to client-side `localStorage`, ensuring the game remains playable without interruption.

---

## Extending Content & Custom Missions

New game content can be added without modifying the core state machine:
- **New Achievements or Locations**: Edit `assets/js/content/universe.js` or call `ContentRegistry.registerAchievement({...})`.
- **New Radio Dispatch Lines**: Edit `assets/js/content/dispatch-data.js` or call `ContentRegistry.registerDispatchMessage("...", isFish)`.
- **New Mission Briefing Templates**: Edit `assets/js/content/briefings-data.js` or call `ContentRegistry.registerBriefing({...})`.
- **New After-Action Reports**: Edit `assets/js/content/reports-data.js` or call `ContentRegistry.registerFailureReport("...")`.

---

## License & Credits

Developed for **STF Arcade** and the **Department of Boom Prevention**.  
All rights reserved. Unauthorized countdown appliances will be defused or relocated to the breakroom.
