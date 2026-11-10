/**
 * BOOM SQUAD - Core Game Controller
 * Manages game flow, procedural mission generation, difficulty scaling,
 * timers, scoring, rank promotions, achievements, and UI screens.
 */

class BoomSquadGame {
    constructor() {
        this.currentScreen = "menu";
        this.activeMission = null;
        this.activeChassis = null;
        this.activeModules = [];
        this.timerInterval = null;
        this.remainingSeconds = 0;
        this.totalMissionSeconds = 0;
        this.strikes = 0;
        this.maxStrikes = 3;
        this.lastWholeSecond = -1;
        this.sessionScore = 0;
        this.isTrainingMission = false;
        this.currentTrainingId = null;
        this.isRetryRun = false;
        this.lastMissionSuccess = false;
        this.lastStrikeModule = null;
        this.lastStrikeReason = "";
        this.incidentTimeline = [];
        this.lastDialAutoAdvanced = false;
        this.currentDialCommentary = "";
        this.elevenQuoteIndex = 0;
    }

    init() {
        // Bind STF Arcade Header link
        const stfLink = document.getElementById("stf-arcade-btn");
        if (stfLink) {
            stfLink.href = STF_ARCADE_URL;
        }

        this.updateHeaderHUD();
        this.bindMenuNavigation();
        this.bindOperatorControls();
        this.bindDifficultyDialControls();
        this.bindOptionsControls();
        if (typeof visor !== "undefined" && typeof visor.init === "function") {
            visor.init();
        }
        this.showScreen("screen-menu");
        this.checkFirstLaunchOperatorPrompt();
    }

    updateHeaderHUD() {
        const rankObj = storage.getCurrentRankObj();
        const operatorName = (storage.settings.playerName || "TECH-404").trim();
        const rankEl = document.getElementById("header-rank-badge");
        const streakEl = document.getElementById("header-streak-val");
        const voiceBtn = document.getElementById("header-voice-toggle");
        const menuOpDisplay = document.getElementById("menu-operator-name-display");
        const menuRankPill = document.getElementById("menu-operator-rank-pill");
        const lbOpDisplay = document.getElementById("lb-current-operator-name");
        const optNameInput = document.getElementById("opt-player-name");

        if (rankEl) {
            rankEl.textContent = `${rankObj.badge} // ${operatorName} (${rankObj.title})`;
        }
        if (streakEl) {
            streakEl.textContent = `STREAK: ${storage.stats.currentStreak}`;
        }
        if (voiceBtn) {
            const on = storage.settings.voiceEnabled;
            voiceBtn.textContent = on ? "🔊 DISPATCH VOICE: ON" : "🔇 DISPATCH VOICE: OFF";
            voiceBtn.classList.toggle("muted", !on);
        }
        if (menuOpDisplay) {
            menuOpDisplay.textContent = operatorName;
        }
        if (menuRankPill) {
            menuRankPill.textContent = `${rankObj.badge} // ${rankObj.clearance}`;
        }
        if (lbOpDisplay) {
            lbOpDisplay.textContent = operatorName;
        }
        if (optNameInput && document.activeElement !== optNameInput) {
            optNameInput.value = operatorName;
        }
    }

