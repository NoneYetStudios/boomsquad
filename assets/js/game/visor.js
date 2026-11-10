/**
 * BOOM SQUAD - Bomb Tech Visor (Inspection Optics System)
 * Department of Boom Prevention Equipment Mk. IV
 *
 * Provides a real-time 2x / 3x / 4x circular tactical magnifier that follows
 * the cursor/touch point, allows pass-through puzzle interaction, supports
 * optional Focus Inspection Mode and Always-On mode, and integrates with Dispatch.
 */

class BombTechVisor {
    constructor() {
        this.active = false;
        this.magnification = 2; // 2, 3, or 4
        this.focusMode = false;
        this.alwaysOn = false;
        this.lensDiameter = 260;
        this.lensRadius = 130;

        this.cursorX = window.innerWidth ? Math.round(window.innerWidth / 2) : 480;
        this.cursorY = window.innerHeight ? Math.round(window.innerHeight / 2) : 320;
        this.isTouchPosition = false;

        this.hasAnnouncedFirstActivation = false;
        this.lastChatterTime = 0;

        this.rafMovePending = false;
        this.rafSyncPending = false;
        this.mutationObserver = null;

        this.overlayEl = null;
        this.backdropEl = null;
        this.lensEl = null;
        this.viewportEl = null;
        this.mirrorStageEl = null;
        this.magBadgeEl = null;
        this.telemetryEl = null;
        this.coordsEl = null;
    }

    init() {
        // Load persisted visor settings from storage
        if (typeof storage !== "undefined" && storage.settings) {
            const savedMag = Number(storage.settings.visorMagnification);
            if ([2, 3, 4].includes(savedMag)) {
                this.magnification = savedMag;
            }
            this.focusMode = Boolean(storage.settings.visorFocusMode);
            this.alwaysOn = Boolean(storage.settings.visorAlwaysOn);
        }

        this.overlayEl = document.getElementById("bomb-tech-visor-overlay");
        this.backdropEl = document.getElementById("bomb-tech-visor-backdrop");
        this.lensEl = document.getElementById("bomb-tech-visor-lens");
        this.viewportEl = document.getElementById("visor-optical-viewport");
        this.mirrorStageEl = document.getElementById("visor-mirror-stage");
        this.magBadgeEl = document.getElementById("visor-hud-mag-readout");
        this.telemetryEl = document.getElementById("visor-hud-target-readout");
        this.coordsEl = document.getElementById("visor-hud-coords");

        this.bindEvents();
        this.updateHUDButtons();

        if (this.alwaysOn) {
            this.setActive(true, false);
        }
    }

