/**
 * BOOM SQUAD - Radio Dispatch System
 * Handles live incoming radio transmissions, spoken voice synthesis,
 * confidence telemetry, module hints, conflicting corporate advice, and fish lore.
 */

class DispatchSystem {
    constructor() {
        this.chatterTimer = null;
        this.statusTimer = null;
        this.confidence = 38;
        this.manualStatus = "Under Review";
        this.adviceChangedThisMission = false;
        this.activeMissionIsFish = false;
        this.currentModulesRef = [];
        this.messageHistory = [];

        audio.onSpeechStateChange = (speaking) => {
            const waveEl = document.getElementById("dispatch-waveform");
            const badgeEl = document.getElementById("dispatch-live-indicator");
            if (waveEl) {
                waveEl.classList.toggle("speaking", speaking);
            }
            if (badgeEl) {
                badgeEl.textContent = speaking ? "ON AIR // VOICE ACTIVE" : "STANDBY // CHANNEL OPEN";
                badgeEl.classList.toggle("live", speaking);
            }
        };
    }

    startMissionDispatch(missionData, modulesList, isRetry = false) {
        this.stopDispatch();
        this.activeMissionIsFish = Boolean(missionData.isFishIncident);
        this.currentModulesRef = modulesList || [];
        this.adviceChangedThisMission = false;

        this.activeDialLevel =
            missionData.difficultyDial ||
            (typeof storage !== "undefined" && storage.settings && storage.settings.difficultyDial) ||
            2;
        const dialCfg =
            typeof GAME_CONFIG !== "undefined" && typeof GAME_CONFIG.getDifficultyDialConfig === "function"
                ? GAME_CONFIG.getDifficultyDialConfig(this.activeDialLevel)
                : null;

        if (dialCfg && Array.isArray(dialCfg.dispatchConfidenceRange)) {
            const [minC, maxC] = dialCfg.dispatchConfidenceRange;
            this.confidence = minC + Math.floor(Math.random() * (maxC - minC + 1));
            this.manualStatus = dialCfg.manualStatus || "Under Review";
        } else {
            this.confidence = Math.floor(Math.random() * 55) + 25;
            this.manualStatus = MANUAL_STATES[Math.floor(Math.random() * MANUAL_STATES.length)];
        }
        this.messageHistory = [];

        const logEl = document.getElementById("dispatch-log");
        if (logEl) logEl.innerHTML = "";
        this.updateTelemetryUI();

        let introText;
        let sender = "DISPATCH CENTRAL";
        if (isRetry && FLAVOR_DB.retryDispatchMessages && FLAVOR_DB.retryDispatchMessages.length > 0) {
            const pool = FLAVOR_DB.retryDispatchMessages;
            introText = pool[Math.floor(Math.random() * pool.length)];
            sender = "DISPATCH ARCHIVE";
        } else {
            introText =
                missionData.introDispatch ||
                `Boom Squad, we have reports of a ${missionData.device} at the ${missionData.location}. We are ${this.confidence} percent confident.`;
        }

        this.transmit(introText, sender, "briefing", true);

        this.chatterTimer = setInterval(() => {
            this.triggerPeriodicTransmission();
        }, 12500);

        this.statusTimer = setInterval(() => {
            this.rotateStatusTicker();
        }, 6500);
        this.rotateStatusTicker();
    }

    stopDispatch() {
        if (this.chatterTimer) {
            clearInterval(this.chatterTimer);
            this.chatterTimer = null;
        }
        if (this.statusTimer) {
            clearInterval(this.statusTimer);
            this.statusTimer = null;
        }
        audio.stopSpeech();
    }

    updateTelemetryUI() {
        const confEl = document.getElementById("dispatch-confidence-val");
        const manEl = document.getElementById("dispatch-manual-val");
        if (confEl) confEl.textContent = `${this.confidence}%`;
        if (manEl) manEl.textContent = this.manualStatus;
    }

    rotateStatusTicker() {
        const tickerEl = document.getElementById("hud-status-ticker");
        if (!tickerEl) return;
        const useFishPool =
            this.activeMissionIsFish &&
            FLAVOR_DB.fishStatusUpdates &&
            FLAVOR_DB.fishStatusUpdates.length > 0 &&
            Math.random() < 0.55;
        const pool = useFishPool ? FLAVOR_DB.fishStatusUpdates : FLAVOR_DB.statusUpdates;
        const item = pool[Math.floor(Math.random() * pool.length)];
        tickerEl.textContent = item;
    }