    generateRandomCallsign() {
        const prefixes = [
            "GOURD",
            "GRAVY",
            "FISH-TECH",
            "CLIPBOARD",
            "CRAYON",
            "WIRE-SNIP",
            "BASSLIFT",
            "POULTRY",
            "TOASTER",
            "BREAKROOM",
            "PLIER",
            "BAFFLED"
        ];
        const suffixes = [
            "404",
            "ACTUAL",
            "ZERO",
            "PRIME",
            "09",
            "77",
            "LEAD",
            "INTERN",
            "99",
            "ALPHA",
            "OPS",
            "12"
        ];
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${p}-${s}`.slice(0, 24);
    }

    async setOperatorName(rawName, source = "menu") {
        const oldName = (storage.settings.playerName || "TECH-404").trim();
        let cleanName = String(rawName || "")
            .replace(/[<>]/g, "")
            .trim()
            .slice(0, 24);
        if (!cleanName) {
            cleanName = "TECH-404";
        }

        storage.saveSettings({
            playerName: cleanName,
            hasRegisteredCallsign: true
        });

        await leaderboard.updateOperatorName(oldName, cleanName);
        this.updateHeaderHUD();

        if (this.currentScreen === "screen-highscores") {
            this.openHighScoresScreen();
        }

        if (source === "menu" || source === "modal") {
            const feedbackEl = document.getElementById("menu-operator-feedback");
            if (feedbackEl) {
                feedbackEl.textContent = `✓ Department of Boom Prevention personnel record updated — Operator designation: ${cleanName}`;
                feedbackEl.style.display = "block";
                clearTimeout(this.operatorFeedbackTimer);
                this.operatorFeedbackTimer = setTimeout(() => {
                    feedbackEl.style.display = "none";
                }, 4500);
            }
        }

        return cleanName;
    }

    checkFirstLaunchOperatorPrompt() {
        if (!storage.settings.hasRegisteredCallsign) {
            this.openOperatorRegistrationModal(true);
        }
    }

    openOperatorRegistrationModal(isFirstLaunch = false) {
        const modal = document.getElementById("operator-registration-modal");
        const input = document.getElementById("modal-operator-name-input");
        if (!modal) return;

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        if (input) {
            const current = (storage.settings.playerName || "TECH-404").trim();
            input.value = isFirstLaunch && current === "TECH-404" ? "" : current;
            setTimeout(() => {
                if (typeof input.focus === "function") input.focus();
            }, 60);
        }
    }

    closeOperatorRegistrationModal() {
        const modal = document.getElementById("operator-registration-modal");
        if (!modal) return;
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
    }

    bindOperatorControls() {
        const viewRow = document.getElementById("menu-operator-view-row");
        const editRow = document.getElementById("menu-operator-edit-row");
        const toggleEditBtn = document.getElementById("btn-toggle-menu-operator-edit");
        const nameDisplay = document.getElementById("menu-operator-name-display");
        const menuInput = document.getElementById("menu-operator-name-input");
        const randomMenuBtn = document.getElementById("btn-random-menu-operator");
        const saveMenuBtn = document.getElementById("btn-save-menu-operator");
        const cancelMenuBtn = document.getElementById("btn-cancel-menu-operator");

        const openInlineEdit = () => {
            if (!editRow || !viewRow) return;
            audio.playButton(560);
            viewRow.style.display = "none";
            editRow.style.display = "flex";
            if (menuInput) {
                menuInput.value = (storage.settings.playerName || "TECH-404").trim();
                if (typeof menuInput.focus === "function") menuInput.focus();
                if (typeof menuInput.select === "function") menuInput.select();
            }
        };

        const closeInlineEdit = () => {
            if (!editRow || !viewRow) return;
            editRow.style.display = "none";
            viewRow.style.display = "flex";
        };

        const commitInlineEdit = async () => {
            audio.playButton(660);
            const nextVal = menuInput ? menuInput.value : storage.settings.playerName;
            await this.setOperatorName(nextVal, "menu");
            closeInlineEdit();
        };

        if (toggleEditBtn) {
            toggleEditBtn.addEventListener("click", openInlineEdit);
        }
        if (nameDisplay) {
            nameDisplay.addEventListener("click", openInlineEdit);
            nameDisplay.title = "Click to edit Technician Call Sign";
        }
        if (randomMenuBtn && menuInput) {
            randomMenuBtn.addEventListener("click", () => {
                audio.playButton(580);
                menuInput.value = this.generateRandomCallsign();
                if (typeof menuInput.focus === "function") menuInput.focus();
            });
        }
        if (saveMenuBtn) {
            saveMenuBtn.addEventListener("click", commitInlineEdit);
        }
        if (cancelMenuBtn) {
            cancelMenuBtn.addEventListener("click", () => {
                audio.playButton(420);
                closeInlineEdit();
            });
        }
        if (menuInput) {
            menuInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    commitInlineEdit();
                } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeInlineEdit();
                }
            });
        }

        // Leaderboard quick call sign change button
        const lbChangeBtn = document.getElementById("btn-leaderboard-change-callsign");
        if (lbChangeBtn) {
            lbChangeBtn.addEventListener("click", () => {
                audio.playButton(560);
                this.openOperatorRegistrationModal(false);
            });
        }

        // First-launch / Operator Registration Modal controls
        const modalInput = document.getElementById("modal-operator-name-input");
        const modalRandomBtn = document.getElementById("btn-modal-random-callsign");
        const modalConfirmBtn = document.getElementById("btn-confirm-operator-modal");

        const confirmModalCallsign = async () => {
            audio.playButton(680);
            const raw = modalInput && modalInput.value.trim()
                ? modalInput.value.trim()
                : storage.settings.playerName || "TECH-404";
            await this.setOperatorName(raw, "modal");
            this.closeOperatorRegistrationModal();
        };

        if (modalRandomBtn && modalInput) {
            modalRandomBtn.addEventListener("click", () => {
                audio.playButton(580);
                modalInput.value = this.generateRandomCallsign();
                if (typeof modalInput.focus === "function") modalInput.focus();
            });
        }
        if (modalConfirmBtn) {
            modalConfirmBtn.addEventListener("click", confirmModalCallsign);
        }
        if (modalInput) {
            modalInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    confirmModalCallsign();
                }
            });
        }
    }

    showScreen(screenId) {
        document.querySelectorAll(".game-screen").forEach((sc) => {
            sc.classList.remove("active");
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add("active");
        }
        if (document.body && document.body.classList) {
            document.body.classList.toggle("in-active-game", screenId === "screen-game");
        }
        if (typeof window.scrollTo === "function") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        this.currentScreen = screenId;
        this.updateHeaderHUD();
        if (typeof visor !== "undefined" && visor.active && typeof visor.scheduleMirrorSync === "function") {
            visor.scheduleMirrorSync();
        }
    }

    bindMenuNavigation() {
        const bindClick = (id, handler) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("click", () => {
                    audio.playButton(540);
                    handler();
                });
            }
        };

        // Main Menu Buttons
        bindClick("btn-start-mission", () => this.prepareProceduralMission());
        bindClick("btn-training", () => this.openTrainingScreen());
        bindClick("btn-highscores", () => this.openHighScoresScreen());
        bindClick("btn-statistics", () => this.openStatisticsScreen());
        bindClick("btn-achievements", () => this.openAchievementsScreen());
        bindClick("btn-options", () => this.openOptionsScreen());
        bindClick("btn-credits", () => this.showScreen("screen-credits"));

        // Header quick controls
        bindClick("header-voice-toggle", () => {
            const nextState = !storage.settings.voiceEnabled;
            storage.saveSettings({ voiceEnabled: nextState });
            if (!nextState) audio.stopSpeech();
            this.updateHeaderHUD();
        });

        bindClick("header-home-btn", () => {
            this.abortActiveMissionToMenu();
        });

        // Back to Menu buttons across subscreens
        document.querySelectorAll(".btn-back-menu").forEach((btn) => {
            btn.addEventListener("click", () => {
                audio.playButton(460);
                this.showScreen("screen-menu");
            });
        });

        // Briefing -> Start Countdown
        bindClick("btn-deploy-incident", () => this.launchActiveDevice(false));

        // Active Gameplay controls
        bindClick("btn-request-hint", () => dispatch.requestTacticalHint());
        bindClick("btn-toggle-dispatch-log", () => {
            const bodyEl = document.getElementById("dispatch-collapsible-body");
            const btnEl = document.getElementById("btn-toggle-dispatch-log");
            if (bodyEl) {
                const isOpen = bodyEl.classList.toggle("mobile-open");
                if (btnEl) {
                    btnEl.setAttribute("aria-expanded", String(isOpen));
                    btnEl.textContent = isOpen ? "▲ HIDE LOG" : "📋 LOG & TELEMETRY";
                }
            }
        });
        bindClick("btn-toggle-manual", () => {
            const drawer = document.getElementById("field-manual-drawer");
            if (drawer) {
                drawer.classList.toggle("open");
                this.checkAndToastAchievement("manual_scholar");
            }
        });
        bindClick("btn-abort-mission", () => this.abortActiveMissionToMenu());
        bindClick("btn-toggle-active-obj", () => {
            const bodyEl = document.getElementById("active-obj-body");
            const btnEl = document.getElementById("btn-toggle-active-obj");
            if (bodyEl) {
                const isCollapsed = bodyEl.classList.toggle("collapsed");
                if (btnEl) {
                    btnEl.setAttribute("aria-expanded", String(!isCollapsed));
                    btnEl.textContent = isCollapsed ? "▼ SHOW OBJECTIVE GUIDE" : "▲ HIDE OBJECTIVE GUIDE";
                }
            }
        });
        bindClick("btn-continue-campaign", () => {
            const nextLesson =
                TRAINING_MISSIONS.find((tm) => !storage.progress.trainingCompleted.includes(tm.id)) ||
                TRAINING_MISSIONS[0];
            this.prepareTrainingMission(nextLesson.id);
        });

        // Logic Reference Card Modal controls
        bindClick("btn-training-logic-ref", () => this.openLogicReferenceModal());
        bindClick("btn-manual-logic-ref", () => this.openLogicReferenceModal());
        bindClick("btn-close-logic-ref", () => this.closeLogicReferenceModal());
        const logicModal = document.getElementById("logic-reference-modal");
        if (logicModal) {
            logicModal.addEventListener("click", (e) => {
                if (e.target === logicModal) {
                    audio.playButton(460);
                    this.closeLogicReferenceModal();
                }
            });
        }

        // Post-mission screen buttons
        bindClick("btn-retry-incident", () => this.retryActiveIncident());
        bindClick("btn-next-mission", () => {
            if (this.isTrainingMission) {
                if (!this.lastMissionSuccess) {
                    // Do not advance training progression on a failed training mission
                    this.openTrainingScreen();
                } else if (this.currentTrainingId < TRAINING_MISSIONS.length) {
                    this.prepareTrainingMission(this.currentTrainingId + 1);
                } else {
                    this.prepareProceduralMission();
                }
            } else {
                // Campaign behavior: When a player successfully completes an incident and chooses NEXT INCIDENT:
                // Difficulty automatically increases by 1. Difficulty 11 remains at 11.
                if (this.lastMissionSuccess) {
                    const prevDial = this.getDifficultyDialLevel();
                    const nextDial = Math.min(11, prevDial + 1);
                    const didAdvance = nextDial > prevDial;
                    this.setDifficultyDial(nextDial, {
                        autoAdvanced: didAdvance,
                        regenerateMission: false,
                        speakCommentary: true
                    });
                    this.prepareProceduralMission({
                        autoAdvanced: didAdvance,
                        commentaryOverride: this.currentDialCommentary
                    });
                } else {
                    this.prepareProceduralMission();
                }
            }
        });
        bindClick("btn-result-menu", () => this.showScreen("screen-menu"));
        bindClick("btn-result-leaderboard", () => this.openHighScoresScreen());
    }

    openLogicReferenceModal() {
        const modal = document.getElementById("logic-reference-modal");
        if (modal) {
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
        }
    }

    closeLogicReferenceModal() {
        const modal = document.getElementById("logic-reference-modal");
        if (modal) {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        }
    }

    // ==================================================
    // TRAINING MODE CAMPAIGN
    // ==================================================
    openTrainingScreen() {
        const completedCount = TRAINING_MISSIONS.filter((tm) =>
            storage.progress.trainingCompleted.includes(tm.id)
        ).length;
        const nextUnfinished = TRAINING_MISSIONS.find(
            (tm) => !storage.progress.trainingCompleted.includes(tm.id)
        );

        const statusEl = document.getElementById("training-campaign-status");
        const nextDescEl = document.getElementById("training-campaign-next-desc");
        const continueBtn = document.getElementById("btn-continue-campaign");

        if (statusEl) {
            statusEl.textContent = `CAMPAIGN PROGRESS: ${completedCount} / ${TRAINING_MISSIONS.length} CERTIFIED`;
        }
        if (nextDescEl) {
            if (nextUnfinished) {
                nextDescEl.innerHTML = `<b>Next Lesson (${nextUnfinished.chapter}):</b> ${nextUnfinished.title} — <i>Teaches: ${nextUnfinished.newConcept}</i>`;
            } else {
                nextDescEl.innerHTML = `🎓 <b>All 8 Training Chapters Certified!</b> You are fully qualified for procedural Field Missions, or you may replay any training lesson below.`;
            }
        }
        if (continueBtn) {
            continueBtn.textContent = nextUnfinished
                ? `▶ START ${nextUnfinished.chapter}`
                : "🔄 REPLAY CHAPTER 1";
        }

        const listEl = document.getElementById("training-missions-list");
        if (listEl) {
            listEl.innerHTML = TRAINING_MISSIONS.map((tm) => {
                const done = storage.progress.trainingCompleted.includes(tm.id);
                const isNext = nextUnfinished && nextUnfinished.id === tm.id;
                const obj = tm.objectivePanel || {};
                return `
                    <div class="training-card ${done ? "completed" : ""} ${isNext ? "next-recommended" : ""}">
                        <div class="training-card-info">
                            <div class="training-badges-row">
                                <span class="training-badge">${done ? `✓ ${tm.chapter} CERTIFIED` : isNext ? `▶ NEXT: ${tm.chapter}` : tm.chapter || `MODULE 10${tm.id}`}</span>
                                <span class="concept-pill new-concept">🎯 NEW: ${tm.newConcept || "Core Mechanics"}</span>
                                <span class="concept-pill reinforces">🔁 REINFORCES: ${tm.reinforces || "Fundamentals"}</span>
                            </div>
                            <h3>${tm.title}</h3>
                            <p>${tm.description}</p>
                            ${
                                obj.learning
                                    ? `<div class="training-card-obj-preview">
                                        <span><b>Objective:</b> ${obj.learning}</span>
                                       </div>`
                                    : ""
                            }
                            <div class="training-meta">
                                <span>📍 ${tm.location}</span>
                                <span>⏱️ ${tm.timeSeconds}s</span>
                                <span>🧩 ${tm.modules.length} ${tm.modules.length === 1 ? "Module" : "Modules"}</span>
                                <span>📈 Tier ${tm.difficulty}</span>
                            </div>
                        </div>
                        <button class="btn-primary btn-launch-training" data-tid="${tm.id}">
                            ${done ? "REPLAY LESSON" : isNext ? "▶ START LESSON" : "START LESSON"}
                        </button>
                    </div>
                `;
            }).join("");

            listEl.querySelectorAll(".btn-launch-training").forEach((btn) => {
                btn.addEventListener("click", () => {
                    audio.playButton(580);
                    const tid = Number(btn.getAttribute("data-tid"));
                    this.prepareTrainingMission(tid);
                });
            });
        }
        this.showScreen("screen-training");
    }

    prepareTrainingMission(trainingId) {
        const tm = TRAINING_MISSIONS.find((m) => m.id === trainingId) || TRAINING_MISSIONS[0];
        this.isTrainingMission = true;
        this.currentTrainingId = tm.id;
        this.isRetryRun = false;

        this.activeMission = {
            title: tm.title,
            chapter: tm.chapter || `CHAPTER ${tm.id} OF ${TRAINING_MISSIONS.length}`,
            newConcept: tm.newConcept || "",
            reinforces: tm.reinforces || "",
            instructionalText: tm.instructionalText || "",
            objectivePanel: tm.objectivePanel || null,
            location: tm.location,
            device: tm.device,
            description: tm.description,
            timeSeconds: tm.timeSeconds,
            moduleTypes: [...tm.modules],
            difficultyLevel: tm.difficulty,
            isFishIncident: Boolean(tm.isFishIncident),
            isLogicTutorial: Boolean(tm.isLogicTutorial),
            unlimitedRetries: Boolean(tm.unlimitedRetries),
            introDispatch: tm.introDispatch
        };

        this.populateBriefingScreen();
        this.showScreen("screen-briefing");
    }

    // ==================================================
    // DEPARTMENT OF BOOM PREVENTION DIFFICULTY DIAL (1–11)
    // ==================================================
    getDifficultyDialLevel() {
        const raw = Number(storage.settings.difficultyDial);
        if (!Number.isNaN(raw) && raw >= 1 && raw <= 11) {
            return Math.round(raw);
        }
        const legacy = storage.settings.difficulty;
        if (legacy === "relaxed") return 1;
        if (legacy === "high_pressure") return 7;
        const asNum = Number(legacy);
        if (!Number.isNaN(asNum) && asNum >= 1 && asNum <= 11) {
            return Math.round(asNum);
        }
        return 2;
    }

    getDialCommentary(level, isAutoAdvance = false) {
        const db = FLAVOR_DB.difficultyDialMessages || {};
        const byLevel = (db.byLevel && db.byLevel[level]) || [];
        let chosen = "";

        if (level === 11 && Array.isArray(db.elevenSpecial) && db.elevenSpecial.length > 0) {
            chosen = db.elevenSpecial[this.elevenQuoteIndex % db.elevenSpecial.length];
            this.elevenQuoteIndex++;
        } else if (byLevel.length > 0) {
            chosen = byLevel[Math.floor(Math.random() * byLevel.length)];
        } else {
            chosen = `Difficulty Dial locked at Level ${level}.`;
        }

        if (isAutoAdvance && Array.isArray(db.autoIncrement) && db.autoIncrement.length > 0 && level < 11) {
            return `${chosen} (Campaign Escalation: Dial advanced to ${level}.)`;
        }
        return chosen;
    }

    setDifficultyDial(nextLevel, options = {}) {
        const clamped = Math.max(1, Math.min(11, Math.round(Number(nextLevel) || 2)));
        storage.saveSettings({
            difficultyDial: clamped,
            difficulty: String(clamped)
        });

        const optSelect = document.getElementById("opt-difficulty");
        if (optSelect) {
            optSelect.value = String(clamped);
        }

        this.lastDialAutoAdvanced = Boolean(options.autoAdvanced);
        this.currentDialCommentary = this.getDialCommentary(clamped, Boolean(options.autoAdvanced));

        if (options.speakCommentary && typeof audio !== "undefined" && typeof audio.speakDispatch === "function") {
            audio.speakDispatch(this.currentDialCommentary, true);
        }

        if (options.regenerateMission !== false && !this.isTrainingMission && this.currentScreen === "screen-briefing") {
            this.prepareProceduralMission({
                preserveBriefingTemplate: true,
                autoAdvanced: Boolean(options.autoAdvanced),
                commentaryOverride: this.currentDialCommentary
            });
        } else {
            this.updateDifficultyDialUI();
        }

        return clamped;
    }

    bindDifficultyDialControls() {
        const selectDialValue = (targetLevel, speak = true) => {
            const clamped = Math.max(1, Math.min(11, Math.round(Number(targetLevel) || 2)));
            audio.playButton(360 + clamped * 28);
            this.setDifficultyDial(clamped, {
                autoAdvanced: false,
                regenerateMission: true,
                speakCommentary: speak
            });
        };

        document.querySelectorAll(".dial-detent-btn").forEach((btn) => {
            btn.setAttribute("role", "radio");
            btn.setAttribute("tabindex", "0");
            btn.addEventListener("click", (e) => {
                if (e && typeof e.stopPropagation === "function") {
                    e.stopPropagation();
                }
                const targetLevel = Number(btn.getAttribute("data-dial"));
                selectDialValue(targetLevel, true);
            });
            btn.addEventListener("keydown", (e) => {
                const cur = this.getDifficultyDialLevel();
                if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "+") {
                    e.preventDefault();
                    const next = Math.min(11, cur + 1);
                    selectDialValue(next, true);
                    const nextBtn = document.querySelector(`.dial-detent-btn[data-dial="${next}"]`);
                    if (nextBtn && typeof nextBtn.focus === "function") nextBtn.focus();
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "-") {
                    e.preventDefault();
                    const next = Math.max(1, cur - 1);
                    selectDialValue(next, true);
                    const nextBtn = document.querySelector(`.dial-detent-btn[data-dial="${next}"]`);
                    if (nextBtn && typeof nextBtn.focus === "function") nextBtn.focus();
                } else if (e.key === "Home") {
                    e.preventDefault();
                    selectDialValue(1, true);
                } else if (e.key === "End") {
                    e.preventDefault();
                    selectDialValue(11, true);
                }
            });
        });

        const decBtn = document.getElementById("btn-dial-dec");
        if (decBtn) {
            decBtn.addEventListener("click", () => {
                const cur = this.getDifficultyDialLevel();
                const next = Math.max(1, cur - 1);
                selectDialValue(next, true);
            });
        }

        const incBtn = document.getElementById("btn-dial-inc");
        if (incBtn) {
            incBtn.addEventListener("click", () => {
                const cur = this.getDifficultyDialLevel();
                const next = Math.min(11, cur + 1);
                selectDialValue(next, true);
            });
        }

        const knobEl = document.getElementById("difficulty-rotary-knob");
        if (knobEl) {
            knobEl.setAttribute("tabindex", "0");
            knobEl.setAttribute("role", "slider");
            knobEl.setAttribute("aria-valuemin", "1");
            knobEl.setAttribute("aria-valuemax", "11");
            knobEl.addEventListener("click", (e) => {
                if (e && typeof e.stopPropagation === "function") {
                    e.stopPropagation();
                }
                const cur = this.getDifficultyDialLevel();
                const next = cur >= 11 ? 1 : cur + 1;
                selectDialValue(next, true);
            });
            knobEl.addEventListener("keydown", (e) => {
                const cur = this.getDifficultyDialLevel();
                if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "+") {
                    e.preventDefault();
                    selectDialValue(Math.min(11, cur + 1), true);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "-") {
                    e.preventDefault();
                    selectDialValue(Math.max(1, cur - 1), true);
                } else if (e.key === "Home") {
                    e.preventDefault();
                    selectDialValue(1, true);
                } else if (e.key === "End") {
                    e.preventDefault();
                    selectDialValue(11, true);
                }
            });
        }

        const housingEl = document.getElementById("difficulty-rotary-housing");
        if (housingEl) {
            housingEl.addEventListener("click", (e) => {
                if (!e || !e.target) return;
                if (typeof e.target.closest === "function") {
                    const detentBtn = e.target.closest(".dial-detent-btn");
                    if (detentBtn) {
                        const targetLevel = Number(detentBtn.getAttribute("data-dial"));
                        selectDialValue(targetLevel, true);
                    }
                }
            });
            housingEl.addEventListener(
                "wheel",
                (e) => {
                    e.preventDefault();
                    const cur = this.getDifficultyDialLevel();
                    const delta = e.deltaY < 0 ? 1 : -1;
                    const next = Math.max(1, Math.min(11, cur + delta));
                    if (next !== cur) {
                        selectDialValue(next, false);
                    }
                },
                { passive: false }
            );
        }
    }

    updateDifficultyDialUI() {
        const panelEl = document.getElementById("briefing-difficulty-dial-panel");
        if (!panelEl) return;

        if (this.isTrainingMission) {
            panelEl.style.display = "none";
            return;
        }
        panelEl.style.display = "block";

        const dialLevel = this.getDifficultyDialLevel();
        const dialConfig = GAME_CONFIG.getDifficultyDialConfig(dialLevel);
        const angleDeg = -135 + (dialLevel - 1) * 27;

        panelEl.classList.toggle("is-level-11", dialLevel === 11);

        const knobEl = document.getElementById("difficulty-rotary-knob");
        if (knobEl) {
            knobEl.style.setProperty("--knob-rotation", `${angleDeg}deg`);
            knobEl.classList.toggle("knob-eleven", dialLevel === 11);
            knobEl.setAttribute("aria-valuenow", String(dialLevel));
        }

        const centerValEl = document.getElementById("difficulty-rotary-center-val");
        if (centerValEl) {
            centerValEl.textContent = String(dialLevel).padStart(2, "0");
        }

        document.querySelectorAll(".dial-detent-btn").forEach((btn) => {
            const btnLvl = Number(btn.getAttribute("data-dial"));
            const isActive = btnLvl === dialLevel;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-checked", String(isActive));
        });

        const tierBadgeEl = document.getElementById("dial-tier-badge");
        if (tierBadgeEl) {
            tierBadgeEl.textContent = `LEVEL ${String(dialLevel).padStart(2, "0")} // ${dialConfig.name.toUpperCase()}`;
            tierBadgeEl.classList.toggle("badge-eleven", dialLevel === 11);
        }

