/**
 * BOOM SQUAD - Content Registry & Procedural Compiler
 * Compiles modular content data into FLAVOR_DB and exposes registration
 * methods so new content can be added without modifying engine logic.
 */

class ContentRegistryManager {
    constructor() {
        this.dispatchMessages = [];
        this.fishDispatchMessages = [...DISPATCH_FISH_LINES];
        this.fishLoreStages = [...FISH_CONTAINER_LORE_STAGES];
        this.fishFailureReports = [...(FAILURE_REPORTS_DATA.fishSpecific || [])];
        this.fishSuccessReports = [...(SUCCESS_REPORTS_DATA.fishSpecific || [])];
        this.fishStatusUpdates = [...(STATUS_UPDATES_DATA.fishSpecific || [])];
        this.retryDispatchMessages = [...DISPATCH_RETRY_LINES];
        this.logicDispatchMessages = [...DISPATCH_LOGIC_LINES];
        this.trainingDebriefDispatchMessages = [...DISPATCH_TRAINING_DEBRIEF_LINES];
        this.visorDispatchMessages = DISPATCH_VISOR_LINES;
        this.difficultyDialMessages =
            typeof DISPATCH_DIFFICULTY_DIAL_LINES !== "undefined"
                ? DISPATCH_DIFFICULTY_DIAL_LINES
                : { byLevel: {}, elevenSpecial: [], autoIncrement: [] };
        this.difficulty11Briefings =
            typeof DIFFICULTY_11_SPECIAL_BRIEFINGS !== "undefined"
                ? [...DIFFICULTY_11_SPECIAL_BRIEFINGS]
                : [];
        this.dispatchAssessments = DISPATCH_ASSESSMENTS_DATA;
        this.conflictingPairs = [...DISPATCH_CONFLICTING_PAIRS];
        this.missionBriefings = [];
        this.failureReports = [];
        this.successReports = [];
        this.statusUpdates = [];

        this.compileAll();
    }

    compileAll() {
        this.compileDispatchMessages();
        this.compileMissionBriefings();
        this.compileFailureReports();
        this.compileSuccessReports();
        this.compileStatusUpdates();
    }

    compileDispatchMessages() {
        const list = [...DISPATCH_CORE_LINES, ...DISPATCH_FISH_LINES];
        const { senders, verbs, subjects, outcomes } = DISPATCH_GRAMMAR;

        for (let s = 0; s < senders.length; s++) {
            for (let v = 0; v < verbs.length; v++) {
                for (let k = 0; k < 4; k++) {
                    const sub = subjects[(s * 3 + v + k) % subjects.length];
                    const out = outcomes[(s + v * 2 + k * 3) % outcomes.length];
                    list.push(`${senders[s]} ${verbs[v]} ${sub} ${out}`);
                }
            }
        }

        STF_ORGANIZATIONS.forEach((org) => {
            list.push(`Bulletin from the ${org}: Please refrain from detonating devices near their annual banquet.`);
            list.push(`The ${org} has downgraded our confidence rating from 'Plausible' to 'Yikes'.`);
            list.push(`Cross-agency memo: The ${org} claims jurisdiction over any explosion involving condiments.`);
            list.push(`Representative from the ${org} is on Line 2 asking if you need extra paper towels.`);
        });

        for (let pct = 1; pct <= 99; pct += 3) {
            list.push(`Telemetry update: Departmental confidence is now holding steady at ${pct} percent.`);
            list.push(`Actuarial forecast: ${pct} percent probability that the manual matches this model.`);
        }

        this.dispatchMessages = list;
    }

    compileMissionBriefings() {
        const briefings = [...CURATED_MISSION_BRIEFINGS];
        const { situations, notes } = BRIEFING_GRAMMAR;

        for (let l = 0; l < LOCATIONS.length; l++) {
            for (let d = 0; d < DEVICE_TYPES.length; d++) {
                if (briefings.length >= 340) break;
                const loc = LOCATIONS[l];
                const dev = DEVICE_TYPES[d];
                const sit = situations[(l + d) % situations.length];
                const note = notes[(l * 2 + d) % notes.length];
                const isFish =
                    dev.category === "fish" || loc.includes("Refrigerator") || (l + d) % 9 === 0;
                briefings.push({
                    location: loc,
                    device: dev.name,
                    description: `A ${dev.name.toLowerCase()} in the ${loc} ${sit} ${isFish ? notes[0] : note}`,
                    isFishIncident: isFish
                });
            }
        }

        this.missionBriefings = briefings;
    }

    compileFailureReports() {
        const list = [...FAILURE_REPORTS_DATA.curated];
        const { places, effects } = FAILURE_REPORTS_DATA;
        for (let p = 0; p < places.length; p++) {
            for (let e = 0; e < effects.length; e++) {
                list.push(`${places[p]} ${effects[e]}`);
            }
        }
        this.failureReports = list;
    }

    compileSuccessReports() {
        const list = [...SUCCESS_REPORTS_DATA.curated];
        const { subjects, resolutions } = SUCCESS_REPORTS_DATA;
        for (let s = 0; s < subjects.length; s++) {
            for (let r = 0; r < resolutions.length; r++) {
                list.push(`${subjects[s]} ${resolutions[r]}`);
            }
        }
        this.successReports = list;
    }

    compileStatusUpdates() {
        const list = [...STATUS_UPDATES_DATA.curated];
        const { prefixes, metrics, states } = STATUS_UPDATES_DATA;
        for (let p = 0; p < prefixes.length; p++) {
            for (let m = 0; m < metrics.length; m++) {
                const st = states[(p + m) % states.length];
                list.push(`${prefixes[p]}: ${metrics[m]} — ${st}`);
            }
        }
        this.statusUpdates = list;
    }

    // Extension API for adding custom content packs without touching engine logic
    registerDispatchMessage(msg, isFish = false) {
        this.dispatchMessages.push(msg);
        if (isFish) this.fishDispatchMessages.push(msg);
    }

    registerBriefing(briefingObj) {
        this.missionBriefings.push(briefingObj);
    }

    registerFailureReport(report) {
        this.failureReports.push(report);
    }

    registerSuccessReport(report) {
        this.successReports.push(report);
    }

    registerAchievement(achievementObj) {
        if (!ACHIEVEMENTS.some((a) => a.id === achievementObj.id)) {
            ACHIEVEMENTS.push(achievementObj);
        }
    }

    getFishLoreStageData(stageNum = 1) {
        if (!this.fishLoreStages || this.fishLoreStages.length === 0) return null;
        const idx = Math.max(
            0,
            Math.min(this.fishLoreStages.length - 1, (Number(stageNum) || 1) - 1)
        );
        return this.fishLoreStages[idx];
    }
}

const ContentRegistry = new ContentRegistryManager();
const FLAVOR_DB = ContentRegistry;
