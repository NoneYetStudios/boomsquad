/**
 * BOOM SQUAD - Puzzle Modules & Procedural Generator + Validator
 * Implements all 8 puzzle modules with deterministic solvability guarantees.
 */

const MODULE_TYPES = [
    "wires",
    "keypad",
    "frequency",
    "switches",
    "symbols",
    "memory",
    "pattern",
    "override"
];

const WIRE_COLORS = [
    { name: "RED", hex: "#ef4444", stripe: "#fca5a5" },
    { name: "BLUE", hex: "#3b82f6", stripe: "#93c5fd" },
    { name: "YELLOW", hex: "#eab308", stripe: "#fef08a" },
    { name: "GREEN", hex: "#22c55e", stripe: "#86efac" },
    { name: "WHITE", hex: "#f1f5f9", stripe: "#94a3b8" },
    { name: "PURPLE", hex: "#a855f7", stripe: "#d8b4fe" }
];

const CIPHER_SYMBOLS = ["Ω", "Δ", "Ψ", "Σ", "Φ", "Λ", "Θ", "Ξ"];

class DeviceGenerator {
    static generateChassis(difficultyLevel = 1) {
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const digits = "0123456789";
        const c1 = letters[Math.floor(Math.random() * letters.length)];
        const c2 = letters[Math.floor(Math.random() * letters.length)];
        const d1 = digits[Math.floor(Math.random() * 10)];
        const c3 = letters[Math.floor(Math.random() * letters.length)];
        const d2 = digits[Math.floor(Math.random() * 10)];
        const lastDigit = Math.floor(Math.random() * 10);

        const serial = `${c1}${c2}${d1}-${c3}${d2}${lastDigit}`;
        const batteries = Math.floor(Math.random() * 4) + 1; // 1 to 4
        const ports = ["PARALLEL", "SERIAL-9", "AUX-GRAVY", "FIBER-BASS"];
        const port = ports[Math.floor(Math.random() * ports.length)];

        return {
            serial,
            lastDigit,
            isEven: lastDigit % 2 === 0,
            digitSum: Number(d1) + Number(d2) + lastDigit,
            batteries,
            port,
            difficultyLevel
        };
    }

    static createModule(type, index, chassis, totalModules, onSolve, onStrike, existingModules = []) {
        if (chassis && typeof totalModules === "number") {
            chassis.totalModules = totalModules;
        }
        let mod = null;
        switch (type) {
            case "wires":
                mod = new WirePanelModule(index, chassis, onSolve, onStrike);
                break;
            case "keypad":
                mod = new KeypadDecoderModule(index, chassis, onSolve, onStrike);
                break;
            case "frequency":
                mod = new FrequencyDialModule(index, chassis, onSolve, onStrike);
                break;
            case "switches":
                mod = new SwitchSequencerModule(index, chassis, onSolve, onStrike);
                break;
            case "symbols":
                mod = new LogicSymbolsModule(index, chassis, onSolve, onStrike);
                break;
            case "memory":
                mod = new MemoryPanelModule(index, chassis, onSolve, onStrike);
                break;
            case "pattern":
                mod = new PatternModule(index, chassis, onSolve, onStrike);
                break;
            case "override":
                mod = new EmergencyOverrideModule(
                    index,
                    chassis,
                    totalModules,
                    onSolve,
                    onStrike,
                    existingModules
                );
                break;
            default:
                mod = new WirePanelModule(index, chassis, onSolve, onStrike);
        }

        // Validate puzzle solvability before returning
        if (!mod.validate()) {
            console.warn(`Module ${type} failed validation, regenerating safely...`);
            mod.generateSafeFallback();
        }
        return mod;
    }
}

// ==================================================
// BASE MODULE CLASS
// ==================================================
class BasePuzzleModule {
    constructor(id, type, title, chassis, onSolve, onStrike) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.chassis = chassis;
        this.onSolve = onSolve;
        this.onStrike = onStrike;
        this.solved = false;
        this.element = null;
        this.lastPlayerAnswer = null;
    }

    markSolved() {
        if (this.solved) return;
        this.solved = true;
        if (this.element) {
            this.element.classList.add("module-solved");
            const led = this.element.querySelector(".module-status-led");
            if (led) {
                led.classList.remove("led-armed");
                led.classList.add("led-safe");
                led.textContent = "SAFE";
            }
        }
        audio.playModuleSolved();
        if (this.onSolve) this.onSolve(this);
    }

    triggerStrike(reason = "") {
        if (this.solved) return;
        if (this.element) {
            this.element.classList.remove("module-strike-shake");
            void this.element.offsetWidth;
            this.element.classList.add("module-strike-shake");
        }
        audio.playStrikeAlarm();
        if (this.onStrike) this.onStrike(this, reason);
    }

    createShellHTML(innerBodyHTML, ruleFootnote = "") {
        const wrapper = document.createElement("div");
        wrapper.className = `puzzle-module module-type-${this.type}`;
        wrapper.id = `module-card-${this.id}`;
        wrapper.innerHTML = `
            <div class="module-screws-top">
                <span class="screw"></span>
                <span class="module-code">MOD-0${this.id + 1} // ${this.type.toUpperCase()}</span>
                <span class="screw"></span>
            </div>
            <div class="module-header">
                <h3 class="module-title">${this.title}</h3>
                <span class="module-status-led led-armed">ARMED</span>
            </div>
            <div class="module-body">
                ${innerBodyHTML}
            </div>
            ${ruleFootnote ? `<div class="module-rule-strip">${ruleFootnote}</div>` : ""}
        `;
        this.element = wrapper;
        return wrapper;
    }

    validate() {
        return true;
    }

    generateSafeFallback() {}

    getDispatchHint() {
        return `Check the protocol readout on ${this.title}.`;
    }

    resetForRetry() {
        this.solved = false;
        this.element = null;
        this.lastPlayerAnswer = null;
    }

    getTrainingDebrief() {
        return {
            moduleTitle: this.title,
            expectedAnswer: "See module protocol",
            playerAnswer: this.lastPlayerAnswer || "No action submitted before detonation",
            ruleOrClue: this.ruleText || "Follow module rule strip.",
            explanation: this.getDispatchHint()
        };
    }
}