    bindEvents() {
        // HUD Toggle & Magnification Cycle buttons (Header + Chassis HUD + Training Banner)
        const bindBtn = (id, fn) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (typeof audio !== "undefined") audio.playButton(640);
                    fn();
                });
            }
        };

        bindBtn("header-visor-toggle", () => this.toggle());
        bindBtn("header-visor-mag-btn", () => this.cycleMagnification());
        bindBtn("chassis-visor-toggle", () => this.toggle());
        bindBtn("chassis-visor-mag-btn", () => this.cycleMagnification());
        bindBtn("chassis-visor-focus-btn", () => this.toggleFocusMode());
        bindBtn("training-visor-demo-btn", () => {
            if (!this.active) this.setActive(true, true);
            else this.cycleMagnification();
        });

        // Backdrop click closes visor when in Focus Inspection Mode
        if (this.backdropEl) {
            this.backdropEl.addEventListener("click", () => {
                if (this.active && this.focusMode) {
                    if (typeof audio !== "undefined") audio.playButton(460);
                    this.setActive(false, false);
                }
            });
        }

        // Keyboard shortcut: 'M' toggles Bomb Tech Visor; 'Escape' closes if not Always-On
        // '+' / '-' adjusts magnification between 2x, 3x, and 4x when optics are active
        window.addEventListener("keydown", (e) => {
            const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "";
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                return;
            }
            if (e.key === "m" || e.key === "M") {
                e.preventDefault();
                if (e.shiftKey) {
                    this.toggleFocusMode();
                } else {
                    if (typeof audio !== "undefined") audio.playButton(this.active ? 460 : 660);
                    this.toggle();
                }
            } else if (
                this.active &&
                (e.key === "+" || e.key === "=" || e.code === "NumpadAdd" || e.code === "Equal")
            ) {
                e.preventDefault();
                this.increaseMagnification();
            } else if (
                this.active &&
                (e.key === "-" || e.key === "_" || e.code === "NumpadSubtract" || e.code === "Minus")
            ) {
                e.preventDefault();
                this.decreaseMagnification();
            } else if (this.active && (e.key === "2" || e.key === "3" || e.key === "4") && e.altKey) {
                e.preventDefault();
                this.setMagnification(Number(e.key));
            } else if (this.active && !this.alwaysOn && e.key === "Escape") {
                this.setActive(false, false);
            }
        });

        // Mouse movement tracking
        window.addEventListener(
            "mousemove",
            (e) => {
                this.cursorX = e.clientX;
                this.cursorY = e.clientY;
                this.isTouchPosition = false;
                if (this.active) {
                    this.schedulePositionUpdate();
                }
            },
            { passive: true }
        );

        // Touch support for mobile/tablet inspection
        window.addEventListener(
            "touchstart",
            (e) => {
                if (!this.active || !e.touches || e.touches.length === 0) return;
                const t = e.touches[0];
                this.cursorX = t.clientX;
                // Offset lens slightly above finger on touchscreens so finger doesn't block view
                this.cursorY = Math.max(60, t.clientY - 64);
                this.isTouchPosition = true;
                this.schedulePositionUpdate();
            },
            { passive: true }
        );

        window.addEventListener(
            "touchmove",
            (e) => {
                if (!this.active || !e.touches || e.touches.length === 0) return;
                const t = e.touches[0];
                this.cursorX = t.clientX;
                this.cursorY = Math.max(60, t.clientY - 64);
                this.isTouchPosition = true;
                this.schedulePositionUpdate();
            },
            { passive: true }
        );

        // Sync mirror when user interacts with modules or scrolls/resizes
        window.addEventListener(
            "click",
            () => {
                if (this.active) {
                    this.scheduleMirrorSync();
                }
            },
            true
        );

        window.addEventListener(
            "input",
            () => {
                if (this.active) {
                    this.scheduleMirrorSync();
                }
            },
            true
        );

        window.addEventListener(
            "scroll",
            () => {
                if (this.active) {
                    this.schedulePositionUpdate();
                }
            },
            { passive: true }
        );

        window.addEventListener(
            "resize",
            () => {
                if (this.active) {
                    this.scheduleMirrorSync();
                }
            },
            { passive: true }
        );

        // Observe DOM mutations on main-stage while visor is active
        const mainStage = document.querySelector(".main-stage");
        if (mainStage && typeof MutationObserver !== "undefined") {
            let lastSyncTime = 0;
            this.mutationObserver = new MutationObserver((mutations) => {
                if (!this.active) return;

                let hasRelevantChange = false;
                let hasClockChange = false;

                for (const m of mutations) {
                    const target = m.target;
                    const el = target ? (target.nodeType === 1 ? target : target.parentElement) : null;
                    const isClock = el && typeof el.closest === "function" && (
                        el.closest(".chassis-clock-box") ||
                        el.closest("#countdown-clock")
                    );

                    if (isClock) {
                        hasClockChange = true;
                    } else {
                        hasRelevantChange = true;
                    }
                }

                // If clock changed, update the mirror clock element directly without re-cloning
                if (hasClockChange && this.mirrorStageEl) {
                    const liveClock = document.getElementById("countdown-clock");
                    const mirrorClock = this.mirrorStageEl.querySelector('[data-visor-source-id="countdown-clock"]');
                    if (liveClock && mirrorClock) {
                        mirrorClock.textContent = liveClock.textContent;
                        mirrorClock.className = liveClock.className;
                    }
                }

                // Only schedule a full DOM re-clone if non-clock elements changed (throttled)
                if (hasRelevantChange) {
                    const now = Date.now();
                    if (now - lastSyncTime > 150) {
                        lastSyncTime = now;
                        this.scheduleMirrorSync();
                    }
                }
            });

            this.mutationObserver.observe(mainStage, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
    }

    toggle() {
        this.setActive(!this.active, true);
    }

    setActive(nextState, triggerDispatch = true) {
        this.active = Boolean(nextState);

        if (document.body && document.body.classList) {
            document.body.classList.toggle("visor-active", this.active);
            document.body.classList.toggle(
                "visor-focus-active",
                this.active && this.focusMode
            );
        }

        if (this.overlayEl) {
            this.overlayEl.style.display = this.active ? "block" : "none";
            this.overlayEl.classList.toggle("active", this.active);
            this.overlayEl.classList.toggle(
                "focus-mode",
                this.active && this.focusMode
            );
            this.overlayEl.setAttribute("aria-hidden", String(!this.active));
        }

        if (this.backdropEl) {
            this.backdropEl.style.display =
                this.active && this.focusMode ? "block" : "none";
        }

        this.updateHUDButtons();

        if (this.active) {
            this.syncMirrorNow();
            this.updateLensPositionNow();
            if (triggerDispatch) {
                this.announceVisorActivation();
            }
            if (typeof game !== "undefined" && game) {
                if (game.currentScreen === "screen-game" || game.activeMission) {
                    game.usedVisorThisMission = true;
                    if (typeof game.checkAndToastAchievement === "function") {
                        game.checkAndToastAchievement("precision_optics");
                    }
                }
            }
        } else {
            if (this.mirrorStageEl) {
                this.mirrorStageEl.innerHTML = "";
            }
        }
    }

    cycleMagnification() {
        const nextMag = this.magnification === 2 ? 3 : this.magnification === 3 ? 4 : 2;
        this.setMagnification(nextMag, true);
    }

    increaseMagnification() {
        if (this.magnification < 4) {
            this.setMagnification(this.magnification + 1, true);
            if (typeof audio !== "undefined") audio.playButton(720);
        } else {
            if (typeof audio !== "undefined") audio.playButton(420);
        }
    }

    decreaseMagnification() {
        if (this.magnification > 2) {
            this.setMagnification(this.magnification - 1, true);
            if (typeof audio !== "undefined") audio.playButton(540);
        } else {
            if (typeof audio !== "undefined") audio.playButton(420);
        }
    }

    setMagnification(magValue, announce = false) {
        const validMag = [2, 3, 4].includes(Number(magValue)) ? Number(magValue) : 2;
        this.magnification = validMag;

        if (typeof storage !== "undefined" && typeof storage.saveSettings === "function") {
            storage.saveSettings({ visorMagnification: validMag });
        }

        const optMagSelect = document.getElementById("opt-visor-magnification");
        if (optMagSelect) {
            optMagSelect.value = String(validMag);
        }

        this.updateHUDButtons();
        if (this.active) {
            this.updateLensPositionNow();
            if (announce) {
                this.maybeTransmitOpticsQuip();
            }
        }
    }

    toggleFocusMode() {
        this.setFocusMode(!this.focusMode);
    }

    setFocusMode(enabled) {
        this.focusMode = Boolean(enabled);
        if (typeof storage !== "undefined" && typeof storage.saveSettings === "function") {
            storage.saveSettings({ visorFocusMode: this.focusMode });
        }
        const optFocusCheck = document.getElementById("opt-visor-focus-mode");
        if (optFocusCheck) {
            optFocusCheck.checked = this.focusMode;
        }
        if (document.body && document.body.classList) {
            document.body.classList.toggle(
                "visor-focus-active",
                this.active && this.focusMode
            );
        }
        if (this.overlayEl) {
            this.overlayEl.classList.toggle(
                "focus-mode",
                this.active && this.focusMode
            );
        }
        if (this.backdropEl) {
            this.backdropEl.style.display =
                this.active && this.focusMode ? "block" : "none";
        }
        this.updateHUDButtons();
    }

    setAlwaysOn(enabled) {
        this.alwaysOn = Boolean(enabled);
        if (typeof storage !== "undefined" && typeof storage.saveSettings === "function") {
            storage.saveSettings({ visorAlwaysOn: this.alwaysOn });
        }
        if (this.alwaysOn && !this.active) {
            this.setActive(true, false);
        }
        this.updateHUDButtons();
    }

    announceVisorActivation() {
        if (typeof FLAVOR_DB === "undefined" || !FLAVOR_DB.visorDispatchMessages) return;
        const visorLines = FLAVOR_DB.visorDispatchMessages;

        if (!this.hasAnnouncedFirstActivation) {
            this.hasAnnouncedFirstActivation = true;
            this.lastChatterTime = Date.now();
            const firstMsg = visorLines.firstActivation;
            if (typeof dispatch !== "undefined" && typeof dispatch.transmit === "function") {
                dispatch.transmit(firstMsg, "EQUIPMENT OPTICS", "hint", true);
            } else if (typeof audio !== "undefined") {
                audio.speakDispatch(firstMsg, false);
            }
            return;
        }

        this.maybeTransmitOpticsQuip();
    }

    maybeTransmitOpticsQuip() {
        const now = Date.now();
        if (now - this.lastChatterTime < 8000) return;
        if (typeof FLAVOR_DB === "undefined" || !FLAVOR_DB.visorDispatchMessages) return;

        const pool = FLAVOR_DB.visorDispatchMessages.additional || [];
        if (pool.length === 0) return;

        // Context-aware selection if inspecting a fish incident
        let chosen = pool[Math.floor(Math.random() * pool.length)];
        if (
            typeof game !== "undefined" &&
            game.activeMission &&
            game.activeMission.isFishIncident &&
            Math.random() < 0.65
        ) {
            chosen = "The optics are rated for bomb components, not fish containers.";
        }

        this.lastChatterTime = now;
        if (typeof dispatch !== "undefined" && typeof dispatch.transmit === "function") {
            dispatch.transmit(chosen, "OPTICS TELEMETRY", "hint", false);
        }
    }

    updateHUDButtons() {
        const headerToggle = document.getElementById("header-visor-toggle");
        const headerMag = document.getElementById("header-visor-mag-btn");
        const chassisToggle = document.getElementById("chassis-visor-toggle");
        const chassisMag = document.getElementById("chassis-visor-mag-btn");
        const chassisFocus = document.getElementById("chassis-visor-focus-btn");

        const statusLabel = this.active ? `🔭 VISOR [M]: ON` : `🔭 VISOR [M]: OFF`;
        const magLabel = `${this.magnification}x OPTICS`;

        if (headerToggle) {
            headerToggle.textContent = statusLabel;
            headerToggle.classList.toggle("visor-btn-on", this.active);
        }
        if (headerMag) {
            headerMag.textContent = magLabel;
        }
        if (chassisToggle) {
            chassisToggle.textContent = this.active ? "🔭 VISOR: ON [M]" : "🔭 VISOR: OFF [M]";
            chassisToggle.classList.toggle("visor-btn-on", this.active);
        }
        if (chassisMag) {
            chassisMag.textContent = `${this.magnification}x`;
        }
        if (chassisFocus) {
            chassisFocus.textContent = this.focusMode ? "🎯 FOCUS: ON" : "🎯 FOCUS: OFF";
            chassisFocus.classList.toggle("visor-btn-on", this.focusMode);
        }
        if (this.magBadgeEl) {
            this.magBadgeEl.textContent = `DBP OPTICS // ${this.magnification}.0x`;
        }
    }

    schedulePositionUpdate() {
        if (this.rafMovePending) return;
        this.rafMovePending = true;
        requestAnimationFrame(() => {
            this.rafMovePending = false;
            if (this.active) {
                this.updateLensPositionNow();
            }
        });
    }

    scheduleMirrorSync() {
        if (this.rafSyncPending) return;
        this.rafSyncPending = true;
        requestAnimationFrame(() => {
            this.rafSyncPending = false;
            if (this.active) {
                this.syncMirrorNow();
                this.updateLensPositionNow();
            }
        });
    }

    syncMirrorNow() {
        if (!this.mirrorStageEl) return;
        const mainStage = document.querySelector(".main-stage");
        if (!mainStage) return;

        const clone = mainStage.cloneNode(true);

        // Strip duplicate IDs from cloned nodes so document.getElementById() always hits live DOM
        clone.querySelectorAll("[id]").forEach((el) => {
            el.setAttribute("data-visor-source-id", el.id);
            el.removeAttribute("id");
        });

        // Copy live <canvas> pixel bitmaps (e.g., Frequency Dial oscilloscope) into cloned canvases
        const srcCanvases = mainStage.querySelectorAll("canvas");
        const dstCanvases = clone.querySelectorAll("canvas");
        srcCanvases.forEach((srcCanvas, idx) => {
            const dstCanvas = dstCanvases[idx];
            if (dstCanvas && typeof dstCanvas.getContext === "function") {
                const ctx = dstCanvas.getContext("2d");
                if (ctx) {
                    try {
                        ctx.drawImage(srcCanvas, 0, 0);
                    } catch (e) {
                        // Ignore cross-context draw errors in headless environments
                    }
                }
            }
        });

        // Sync live <input> and <select> values
        const srcInputs = mainStage.querySelectorAll("input, select");
        const dstInputs = clone.querySelectorAll("input, select");
        srcInputs.forEach((srcInp, idx) => {
            const dstInp = dstInputs[idx];
            if (dstInp) {
                dstInp.value = srcInp.value;
            }
        });

        // Atomic swap to prevent blank frames, layer invalidation, and visual strobing
        if (this.mirrorStageEl.firstElementChild) {
            this.mirrorStageEl.replaceChild(clone, this.mirrorStageEl.firstElementChild);
        } else {
            this.mirrorStageEl.appendChild(clone);
        }
    }

    updateLensPositionNow() {
        if (!this.lensEl || !this.mirrorStageEl) return;
        const mainStage = document.querySelector(".main-stage");
        if (!mainStage) return;

        const x = this.cursorX;
        const y = this.cursorY;
        const rect = this.lensEl.getBoundingClientRect ? this.lensEl.getBoundingClientRect() : null;
        const r = rect && rect.width > 0 ? rect.width / 2 : this.lensRadius;

        // Position circular visor lens centered on (x, y)
        const left = Math.round(x - r);
        const top = Math.round(y - r);
        this.lensEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;

        // Align scaled mirror stage so point (x, y) is centered at (r, r) inside the lens
        const stageRect = mainStage.getBoundingClientRect();
        this.mirrorStageEl.style.width = `${stageRect.width}px`;
        this.mirrorStageEl.style.height = `${stageRect.height}px`;

        const relX = x - stageRect.left;
        const relY = y - stageRect.top;
        const tx = Math.round(r - relX * this.magnification);
        const ty = Math.round(r - relY * this.magnification);

        this.mirrorStageEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${this.magnification})`;

        // Update tactical coordinates & target telemetry readout
        if (this.coordsEl) {
            this.coordsEl.textContent = `X:${String(Math.round(x)).padStart(4, "0")} Y:${String(
                Math.round(y)
            ).padStart(4, "0")}`;
        }
        if (this.telemetryEl) {
            this.telemetryEl.textContent = this.inspectElementAtCursor(x, y);
        }
    }

    inspectElementAtCursor(x, y) {
        if (typeof document.elementFromPoint !== "function") {
            return "OPTICAL SCAN ACTIVE";
        }
        const target = document.elementFromPoint(x, y);
        if (!target) return "SCANNING SECTOR...";

        // Check for specific Boom Squad tactical elements
        const wireBtn = target.closest && target.closest(".wire-row");
        if (wireBtn) {
            return `WIRE: ${wireBtn.getAttribute("title") || wireBtn.textContent.trim()}`;
        }

        const cipherPair = target.closest && target.closest(".cipher-pair");
        if (cipherPair) {
            return `CIPHER KEY: ${cipherPair.textContent.trim()}`;
        }

        const kpTarget = target.closest && target.closest(".keypad-cipher-target");
        if (kpTarget) {
            return `ENCRYPTED SYMBOLS: ${kpTarget.textContent.trim().replace(/\s+/g, " ")}`;
        }

        const freqScope = target.closest && target.closest(".freq-scope-wrap");
        if (freqScope) {
            const ro = freqScope.querySelector(".freq-readout");
            return `CARRIER WAVE: ${ro ? ro.textContent.trim() : "OSCILLOSCOPE"}`;
        }

        const swUnit = target.closest && target.closest(".sw-unit");
        if (swUnit) {
            const meta = swUnit.querySelector(".sw-meta");
            return `SWITCH LOAD: ${meta ? meta.textContent.trim() : "SEQUENCER"}`;
        }

        const logicNode = target.closest && target.closest(".logic-node-btn");
        if (logicNode) {
            return `LOGIC NODE: ${logicNode.textContent.trim().replace(/\s+/g, " ")}`;
        }

        const logicTele = target.closest && target.closest(".logic-telemetry");
        if (logicTele) {
            return `INPUT STATES: ${logicTele.textContent.trim().replace(/\s+/g, " ")}`;
        }

        const memBtn = target.closest && target.closest(".mem-btn");
        if (memBtn) {
            return `MEMORY KEY: ${memBtn.textContent.trim().replace(/\s+/g, " ")}`;
        }

        const patCell = target.closest && target.closest(".pattern-cell");
        if (patCell) {
            return `MATRIX CELL: ${patCell.textContent.trim().replace(/\s+/g, " = ")}`;
        }

        const ovOpt = target.closest && target.closest(".override-opt-btn");
        if (ovOpt) {
            return `OVERRIDE CODE: ${ovOpt.textContent.trim()}`;
        }

        const ruleStrip = target.closest && target.closest(".module-rule-strip");
        if (ruleStrip) {
            return `RULE: ${ruleStrip.textContent.trim().slice(0, 48)}`;
        }

        const chassisTag = target.closest && target.closest(".chassis-tag");
        if (chassisTag) {
            return `TELEMETRY: ${chassisTag.textContent.trim()}`;
        }

        const modCard = target.closest && target.closest(".puzzle-module");
        if (modCard) {
            const titleEl = modCard.querySelector(".module-title");
            return `MODULE: ${titleEl ? titleEl.textContent.trim() : "ACTIVE"}`;
        }

        return this.focusMode ? "FOCUS LOCK // PRESS [M] TO EXIT" : "PASS-THROUGH OPTICS READY";
    }
}

const visor = new BombTechVisor();