        const autoBadgeEl = document.getElementById("dial-auto-advance-badge");
        if (autoBadgeEl) {
            autoBadgeEl.style.display = this.lastDialAutoAdvanced ? "inline-flex" : "none";
        }

        const scoreMultEl = document.getElementById("dial-score-mult");
        if (scoreMultEl) {
            scoreMultEl.textContent = `${dialConfig.scoreMultiplier.toFixed(2)}x`;
        }

        const strikesValEl = document.getElementById("dial-strikes-val");
        if (strikesValEl) {
            strikesValEl.textContent = `${dialConfig.maxStrikes} STRIKES`;
        }

        const puzzleTierEl = document.getElementById("dial-puzzle-tier");
        if (puzzleTierEl) {
            const tierNames = {
                1: "TIER 1 // DIRECT",
                2: "TIER 2 // CHASSIS",
                3: "TIER 3 // DEDUCTIVE",
                4: "TIER 4 // MULTI-LOCK",
                5: "TIER 5 // INTERLOCK XI"
            };
            puzzleTierEl.textContent = tierNames[dialConfig.puzzleTier] || `TIER ${dialConfig.puzzleTier}`;
        }

        const dispatchRelEl = document.getElementById("dial-dispatch-rel");
        if (dispatchRelEl) {
            dispatchRelEl.textContent =
                typeof dialConfig.dispatchReliability === "string"
                    ? dialConfig.dispatchReliability
                    : `${Math.round((dialConfig.dispatchReliability || 0.85) * 100)}% (${dialConfig.manualStatus})`;
        }

        const summaryEl = document.getElementById("dial-summary-text");
        if (summaryEl) {
            summaryEl.textContent = dialConfig.summary;
        }

        const elevenWarnEl = document.getElementById("dial-eleven-warning");
        if (elevenWarnEl) {
            elevenWarnEl.style.display = "block";
            elevenWarnEl.classList.toggle("is-active-eleven", dialLevel === 11);
            if (dialLevel === 11) {
                elevenWarnEl.innerHTML =
                    "⚠️ <strong>UNSANCTIONED SETTING 11 ENGAGED:</strong> Cross-module Interlock XI &amp; Dual-Override chains active.";
            } else {
                elevenWarnEl.innerHTML =
                    `🔧 <strong>CHASSIS INTERLOCK BUS:</strong> Standard regulation module isolation active (Level ${String(dialLevel).padStart(2, "0")}).`;
            }
        }

        const commentaryEl = document.getElementById("dial-dispatch-commentary");
        if (commentaryEl) {
            if (!this.currentDialCommentary) {
                this.currentDialCommentary = this.getDialCommentary(dialLevel, this.lastDialAutoAdvanced);
            }
            commentaryEl.textContent = `"${this.currentDialCommentary}"`;
        }