// ==================================================
// 1. WIRE PANEL MODULE
// ==================================================
class WirePanelModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "wires", "WIRE PANEL", chassis, onSolve, onStrike);
        this.generate();
    }

    generate() {
        const count = this.chassis.difficultyLevel >= 3 ? 6 : this.chassis.difficultyLevel === 2 ? 5 : 4;
        this.wires = [];
        for (let i = 0; i < count; i++) {
            const c = WIRE_COLORS[Math.floor(Math.random() * WIRE_COLORS.length)];
            const voltage = (Math.floor(Math.random() * 9) + 1) * 10;
            this.wires.push({
                index: i,
                color: c.name,
                hex: c.hex,
                stripe: c.stripe,
                voltage,
                cut: false
            });
        }

        // Pick a clear deterministic rule that uniquely identifies one wire index
        const maxVariants = this.chassis.difficultyLevel >= 5 ? 6 : this.chassis.difficultyLevel >= 3 ? 5 : 4;
        const ruleVariant = this.chassis.difficultyLevel >= 5 && Math.random() < 0.45
            ? 5
            : Math.floor(Math.random() * maxVariants);
        if (ruleVariant === 0) {
            // Highest or lowest voltage wire (ensure unique max)
            let maxV = 90;
            this.targetIndex = Math.floor(Math.random() * count);
            this.wires.forEach((w, idx) => {
                w.voltage = idx === this.targetIndex ? maxV : Math.floor(Math.random() * 7 + 1) * 10;
            });
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `PROTOCOL: Cut the wire carrying the HIGHEST voltage. [TRAINING AID: Look for highest voltage such as ${maxV}V]`;
            } else {
                this.ruleText = "PROTOCOL: Cut the wire carrying the HIGHEST voltage.";
            }
        } else if (ruleVariant === 1) {
            // Serial parity rule
            const evenTarget = 0;
            const oddTarget = count - 1;
            this.targetIndex = this.chassis.isEven ? evenTarget : oddTarget;
            if (this.chassis && this.chassis.isTraining) {
                const parityStr = this.chassis.isEven ? "EVEN" : "ODD";
                this.ruleText = `PROTOCOL: If Serial ends in EVEN, cut Wire #1. If ODD, cut Wire #${count}. [TRAINING AID: Serial ends in ${this.chassis.lastDigit} (${parityStr}) → Wire #${this.targetIndex + 1}]`;
            } else {
                this.ruleText = `PROTOCOL: If Serial ends in EVEN, cut Wire #1. If ODD, cut Wire #${count}.`;
            }
        } else if (ruleVariant === 2) {
            // Specific color + position rule
            this.targetIndex = Math.floor(Math.random() * count);
            const targetColor = this.wires[this.targetIndex].color;
            // Make sure it's the LAST wire of that color
            for (let i = this.targetIndex + 1; i < count; i++) {
                if (this.wires[i].color === targetColor) {
                    const alt = WIRE_COLORS.find((c) => c.name !== targetColor);
                    this.wires[i].color = alt.name;
                    this.wires[i].hex = alt.hex;
                }
            }
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `PROTOCOL: Cut the LAST ${targetColor} wire in the panel. [TRAINING AID: Count bottom-up for ${targetColor}]`;
            } else {
                this.ruleText = `PROTOCOL: Cut the LAST ${targetColor} wire in the panel.`;
            }
        } else if (ruleVariant === 3) {
            // Battery count index rule
            this.targetIndex = Math.min(count - 1, Math.max(0, this.chassis.batteries - 1));
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `PROTOCOL: Cut the wire at position equal to Device Batteries (PWR CELLS). [TRAINING AID: Chassis has ${this.chassis.batteries} batteries → Wire #${this.targetIndex + 1}]`;
            } else {
                this.ruleText = "PROTOCOL: Cut the wire at position equal to Device Batteries (PWR CELLS).";
            }
        } else if (ruleVariant === 4) {
            // High-complexity Port + Battery interaction rule
            const isParallelOrGravy =
                this.chassis.port === "PARALLEL" || this.chassis.port === "AUX-GRAVY";
            this.targetIndex = isParallelOrGravy ? 1 : count - 2;
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `PROTOCOL: If Port is PARALLEL or AUX-GRAVY, cut Wire #2; otherwise cut Wire #${count - 1}. [TRAINING AID: Port is ${this.chassis.port} → Wire #${this.targetIndex + 1}]`;
            } else {
                this.ruleText = `PROTOCOL: If Port is PARALLEL or AUX-GRAVY, cut Wire #2; otherwise cut Wire #${count - 1}.`;
            }
        } else {
            // Difficulty 11 Cross-Module System Interlock Rule
            const totalMods = this.chassis.totalModules || 6;
            this.targetIndex = (totalMods + this.chassis.batteries - 1) % count;
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `INTERLOCK XI: Cut Wire #((Total Device Modules + Batteries - 1) mod ${count} + 1). [TRAINING AID: (${totalMods} + ${this.chassis.batteries} - 1) mod ${count} + 1 = Wire #${this.targetIndex + 1}]`;
            } else {
                this.ruleText = `INTERLOCK XI: Cut Wire #((Total Device Modules + Batteries - 1) mod ${count} + 1).`;
            }
        }
    }

    validate() {
        return (
            Array.isArray(this.wires) &&
            this.wires.length >= 4 &&
            this.targetIndex >= 0 &&
            this.targetIndex < this.wires.length
        );
    }

    generateSafeFallback() {
        this.targetIndex = 0;
        this.ruleText = "PROTOCOL: Cut Wire #1 at the top of the panel.";
    }

    getDispatchHint() {
        const w = this.wires[this.targetIndex];
        return `For the Wire Panel, our schematic points to Wire #${this.targetIndex + 1}, the ${w.color} ${w.voltage}V line.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.wires.forEach((w) => {
            w.cut = false;
        });
    }

    render() {
        const wiresHTML = this.wires
            .map(
                (w, idx) => `
            <button class="wire-row" data-wire-idx="${idx}" title="Cut Wire #${idx + 1} (${w.color} ${w.voltage}V)">
                <span class="wire-terminal-left">#${idx + 1}</span>
                <span class="wire-strand" style="--wire-color: ${w.hex}; --wire-stripe: ${w.stripe};">
                    <span class="wire-cut-gap"></span>
                </span>
                <span class="wire-terminal-right">${w.color.slice(0, 3)} ${w.voltage}V</span>
            </button>
        `
            )
            .join("");

        const el = this.createShellHTML(
            `<div class="wires-rack">${wiresHTML}</div>`,
            this.ruleText
        );

        el.querySelectorAll(".wire-row").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const idx = Number(btn.getAttribute("data-wire-idx"));
                const wire = this.wires[idx];
                if (wire.cut) return;

                wire.cut = true;
                btn.classList.add("is-cut");
                audio.playWireCut();

                if (idx === this.targetIndex) {
                    this.markSolved();
                } else {
                    this.lastPlayerAnswer = `Wire #${idx + 1} (${wire.color}, ${wire.voltage}V)`;
                    this.triggerStrike(`Cut wrong wire (#${idx + 1} instead of #${this.targetIndex + 1})`);
                }
            });
        });

        return el;
    }

    getTrainingDebrief() {
        const targetWire = this.wires[this.targetIndex];
        const expected = `Wire #${this.targetIndex + 1} (${targetWire.color}, ${targetWire.voltage}V)`;
        let explanation = `The clue specified Wire #${this.targetIndex + 1} (${targetWire.color}, ${targetWire.voltage}V) based on the active protocol.`;
        if (this.ruleText.includes("HIGHEST voltage")) {
            explanation = `The rule required cutting the highest-voltage wire (${targetWire.voltage}V), which was Wire #${this.targetIndex + 1} (${targetWire.color}).`;
        } else if (this.ruleText.includes("Serial ends in")) {
            explanation = `Device Serial (${this.chassis.serial}) ends in ${this.chassis.lastDigit} (${this.chassis.isEven ? "EVEN" : "ODD"}), pointing to Wire #${this.targetIndex + 1}.`;
        } else if (this.ruleText.includes("LAST")) {
            explanation = `The clue specified the last ${targetWire.color} wire in the rack, located at position #${this.targetIndex + 1}.`;
        } else if (this.ruleText.includes("Device Batteries")) {
            explanation = `The chassis holds ${this.chassis.batteries} battery cell(s), requiring Wire #${this.targetIndex + 1} to be cut.`;
        }
        return {
            moduleTitle: this.title,
            expectedAnswer: expected,
            playerAnswer: this.lastPlayerAnswer || "No wire cut before detonation",
            ruleOrClue: this.ruleText,
            explanation
        };
    }
}

// ==================================================
// 2. KEYPAD DECODER MODULE
// ==================================================
class KeypadDecoderModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "keypad", "KEYPAD DECODER", chassis, onSolve, onStrike);
        this.entered = "";
        this.generate();
    }

    generate() {
        // Assign digits 0-9 to the 8 cipher symbols
        const digitsPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        this.cipherMap = {};
        CIPHER_SYMBOLS.forEach((sym, i) => {
            this.cipherMap[sym] = digitsPool[(i + this.chassis.lastDigit) % 10];
        });

        this.displaySymbols = [];
        let rawDigits = [];
        for (let i = 0; i < 4; i++) {
            const sym = CIPHER_SYMBOLS[Math.floor(Math.random() * CIPHER_SYMBOLS.length)];
            this.displaySymbols.push(sym);
            rawDigits.push(this.cipherMap[sym]);
        }

        if (this.chassis.difficultyLevel >= 5) {
            const totalMods = this.chassis.totalModules || 6;
            this.offset = (this.chassis.batteries + totalMods) % 10;
            this.solution = rawDigits.map((d) => (d + this.offset) % 10).join("");
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `INTERLOCK XI CIPHER: Decode symbols, then ADD (Chassis Batteries + Total Modules) to each digit (wrap mod 10). [TRAINING AID: (${this.chassis.batteries} + ${totalMods}) = +${this.offset}]`;
            } else {
                this.ruleText = `INTERLOCK XI CIPHER: Decode symbols, then ADD (Chassis Batteries + Total Device Modules) to each digit (wrap mod 10).`;
            }
        } else if (this.chassis.difficultyLevel >= 4) {
            this.offset = this.chassis.batteries;
            this.solution = rawDigits.map((d) => (d + this.offset) % 10).join("");
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `CIPHER RULE: Decode symbols below, then ADD Chassis Batteries to each digit (wrap mod 10). [TRAINING AID: Chassis has ${this.offset} batteries → add +${this.offset}]`;
            } else {
                this.ruleText = "CIPHER RULE: Decode symbols below, then ADD Chassis Batteries to each digit (wrap mod 10).";
            }
        } else if (this.chassis.difficultyLevel >= 3) {
            this.offset = 1;
            this.solution = rawDigits.map((d) => (d + 1) % 10).join("");
            this.ruleText = "CIPHER RULE: Decode symbols below, then ADD +1 to each digit (9 wraps to 0).";
        } else {
            this.offset = 0;
            this.solution = rawDigits.join("");
            this.ruleText = "CIPHER RULE: Enter the 4-digit code matching the encrypted symbols above.";
        }
    }

    validate() {
        return typeof this.solution === "string" && /^\d{4}$/.test(this.solution);
    }

    generateSafeFallback() {
        this.solution = "1234";
        this.ruleText = "FALLBACK OVERRIDE: Enter 1234.";
    }

    getDispatchHint() {
        return `Keypad Decoder check: the first two digits are ${this.solution.slice(0, 2)}, followed by ${this.solution.slice(2)}.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.entered = "";
    }

    render() {
        const legendHTML = CIPHER_SYMBOLS.map(
            (sym) => `<span class="cipher-pair"><b>${sym}</b>=${this.cipherMap[sym]}</span>`
        ).join("");

        const html = `
            <div class="keypad-top-row">
                <div class="keypad-cipher-target" title="Encrypted Target Symbols">
                    ${this.displaySymbols.map((s) => `<span>${s}</span>`).join("")}
                </div>
                <div class="keypad-input-screen" id="kp-screen-${this.id}">----</div>
            </div>
            <div class="keypad-cipher-legend">${legendHTML}</div>
            <div class="keypad-grid">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
                    .map((n) => `<button class="kp-btn" data-val="${n}">${n}</button>`)
                    .join("")}
                <button class="kp-btn kp-clr" data-val="CLR">CLR</button>
                <button class="kp-btn" data-val="0">0</button>
                <button class="kp-btn kp-ok" data-val="OK">OK</button>
            </div>
        `;

        const el = this.createShellHTML(html, this.ruleText);
        const screen = el.querySelector(`#kp-screen-${this.id}`);

        el.querySelectorAll(".kp-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const val = btn.getAttribute("data-val");
                audio.playButton(560);

                if (val === "CLR") {
                    this.entered = "";
                    screen.textContent = "----";
                } else if (val === "OK") {
                    if (this.entered === this.solution) {
                        screen.textContent = "OPEN";
                        this.markSolved();
                    } else {
                        this.lastPlayerAnswer = this.entered ? `"${this.entered}"` : "Empty entry";
                        screen.textContent = "ERR!";
                        this.entered = "";
                        this.triggerStrike("Incorrect keypad code submitted");
                        setTimeout(() => {
                            if (!this.solved && screen) screen.textContent = "----";
                        }, 650);
                    }
                } else {
                    if (this.entered.length < 4) {
                        this.entered += val;
                        screen.textContent = this.entered.padEnd(4, "-");
                    }
                }
            });
        });

        return el;
    }

    getTrainingDebrief() {
        const symPairs = this.displaySymbols
            .map((sym) => `${sym}=${this.cipherMap[sym]}`)
            .join(", ");
        const explanation = this.offset
            ? `Symbols [${this.displaySymbols.join(" ")}] decode to (${symPairs}); adding +1 to each digit (with 9→0) yields ${this.solution}.`
            : `Matching each symbol [${this.displaySymbols.join(" ")}] against the legend (${symPairs}) produces ${this.solution}.`;
        return {
            moduleTitle: this.title,
            expectedAnswer: this.solution,
            playerAnswer: this.lastPlayerAnswer || (this.entered ? `"${this.entered}" (not submitted)` : "No code submitted"),
            ruleOrClue: this.ruleText,
            explanation
        };
    }
}