    triggerPeriodicTransmission() {
        const roll = Math.random();
        const dialLevel = this.activeDialLevel || 2;

        // At Difficulty 11, occasional special Dial-11 Dispatch objection / anomaly alert
        if (
            dialLevel === 11 &&
            FLAVOR_DB.difficultyDialMessages &&
            Array.isArray(FLAVOR_DB.difficultyDialMessages.elevenSpecial) &&
            FLAVOR_DB.difficultyDialMessages.elevenSpecial.length > 0 &&
            Math.random() < 0.32
        ) {
            const pool = FLAVOR_DB.difficultyDialMessages.elevenSpecial;
            const line = pool[Math.floor(Math.random() * pool.length)];
            this.transmit(line, "DIAL-11 OVERSIGHT", "urgent", false);
            return;
        }

        // Conflicting advice probability scales with Difficulty Dial (low at Dial 1-3, higher at Dial 7-11)
        const conflictChance = dialLevel <= 3 ? 0.08 : dialLevel <= 6 ? 0.2 : 0.32;
        if (roll < conflictChance && !this.adviceChangedThisMission) {
            const pair =
                FLAVOR_DB.conflictingPairs[
                    Math.floor(Math.random() * FLAVOR_DB.conflictingPairs.length)
                ];
            this.transmit(pair.first, "SUPERVISOR GARY", "warning", false);

            setTimeout(() => {
                if (!this.chatterTimer) return;
                this.adviceChangedThisMission = true;
                this.confidence = Math.max(4, this.confidence - 19);
                this.manualStatus =
                    MANUAL_STATES[Math.floor(Math.random() * MANUAL_STATES.length)];
                this.updateTelemetryUI();
                this.transmit(pair.correction, "DISPATCH CORRECTION", "urgent", true);
            }, 4600);
            return;
        }

        // Spontaneous free hint probability scales inversely with Difficulty Dial (high at Dial 1-3, lower at Dial 8-11)
        const hintWindow = dialLevel <= 3 ? conflictChance + 0.42 : dialLevel <= 7 ? conflictChance + 0.25 : conflictChance + 0.14;
        const unsolved = this.currentModulesRef.filter((m) => !m.solved);
        if (roll < hintWindow && unsolved.length > 0) {
            const targetMod = unsolved[Math.floor(Math.random() * unsolved.length)];
            if (targetMod && typeof targetMod.getDispatchHint === "function") {
                const hint = targetMod.getDispatchHint();
                this.transmit(hint, "MANUAL ANALYST", "hint", false);
                return;
            }
        }

        // If an unsolved Logic Symbols module is active, 40% chance of logic operator reminder/quips
        const hasUnsolvedLogic = unsolved.some((m) => m.type === "symbols");
        if (hasUnsolvedLogic && FLAVOR_DB.logicDispatchMessages && Math.random() < 0.4) {
            const logicMsg =
                FLAVOR_DB.logicDispatchMessages[
                    Math.floor(Math.random() * FLAVOR_DB.logicDispatchMessages.length)
                ];
            this.transmit(logicMsg, "ENGINEERING LIAISON", "hint", false);
            return;
        }

        // If fish incident, 50% chance of fish-specific dispatch line; or 12% recurring lore ping if previously encountered
        const fishRecurringChance = this.activeMissionIsFish
            ? 0.5
            : storage && storage.stats && storage.stats.fishEncounters > 0
            ? 0.12
            : 0;
        if (Math.random() < fishRecurringChance) {
            const fishMsg =
                FLAVOR_DB.fishDispatchMessages[
                    Math.floor(Math.random() * FLAVOR_DB.fishDispatchMessages.length)
                ];
            this.transmit(fishMsg, "BIO-CONTAINMENT DESK", "fish", false);
            return;
        }

        // Otherwise general corporate / STF dispatch line
        const msg =
            FLAVOR_DB.dispatchMessages[
                Math.floor(Math.random() * FLAVOR_DB.dispatchMessages.length)
            ];
        this.confidence = Math.max(
            1,
            Math.min(99, this.confidence + (Math.floor(Math.random() * 25) - 13))
        );
        if (Math.random() < 0.35) {
            this.manualStatus = MANUAL_STATES[Math.floor(Math.random() * MANUAL_STATES.length)];
        }
        this.updateTelemetryUI();

        storage.stats.dispatchMessagesIgnored = (storage.stats.dispatchMessagesIgnored || 0) + 1;
        this.transmit(msg, "DISPATCH CENTRAL", "chatter", false);
    }

    requestTacticalHint() {
        const unsolved = this.currentModulesRef.filter((m) => !m.solved);
        if (unsolved.length === 0) {
            this.transmit(
                "All modules are already green, technician! Admire your handiwork.",
                "DISPATCH CENTRAL",
                "hint",
                true
            );
            return;
        }
        const targetMod = unsolved[0];
        if (targetMod && typeof targetMod.getDispatchHint === "function") {
            const hint = targetMod.getDispatchHint();
            this.transmit(
                `Tactical Assist for ${targetMod.title}: ${hint}`,
                "SENIOR ANALYST",
                "hint",
                true
            );
        }
    }

    transmit(text, sender = "DISPATCH CENTRAL", type = "chatter", priorityVoice = false) {
        storage.stats.dispatchMessagesHeard = (storage.stats.dispatchMessagesHeard || 0) + 1;
        storage.saveStats();

        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];

        this.messageHistory.unshift({ text, sender, type, timeStr });

        const currentTextEl = document.getElementById("dispatch-current-text");
        const currentSenderEl = document.getElementById("dispatch-current-sender");
        const logEl = document.getElementById("dispatch-log");

        if (currentSenderEl) {
            currentSenderEl.textContent = `[${timeStr}] ${sender}`;
        }
        if (currentTextEl) {
            currentTextEl.textContent = `"${text}"`;
            currentTextEl.className = `dispatch-headline type-${type}`;
        }

        if (logEl) {
            const entry = document.createElement("div");
            entry.className = `dispatch-entry type-${type}`;
            entry.innerHTML = `
                <div class="dispatch-entry-meta">
                    <span class="dispatch-sender">${sender}</span>
                    <span class="dispatch-time">${timeStr}</span>
                </div>
                <div class="dispatch-entry-body">${text}</div>
            `;
            logEl.prepend(entry);
            while (logEl.children.length > 25) {
                logEl.removeChild(logEl.lastChild);
            }
        }

        audio.speakDispatch(text, priorityVoice);
    }
}

const dispatch = new DispatchSystem();