        const decBtn = document.getElementById("btn-dial-dec");
        const incBtn = document.getElementById("btn-dial-inc");
        if (decBtn) decBtn.disabled = dialLevel <= 1;
        if (incBtn) incBtn.disabled = dialLevel >= 11;
    }

    // ==================================================
    // PROCEDURAL MISSION GENERATION & DIFFICULTY SCALING
    // ==================================================
    getRankModuleRange(rankIdx, dialLevel) {
        const dialConfig = GAME_CONFIG.getDifficultyDialConfig(dialLevel || this.getDifficultyDialLevel());
        // Scale module count based on Difficulty Dial (1-11) blended with Corporate Rank progression:
        const rankTable = [
            { min: 1, max: 2 }, // JBT-1
            { min: 2, max: 3 }, // BT-2
            { min: 3, max: 4 }, // SBT-3
            { min: 4, max: 5 }, // BA-4
            { min: 5, max: 6 }, // PBE-5
            { min: 5, max: 8 }, // DBM-6 (Director)
            { min: 6, max: 8 }, // VPCD-7
            { min: 6, max: 8 }  // CENB-8
        ];
        const rankTier = rankTable[Math.min(rankTable.length - 1, Math.max(0, rankIdx || 0))];

        // Difficulty Dial directly controls module count, with high corporate rank raising the floor slightly on mid dials
        const rankBonus = rankIdx >= 3 && dialConfig.level >= 3 && dialConfig.level <= 8 ? 1 : 0;
        const minMods = Math.min(8, Math.max(dialConfig.minMods, Math.min(dialConfig.maxMods, rankTier.min > dialConfig.minMods ? dialConfig.minMods + rankBonus : dialConfig.minMods)));
        const maxMods = Math.min(8, Math.max(minMods, dialConfig.maxMods));
        const difficultyLevel = dialConfig.puzzleTier;

        return { minMods, maxMods, difficultyLevel, dialConfig };
    }

    validateModuleLineup(modules, options = {}) {
        if (!Array.isArray(modules) || modules.length === 0) return false;
        const total = modules.length;
        const allowDualOverride = options.specialScenario === "dual_override_interlock";

        const counts = {};
        for (const m of modules) {
            counts[m] = (counts[m] || 0) + 1;
        }

        // 1. Emergency Override must be unique unless a special scenario explicitly requires multiple Overrides
        if ((counts.override || 0) > (allowDualOverride ? 2 : 1)) {
            return false;
        }

        // 2. Avoid incidents where more than 50% of modules are identical types
        if (total >= 2) {
            const maxAllowedSameType = Math.floor(total / 2);
            for (const m of Object.keys(counts)) {
                if (counts[m] > maxAllowedSameType) {
                    return false;
                }
            }
        }

        // 3. Before selecting any duplicate module type, all available unique module types must be prioritized
        if (!allowDualOverride && total <= MODULE_TYPES.length) {
            if (Object.keys(counts).length !== total) {
                return false;
            }
        }

        return true;
    }

    selectIncidentModules(moduleCount, difficultyLevel, options = {}) {
        const clampedCount = Math.max(1, Math.min(8, moduleCount));
        const allowDualOverride =
            options.specialScenario === "dual_override_interlock" && clampedCount >= 4;
        const recentSet = new Set(Array.isArray(this.recentModuleTypes) ? this.recentModuleTypes : []);

        const shuffleArray = (arr) => {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        };

        const buildCandidate = () => {
            // Prioritize module types that were not used in the previous small incident first,
            // while drawing strictly without replacement from MODULE_TYPES
            const freshTypes = shuffleArray(MODULE_TYPES.filter((t) => !recentSet.has(t)));
            const recentTypes = shuffleArray(MODULE_TYPES.filter((t) => recentSet.has(t)));
            const prioritizedPool =
                clampedCount <= 4 ? [...freshTypes, ...recentTypes] : shuffleArray(MODULE_TYPES);

            const selected = [];
            for (const modType of prioritizedPool) {
                if (selected.length >= clampedCount) break;
                // On 1-module early incidents, prefer core puzzle modules over cross-module Override
                if (clampedCount === 1 && modType === "override" && prioritizedPool.length > 1) {
                    continue;
                }
                selected.push(modType);
            }

            // If a future configuration ever requests more than MODULE_TYPES.length modules,
            // fill remaining slots from distinct non-override types without exceeding 50%
            if (selected.length < clampedCount) {
                const fallbackPool = shuffleArray(MODULE_TYPES.filter((t) => t !== "override"));
                for (const modType of fallbackPool) {
                    if (selected.length >= clampedCount) break;
                    selected.push(modType);
                }
            }

            // In mid/late-game incidents (3+ modules, difficulty >= 2), include a single Emergency Override
            // ~55% of the time if not already present (replacing the last slot while keeping all types unique)
            if (
                clampedCount >= 3 &&
                difficultyLevel >= 2 &&
                !selected.includes("override") &&
                Math.random() < 0.55
            ) {
                selected[selected.length - 1] = "override";
            }

            // Only if an explicit special scenario requires Dual-Interlock Overrides (A -> B chained auth)
            if (allowDualOverride) {
                if (!selected.includes("override")) {
                    selected[selected.length - 1] = "override";
                }
                const overrideIndices = selected
                    .map((m, idx) => (m === "override" ? idx : -1))
                    .filter((idx) => idx !== -1);
                if (overrideIndices.length === 1) {
                    const replaceIdx = selected.findIndex((m) => m !== "override");
                    if (replaceIdx !== -1) {
                        selected[replaceIdx] = "override";
                    }
                }
            }

            return shuffleArray(selected);
        };

        let chosen = buildCandidate();
        for (let attempt = 0; attempt < 6; attempt++) {
            const sig = [...chosen].sort().join(",");
            const isValid = this.validateModuleLineup(chosen, {
                specialScenario: allowDualOverride ? "dual_override_interlock" : null
            });
            const isRepeat =
                clampedCount < 8 &&
                this.lastIncidentSignature &&
                sig === this.lastIncidentSignature;
            if (isValid && !isRepeat) {
                break;
            }
            chosen = buildCandidate();
        }

        this.lastIncidentSignature = [...chosen].sort().join(",");
        this.recentModuleTypes = [...chosen];
        return chosen;
    }

    getComplexityBriefingProfile(moduleCount, isFishIncident, exceptionType) {
        if (moduleCount === 1) {
            return {
                scaleHeadline: isFishIncident
                    ? "Single suspicious breakroom fish container."
                    : "Single suspicious lunch container.",
                telemetryLabel: "1 ACTIVE MODULE // SINGLE-UNIT ANOMALY",
                stamp:
                    exceptionType === "routine_deescalation"
                        ? "ROUTINE DE-ESCALATION"
                        : "SINGLE-STAGE DISPATCH"
            };
        }
        if (moduleCount <= 3) {
            return {
                scaleHeadline: isFishIncident
                    ? "Localized breakroom fish containment hazard."
                    : "Multi-stage countdown appliance.",
                telemetryLabel: `${moduleCount} ACTIVE MODULES // MULTI-STAGE DEVICE`,
                stamp:
                    exceptionType === "routine_deescalation"
                        ? "QUICK-RESPONSE CALL"
                        : "URGENT DISPATCH"
            };
        }
        if (moduleCount <= 5) {
            return {
                scaleHeadline: isFishIncident
                    ? "Multi-compartment aquatic telemetry hazard."
                    : "Multi-stage countdown appliance with interlocked circuits.",
                telemetryLabel: `${moduleCount} ACTIVE MODULES // INTERLOCKED COMPLEX`,
                stamp:
                    exceptionType === "special_escalation"
                        ? "⚠️ SPECIAL CHALLENGE"
                        : "HIGH-PRIORITY INCIDENT"
            };
        }
        return {
            scaleHeadline: isFishIncident
                ? "Regional-level fish-related emergency."
                : "Regional-level multi-stage ordnance emergency.",
            telemetryLabel: `${moduleCount} ACTIVE MODULES // REGIONAL-LEVEL CRISIS`,
            stamp:
                exceptionType === "special_escalation"
                    ? "🚨 PRIORITY-1 ESCALATION"
                    : "🚨 REGIONAL CRISIS PROTOCOL"
        };
    }

    prepareProceduralMission(options = {}) {
        this.isTrainingMission = false;
        this.currentTrainingId = null;
        this.isRetryRun = false;
        this.lastDialAutoAdvanced = Boolean(options.autoAdvanced);

        storage.updateRankFromStats();
        const rankIdx = storage.stats.highestRankIndex || 0;
        const completed = storage.stats.missionsCompleted || 0;
        const streak = storage.stats.currentStreak || 0;
        const dialLevel = this.getDifficultyDialLevel();

        if (options.commentaryOverride) {
            this.currentDialCommentary = options.commentaryOverride;
        } else {
            this.currentDialCommentary = this.getDialCommentary(dialLevel, this.lastDialAutoAdvanced);
        }

        // Effective progression blends official Rank with active win streak so early/mid players also feel momentum
        const effectiveRankIdx = Math.min(
            GAME_CONFIG.ranks.length - 1,
            Math.max(rankIdx, Math.floor((completed + Math.floor(streak * 0.5)) / 3))
        );

        const { minMods, maxMods, difficultyLevel: baseDiffLevel, dialConfig } =
            this.getRankModuleRange(effectiveRankIdx, dialLevel);

        // Pick a varied module count within the Difficulty Dial's [minMods, maxMods] window
        let moduleCount =
            minMods + Math.floor(Math.random() * (maxMods - minMods + 1));
        let difficultyLevel = baseDiffLevel;
        let exceptionType = dialConfig.isSpecialEleven ? "unsanctioned_eleven" : "standard";

        // Maintain occasional exceptions when not locked into Dial 11:
        // 1) Rare simple incident at higher ranks (1-2 modules)
        // 2) Rare complex special challenge early on (+1 to +2 modules)
        if (!dialConfig.isSpecialEleven) {
            const exceptionRoll = Math.random();
            if (effectiveRankIdx >= 2 && dialLevel <= 6 && exceptionRoll < 0.12) {
                moduleCount = Math.random() < 0.5 ? 1 : 2;
                difficultyLevel = Math.max(1, baseDiffLevel - 1);
                exceptionType = "routine_deescalation";
            } else if (effectiveRankIdx <= 3 && completed >= 1 && exceptionRoll > 0.88) {
                moduleCount = Math.min(8, maxMods + (Math.random() < 0.65 ? 1 : 2));
                difficultyLevel = Math.min(4, baseDiffLevel + 1);
                exceptionType = "special_escalation";
            }
        }

        // Scale timer cleanly with Difficulty Dial per-module parameters and timeMultiplier
        const perModuleSeconds = dialConfig.perModuleSeconds || 38;
        const overheadSeconds = dialConfig.overheadSeconds || 22;
        const baseSeconds = overheadSeconds + moduleCount * perModuleSeconds;
        const finalSeconds = Math.max(45, Math.round(baseSeconds * (dialConfig.timeMultiplier || 1.0)));

        // Select briefing template (preserve existing base & D11 templates if user is rotating the dial on the briefing screen)
        const d11Pool = Array.isArray(FLAVOR_DB.difficulty11Briefings) && FLAVOR_DB.difficulty11Briefings.length > 0
            ? FLAVOR_DB.difficulty11Briefings
            : FLAVOR_DB.missionBriefings;

        let baseTemplate = null;
        let d11Template = null;
        let fishStageObj = null;

        if (options.preserveBriefingTemplate && this.activeMission && this.activeMission._baseTemplate) {
            baseTemplate = this.activeMission._baseTemplate;
            d11Template = this.activeMission._d11Template || d11Pool[Math.floor(Math.random() * d11Pool.length)];
            fishStageObj = this.activeMission._fishStageObj || null;
        } else {
            baseTemplate =
                FLAVOR_DB.missionBriefings[
                    Math.floor(Math.random() * FLAVOR_DB.missionBriefings.length)
                ];
            d11Template = d11Pool[Math.floor(Math.random() * d11Pool.length)];
            const triggerRecurringFish =
                Boolean(baseTemplate.isFishIncident) ||
                (!dialConfig.isSpecialEleven && Math.random() < 0.24);
            const currentFishStageNum = (storage.progress && storage.progress.fishLoreStage) || 1;
            fishStageObj =
                triggerRecurringFish && typeof FLAVOR_DB.getFishLoreStageData === "function"
                    ? FLAVOR_DB.getFishLoreStageData(currentFishStageNum)
                    : null;
        }

        const briefingTemplate = dialConfig.isSpecialEleven ? d11Template : baseTemplate;
        const currentFishStageNum = (storage.progress && storage.progress.fishLoreStage) || 1;
        const isFishIncident = Boolean(
            (!dialConfig.isSpecialEleven && fishStageObj) || briefingTemplate.isFishIncident
        );

        // Cross-module dependencies & Dual-Override chains scale with Difficulty Dial:
        // Dial 11 guarantees or strongly favors Dual-Override Interlock + Tier 5 cross-module dependencies
        let specialScenario = null;
        if (dialConfig.isSpecialEleven && moduleCount >= 4) {
            specialScenario = "dual_override_interlock";
        } else if (dialLevel >= 8 && moduleCount >= 5 && Math.random() < 0.35) {
            specialScenario = "dual_override_interlock";
        } else if (moduleCount >= 5 && difficultyLevel >= 3 && Math.random() < 0.10) {
            specialScenario = "dual_override_interlock";
        }

        const chosenModules = this.selectIncidentModules(moduleCount, difficultyLevel, {
            specialScenario
        });
        const complexityProfile = this.getComplexityBriefingProfile(
            chosenModules.length,
            isFishIncident,
            exceptionType
        );

        const activeFishStageObj = !dialConfig.isSpecialEleven ? fishStageObj : null;
        const baseDescription = activeFishStageObj ? activeFishStageObj.description : briefingTemplate.description;
        const scenarioNote =
            dialConfig.isSpecialEleven
                ? " [UNSANCTIONED DIAL 11: CROSS-MODULE INTERLOCK XI & DUAL-OVERRIDE CHAIN ACTIVE]"
                : specialScenario === "dual_override_interlock"
                ? " [SPECIAL SCENARIO: DUAL-INTERLOCK OVERRIDE A & B]"
                : "";
        const fullDescription = `[SCALE ASSESSMENT: ${complexityProfile.scaleHeadline}]${scenarioNote} ${baseDescription}`;

        this.activeMission = {
            title:
                options.preserveBriefingTemplate && this.activeMission && this.activeMission.title
                    ? this.activeMission.title
                    : `INCIDENT #${1000 + (storage.stats.missionsAttempted + 1) * 7}`,
            location: activeFishStageObj ? activeFishStageObj.location : briefingTemplate.location,
            device: activeFishStageObj ? activeFishStageObj.device : briefingTemplate.device,
            description: fullDescription,
            complexityTelemetry: dialConfig.isSpecialEleven
                ? `${chosenModules.length} ACTIVE MODULES // DIAL 11 INTERLOCK XI`
                : complexityProfile.telemetryLabel,
            dossierStamp: dialConfig.isSpecialEleven
                ? "☢️ UNSANCTIONED LEVEL 11"
                : complexityProfile.stamp,
            exceptionType,
            specialScenario,
            timeSeconds: finalSeconds,
            moduleTypes: chosenModules,
            difficultyLevel,
            difficultyDial: dialLevel,
            isFishIncident,
            fishLoreStage: activeFishStageObj ? activeFishStageObj.stage : currentFishStageNum,
            fishLoreBadge: activeFishStageObj ? activeFishStageObj.badge : "🐟 CLASS-4 BREAKROOM FISH INCIDENT",
            introDispatch: activeFishStageObj ? activeFishStageObj.introDispatch : null,
            _rawTemplate: briefingTemplate,
            _baseTemplate: baseTemplate,
            _d11Template: d11Template,
            _fishStageObj: fishStageObj
        };

        this.populateBriefingScreen();
        if (this.currentScreen !== "screen-briefing") {
            this.showScreen("screen-briefing");
        }
    }

    populateBriefingScreen() {
        const m = this.activeMission;
        document.getElementById("briefing-incident-id").textContent = m.title;
        document.getElementById("briefing-location").textContent = m.location;
        document.getElementById("briefing-device").textContent = m.device;
        document.getElementById("briefing-description").textContent = m.description;
        document.getElementById("briefing-module-count").textContent =
            m.complexityTelemetry ||
            `${m.moduleTypes.length} ACTIVE ${m.moduleTypes.length === 1 ? "MODULE" : "MODULES"}`;
        document.getElementById("briefing-time-limit").textContent = `${m.timeSeconds} SECONDS`;

        const stampEl = document.getElementById("briefing-stamp");
        const descLabelEl = document.getElementById("briefing-desc-label");
        const deployBtnEl = document.getElementById("btn-deploy-incident");
        if (stampEl) {
            stampEl.textContent = this.isTrainingMission
                ? m.chapter || "TRAINING CAMPAIGN"
                : m.dossierStamp || "URGENT DISPATCH";
        }
        if (descLabelEl) {
            descLabelEl.textContent = this.isTrainingMission ? "TRAINING SCENARIO OVERVIEW" : "FIELD SITUATION REPORT";
        }
        if (deployBtnEl) {
            deployBtnEl.textContent = this.isTrainingMission
                ? "🎓 BEGIN TRAINING LESSON & START CLOCK"
                : "⚡ DEPLOY TO INCIDENT & START CLOCK";
        }

        const fishBadge = document.getElementById("briefing-fish-alert");
        if (fishBadge) {
            fishBadge.style.display = m.isFishIncident ? "inline-flex" : "none";
            if (m.isFishIncident) {
                fishBadge.textContent = m.fishLoreBadge || "🐟 CLASS-4 BREAKROOM FISH INCIDENT";
            }
        }

        // Populate Pre-Mission Instructional Guide & Mission Objective Panel in Training Mode
        const trainingPanelEl = document.getElementById("briefing-training-panel");
        if (trainingPanelEl) {
            if (this.isTrainingMission && m.objectivePanel) {
                trainingPanelEl.style.display = "block";
                const newConceptEl = document.getElementById("briefing-new-concept");
                const reinforcesEl = document.getElementById("briefing-reinforces");
                const instructionsEl = document.getElementById("briefing-training-instructions");
                const learnEl = document.getElementById("briefing-obj-learning");
                const successEl = document.getElementById("briefing-obj-success");
                const mistakesEl = document.getElementById("briefing-obj-mistakes");

                if (newConceptEl) newConceptEl.textContent = `🎯 NEW CONCEPT: ${m.newConcept}`;
                if (reinforcesEl) reinforcesEl.textContent = `🔁 REINFORCES: ${m.reinforces}`;
                if (instructionsEl) {
                    const steps = String(m.instructionalText || "")
                        .split("\n")
                        .filter((s) => s.trim().length > 0);
                    instructionsEl.innerHTML = steps
                        .map((step) => `<div class="training-step-item">${step}</div>`)
                        .join("");
                }
                if (learnEl) learnEl.textContent = m.objectivePanel.learning;
                if (successEl) successEl.textContent = m.objectivePanel.successCriteria;
                if (mistakesEl) mistakesEl.textContent = m.objectivePanel.commonMistakes;
            } else {
                trainingPanelEl.style.display = "none";
            }
        }

        // Sync Rotary Difficulty Dial (1-11) on Briefing Screen
        this.updateDifficultyDialUI();
    }

    // ==================================================
    // ACTIVE DEVICE GAMEPLAY & RETRY SYSTEM
    // ==================================================
    retryActiveIncident() {
        if (!this.activeMission) return;
        this.isRetryRun = true;
        this.launchActiveDevice(true);
    }

    launchActiveDevice(isRetry = false) {
        if (!this.activeMission) return;
        this.isRetryRun = Boolean(isRetry);

        storage.progress.hasTouchedDevice = true;
        storage.saveProgress();

        storage.stats.missionsAttempted++;
        storage.saveStats();

        const dialLevel =
            (this.activeMission && this.activeMission.difficultyDial) ||
            this.getDifficultyDialLevel();
        const dialConfig = GAME_CONFIG.getDifficultyDialConfig(dialLevel);

        this.strikes = 0;
        this.maxStrikes = this.isTrainingMission ? 3 : dialConfig.maxStrikes;
        this.totalMissionSeconds = this.activeMission.timeSeconds;
        this.remainingSeconds = this.activeMission.timeSeconds;
        this.lastWholeSecond = Math.ceil(this.remainingSeconds);
        this.lastStrikeModule = null;
        this.lastStrikeReason = "";
        this.incidentTimeline = [
            {
                timeStr: this.formatTimelineClock(this.totalMissionSeconds),
                text: "Device activated",
                type: "start"
            }
        ];

        this.usedVisorThisMission = Boolean(typeof visor !== "undefined" && visor && visor.active);
        if (this.usedVisorThisMission) {
            this.checkAndToastAchievement("precision_optics");
        }

        // Generate chassis telemetry only on fresh runs; preserve exact chassis on retry
        if (!isRetry || !this.activeChassis) {
            this.activeChassis = DeviceGenerator.generateChassis(this.activeMission.difficultyLevel);
            this.activeChassis.isLogicTutorial = Boolean(this.activeMission.isLogicTutorial);
            this.activeChassis.isTraining = Boolean(this.isTrainingMission);
        }
        this.activeChassis.isTraining = Boolean(this.isTrainingMission);
        this.activeChassis.totalOverrides = this.activeMission.moduleTypes.filter(
            (t) => t === "override"
        ).length;

        // Populate Chassis Bar
        const deviceTitle =
            isRetry && !this.isTrainingMission
                ? `${this.activeMission.device} [PRACTICE RETRY]`
                : this.activeMission.device;
        document.getElementById("hud-device-name").textContent = deviceTitle;
        document.getElementById("hud-device-location").textContent = this.activeMission.location;
        document.getElementById("chassis-serial").textContent = this.activeChassis.serial;
        document.getElementById("chassis-batteries").textContent = `${this.activeChassis.batteries} ${this.activeChassis.batteries === 1 ? "CELL" : "CELLS"}`;
        document.getElementById("chassis-port").textContent = this.activeChassis.port;

        // Populate Active Training Mission Objective Panel during Training Mode gameplay
        const activeObjPanel = document.getElementById("active-training-objective-panel");
        if (activeObjPanel) {
            if (this.isTrainingMission && this.activeMission.objectivePanel) {
                activeObjPanel.style.display = "block";
                const chapEl = document.getElementById("active-obj-chapter");
                const newEl = document.getElementById("active-obj-new-concept");
                const reinfEl = document.getElementById("active-obj-reinforces");
                const learnEl = document.getElementById("active-obj-learning");
                const succEl = document.getElementById("active-obj-success");
                const mistEl = document.getElementById("active-obj-mistakes");

                if (chapEl) chapEl.textContent = this.activeMission.chapter || "TRAINING";
                if (newEl) newEl.textContent = `🎯 NEW: ${this.activeMission.newConcept}`;
                if (reinfEl) reinfEl.textContent = `🔁 REINFORCES: ${this.activeMission.reinforces}`;
                if (learnEl) learnEl.textContent = this.activeMission.objectivePanel.learning;
                if (succEl) succEl.textContent = this.activeMission.objectivePanel.successCriteria;
                if (mistEl) mistEl.textContent = this.activeMission.objectivePanel.commonMistakes;
            } else {
                activeObjPanel.style.display = "none";
            }
        }

        // Generate or reset modules
        const gridEl = document.getElementById("device-modules-grid");
        gridEl.innerHTML = "";

        if (isRetry && Array.isArray(this.activeModules) && this.activeModules.length > 0) {
            // Reload exact same incident configuration with reset puzzle state
            this.activeModules.forEach((modInstance) => {
                if (typeof modInstance.resetForRetry === "function") {
                    modInstance.resetForRetry();
                } else {
                    modInstance.solved = false;
                }
                gridEl.appendChild(modInstance.render());
            });
        } else {
            this.activeModules = [];
            const totalMods = this.activeMission.moduleTypes.length;
            this.activeMission.moduleTypes.forEach((mType, idx) => {
                const modInstance = DeviceGenerator.createModule(
                    mType,
                    idx,
                    this.activeChassis,
                    totalMods,
                    (solvedMod) => this.handleModuleSolved(solvedMod),
                    (struckMod, reason) => this.handleModuleStrike(struckMod, reason),
                    this.activeModules
                );
                this.activeModules.push(modInstance);
                gridEl.appendChild(modInstance.render());
            });
        }

        this.updateStrikesUI();
        this.updateProgressUI();
        this.updateTimerDisplay();

        this.showScreen("screen-game");

        // Start procedural background synth & live radio dispatch
        audio.ensureContext();
        audio.startMusic();
        dispatch.startMissionDispatch(this.activeMission, this.activeModules, isRetry);

        // Start high-precision countdown loop
        if (this.timerInterval) clearInterval(this.timerInterval);
        const startTime = performance.now();
        let lastTickTime = startTime;

        this.timerInterval = setInterval(() => {
            const now = performance.now();
            const dt = (now - lastTickTime) / 1000;
            lastTickTime = now;

            // Strikes slightly accelerate countdown (classic Bomb Squad tension)
            const speedFactor = 1 + this.strikes * 0.15;
            this.remainingSeconds = Math.max(0, this.remainingSeconds - dt * speedFactor);
            this.updateTimerDisplay();

            const currentWhole = Math.ceil(this.remainingSeconds);
            if (currentWhole !== this.lastWholeSecond && currentWhole > 0) {
                this.lastWholeSecond = currentWhole;
                const urgency = currentWhole <= 10 ? 2 : currentWhole <= 30 ? 1 : 0;
                audio.playTick(urgency);
            }

            if (this.remainingSeconds <= 0) {
                this.finishMission(false, "COUNTDOWN EXPIRED");
            }
        }, 50);
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById("countdown-clock");
        if (!timerEl) return;

        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = Math.floor(this.remainingSeconds % 60);
        const tenths = Math.floor((this.remainingSeconds % 1) * 10);

        const mStr = String(mins).padStart(2, "0");
        const sStr = String(secs).padStart(2, "0");
        timerEl.textContent = `${mStr}:${sStr}.${tenths}`;

        timerEl.classList.toggle("warning", this.remainingSeconds <= 30 && this.remainingSeconds > 10);
        timerEl.classList.toggle("critical", this.remainingSeconds <= 10);
    }

    updateStrikesUI() {
        const container = document.getElementById("strikes-indicators");
        if (!container) return;
        let html = "";
        for (let i = 0; i < this.maxStrikes; i++) {
            const active = i < this.strikes;
            html += `<span class="strike-pip ${active ? "struck" : ""}">✕</span>`;
        }
        container.innerHTML = html;
    }

    updateProgressUI() {
        const solvedCount = this.activeModules.filter((m) => m.solved).length;
        const total = this.activeModules.length;
        const el = document.getElementById("hud-modules-progress");
        if (el) {
            el.textContent = `${solvedCount} / ${total} DISARMED`;
        }
    }

    formatTimelineClock(seconds) {
        const clamped = Math.max(0, Math.ceil(Number(seconds) || 0));
        const mins = Math.floor(clamped / 60);
        const secs = clamped % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    describeWrongAction(mod, reason) {
        if (!mod) return reason || "Incorrect input submitted";
        switch (mod.type) {
            case "wires":
                return "Wrong wire cut";
            case "keypad":
                return "Wrong keypad code submitted";
            case "frequency":
                return "Out-of-phase frequency locked";
            case "switches":
                return "Switch flipped out of sequence";
            case "symbols":
                return "Wrong Boolean logic submitted";
            case "memory":
                return "Wrong memory stage button pressed";
            case "pattern":
                return "Wrong pattern submitted";
            case "override":
                return "Emergency override engaged with invalid Auth Sum";
            default:
                return reason || "Wrong module action";
        }
    }

    handleModuleSolved(mod) {
        storage.stats.totalModulesSolved++;
        this.updateProgressUI();

        this.incidentTimeline.push({
            timeStr: this.formatTimelineClock(this.remainingSeconds),
            text: `${mod.title} neutralized`,
            type: "solve"
        });

        const remaining = this.activeModules.filter((m) => !m.solved).length;
        if (remaining === 0) {
            this.finishMission(true, "ALL MODULES NEUTRALIZED");
        } else {
            dispatch.transmit(
                `${mod.title} neutralized! ${remaining} module${remaining === 1 ? "" : "s"} remaining.`,
                "DISPATCH TELEMETRY",
                "hint",
                false
            );
        }
    }

    handleModuleStrike(mod, reason) {
        this.strikes++;
        this.lastStrikeModule = mod;
        this.lastStrikeReason = reason;
        storage.stats.totalStrikes++;
        this.updateStrikesUI();

        const clockStr = this.formatTimelineClock(this.remainingSeconds);
        const actionDesc = this.describeWrongAction(mod, reason);

        if (this.strikes >= this.maxStrikes) {
            this.incidentTimeline.push({
                timeStr: clockStr,
                text: `Final incorrect input (${actionDesc})`,
                type: "fatal-input"
            });
            this.finishMission(false, `MAXIMUM STRIKES EXCEEDED (${reason})`);
        } else {
            this.incidentTimeline.push({
                timeStr: clockStr,
                text: actionDesc,
                type: "wrong-action"
            });
            this.incidentTimeline.push({
                timeStr: clockStr,
                text: `Strike issued (${this.strikes}/${this.maxStrikes})`,
                type: "strike"
            });

            const remainingMistakes = this.maxStrikes - this.strikes;
            const mistakeWord = remainingMistakes === 1 ? "mistake" : "mistakes";
            dispatch.transmit(
                `Strike detected on ${mod.title}! ${remainingMistakes} ${mistakeWord} left before detonation!`,
                "SAFETY MONITOR",
                "urgent",
                true
            );
        }
    }

    abortActiveMissionToMenu() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        audio.stopMusic();
        dispatch.stopDispatch();
        this.showScreen("screen-menu");
    }

    // ==================================================
    // MISSION RESOLUTION, SCORING & ACHIEVEMENTS
    // ==================================================
    async finishMission(success, causeText) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        audio.stopMusic();
        dispatch.stopDispatch();
        this.lastMissionSuccess = Boolean(success);

        const isPracticeRetry = Boolean(this.isRetryRun && !this.isTrainingMission);
        const elapsedSeconds = Math.max(1, this.totalMissionSeconds - this.remainingSeconds);
        const modCount = this.activeModules.length;
        const dialLevel =
            (this.activeMission && this.activeMission.difficultyDial) ||
            this.getDifficultyDialLevel();
        const diffConfig = GAME_CONFIG.getDifficultyDialConfig(dialLevel);

        let basePoints = 0;
        let timeBonus = 0;
        let accuracyBonus = 0;
        let streakMultiplier = 1.0;
        let missionTotalScore = 0;

        if (success) {
            audio.playSuccessFanfare();

            storage.stats.missionsCompleted++;

            if (this.activeMission.isFishIncident) {
                if (typeof storage.recordFishEncounter === "function" && !isPracticeRetry) {
                    storage.recordFishEncounter(true);
                } else {
                    storage.stats.fishIncidentsSurvived++;
                }
            }

            if (this.isTrainingMission && this.currentTrainingId) {
                storage.markTrainingComplete(this.currentTrainingId);
            }

            // Score formula
            basePoints = modCount * 500;
            timeBonus = Math.round(this.remainingSeconds * 25);
            accuracyBonus =
                this.strikes === 0
                    ? modCount * 300
                    : Math.max(0, (this.maxStrikes - this.strikes) * 100);

            if (!isPracticeRetry) {
                storage.stats.currentStreak++;
                if (storage.stats.currentStreak > storage.stats.longestStreak) {
                    storage.stats.longestStreak = storage.stats.currentStreak;
                }

                if (
                    storage.stats.fastestDefusal === null ||
                    elapsedSeconds < storage.stats.fastestDefusal
                ) {
                    storage.stats.fastestDefusal = Number(elapsedSeconds.toFixed(1));
                }

                streakMultiplier = Number(
                    (1 + Math.min(2.0, (storage.stats.currentStreak - 1) * 0.15)).toFixed(2)
                );

                missionTotalScore = Math.round(
                    (basePoints + timeBonus + accuracyBonus) *
                        streakMultiplier *
                        diffConfig.scoreMultiplier
                );

                storage.stats.totalScore += missionTotalScore;
                if (missionTotalScore > storage.stats.bestScore) {
                    storage.stats.bestScore = missionTotalScore;
                }
            } else {
                // Practice Run (Retry): calculate practice score for display without inflating ranked bestScore/streak
                streakMultiplier = 1.0;
                missionTotalScore = Math.round(
                    (basePoints + timeBonus + accuracyBonus) * diffConfig.scoreMultiplier
                );
            }
        } else {
            audio.playExplosion();
            if (
                this.activeMission &&
                this.activeMission.isFishIncident &&
                typeof storage.recordFishEncounter === "function" &&
                !isPracticeRetry
            ) {
                storage.recordFishEncounter(false);
            }
            const solvedMods = this.activeModules.filter((m) => m.solved).length;
            basePoints = solvedMods * 150;
            missionTotalScore = basePoints;
            if (!isPracticeRetry) {
                storage.stats.currentStreak = 0;
                storage.stats.totalScore += missionTotalScore;
            }
        }

        const prevRankIdx = storage.stats.highestRankIndex || 0;
        storage.saveStats();
        const newRankIdx = storage.stats.highestRankIndex || 0;
        const promoted = newRankIdx > prevRankIdx;

        // Evaluate Achievements
        this.evaluatePostMissionAchievements(success, elapsedSeconds, modCount);

        // Populate Result Screen
        const bannerEl = document.getElementById("result-status-banner");
        const reportTitleEl = document.getElementById("result-report-title");
        const reportBodyEl = document.getElementById("result-flavor-report");
        const failureAnalysisEl = document.getElementById("failure-analysis-section");
        const failurePillsEl = document.getElementById("failure-type-pills");
        const immediateCauseEl = document.getElementById("failure-immediate-cause");
        const dispatchAssessEl = document.getElementById("failure-dispatch-assessment");
        const timelineListEl = document.getElementById("failure-timeline-list");

        if (success) {
            bannerEl.textContent = isPracticeRetry
                ? "PRACTICE RUN COMPLETE // DEVICE NEUTRALIZED"
                : "INCIDENT CONTAINED // DEVICE NEUTRALIZED";
            bannerEl.className = "result-banner success";
            reportTitleEl.textContent = "OFFICIAL AFTER-ACTION SUCCESS REPORT:";
            const sPool =
                this.activeMission &&
                this.activeMission.isFishIncident &&
                FLAVOR_DB.fishSuccessReports &&
                FLAVOR_DB.fishSuccessReports.length > 0
                    ? FLAVOR_DB.fishSuccessReports
                    : FLAVOR_DB.successReports;
            reportBodyEl.textContent = sPool[Math.floor(Math.random() * sPool.length)];
            if (failureAnalysisEl) {
                failureAnalysisEl.style.display = "none";
            }
        } else {
            // Classify exact failure mode: Timer Expiration vs. Emergency Override Failure vs. Strike Accumulation vs. Wrong Action
            const isTimerExpired =
                this.remainingSeconds <= 0 || String(causeText).includes("COUNTDOWN EXPIRED");
            const isOverrideFailure =
                !isTimerExpired &&
                Boolean(this.lastStrikeModule && this.lastStrikeModule.type === "override");
            const isStrikeAccumulation = !isTimerExpired && this.strikes >= 2;
            const isWrongAction = !isTimerExpired && Boolean(this.lastStrikeModule);

            let primaryCategoryKey = "wrong_action";
            let bannerHeadline = "UNAUTHORIZED DETONATION // CRITICAL WRONG ACTION";
            let immediateCauseText = "";

            const unsolvedCount = this.activeModules.filter((m) => !m.solved).length;

            if (isTimerExpired) {
                primaryCategoryKey = "timer";
                bannerHeadline = "UNAUTHORIZED DETONATION // TIMER EXPIRATION";
                immediateCauseText =
                    this.strikes > 0
                        ? `Countdown timer expired at 00:00.0 with ${unsolvedCount} module${unsolvedCount === 1 ? "" : "s"} still armed (accelerated by ${this.strikes} prior strike${this.strikes === 1 ? "" : "s"}).`
                        : `Countdown timer expired at 00:00.0 with ${unsolvedCount} module${unsolvedCount === 1 ? "" : "s"} still armed.`;
            } else if (isOverrideFailure) {
                primaryCategoryKey = "override";
                bannerHeadline = "UNAUTHORIZED DETONATION // EMERGENCY OVERRIDE FAILURE";
                const playerCode =
                    this.lastStrikeModule.lastPlayerAnswer || "Invalid AUTH Code";
                immediateCauseText = `Emergency Override engaged with ${playerCode} instead of AUTH-${this.lastStrikeModule.targetAuthValue} (Strike ${this.strikes}/${this.maxStrikes}).`;
            } else if (isStrikeAccumulation) {
                primaryCategoryKey = "strike_accumulation";
                bannerHeadline = "UNAUTHORIZED DETONATION // STRIKE ACCUMULATION";
                immediateCauseText = `Accumulated ${this.strikes}/${this.maxStrikes} strikes; final wrong action on ${
                    this.lastStrikeModule ? this.lastStrikeModule.title : "Device"
                } (${this.lastStrikeReason}).`;
            } else {
                primaryCategoryKey = "wrong_action";
                bannerHeadline = "UNAUTHORIZED DETONATION // CRITICAL WRONG ACTION";
                immediateCauseText = `Critical wrong action on ${
                    this.lastStrikeModule ? this.lastStrikeModule.title : "Device"
                }: ${this.lastStrikeReason}.`;
            }

            bannerEl.textContent = bannerHeadline;
            bannerEl.className = "result-banner failure";
            reportTitleEl.textContent = "COMEDY CONSEQUENCE REPORT:";
            const fPool =
                this.activeMission &&
                this.activeMission.isFishIncident &&
                FLAVOR_DB.fishFailureReports &&
                FLAVOR_DB.fishFailureReports.length > 0
                    ? FLAVOR_DB.fishFailureReports
                    : FLAVOR_DB.failureReports;
            reportBodyEl.textContent = fPool[Math.floor(Math.random() * fPool.length)];

            // Append terminal Detonation entry to Incident Timeline
            const detClock = isTimerExpired
                ? "00:00"
                : this.formatTimelineClock(this.remainingSeconds);
            this.incidentTimeline.push({
                timeStr: detClock,
                text: "Detonation",
                type: "detonation"
            });

            if (failureAnalysisEl) {
                failureAnalysisEl.style.display = "block";
            }

            if (failurePillsEl) {
                const categories = [
                    {
                        key: "timer",
                        label: "⏱️ TIMER EXPIRATION",
                        active: isTimerExpired,
                        primary: primaryCategoryKey === "timer"
                    },
                    {
                        key: "wrong_action",
                        label: "❌ WRONG ACTION",
                        active: isWrongAction,
                        primary: primaryCategoryKey === "wrong_action"
                    },
                    {
                        key: "strike_accumulation",
                        label: `⚡ STRIKE ACCUMULATION (${this.strikes}/${this.maxStrikes})`,
                        active: isStrikeAccumulation,
                        primary: primaryCategoryKey === "strike_accumulation"
                    },
                    {
                        key: "override",
                        label: "🚨 EMERGENCY OVERRIDE FAILURE",
                        active: isOverrideFailure,
                        primary: primaryCategoryKey === "override"
                    }
                ];

                failurePillsEl.innerHTML = categories
                    .map(
                        (c) => `
                        <span class="failure-type-pill ${c.active ? "is-active" : "is-inactive"} ${
                            c.primary ? "is-primary" : ""
                        }">
                            ${c.label}${c.primary ? " • PRIMARY" : ""}
                        </span>
                    `
                    )
                    .join("");
            }

            if (immediateCauseEl) {
                immediateCauseEl.textContent = immediateCauseText;
            }

            if (dispatchAssessEl) {
                const assessPool =
                    (FLAVOR_DB.dispatchAssessments &&
                        FLAVOR_DB.dispatchAssessments[primaryCategoryKey]) ||
                    (FLAVOR_DB.dispatchAssessments && FLAVOR_DB.dispatchAssessments.wrong_action) || [
                        "Dispatch has filed this incident under 'Sub-Optimal Rapid Disassembly.'"
                    ];
                dispatchAssessEl.textContent =
                    assessPool[Math.floor(Math.random() * assessPool.length)];
            }

            if (timelineListEl) {
                timelineListEl.innerHTML = this.incidentTimeline
                    .map(
                        (ev) => `
                        <div class="timeline-row timeline-${ev.type || "event"}">
                            <span class="timeline-clock">${ev.timeStr}</span>
                            <span class="timeline-desc">${ev.text}</span>
                        </div>
                    `
                    )
                    .join("");
            }
        }

        // Training Mode Debrief Section (Appears ONLY after a failed Training Mission)
        const debriefSectionEl = document.getElementById("training-debrief-section");
        const debriefReasonEl = document.getElementById("debrief-failure-reason");
        const debriefCardsEl = document.getElementById("training-debrief-cards");

        if (debriefSectionEl && debriefReasonEl && debriefCardsEl) {
            if (this.isTrainingMission && !success) {
                debriefSectionEl.style.display = "block";

                // 1. Explain why the player failed + Dispatch commentary quote
                const hasPatternUnsolved = this.activeModules.some(
                    (m) => !m.solved && m.type === "pattern"
                );
                const debriefVoicePool = FLAVOR_DB.trainingDebriefDispatchMessages || [
                    "The Department considers this a learning opportunity.",
                    "The matrix did not matrix correctly."
                ];
                const dispatchComment = hasPatternUnsolved
                    ? "The matrix did not matrix correctly."
                    : debriefVoicePool[Math.floor(Math.random() * debriefVoicePool.length)];

                if (this.strikes >= this.maxStrikes && this.lastStrikeModule) {
                    debriefReasonEl.innerHTML = `<strong>WHY IT DETONATED:</strong> Maximum strikes (${this.maxStrikes}/${this.maxStrikes}) reached on <b>${this.lastStrikeModule.title}</b> — ${this.lastStrikeReason}.<br/><span class="debrief-dispatch-quote">📻 Dispatch: "${dispatchComment}"</span>`;
                } else {
                    debriefReasonEl.innerHTML = `<strong>WHY IT DETONATED:</strong> The countdown clock reached 00:00.0 before all training modules were neutralized.<br/><span class="debrief-dispatch-quote">📻 Dispatch: "${dispatchComment}"</span>`;
                }

                // 2. Collect modules to debrief (prioritize lastStrikeModule, then any unsolved modules)
                const modulesToDebrief = [];
                if (this.lastStrikeModule) {
                    modulesToDebrief.push(this.lastStrikeModule);
                }
                this.activeModules.forEach((mod) => {
                    if (!mod.solved && !modulesToDebrief.includes(mod)) {
                        modulesToDebrief.push(mod);
                    }
                });

                debriefCardsEl.innerHTML = modulesToDebrief
                    .map((mod) => {
                        const info =
                            typeof mod.getTrainingDebrief === "function"
                                ? mod.getTrainingDebrief()
                                : {
                                      moduleTitle: mod.title,
                                      expectedAnswer: "See protocol",
                                      playerAnswer: "N/A",
                                      ruleOrClue: mod.ruleText || "",
                                      explanation: mod.getDispatchHint()
                                  };
                        return `
                        <div class="debrief-card">
                            <div class="debrief-card-title">🔧 ${info.moduleTitle}</div>
                            <div class="debrief-kv-grid">
                                <div class="debrief-kv-item expected">
                                    <small>EXPECTED ANSWER</small>
                                    <strong>${info.expectedAnswer}</strong>
                                </div>
                                <div class="debrief-kv-item player">
                                    <small>YOUR ANSWER</small>
                                    <strong>${info.playerAnswer}</strong>
                                </div>
                            </div>
                            <div class="debrief-rule-row">
                                <small>RELEVANT RULE / CLUE:</small>
                                <span>${info.ruleOrClue}</span>
                            </div>
                            <p class="debrief-explanation">💡 ${info.explanation}</p>
                        </div>
                    `;
                    })
                    .join("");

                // 3. Speak Dispatch voice commentary for Training Debrief
                audio.speakDispatch(dispatchComment, true);
            } else {
                debriefSectionEl.style.display = "none";
                debriefCardsEl.innerHTML = "";
            }
        }

        document.getElementById("score-base").textContent = `${basePoints.toLocaleString()} PTS`;
        document.getElementById("score-time").textContent = `+${timeBonus.toLocaleString()} PTS`;
        document.getElementById("score-accuracy").textContent = `+${accuracyBonus.toLocaleString()} PTS`;
        document.getElementById("score-multipliers").textContent = isPracticeRetry
            ? `PRACTICE RUN (UNRANKED RETRY)`
            : `${streakMultiplier}x Streak × ${diffConfig.scoreMultiplier}x Dial ${dialLevel}`;
        document.getElementById("score-total").textContent = isPracticeRetry
            ? `${missionTotalScore.toLocaleString()} PTS (PRACTICE)`
            : `${missionTotalScore.toLocaleString()} PTS`;
        document.getElementById("score-career").textContent = `${storage.stats.totalScore.toLocaleString()} PTS`;

        const rankObj = storage.getCurrentRankObj();
        const promoEl = document.getElementById("result-rank-display");
        promoEl.innerHTML = promoted
            ? `🎉 <b>PROMOTION EARNED:</b> ${rankObj.title} (${rankObj.clearance})`
            : `CURRENT RANK: <b>${rankObj.title}</b> (${rankObj.clearance})`;

        // Configure Retry & Next Incident buttons based on mode and outcome
        const retryBtn = document.getElementById("btn-retry-incident");
        const nextBtn = document.getElementById("btn-next-mission");
        if (retryBtn && nextBtn) {
            if (this.isTrainingMission && !success) {
                // Failed Training Mission: Retry is the primary action; do not advance training progression
                retryBtn.className = "btn-retry btn-primary";
                retryBtn.textContent = "🔄 RETRY TRAINING MISSION";
                nextBtn.className = "btn-secondary";
                nextBtn.textContent = "◄ TRAINING LIST";
            } else if (this.isTrainingMission && success) {
                retryBtn.className = "btn-retry";
                retryBtn.textContent = "🔄 RETRY TRAINING";
                nextBtn.className = "btn-primary";
                nextBtn.textContent =
                    this.currentTrainingId < TRAINING_MISSIONS.length
                        ? "NEXT TRAINING ►"
                        : "START FIELD MISSIONS ►";
            } else {
                // Procedural / Arcade Mode
                retryBtn.className = "btn-retry";
                retryBtn.textContent = "🔄 RETRY INCIDENT";
                nextBtn.className = "btn-primary";
                nextBtn.textContent = "NEXT INCIDENT ►";
            }
        }

        this.showScreen("screen-result");

        // Leaderboard submission & Score Integrity
        const lbStatusEl = document.getElementById("result-leaderboard-status");
        if (this.isRetryRun) {
            if (lbStatusEl) {
                lbStatusEl.textContent =
                    "ℹ️ PRACTICE RUN (RETRIED INCIDENT) — Leaderboard submission suppressed to preserve score integrity.";
            }
            return;
        }

        if (lbStatusEl) lbStatusEl.textContent = "Submitting score to STF Leaderboard...";
        await leaderboard.submitScore({
            playerName: storage.settings.playerName,
            score: storage.stats.bestScore,
            rank: rankObj.title,
            missionsCompleted: storage.stats.missionsCompleted,
            longestStreak: storage.stats.longestStreak
        });
        if (lbStatusEl) lbStatusEl.textContent = `✓ ${leaderboard.lastStatus}`;
    }

    evaluatePostMissionAchievements(success, elapsedSeconds, modCount) {
        const activeFishStage =
            (this.activeMission && this.activeMission.fishLoreStage) ||
            (storage.progress && storage.progress.fishLoreStage) ||
            1;

        if (this.activeMission && this.activeMission.isFishIncident) {
            if (activeFishStage >= 2 || (storage.stats && storage.stats.fishEncounters >= 2)) {
                this.checkAndToastAchievement("fish_relocated");
            }
            if (activeFishStage >= 5 || (storage.stats && storage.stats.fishEncounters >= 5)) {
                this.checkAndToastAchievement("fish_treasurer");
            }
        }

        if (success) {
            this.checkAndToastAchievement("not_exploding_is_winning");

            if (storage.stats.dispatchMessagesIgnored >= 50) {
                this.checkAndToastAchievement("trust_issues");
            }
            if (storage.stats.fishIncidentsSurvived >= 3) {
                this.checkAndToastAchievement("fish_whisperer");
            }
            if (
                this.activeMission &&
                this.activeMission.isFishIncident &&
                (activeFishStage >= 3 || storage.stats.fishIncidentsSurvived >= 2)
            ) {
                this.checkAndToastAchievement("fish_complaint");
            }
            if (storage.progress.trainingCompleted.length >= TRAINING_MISSIONS.length) {
                this.checkAndToastAchievement("training_certified");
            }
            if (this.remainingSeconds > 0 && this.remainingSeconds < 5.0) {
                this.checkAndToastAchievement("close_call");
            }
            if (!this.isTrainingMission && elapsedSeconds < 25) {
                this.checkAndToastAchievement("speed_demon");
            }
            if (storage.stats.currentStreak >= 5) {
                this.checkAndToastAchievement("flawless_streak_5");
            }
            if (storage.stats.currentStreak >= 10) {
                this.checkAndToastAchievement("flawless_streak_10");
            }
            if (modCount >= 4 && this.strikes === 0) {
                this.checkAndToastAchievement("no_strikes_hard");
            }
        } else {
            // Lost after Dispatch changed advice mid-mission
            if (dispatch.adviceChangedThisMission) {
                this.checkAndToastAchievement("the_other_blue_wire");
            }
        }

        if (storage.stats.highestRankIndex >= 2) {
            this.checkAndToastAchievement("senior_promotion");
        }
        if (storage.stats.highestRankIndex >= GAME_CONFIG.ranks.length - 1) {
            this.checkAndToastAchievement("ceo_not_booming");
        }

        if (this.usedVisorThisMission || (typeof visor !== "undefined" && visor && visor.active)) {
            this.checkAndToastAchievement("precision_optics");
        }
    }

    checkAndToastAchievement(achId) {
        const unlocked = storage.unlockAchievement(achId);
        if (!unlocked) return;

        const toast = document.getElementById("achievement-toast");
        if (!toast) return;
        toast.innerHTML = `
            <span class="toast-icon">${unlocked.icon}</span>
            <div class="toast-text">
                <small>ACHIEVEMENT UNLOCKED</small>
                <strong>${unlocked.title}</strong>
                <span>${unlocked.description}</span>
            </div>
        `;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 4500);
    }

    // ==================================================
    // HIGH SCORES, STATISTICS, ACHIEVEMENTS, OPTIONS
    // ==================================================
    async openHighScoresScreen() {
        this.showScreen("screen-highscores");
        const tbody = document.getElementById("leaderboard-tbody");
        const statusEl = document.getElementById("leaderboard-conn-status");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6">Loading STF Arcade telemetry...</td></tr>`;
        }

        const data = await leaderboard.fetchLeaderboard();
        if (statusEl) {
            statusEl.textContent = leaderboard.lastStatus;
        }
        if (tbody) {
            tbody.innerHTML = data.entries
                .map(
                    (row, idx) => `
                <tr>
                    <td>#${idx + 1}</td>
                    <td><b>${this.escapeHTML(row.playerName)}</b></td>
                    <td class="td-score">${Number(row.score).toLocaleString()}</td>
                    <td>${this.escapeHTML(row.rank)}</td>
                    <td>${row.missionsCompleted} (${row.longestStreak}🔥)</td>
                    <td>${this.escapeHTML(row.date || "-")}</td>
                </tr>
            `
                )
                .join("");
        }
    }

    openStatisticsScreen() {
        const s = storage.stats;
        const rankObj = storage.getCurrentRankObj();
        const nextRank = storage.getNextRankObj();

        const grid = document.getElementById("stats-grid-container");
        if (grid) {
            const statsItems = [
                {
                    label: "Operator Designation (Call Sign)",
                    val: (storage.settings.playerName || "TECH-404").trim()
                },
                { label: "Current Corporate Rank", val: rankObj.title },
                { label: "Security Clearance", val: rankObj.clearance },
                { label: "Next Promotion Target", val: nextRank ? `${nextRank.title} (${nextRank.minScore.toLocaleString()} pts)` : "MAX RANK ACHIEVED" },
                { label: "Missions Attempted", val: s.missionsAttempted },
                { label: "Missions Completed", val: s.missionsCompleted },
                { label: "Defusal Success Rate", val: storage.getSuccessRate() },
                { label: "Best Single Mission Score", val: s.bestScore.toLocaleString() },
                { label: "Cumulative Career Score", val: s.totalScore.toLocaleString() },
                { label: "Longest Defusal Streak", val: `${s.longestStreak} Missions` },
                { label: "Fastest Defusal Time", val: s.fastestDefusal !== null ? `${s.fastestDefusal}s` : "N/A" },
                { label: "Fish Incidents Survived", val: `${s.fishIncidentsSurvived} 🐟 (${s.fishEncounters || 0} Encounters)` },
                {
                    label: "Fish Container Lore Status",
                    val:
                        typeof FLAVOR_DB.getFishLoreStageData === "function"
                            ? `Stage ${(storage.progress && storage.progress.fishLoreStage) || 1}: ${
                                  FLAVOR_DB.getFishLoreStageData(
                                      (storage.progress && storage.progress.fishLoreStage) || 1
                                  ).statusSummary
                              }`
                            : "Ticking on Shelf 3"
                },
                { label: "Dispatch Messages Heard", val: s.dispatchMessagesHeard }
            ];

            grid.innerHTML = statsItems
                .map(
                    (item) => `
                <div class="stat-card">
                    <span class="stat-label">${item.label}</span>
                    <strong class="stat-value">${item.val}</strong>
                </div>
            `
                )
                .join("");
        }
        this.showScreen("screen-statistics");
    }

    openAchievementsScreen() {
        const container = document.getElementById("achievements-grid-container");
        if (container) {
            container.innerHTML = ACHIEVEMENTS.map((ach) => {
                const unlocked = storage.isAchievementUnlocked(ach.id);
                return `
                    <div class="ach-card ${unlocked ? "unlocked" : "locked"}">
                        <div class="ach-icon">${ach.icon}</div>
                        <div class="ach-details">
                            <h4>${ach.title}</h4>
                            <p>${ach.description}</p>
                            <span class="ach-status">${unlocked ? "✓ UNLOCKED" : "LOCKED"}</span>
                        </div>
                    </div>
                `;
            }).join("");
        }
        this.showScreen("screen-achievements");
    }

    openOptionsScreen() {
        // Check "Paperwork First" achievement: opened options before touching any device!
        if (!storage.progress.hasTouchedDevice && storage.stats.missionsAttempted === 0) {
            this.checkAndToastAchievement("paperwork_first");
        }

        const st = storage.settings;
        document.getElementById("opt-player-name").value = st.playerName || "TECH-404";
        document.getElementById("opt-voice-enabled").checked = Boolean(st.voiceEnabled);
        document.getElementById("opt-voice-volume").value = st.voiceVolume;
        document.getElementById("opt-music-volume").value = st.musicVolume;
        document.getElementById("opt-sfx-volume").value = st.sfxVolume;
        document.getElementById("opt-difficulty").value = String(this.getDifficultyDialLevel());
        document.getElementById("opt-online-leaderboard").checked = Boolean(st.onlineLeaderboard);

        const visorAlwaysEl = document.getElementById("opt-visor-always-on");
        const visorMagEl = document.getElementById("opt-visor-magnification");
        const visorFocusEl = document.getElementById("opt-visor-focus-mode");
        if (visorAlwaysEl) visorAlwaysEl.checked = Boolean(st.visorAlwaysOn);
        if (visorMagEl) visorMagEl.value = String(st.visorMagnification || 2);
        if (visorFocusEl) visorFocusEl.checked = Boolean(st.visorFocusMode);

        this.showScreen("screen-options");
    }

    bindOptionsControls() {
        const saveAllFromForm = () => {
            const nameInput = document.getElementById("opt-player-name");
            const voiceToggle = document.getElementById("opt-voice-enabled");
            const voiceVol = document.getElementById("opt-voice-volume");
            const musicVol = document.getElementById("opt-music-volume");
            const sfxVol = document.getElementById("opt-sfx-volume");
            const diffSel = document.getElementById("opt-difficulty");
            const lbToggle = document.getElementById("opt-online-leaderboard");
            const visorAlwaysEl = document.getElementById("opt-visor-always-on");
            const visorMagEl = document.getElementById("opt-visor-magnification");
            const visorFocusEl = document.getElementById("opt-visor-focus-mode");

            const nextMag = visorMagEl ? Number(visorMagEl.value) || 2 : 2;
            const nextAlways = visorAlwaysEl ? visorAlwaysEl.checked : false;
            const nextFocus = visorFocusEl ? visorFocusEl.checked : false;
            const oldName = (storage.settings.playerName || "TECH-404").trim();
            const newName = (nameInput.value || "TECH-404").replace(/[<>]/g, "").trim().slice(0, 24) || "TECH-404";

            const nextDial = Math.max(1, Math.min(11, Math.round(Number(diffSel ? diffSel.value : 2) || 2)));

            storage.saveSettings({
                playerName: newName,
                hasRegisteredCallsign: true,
                voiceEnabled: voiceToggle.checked,
                voiceVolume: Number(voiceVol.value),
                musicVolume: Number(musicVol.value),
                sfxVolume: Number(sfxVol.value),
                difficultyDial: nextDial,
                difficulty: String(nextDial),
                onlineLeaderboard: lbToggle.checked,
                visorAlwaysOn: nextAlways,
                visorMagnification: nextMag,
                visorFocusMode: nextFocus
            });

            if (oldName !== newName) {
                leaderboard.updateOperatorName(oldName, newName);
            }

            if (typeof visor !== "undefined") {
                visor.setMagnification(nextMag, false);
                visor.setFocusMode(nextFocus);
                visor.setAlwaysOn(nextAlways);
            }
            this.updateHeaderHUD();
        };

        [
            "opt-player-name",
            "opt-voice-enabled",
            "opt-voice-volume",
            "opt-music-volume",
            "opt-sfx-volume",
            "opt-difficulty",
            "opt-online-leaderboard",
            "opt-visor-always-on",
            "opt-visor-magnification",
            "opt-visor-focus-mode"
        ].forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("change", saveAllFromForm);
                el.addEventListener("input", saveAllFromForm);
            }
        });

        const testVoiceBtn = document.getElementById("btn-test-dispatch-voice");
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener("click", () => {
                saveAllFromForm();
                audio.speakDispatch(
                    "Department of Boom Prevention audio test. The manual is still written in crayon.",
                    true
                );
            });
        }

        const resetProgBtn = document.getElementById("btn-reset-progress");
        if (resetProgBtn) {
            resetProgBtn.addEventListener("click", () => {
                storage.resetProgress();
                audio.playButton(360);
                alert("Training progress and achievements have been reset.");
                this.updateHeaderHUD();
            });
        }

        const resetStatsBtn = document.getElementById("btn-reset-stats");
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener("click", () => {
                storage.resetStatistics();
                audio.playButton(360);
                alert("Career statistics and rank have been reset.");
                this.updateHeaderHUD();
            });
        }
    }

    escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
}

const game = new BoomSquadGame();
window.addEventListener("DOMContentLoaded", () => {
    game.init();
});