// ==================================================
// 3. FREQUENCY DIAL MODULE
// ==================================================
class FrequencyDialModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "frequency", "FREQUENCY DIAL", chassis, onSolve, onStrike);
        this.waveModes = ["SINE", "SQUARE", "TRIANGLE"];
        this.currentFreq = 98.0;
        this.currentMode = "SINE";
        this.animFrame = null;
        this.phase = 0;
        this.freqTier = 1;
        this.tierLabel = "EARLY // VISUAL MATCH";
        this.visualAssist = "full";
        this.tolerance = 0.5;
        this.clueStripHTML = "";
        this.debriefExplanation = "";
        this.generate();
    }

    determineFrequencyTier() {
        if (this.chassis && this.chassis.isTraining) {
            return 1;
        }
        const diffLevel = (this.chassis && this.chassis.difficultyLevel) || 1;
        const rankIdx =
            typeof storage !== "undefined" && storage.stats
                ? storage.stats.highestRankIndex || 0
                : 0;

        if (diffLevel >= 4 || rankIdx >= 5) return 4;
        if (diffLevel === 3 || rankIdx >= 3) return 3;
        if (diffLevel === 2 || rankIdx >= 1) return 2;
        return 1;
    }

    generate() {
        this.freqTier = this.determineFrequencyTier();

        if (this.freqTier === 1) {
            // TIER 1 (Early): Direct visual matching with forgiving ±0.5 MHz tolerance
            this.tierLabel = "EARLY // VISUAL MATCH";
            this.visualAssist = "full";
            this.tolerance = 0.5;

            const steps = Math.floor(Math.random() * 17); // 90.0 to 106.0 in 1.0 MHz steps
            this.targetFreq = Number((90.0 + steps * 1.0).toFixed(1));
            this.targetMode = this.waveModes[Math.floor(Math.random() * this.waveModes.length)];
            this.clueStripHTML = "";

            if (this.chassis && this.chassis.isTraining) {
                this.ruleText = `TUNE RULE [EARLY]: Match the green target wave on the scope, then press LOCK. [TRAINING AID: Reference wave is ${this.targetFreq.toFixed(1)} MHz, ${this.targetMode}]`;
            } else {
                this.ruleText = "TUNE RULE [EARLY]: Align your carrier wave to match the green reference wave on the scope, then press LOCK.";
            }
            this.debriefExplanation = `The required frequency was ${this.targetFreq.toFixed(1)} MHz using ${this.targetMode} wave modulation before pressing LOCK.`;
        } else if (this.freqTier === 2) {
            // TIER 2 (Intermediate): Frequency calculated from chassis data (no exact frequency giveaway on scope)
            this.tierLabel = "INTERMEDIATE // CHASSIS CALC";
            this.visualAssist = "shape_only";
            this.tolerance = 0.05;
            this.targetMode = this.waveModes[Math.floor(Math.random() * this.waveModes.length)];

            const useBatteryFormula = Math.random() < 0.55 || this.chassis.lastDigit === 0;
            if (useBatteryFormula) {
                const baseFreq = 90.0 + Math.floor(Math.random() * 9); // 90.0..98.0
                this.targetFreq = Number((baseFreq + this.chassis.batteries * 2.0).toFixed(1));
                this.clueStripHTML = `
                    <span>BASE CARRIER: <b>${baseFreq.toFixed(1)} MHz</b></span>
                    <span>SHIFT: <b>+ (2.0 × Batteries)</b></span>
                    <span>WAVE: <b>${this.targetMode}</b></span>
                `;
                this.ruleText = `TUNE RULE [INTERMEDIATE]: Set Frequency = ${baseFreq.toFixed(1)} MHz + (2.0 × Chassis Batteries) in ${this.targetMode} mode.`;
                this.debriefExplanation = `Base ${baseFreq.toFixed(1)} MHz + (2.0 × ${this.chassis.batteries} Batteries) = ${this.targetFreq.toFixed(1)} MHz in ${this.targetMode} mode.`;
            } else {
                const baseFreq = 91.0 + Math.floor(Math.random() * 7); // 91.0..97.0
                this.targetFreq = Number((baseFreq + this.chassis.lastDigit).toFixed(1));
                this.clueStripHTML = `
                    <span>BASE CARRIER: <b>${baseFreq.toFixed(1)} MHz</b></span>
                    <span>SHIFT: <b>+ Serial Last Digit</b></span>
                    <span>WAVE: <b>${this.targetMode}</b></span>
                `;
                this.ruleText = `TUNE RULE [INTERMEDIATE]: Set Frequency = ${baseFreq.toFixed(1)} MHz + (Serial Last Digit) in ${this.targetMode} mode.`;
                this.debriefExplanation = `Base ${baseFreq.toFixed(1)} MHz + Serial Last Digit (${this.chassis.lastDigit}) = ${this.targetFreq.toFixed(1)} MHz in ${this.targetMode} mode.`;
            }
        } else if (this.freqTier === 3) {
            // TIER 3 (Advanced): Frequency and Waveform both determined from clues
            this.tierLabel = "ADVANCED // CLUE DEDUCTION";
            this.visualAssist = "clues_only";
            this.tolerance = 0.05;

            const isLowPort =
                this.chassis.port === "PARALLEL" || this.chassis.port === "SERIAL-9";
            const baseFreq = isLowPort ? 92.0 : 98.0;
            this.targetFreq = Number((baseFreq + this.chassis.batteries * 1.5).toFixed(1));
            this.targetMode = this.chassis.isEven ? "SQUARE" : "TRIANGLE";

            this.clueStripHTML = `
                <span>PORT BASE: <b>PARALLEL/SERIAL-9 = 92.0</b> • <b>AUX/FIBER = 98.0</b></span>
                <span>WAVE CLUE: <b>EVEN S/N = SQUARE</b> • <b>ODD S/N = TRIANGLE</b></span>
            `;
            this.ruleText =
                "TUNE RULE [ADVANCED]: Frequency = Port Base + (1.5 × Batteries). Deduce Waveform from Serial parity.";
            this.debriefExplanation = `Port (${this.chassis.port}) sets Base = ${baseFreq.toFixed(1)} MHz; adding (1.5 × ${this.chassis.batteries} Batteries) = ${this.targetFreq.toFixed(1)} MHz, and ${this.chassis.isEven ? "EVEN" : "ODD"} Serial requires ${this.targetMode}.`;
        } else {
            // TIER 4 (Expert): Multiple constraints & blind oscilloscope (reduced visual assistance)
            this.tierLabel = "EXPERT // MULTI-CONSTRAINT BLIND LOCK";
            this.visualAssist = "blind";
            this.tolerance = 0.05;

            const portBases = {
                PARALLEL: 90.0,
                "SERIAL-9": 93.0,
                "AUX-GRAVY": 96.0,
                "FIBER-BASS": 99.0
            };
            const baseFreq = portBases[this.chassis.port] || 92.0;
            const shift = this.chassis.isEven
                ? this.chassis.batteries * 2.0
                : this.chassis.lastDigit;
            this.targetFreq = Number((baseFreq + shift).toFixed(1));

            if (this.chassis.batteries >= 3) {
                this.targetMode = "SQUARE";
            } else if (this.chassis.isEven) {
                this.targetMode = "TRIANGLE";
            } else {
                this.targetMode = "SINE";
            }

            this.clueStripHTML = `
                <span>1) PORT BASE: <b>PAR=90 • SER=93 • AUX=96 • FIB=99 MHz</b></span>
                <span>2) SHIFT: <b>EVEN S/N: +(2×Cells)</b> • <b>ODD S/N: +(Last Digit)</b></span>
                <span>3) WAVE: <b>≥3 Cells=SQUARE • Else EVEN=TRIANGLE • Else=SINE</b></span>
            `;
            this.ruleText =
                "TUNE RULE [EXPERT]: Combine Port Base + Parity Shift + Waveform Constraint, then press LOCK.";
            this.debriefExplanation = `Port ${this.chassis.port} (${baseFreq.toFixed(1)} MHz) + ${this.chassis.isEven ? `EVEN shift (2 × ${this.chassis.batteries} Cells = +${shift})` : `ODD shift (+${shift} Last Digit)`} = ${this.targetFreq.toFixed(1)} MHz [${this.targetMode}].`;
        }

        // Make sure initial frequency doesn't already match target
        if (Math.abs(this.currentFreq - this.targetFreq) <= 0.5) {
            this.currentFreq = this.targetFreq >= 98.0 ? 91.5 : 103.5;
        }
    }

    validate() {
        return (
            this.targetFreq >= 88.0 &&
            this.targetFreq <= 108.0 &&
            this.waveModes.includes(this.targetMode)
        );
    }

    generateSafeFallback() {
        this.freqTier = 1;
        this.tierLabel = "EARLY // VISUAL MATCH";
        this.visualAssist = "full";
        this.tolerance = 0.5;
        this.targetFreq = 101.5;
        this.targetMode = "SINE";
        this.clueStripHTML = "";
        this.ruleText = "TUNE RULE: Lock carrier wave to 101.5 MHz [SINE].";
        this.debriefExplanation = "The required frequency was 101.5 MHz using SINE wave modulation before pressing LOCK.";
    }

    getDispatchHint() {
        return `Frequency Dial telemetry shows the harmonic lock is at ${this.targetFreq.toFixed(1)} megahertz using ${this.targetMode} modulation.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.currentFreq = Math.abs(98.0 - this.targetFreq) <= 0.5 ? 91.5 : 98.0;
        this.currentMode = "SINE";
    }

    render() {
        const html = `
            <div class="freq-top-meta">
                <span class="freq-tier-badge tier-${this.freqTier}">${this.tierLabel}</span>
            </div>
            <div class="freq-scope-wrap">
                <canvas class="freq-canvas" id="freq-canvas-${this.id}" width="240" height="72"></canvas>
                <div class="freq-readout" id="freq-readout-${this.id}">${this.currentFreq.toFixed(1)} MHz</div>
            </div>
            ${
                this.clueStripHTML
                    ? `<div class="freq-clue-strip">${this.clueStripHTML}</div>`
                    : ""
            }
            <div class="freq-controls">
                <button class="freq-step-btn" data-step="-1.0" title="Step -1.0 MHz">-1.0</button>
                <button class="freq-step-btn" data-step="-0.5" title="Step -0.5 MHz">-0.5</button>
                <input type="range" class="freq-slider" min="88.0" max="108.0" step="0.5" value="${this.currentFreq}" />
                <button class="freq-step-btn" data-step="0.5" title="Step +0.5 MHz">+0.5</button>
                <button class="freq-step-btn" data-step="1.0" title="Step +1.0 MHz">+1.0</button>
            </div>
            <div class="freq-modes">
                ${this.waveModes
                    .map(
                        (m) =>
                            `<button class="freq-mode-btn ${m === this.currentMode ? "active" : ""}" data-mode="${m}">${m}</button>`
                    )
                    .join("")}
                <button class="freq-lock-btn">LOCK</button>
            </div>
        `;

        const el = this.createShellHTML(html, this.ruleText);
        const slider = el.querySelector(".freq-slider");
        const readout = el.querySelector(`#freq-readout-${this.id}`);
        const canvas = el.querySelector(`#freq-canvas-${this.id}`);

        const updateFreq = (val) => {
            this.currentFreq = Math.max(88.0, Math.min(108.0, Number(val.toFixed(1))));
            slider.value = this.currentFreq;
            readout.textContent = `${this.currentFreq.toFixed(1)} MHz`;
            this.drawScope(canvas);
        };

        slider.addEventListener("input", (e) => {
            if (this.solved) return;
            audio.playButton(420 + (Number(e.target.value) - 88) * 15);
            updateFreq(Number(e.target.value));
        });

        el.querySelectorAll(".freq-step-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const delta = Number(btn.getAttribute("data-step"));
                audio.playButton(500);
                updateFreq(this.currentFreq + delta);
            });
        });

        el.querySelectorAll(".freq-mode-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                this.currentMode = btn.getAttribute("data-mode");
                el.querySelectorAll(".freq-mode-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                audio.playButton(620);
                this.drawScope(canvas);
            });
        });

        el.querySelector(".freq-lock-btn").addEventListener("click", () => {
            if (this.solved) return;
            const tol = this.tolerance || 0.05;
            if (
                Math.abs(this.currentFreq - this.targetFreq) <= tol &&
                this.currentMode === this.targetMode
            ) {
                this.currentFreq = this.targetFreq;
                slider.value = this.targetFreq;
                readout.textContent = `${this.targetFreq.toFixed(1)} MHz`;
                this.markSolved();
                this.drawScope(canvas);
            } else {
                this.lastPlayerAnswer = `${this.currentFreq.toFixed(1)} MHz [${this.currentMode}]`;
                this.triggerStrike("Frequency or wave modulation out of phase");
            }
        });

        this.drawScope(canvas);
        return el;
    }

    getTrainingDebrief() {
        const expected = `${this.targetFreq.toFixed(1)} MHz [${this.targetMode}]`;
        const player =
            this.lastPlayerAnswer ||
            `${this.currentFreq.toFixed(1)} MHz [${this.currentMode}] (unlocked)`;
        return {
            moduleTitle: this.title,
            expectedAnswer: expected,
            playerAnswer: player,
            ruleOrClue: this.ruleText,
            explanation:
                this.debriefExplanation ||
                `The required frequency was ${this.targetFreq.toFixed(1)} MHz using ${this.targetMode} wave modulation before pressing LOCK.`
        };
    }

    drawScope(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = "rgba(34, 197, 94, 0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        const evalWave = (mode, xNorm) => {
            if (mode === "SQUARE") return Math.sin(xNorm) >= 0 ? 1 : -1;
            if (mode === "TRIANGLE") return (2 / Math.PI) * Math.asin(Math.sin(xNorm));
            return Math.sin(xNorm);
        };

        // 1. Draw target reference wave ONLY when visualAssist allows it:
        //    - "full" (Tier 1 Early): draws exact target frequency and shape
        //    - "shape_only" (Tier 2 Intermediate): draws neutral wave shape silhouette without revealing target frequency
        //    - "clues_only" / "blind" (Tier 3/4): hides target reference wave until solved
        if (this.visualAssist === "full" || this.solved) {
            ctx.strokeStyle = "rgba(34, 197, 94, 0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const targetCycles = (this.targetFreq - 84) * 0.65;
            for (let x = 0; x < w; x++) {
                const t = (x / w) * Math.PI * 2 * (targetCycles / 4);
                const y = h / 2 - evalWave(this.targetMode, t) * (h * 0.34);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        } else if (this.visualAssist === "shape_only") {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.32)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const neutralCycles = (96.0 - 84) * 0.65;
            for (let x = 0; x < w; x++) {
                const t = (x / w) * Math.PI * 2 * (neutralCycles / 4);
                const y = h / 2 - evalWave(this.targetMode, t) * (h * 0.28);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // 2. Draw user wave:
        //    Only highlight green during live dragging in Tier 1 ("full") or once solved,
        //    so Tier 2/3/4 cannot be brute-forced by watching the line turn green!
        const tol = this.tolerance || 0.05;
        const visuallyMatched =
            this.solved ||
            (this.visualAssist === "full" &&
                Math.abs(this.currentFreq - this.targetFreq) <= tol &&
                this.currentMode === this.targetMode);
        ctx.strokeStyle = visuallyMatched ? "#22c55e" : "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const userCycles = (this.currentFreq - 84) * 0.65;
        for (let x = 0; x < w; x++) {
            const t = (x / w) * Math.PI * 2 * (userCycles / 4);
            const y = h / 2 - evalWave(this.currentMode, t) * (h * 0.34);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

// ==================================================
// 4. SWITCH SEQUENCER MODULE
// ==================================================
class SwitchSequencerModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "switches", "SWITCH SEQUENCER", chassis, onSolve, onStrike);
        this.generate();
    }

    generate() {
        // Generate 4 switches with unique KVA load values
        const pool = [12, 18, 24, 31, 45, 52, 67, 79, 84, 93];
        const picked = [];
        while (picked.length < 4) {
            const val = pool[Math.floor(Math.random() * pool.length)];
            if (!picked.includes(val)) picked.push(val);
        }

        this.switches = picked.map((kva, idx) => ({
            index: idx,
            label: `SW-${idx + 1}`,
            kva,
            active: false
        }));

        if (this.chassis.difficultyLevel >= 3 && Math.random() < 0.55) {
            this.ascending = Boolean(this.chassis.isEven);
            this.ruleText =
                "SEQUENCE RULE: If Serial ends in EVEN, flip ASCENDING (Lowest → Highest kVA); if ODD, flip DESCENDING (Highest → Lowest kVA).";
            if (this.chassis && this.chassis.isTraining) {
                const parityStr = this.chassis.isEven ? "EVEN" : "ODD";
                const dirStr = this.ascending ? "ASCENDING" : "DESCENDING";
                this.ruleText += ` [TRAINING AID: Serial ends in ${this.chassis.lastDigit} (${parityStr}) → ${dirStr}]`;
            }
        } else {
            this.ascending = Math.random() < 0.5;
            this.ruleText = this.ascending
                ? "SEQUENCE RULE: Flip switches in ASCENDING order of KVA load (Lowest → Highest)."
                : "SEQUENCE RULE: Flip switches in DESCENDING order of KVA load (Highest → Lowest).";
        }
        const sorted = [...this.switches].sort((a, b) =>
            this.ascending ? a.kva - b.kva : b.kva - a.kva
        );
        this.expectedOrder = sorted.map((s) => s.index);
        this.stepCursor = 0;
    }

    validate() {
        return Array.isArray(this.expectedOrder) && this.expectedOrder.length === 4;
    }

    getDispatchHint() {
        const labels = this.expectedOrder.map((i) => `SW-${i + 1}`).join(" then ");
        return `Switch Sequencer order is ${labels}.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.stepCursor = 0;
        this.switches.forEach((s) => {
            s.active = false;
        });
    }

    render() {
        const swHTML = this.switches
            .map(
                (s) => `
            <div class="sw-unit">
                <span class="sw-led" id="sw-led-${this.id}-${s.index}"></span>
                <button class="sw-toggle" data-sw-idx="${s.index}">
                    <span class="sw-lever"></span>
                </button>
                <span class="sw-meta">${s.label}<br/><b>${s.kva}kVA</b></span>
            </div>
        `
            )
            .join("");

        const el = this.createShellHTML(`<div class="switches-rack">${swHTML}</div>`, this.ruleText);

        el.querySelectorAll(".sw-toggle").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const idx = Number(btn.getAttribute("data-sw-idx"));
                const sw = this.switches[idx];
                if (sw.active) return;

                if (idx === this.expectedOrder[this.stepCursor]) {
                    sw.active = true;
                    this.stepCursor++;
                    btn.classList.add("is-up");
                    const led = el.querySelector(`#sw-led-${this.id}-${idx}`);
                    if (led) led.classList.add("on");
                    audio.playSwitchToggle(true);

                    if (this.stepCursor === 4) {
                        this.markSolved();
                    }
                } else {
                    const expectedSw = this.switches[this.expectedOrder[this.stepCursor]];
                    this.lastPlayerAnswer = `Flipped ${sw.label} (${sw.kva}kVA) at step #${this.stepCursor + 1} instead of ${expectedSw.label} (${expectedSw.kva}kVA)`;
                    // Reset sequence on wrong order
                    this.stepCursor = 0;
                    this.switches.forEach((s) => (s.active = false));
                    el.querySelectorAll(".sw-toggle").forEach((b) => b.classList.remove("is-up"));
                    el.querySelectorAll(".sw-led").forEach((l) => l.classList.remove("on"));
                    this.triggerStrike("Switch flipped out of sequence");
                }
            });
        });

        return el;
    }

    getTrainingDebrief() {
        const orderStr = this.expectedOrder
            .map((i) => `${this.switches[i].label} (${this.switches[i].kva}kVA)`)
            .join(" → ");
        const dirText = this.ascending ? "lowest to highest (ascending)" : "highest to lowest (descending)";
        return {
            moduleTitle: this.title,
            expectedAnswer: orderStr,
            playerAnswer: this.lastPlayerAnswer || "Incomplete switch sequence",
            ruleOrClue: this.ruleText,
            explanation: `The protocol required flipping switches from ${dirText} kVA load: ${orderStr}.`
        };
    }
}

// ==================================================
// 5. LOGIC SYMBOLS MODULE
// ==================================================
const GATE_PLAIN_HINTS = {
    AND: "AND: Both conditions required.",
    OR: "OR: Either condition required.",
    NOT: "NOT: Reverse condition.",
    XOR: "XOR: Exactly one condition required.",
    NAND: "NAND: Anything except both."
};

const LOGIC_TUTORIAL_STEPS = [
    {
        step: 1,
        operator: "NOT",
        title: "STEP 1/5: NOT — Reverse condition.",
        inA: 1,
        inB: 0,
        inC: 1,
        lesson: "NOT: Reverse condition. (1 = TRUE, 0 = FALSE: NOT 1 = 0, and NOT 0 = 1.)",
        ruleText: "STEP 1 (NOT): Set Ω1 = (NOT A), Ω2 = (NOT B), and Ω3 = (NOT C).",
        solutionBits: [0, 1, 0],
        dispatchIntro: "Logic Step 1: NOT — Reverse condition. 1 becomes 0, and 0 becomes 1."
    },
    {
        step: 2,
        operator: "AND",
        title: "STEP 2/5: AND — Both conditions required.",
        inA: 1,
        inB: 1,
        inC: 0,
        lesson: "AND: Both conditions required. (TRUE only if both inputs are 1: 1 + 1 = 1, 1 + 0 = 0.)",
        ruleText: "STEP 2 (AND): Set Ω1 = (A AND B), Ω2 = (B AND C), and Ω3 = (A AND C).",
        solutionBits: [1, 0, 0],
        dispatchIntro: "Logic Step 2: AND — Both conditions required."
    },
    {
        step: 3,
        operator: "OR",
        title: "STEP 3/5: OR — Either condition required.",
        inA: 1,
        inB: 0,
        inC: 0,
        lesson: "OR: Either condition required. (TRUE if either input is 1: 1 + 0 = 1, 0 + 0 = 0.)",
        ruleText: "STEP 3 (OR): Set Ω1 = (A OR B), Ω2 = (B OR C), and Ω3 = (A OR C).",
        solutionBits: [1, 0, 1],
        dispatchIntro: "Logic Step 3: OR — Either condition required."
    },
    {
        step: 4,
        operator: "NAND",
        title: "STEP 4/5: NAND — Anything except both.",
        inA: 1,
        inB: 1,
        inC: 0,
        lesson: "NAND: Anything except both. (Opposite of AND: 1 NAND 1 = 0, while 1 NAND 0 = 1 and 0 NAND 0 = 1.)",
        ruleText: "STEP 4 (NAND): Set Ω1 = (A NAND B), Ω2 = (B NAND C), and Ω3 = (A NAND C).",
        solutionBits: [0, 1, 1],
        dispatchIntro: "Dispatch reminder: NAND is the opposite of AND — Anything except both!"
    },
    {
        step: 5,
        operator: "XOR",
        title: "STEP 5/5: XOR — Exactly one condition required.",
        inA: 1,
        inB: 0,
        inC: 1,
        lesson: "XOR: Exactly one condition required. (1 + 0 = 1, but if both inputs are 1, XOR outputs 0!)",
        ruleText: "STEP 5 (XOR): Set Ω1 = (A XOR B), Ω2 = (A XOR C), and Ω3 = (B XOR C).",
        solutionBits: [1, 0, 1],
        dispatchIntro: "We asked engineering for simpler terminology. Engineering responded with XOR. Remember: XOR means exactly one condition required!"
    }
];

class LogicSymbolsModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "symbols", "LOGIC SYMBOLS", chassis, onSolve, onStrike);
        this.userBits = [0, 0, 0];
        this.isTutorial = Boolean(chassis && chassis.isLogicTutorial);
        this.tutorialStepIdx = 0;
        this.generate();
    }

    evalGate(gate, a, b) {
        switch (gate) {
            case "AND":
                return a && b ? 1 : 0;
            case "OR":
                return a || b ? 1 : 0;
            case "XOR":
                return a !== b ? 1 : 0;
            case "NAND":
                return !(a && b) ? 1 : 0;
            default:
                return a && b ? 1 : 0;
        }
    }

    generate() {
        if (this.isTutorial) {
            this.loadTutorialStep(0);
            return;
        }

        const gates = ["AND", "OR", "XOR", "NAND"];
        this.inA = Math.random() < 0.5 ? 1 : 0;
        this.inB = Math.random() < 0.5 ? 1 : 0;
        this.inC = Math.random() < 0.5 ? 1 : 0;

        this.gate1 = gates[Math.floor(Math.random() * gates.length)];
        this.gate2 = gates[Math.floor(Math.random() * gates.length)];

        const n1 = this.evalGate(this.gate1, this.inA, this.inB);
        const n2 = this.inC === 1 ? 0 : 1; // NOT C
        const n3 = this.evalGate(this.gate2, n1, n2);

        this.solutionBits = [n1, n2, n3];
        this.lessonText = `${GATE_PLAIN_HINTS[this.gate1]} | ${GATE_PLAIN_HINTS.NOT} | ${
            this.gate2 !== this.gate1 ? GATE_PLAIN_HINTS[this.gate2] : ""
        }`;
        this.ruleText = `CIRCUIT: Ω1 = (A ${this.gate1} B) • Ω2 = (NOT C) • Ω3 = (Ω1 ${this.gate2} Ω2).`;
    }

    loadTutorialStep(stepIdx) {
        this.tutorialStepIdx = stepIdx;
        const stepObj = LOGIC_TUTORIAL_STEPS[stepIdx] || LOGIC_TUTORIAL_STEPS[0];
        this.inA = stepObj.inA;
        this.inB = stepObj.inB;
        this.inC = stepObj.inC;
        this.gate1 = stepObj.operator;
        this.gate2 = stepObj.operator;
        this.solutionBits = [...stepObj.solutionBits];
        this.lessonText = stepObj.lesson;
        this.ruleText = stepObj.ruleText;
        this.tutorialTitle = stepObj.title;
        this.userBits = [0, 0, 0];
    }

    validate() {
        return (
            Array.isArray(this.solutionBits) &&
            this.solutionBits.length === 3 &&
            this.solutionBits.every((b) => b === 0 || b === 1)
        );
    }

    getDispatchHint() {
        return `Logic Symbols solution states are Ω1=${this.solutionBits[0]} (${
            this.solutionBits[0] ? "TRUE" : "FALSE"
        }), Ω2=${this.solutionBits[1]} (${
            this.solutionBits[1] ? "TRUE" : "FALSE"
        }), and Ω3=${this.solutionBits[2]} (${this.solutionBits[2] ? "TRUE" : "FALSE"}).`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.userBits = [0, 0, 0];
        if (this.isTutorial) {
            this.loadTutorialStep(0);
        }
    }

    render() {
        const formatBit = (b) => `${b} (${b === 1 ? "TRUE" : "FALSE"})`;
        const html = `
            <div class="logic-top-bar">
                <span class="logic-binary-key"><b>1</b> = TRUE • <b>0</b> = FALSE</span>
                <button type="button" class="btn-open-logic-ref" title="Open Field Manual: Boolean Logic Cheat Sheet">
                    📖 FIELD MANUAL
                </button>
            </div>
            ${
                this.isTutorial
                    ? `<div class="logic-tutorial-banner" id="logic-tut-title-${this.id}">${this.tutorialTitle}</div>`
                    : ""
            }
            <div class="logic-telemetry" id="logic-tele-${this.id}">
                <span>A: <b>${formatBit(this.inA)}</b></span>
                <span>B: <b>${formatBit(this.inB)}</b></span>
                <span>C: <b>${formatBit(this.inC)}</b></span>
            </div>
            <div class="logic-plain-explainer" id="logic-lesson-${this.id}">
                ${this.lessonText}
            </div>
            <div class="logic-nodes-row">
                ${[0, 1, 2]
                    .map(
                        (i) => `
                    <button type="button" class="logic-node-btn" data-node="${i}">
                        <span class="node-sym">Ω${i + 1}</span>
                        <span class="node-val" id="logic-val-${this.id}-${i}">0</span>
                        <small class="node-bool" id="logic-bool-${this.id}-${i}">FALSE</small>
                    </button>
                `
                    )
                    .join("")}
            </div>
            <div class="logic-feedback-msg" id="logic-feedback-${this.id}" style="display:none;"></div>
            <button type="button" class="module-action-btn logic-submit-btn">
                ${this.isTutorial ? "VERIFY OPERATOR STEP" : "VERIFY BOOLEAN LOCK"}
            </button>
        `;

        const el = this.createShellHTML(html, this.ruleText);
        const feedbackEl = el.querySelector(`#logic-feedback-${this.id}`);

        const refBtn = el.querySelector(".btn-open-logic-ref");
        if (refBtn) {
            refBtn.addEventListener("click", () => {
                audio.playButton(580);
                if (typeof game !== "undefined" && typeof game.openLogicReferenceModal === "function") {
                    game.openLogicReferenceModal();
                }
            });
        }

        const syncNodesUI = () => {
            el.querySelectorAll(".logic-node-btn").forEach((btn) => {
                const idx = Number(btn.getAttribute("data-node"));
                const bit = this.userBits[idx];
                btn.classList.toggle("active", bit === 1);
                const valEl = el.querySelector(`#logic-val-${this.id}-${idx}`);
                const boolEl = el.querySelector(`#logic-bool-${this.id}-${idx}`);
                if (valEl) valEl.textContent = String(bit);
                if (boolEl) boolEl.textContent = bit === 1 ? "TRUE" : "FALSE";
            });
        };

        const refreshTutorialStepUI = () => {
            const tutTitleEl = el.querySelector(`#logic-tut-title-${this.id}`);
            const teleEl = el.querySelector(`#logic-tele-${this.id}`);
            const lessonEl = el.querySelector(`#logic-lesson-${this.id}`);
            const ruleEl = el.querySelector(".module-rule-strip");

            if (tutTitleEl) tutTitleEl.textContent = this.tutorialTitle;
            if (teleEl) {
                teleEl.innerHTML = `
                    <span>A: <b>${formatBit(this.inA)}</b></span>
                    <span>B: <b>${formatBit(this.inB)}</b></span>
                    <span>C: <b>${formatBit(this.inC)}</b></span>
                `;
            }
            if (lessonEl) lessonEl.textContent = this.lessonText;
            if (ruleEl) ruleEl.textContent = this.ruleText;
            if (feedbackEl) feedbackEl.style.display = "none";
            syncNodesUI();
        };

        el.querySelectorAll(".logic-node-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const idx = Number(btn.getAttribute("data-node"));
                this.userBits[idx] = this.userBits[idx] === 1 ? 0 : 1;
                syncNodesUI();
                audio.playButton(this.userBits[idx] ? 680 : 440);
            });
        });

        el.querySelector(".logic-submit-btn").addEventListener("click", () => {
            if (this.solved) return;
            const ok = this.userBits.every((b, idx) => b === this.solutionBits[idx]);
            if (ok) {
                if (this.isTutorial && this.tutorialStepIdx < LOGIC_TUTORIAL_STEPS.length - 1) {
                    audio.playModuleSolved();
                    const nextIdx = this.tutorialStepIdx + 1;
                    this.loadTutorialStep(nextIdx);
                    refreshTutorialStepUI();
                    const nextStepObj = LOGIC_TUTORIAL_STEPS[nextIdx];
                    if (nextStepObj && nextStepObj.dispatchIntro) {
                        dispatch.transmit(nextStepObj.dispatchIntro, "TRAINING INSTRUCTOR", "hint", true);
                    }
                } else {
                    if (feedbackEl) feedbackEl.style.display = "none";
                    this.markSolved();
                }
            } else {
                const fmtBits = (bits) =>
                    bits.map((b, i) => `Ω${i + 1}=${b} (${b ? "TRUE" : "FALSE"})`).join(", ");
                this.lastPlayerAnswer = fmtBits(this.userBits);

                if (this.isTutorial) {
                    // Unlimited retries with helpful step-by-step guidance during tutorial
                    audio.playButton(320);
                    const mismatches = [];
                    this.solutionBits.forEach((expected, i) => {
                        if (this.userBits[i] !== expected) {
                            mismatches.push(`Ω${i + 1} should be ${expected} (${expected ? "TRUE" : "FALSE"})`);
                        }
                    });
                    if (feedbackEl) {
                        feedbackEl.style.display = "block";
                        feedbackEl.textContent = `Check again (No Strike): ${mismatches.join(", ")}. Tap 📖 FIELD MANUAL if needed!`;
                    }
                } else {
                    this.triggerStrike("Boolean circuit outputs did not match truth table");
                }
            }
        });

        return el;
    }

    getTrainingDebrief() {
        const fmtBits = (bits) =>
            bits.map((b, i) => `Ω${i + 1}=${b} (${b ? "TRUE" : "FALSE"})`).join(", ");
        const expected = fmtBits(this.solutionBits);
        const player = this.lastPlayerAnswer || fmtBits(this.userBits);
        let explanation = "";
        if (this.isTutorial) {
            explanation = `${this.lessonText} With A=${this.inA}, B=${this.inB}, C=${this.inC}, the expected outputs are ${expected}.`;
        } else {
            explanation = `With inputs A=${this.inA}, B=${this.inB}, C=${this.inC}: Ω1 = (${this.inA} ${this.gate1} ${this.inB}) = ${this.solutionBits[0]}, Ω2 = (NOT ${this.inC}) = ${this.solutionBits[1]}, and Ω3 = (${this.solutionBits[0]} ${this.gate2} ${this.solutionBits[1]}) = ${this.solutionBits[2]}.`;
        }
        return {
            moduleTitle: this.title,
            expectedAnswer: expected,
            playerAnswer: player,
            ruleOrClue: this.ruleText,
            explanation
        };
    }
}

// ==================================================
// 6. MEMORY PANEL MODULE
// ==================================================
class MemoryPanelModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "memory", "MEMORY PANEL", chassis, onSolve, onStrike);
        this.stage = 1;
        this.history = {}; // { 1: { pos, label }, 2: { pos, label } }
        this.generate();
    }

    generate() {
        this.stageConfigs = {};
        for (let s = 1; s <= 3; s++) {
            const displayDigit = Math.floor(Math.random() * 4) + 1;
            const labels = [1, 2, 3, 4];
            for (let i = labels.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [labels[i], labels[j]] = [labels[j], labels[i]];
            }
            this.stageConfigs[s] = { displayDigit, buttonLabels: labels };
        }
        this.setupStage(1);
    }

    setupStage(stageNum) {
        this.stage = stageNum;
        const cfg = this.stageConfigs && this.stageConfigs[stageNum];
        if (cfg) {
            this.displayDigit = cfg.displayDigit;
            this.buttonLabels = [...cfg.buttonLabels];
        } else {
            this.displayDigit = 1;
            this.buttonLabels = [1, 2, 3, 4];
        }

        // Compute deterministic target button index (0..3) for current stage
        if (stageNum === 1) {
            // Stage 1: Display 1 or 2 -> Press POS = Display; Display 3 or 4 -> Press LABEL = Display
            if (this.displayDigit <= 2) {
                this.targetPosIndex = this.displayDigit - 1;
                this.stageInstruction = `STG 1 (Disp ${this.displayDigit}): Press POSITION #${this.displayDigit}.`;
            } else {
                this.targetPosIndex = this.buttonLabels.indexOf(this.displayDigit);
                this.stageInstruction = `STG 1 (Disp ${this.displayDigit}): Press button LABELED "${this.displayDigit}".`;
            }
        } else if (stageNum === 2) {
            // Stage 2: Reference Stage 1!
            const s1 = this.history[1] || { pos: 0, label: 1 };
            if (this.displayDigit % 2 === 1) {
                this.targetPosIndex = s1.pos;
                this.stageInstruction = `STG 2 (Odd Disp): Press the SAME POSITION you pressed in Stage 1.`;
            } else {
                this.targetPosIndex = this.buttonLabels.indexOf(s1.label);
                this.stageInstruction = `STG 2 (Even Disp): Press the SAME LABEL you pressed in Stage 1.`;
            }
        } else {
            // Stage 3: Reference Stage 1 or 2!
            const s1 = this.history[1] || { pos: 0, label: 1 };
            const s2 = this.history[2] || { pos: 0, label: 1 };
            if (this.displayDigit <= 2) {
                this.targetPosIndex = this.buttonLabels.indexOf(s2.label);
                this.stageInstruction = `STG 3 (Disp ≤ 2): Press the SAME LABEL you pressed in Stage 2.`;
            } else {
                this.targetPosIndex = s1.pos;
                this.stageInstruction = `STG 3 (Disp ≥ 3): Press the SAME POSITION you pressed in Stage 1.`;
            }
        }
    }

    validate() {
        return (
            Array.isArray(this.buttonLabels) &&
            this.buttonLabels.length === 4 &&
            this.targetPosIndex >= 0 &&
            this.targetPosIndex < 4
        );
    }

    getDispatchHint() {
        const lbl = this.buttonLabels[this.targetPosIndex];
        return `Memory Panel Stage ${this.stage}: press Position #${this.targetPosIndex + 1} (labeled "${lbl}").`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.history = {};
        this.setupStage(1);
    }

    render() {
        const html = `
            <div class="memory-top">
                <div class="memory-main-display" id="mem-disp-${this.id}">${this.displayDigit}</div>
                <div class="memory-stage-pips">
                    <span class="mem-pip" id="mem-pip-${this.id}-1">S1</span>
                    <span class="mem-pip" id="mem-pip-${this.id}-2">S2</span>
                    <span class="mem-pip" id="mem-pip-${this.id}-3">S3</span>
                </div>
            </div>
            <div class="memory-buttons-row" id="mem-btns-${this.id}">
                ${this.buttonLabels
                    .map(
                        (lbl, idx) => `
                    <button class="mem-btn" data-pos="${idx}">
                        <span class="mem-btn-lbl">${lbl}</span>
                        <small>POS ${idx + 1}</small>
                    </button>
                `
                    )
                    .join("")}
            </div>
        `;

        const el = this.createShellHTML(html, this.stageInstruction);
        this.bindMemoryEvents(el);
        return el;
    }

    bindMemoryEvents(el) {
        const ruleEl = el.querySelector(".module-rule-strip");
        const dispEl = el.querySelector(`#mem-disp-${this.id}`);

        const refreshUI = () => {
            if (dispEl) dispEl.textContent = String(this.displayDigit);
            if (ruleEl) ruleEl.textContent = this.stageInstruction;
            el.querySelectorAll(".mem-btn").forEach((btn, idx) => {
                const lblSpan = btn.querySelector(".mem-btn-lbl");
                if (lblSpan) lblSpan.textContent = String(this.buttonLabels[idx]);
            });
            for (let s = 1; s <= 3; s++) {
                const pip = el.querySelector(`#mem-pip-${this.id}-${s}`);
                if (pip) pip.classList.toggle("done", s < this.stage || this.solved);
            }
        };

        el.querySelectorAll(".mem-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const posIdx = Number(btn.getAttribute("data-pos"));
                audio.playButton(590);

                if (posIdx === this.targetPosIndex) {
                    this.history[this.stage] = {
                        pos: posIdx,
                        label: this.buttonLabels[posIdx]
                    };
                    if (this.stage >= 3) {
                        this.markSolved();
                        refreshUI();
                    } else {
                        this.setupStage(this.stage + 1);
                        refreshUI();
                    }
                } else {
                    const expectedLbl = this.buttonLabels[this.targetPosIndex];
                    const pressedLbl = this.buttonLabels[posIdx];
                    this.lastPlayerAnswer = `Stage ${this.stage}: Pressed POS #${posIdx + 1} (Label "${pressedLbl}")`;
                    this.lastFailedStageInfo = {
                        stage: this.stage,
                        expected: `POS #${this.targetPosIndex + 1} (Label "${expectedLbl}")`,
                        rule: this.stageInstruction
                    };
                    // Wrong memory press -> strike & reset to Stage 1
                    this.history = {};
                    this.setupStage(1);
                    refreshUI();
                    this.triggerStrike("Memory Panel sequence mismatch — reset to Stage 1");
                }
            });
        });
    }

    getTrainingDebrief() {
        const expectedLbl = this.buttonLabels[this.targetPosIndex];
        const expected = this.lastFailedStageInfo
            ? `Stage ${this.lastFailedStageInfo.stage}: ${this.lastFailedStageInfo.expected}`
            : `Stage ${this.stage}: POS #${this.targetPosIndex + 1} (Label "${expectedLbl}")`;
        const rule = this.lastFailedStageInfo ? this.lastFailedStageInfo.rule : this.stageInstruction;
        return {
            moduleTitle: this.title,
            expectedAnswer: expected,
            playerAnswer: this.lastPlayerAnswer || `No button pressed on Stage ${this.stage}`,
            ruleOrClue: rule,
            explanation: `Carefully distinguish between button POSITION (1st–4th from left) and button LABEL (the number printed on the key) across Stages 1–3.`
        };
    }
}

// ==================================================
// 7. PATTERN MODULE
// ==================================================
class PatternModule extends BasePuzzleModule {
    constructor(id, chassis, onSolve, onStrike) {
        super(id, "pattern", "PATTERN MODULE", chassis, onSolve, onStrike);
        this.selected = new Set();
        this.generate();
    }

    generate() {
        this.cells = [];
        for (let i = 0; i < 9; i++) {
            const val = Math.floor(Math.random() * 9) + 1;
            this.cells.push({ index: i, row: Math.floor(i / 3) + 1, col: (i % 3) + 1, val });
        }

        const maxRuleTypes = this.chassis.difficultyLevel >= 3 ? 4 : 3;
        const ruleType = Math.floor(Math.random() * maxRuleTypes);
        this.targetSet = new Set();

        if (ruleType === 0) {
            // Select all EVEN numbers
            this.cells.forEach((c) => {
                if (c.val % 2 === 0) this.targetSet.add(c.index);
            });
            if (this.targetSet.size < 2) {
                this.cells[0].val = 2;
                this.cells[4].val = 6;
                this.targetSet.add(0);
                this.targetSet.add(4);
            }
            this.ruleText = "PATTERN RULE: Highlight all cells containing an EVEN number, then commit.";
        } else if (ruleType === 1) {
            // Select all PRIME numbers (2, 3, 5, 7)
            const primes = [2, 3, 5, 7];
            this.cells.forEach((c) => {
                if (primes.includes(c.val)) this.targetSet.add(c.index);
            });
            if (this.targetSet.size < 2) {
                this.cells[1].val = 3;
                this.cells[7].val = 7;
                this.targetSet.add(1);
                this.targetSet.add(7);
            }
            this.ruleText = "PATTERN RULE: Highlight all cells with a PRIME number (2, 3, 5, or 7).";
        } else if (ruleType === 2) {
            // Corner + Center (X-pattern) where value >= 4
            const diagIndices = [0, 2, 4, 6, 8];
            this.cells[0].val = 8;
            this.cells[4].val = 5;
            diagIndices.forEach((idx) => {
                if (this.cells[idx].val >= 5) this.targetSet.add(idx);
            });
            this.ruleText = "PATTERN RULE: Highlight DIAGONAL/CORNER cells (X-shape) with value ≥ 5.";
        } else {
            // High-tier Chassis interaction rule: (Cell Value + Batteries) is EVEN
            const bat = this.chassis.batteries;
            this.cells.forEach((c) => {
                if ((c.val + bat) % 2 === 0) this.targetSet.add(c.index);
            });
            if (this.targetSet.size < 2) {
                const desiredParity = bat % 2;
                this.cells[0].val = desiredParity === 0 ? 4 : 3;
                this.cells[4].val = desiredParity === 0 ? 8 : 7;
                this.targetSet.add(0);
                this.targetSet.add(4);
            }
            this.ruleText =
                "PATTERN RULE: Highlight all cells where (Cell Value + Chassis Batteries) is EVEN.";
        }

        if (this.chassis && this.chassis.isTraining) {
            const sampleCells = [...this.targetSet].slice(0, 2).map((idx) => `Cell #${idx + 1} (${this.cells[idx].val})`);
            if (sampleCells.length > 0) {
                this.ruleText += ` [TRAINING AID: e.g. ${sampleCells.join(", ")}]`;
            }
        }
    }

    validate() {
        return this.targetSet && this.targetSet.size >= 2 && this.targetSet.size <= 9;
    }

    getDispatchHint() {
        const coords = [...this.targetSet].map((i) => `#${i + 1}`).join(", ");
        return `Pattern Module requires activating grid cells ${coords}.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.selected = new Set();
    }

    render() {
        const gridHTML = this.cells
            .map(
                (c) => `
            <button class="pattern-cell" data-idx="${c.index}">
                <span class="pat-coord">R${c.row}C${c.col}</span>
                <span class="pat-val">${c.val}</span>
            </button>
        `
            )
            .join("");

        const html = `
            <div class="pattern-grid">${gridHTML}</div>
            <button class="module-action-btn pattern-submit-btn">COMMIT PATTERN</button>
        `;

        const el = this.createShellHTML(html, this.ruleText);

        el.querySelectorAll(".pattern-cell").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                const idx = Number(btn.getAttribute("data-idx"));
                if (this.selected.has(idx)) {
                    this.selected.delete(idx);
                    btn.classList.remove("active");
                } else {
                    this.selected.add(idx);
                    btn.classList.add("active");
                }
                audio.playButton(510);
            });
        });

        el.querySelector(".pattern-submit-btn").addEventListener("click", () => {
            if (this.solved) return;
            const sameSize = this.selected.size === this.targetSet.size;
            const allMatch = sameSize && [...this.targetSet].every((i) => this.selected.has(i));
            if (allMatch) {
                this.markSolved();
            } else {
                const pickedList = [...this.selected]
                    .sort((a, b) => a - b)
                    .map((idx) => {
                        const c = this.cells[idx];
                        return `R${c.row}C${c.col} (${c.val})`;
                    });
                this.lastPlayerAnswer = pickedList.length > 0 ? pickedList.join(", ") : "No cells highlighted";
                this.triggerStrike("Committed pattern did not match matrix criteria");
            }
        });

        return el;
    }

    getTrainingDebrief() {
        const expectedCells = [...this.targetSet]
            .sort((a, b) => a - b)
            .map((idx) => {
                const c = this.cells[idx];
                return `R${c.row}C${c.col} (${c.val})`;
            })
            .join(", ");
        let explanation = `The matrix required highlighting every cell matching the active rule (${expectedCells}) and excluding all others before committing.`;
        if (this.ruleText.includes("EVEN")) {
            explanation = `The matrix rule required selecting every EVEN number (2, 4, 6, 8) across the 3×3 grid: ${expectedCells}.`;
        } else if (this.ruleText.includes("PRIME")) {
            explanation = `The matrix rule required selecting every PRIME number (2, 3, 5, or 7; note that 1 and 9 are not prime): ${expectedCells}.`;
        } else if (this.ruleText.includes("DIAGONAL")) {
            explanation = `The matrix rule required selecting only cells on the X-diagonals (corners + center) whose value was ≥ 5: ${expectedCells}.`;
        }
        return {
            moduleTitle: this.title,
            expectedAnswer: expectedCells,
            playerAnswer: this.lastPlayerAnswer || "No pattern committed",
            ruleOrClue: this.ruleText,
            explanation
        };
    }
}

// ==================================================
// 8. EMERGENCY OVERRIDE MODULE (Cross-Module / Chassis Clues)
// ==================================================
class EmergencyOverrideModule extends BasePuzzleModule {
    constructor(id, chassis, totalModules, onSolve, onStrike, existingModules = []) {
        const priorOverrides = Array.isArray(existingModules)
            ? existingModules.filter((m) => m && m.type === "override")
            : [];
        const overrideIndex = priorOverrides.length;
        const totalOverrides = Math.max(
            chassis && chassis.totalOverrides ? Number(chassis.totalOverrides) : 1,
            overrideIndex + 1
        );
        const unitLabel = totalOverrides > 1 ? String.fromCharCode(65 + overrideIndex) : "";
        const moduleTitle = unitLabel ? `EMERGENCY OVERRIDE ${unitLabel}` : "EMERGENCY OVERRIDE";

        super(id, "override", moduleTitle, chassis, onSolve, onStrike);
        this.totalModules = totalModules;
        this.overrideIndex = overrideIndex;
        this.totalOverrides = totalOverrides;
        this.unitLabel = unitLabel;
        this.linkedOverride = overrideIndex > 0 ? priorOverrides[overrideIndex - 1] : null;
        this.dependentOverrides = [];
        if (this.linkedOverride && Array.isArray(this.linkedOverride.dependentOverrides)) {
            this.linkedOverride.dependentOverrides.push(this);
        }

        this.coverOpen = false;
        this.selectedCode = null;
        this.generate();
    }

    generate() {
        if (this.linkedOverride) {
            // Secondary / Chained Emergency Override takes the input (Auth number) of the Primary Override as part of its Auth number
            const parentLabel = this.linkedOverride.unitLabel || "A";
            const useSerialDigit = this.chassis.lastDigit > 0 && Math.random() < 0.5;
            this.chainModifierLabel = useSerialDigit ? "Serial Last Digit" : "Batteries";
            this.chainModifierValue = useSerialDigit
                ? this.chassis.lastDigit
                : this.chassis.batteries;

            this.targetAuthValue =
                this.linkedOverride.targetAuthValue + this.chainModifierValue;

            this.ruleText = `OVERRIDE ${this.unitLabel} PROTOCOL: 1) Select Auth ${this.unitLabel} = (OVERRIDE ${parentLabel} Input + ${this.chainModifierLabel}). 2) Open Safety Cover & Engage.`;
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText += ` [TRAINING AID: OVERRIDE ${parentLabel} (${this.linkedOverride.targetAuthValue}) + ${this.chainModifierValue} = AUTH-${this.targetAuthValue}]`;
            }
        } else {
            // Primary or Single Emergency Override combines Chassis Last Digit + Battery Count + Total Module Count
            this.targetAuthValue =
                this.chassis.lastDigit + this.chassis.batteries + this.totalModules;

            this.ruleText = this.unitLabel
                ? `OVERRIDE ${this.unitLabel} PROTOCOL: 1) Select Auth ${this.unitLabel} = (Serial Last Digit + Batteries + Total Modules). 2) Open Safety Cover & Engage.`
                : "OVERRIDE PROTOCOL: 1) Select Auth Sum = (Serial Last Digit + Batteries + Total Modules). 2) Open Safety Cover & Engage.";
            if (this.chassis && this.chassis.isTraining) {
                this.ruleText += ` [TRAINING AID: Serial (${this.chassis.lastDigit}) + Batteries (${this.chassis.batteries}) + Modules (${this.totalModules}) = AUTH-${this.targetAuthValue}]`;
            }
        }

        const decoys = new Set([this.targetAuthValue]);
        while (decoys.size < 4) {
            const cand = Math.max(2, this.targetAuthValue + (Math.floor(Math.random() * 9) - 4));
            decoys.add(cand);
        }
        this.options = [...decoys].sort((a, b) => a - b);
    }

    validate() {
        return (
            Array.isArray(this.options) &&
            this.options.includes(this.targetAuthValue)
        );
    }

    generateSafeFallback() {
        if (this.linkedOverride) {
            this.chainModifierLabel = "Batteries";
            this.chainModifierValue = this.chassis.batteries;
            this.targetAuthValue = this.linkedOverride.targetAuthValue + this.chainModifierValue;
        } else {
            this.targetAuthValue =
                this.chassis.lastDigit + this.chassis.batteries + this.totalModules;
        }
        this.options = [
            Math.max(1, this.targetAuthValue - 2),
            this.targetAuthValue,
            this.targetAuthValue + 2,
            this.targetAuthValue + 4
        ];
    }

    getDispatchHint() {
        if (this.linkedOverride) {
            const parentLabel = this.linkedOverride.unitLabel || "A";
            return `Emergency Override ${this.unitLabel} takes Emergency Override ${parentLabel}'s Auth input (${this.linkedOverride.targetAuthValue}) plus ${this.chainModifierLabel} (${this.chainModifierValue}), which equals ${this.targetAuthValue}.`;
        }
        const labelPrefix = this.unitLabel ? `Emergency Override ${this.unitLabel}` : "Emergency Override";
        return `${labelPrefix} Auth Sum is Serial Last Digit (${this.chassis.lastDigit}) plus Batteries (${this.chassis.batteries}) plus Modules (${this.totalModules}), which equals ${this.targetAuthValue}.`;
    }

    resetForRetry() {
        super.resetForRetry();
        this.coverOpen = false;
        this.selectedCode = null;
    }

    updateLinkedTelemetryUI() {
        if (!this.linkedOverride) return;
        const linkEl = document.getElementById(`ov-link-${this.id}`);
        if (!linkEl) return;
        const parentLabel = this.linkedOverride.unitLabel || "A";
        if (this.linkedOverride.selectedCode !== null) {
            linkEl.innerHTML = `🔗 OVERRIDE ${parentLabel} INPUT: <b>AUTH-${this.linkedOverride.selectedCode}</b> (+ ${this.chainModifierLabel})`;
            linkEl.classList.add("linked-ready");
        } else {
            linkEl.innerHTML = `🔗 OVERRIDE ${parentLabel} INPUT: <b>AWAITING OVERRIDE ${parentLabel} SELECTION</b>`;
            linkEl.classList.remove("linked-ready");
        }
    }

    notifyDependentOverrides() {
        if (!Array.isArray(this.dependentOverrides)) return;
        this.dependentOverrides.forEach((dep) => {
            if (dep && typeof dep.updateLinkedTelemetryUI === "function") {
                dep.updateLinkedTelemetryUI();
            }
        });
    }

    render() {
        const optsHTML = this.options
            .map(
                (val) =>
                    `<button class="override-opt-btn" data-auth="${val}">AUTH-${val}</button>`
            )
            .join("");

        const parentLabel = this.linkedOverride ? this.linkedOverride.unitLabel || "A" : "A";
        const stepHeader = this.linkedOverride
            ? `STEP 1: CHAINED AUTH (OVERRIDE ${parentLabel} INPUT + ${this.chainModifierLabel.toUpperCase()})`
            : this.unitLabel
            ? `STEP 1: OVERRIDE ${this.unitLabel} PRIMARY CHASSIS AUTH`
            : "STEP 1: CHASSIS TELEMETRY AUTH";

        const linkedBannerHTML = this.linkedOverride
            ? `<div class="override-link-telemetry" id="ov-link-${this.id}">
                   🔗 OVERRIDE ${parentLabel} INPUT: <b>${
                  this.linkedOverride.selectedCode !== null
                      ? `AUTH-${this.linkedOverride.selectedCode}`
                      : `AWAITING OVERRIDE ${parentLabel} SELECTION`
              }</b>
               </div>`
            : "";

        const html = `
            <div class="override-step-label">${stepHeader}</div>
            ${linkedBannerHTML}
            <div class="override-opts-row">${optsHTML}</div>
            <div class="override-chamber">
                <button class="override-cover-btn" id="ov-cover-${this.id}">
                    <span>⚠️ FLIP HAZARD COVER</span>
                </button>
                <button class="override-big-red-btn" id="ov-red-${this.id}" disabled>
                    ENGAGE ${this.unitLabel ? `OVERRIDE ${this.unitLabel}` : "OVERRIDE"}
                </button>
            </div>
        `;

        const el = this.createShellHTML(html, this.ruleText);
        const coverBtn = el.querySelector(`#ov-cover-${this.id}`);
        const redBtn = el.querySelector(`#ov-red-${this.id}`);

        el.querySelectorAll(".override-opt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.solved) return;
                this.selectedCode = Number(btn.getAttribute("data-auth"));
                el.querySelectorAll(".override-opt-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                audio.playButton(600);
                this.notifyDependentOverrides();
            });
        });

        coverBtn.addEventListener("click", () => {
            if (this.solved) return;
            this.coverOpen = !this.coverOpen;
            coverBtn.classList.toggle("open", this.coverOpen);
            coverBtn.innerHTML = this.coverOpen
                ? "<span>🔓 COVER OPENED</span>"
                : "<span>⚠️ FLIP HAZARD COVER</span>";
            redBtn.disabled = !this.coverOpen;
            audio.playSwitchToggle(this.coverOpen);
        });

        redBtn.addEventListener("click", () => {
            if (this.solved || !this.coverOpen) return;
            if (this.linkedOverride && this.linkedOverride.selectedCode === null) {
                this.lastPlayerAnswer =
                    this.selectedCode !== null
                        ? `AUTH-${this.selectedCode} (Override ${parentLabel} input not set)`
                        : `No AUTH code selected`;
                this.triggerStrike(
                    `Emergency Override ${this.unitLabel} requires Emergency Override ${parentLabel} input to be selected first`
                );
                return;
            }
            if (this.selectedCode === this.targetAuthValue) {
                this.markSolved();
            } else {
                this.lastPlayerAnswer =
                    this.selectedCode !== null ? `AUTH-${this.selectedCode}` : "No AUTH code selected";
                const titlePrefix = this.unitLabel
                    ? `Emergency Override ${this.unitLabel}`
                    : "Emergency Override";
                this.triggerStrike(`${titlePrefix} engaged with invalid Auth Sum`);
            }
        });

        return el;
    }

    getTrainingDebrief() {
        if (this.linkedOverride) {
            const parentLabel = this.linkedOverride.unitLabel || "A";
            return {
                moduleTitle: this.title,
                expectedAnswer: `AUTH-${this.targetAuthValue}`,
                playerAnswer:
                    this.lastPlayerAnswer ||
                    (this.selectedCode !== null
                        ? `AUTH-${this.selectedCode} (not engaged)`
                        : "No AUTH code engaged"),
                ruleOrClue: this.ruleText,
                explanation: `First find Emergency Override ${parentLabel}'s Auth number (${this.linkedOverride.targetAuthValue}), then add ${this.chainModifierLabel} (${this.chainModifierValue}) = ${this.targetAuthValue}, select AUTH-${this.targetAuthValue}, flip the cover, and engage.`
            };
        }
        return {
            moduleTitle: this.title,
            expectedAnswer: `AUTH-${this.targetAuthValue}`,
            playerAnswer:
                this.lastPlayerAnswer ||
                (this.selectedCode !== null ? `AUTH-${this.selectedCode} (not engaged)` : "No AUTH code engaged"),
            ruleOrClue: this.ruleText,
            explanation: `Add the Serial's last digit (${this.chassis.lastDigit}) + Batteries (${this.chassis.batteries}) + Total Modules (${this.totalModules}) = ${this.targetAuthValue}, select AUTH-${this.targetAuthValue}, flip the cover, and engage.`
        };
    }
}
