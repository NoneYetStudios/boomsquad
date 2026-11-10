/**
 * BOOM SQUAD - Core Engine Configuration
 * Department of Boom Prevention - STF Arcade
 *
 * Pure engine settings, difficulty parameters, rank progression, and relative API routes.
 * All narrative/flavor content lives in ./assets/js/content/
 */

const STF_ARCADE_URL = "https://arcade.stabthefinger.com/";

const GAME_CONFIG = {
    title: "BOOM SQUAD",
    subtitle: "Department of Boom Prevention",
    version: "1.5.0-MODULAR",
    stfArcadeUrl: STF_ARCADE_URL,
    apiEndpoints: {
        submitScore: "./api/leaderboard_submit.php",
        fetchScores: "./api/leaderboard_fetch.php"
    },
    defaultSettings: {
        playerName: "TECH-404",
        hasRegisteredCallsign: false,
        voiceEnabled: true,
        voiceVolume: 0.85,
        musicVolume: 0.45,
        sfxVolume: 0.75,
        difficulty: "normal", // legacy fallback
        difficultyDial: 2, // Rotary Difficulty Dial (1 to 11)
        onlineLeaderboard: true,
        visorAlwaysOn: false,
        visorMagnification: 2, // 2, 3, or 4
        visorFocusMode: false
    },
    difficultyDialLevels: {
        1: {
            level: 1,
            name: "Probationary Intern",
            badge: "DIAL-01 // PROBATIONARY",
            minMods: 1,
            maxMods: 2,
            puzzleTier: 1,
            perModuleSeconds: 60,
            overheadSeconds: 35,
            timeMultiplier: 1.4,
            scoreMultiplier: 0.7,
            maxStrikes: 4,
            dispatchReliability: "94% (Laminated Cheat Sheet)",
            dispatchConfidenceRange: [88, 98],
            manualStatus: "Laminated Cheat Sheet",
            summary: "1–2 modules • Direct clues • 4 strikes • High Dispatch reliability"
        },
        2: {
            level: 2,
            name: "Breakroom Patrol",
            badge: "DIAL-02 // ROUTINE PATROL",
            minMods: 2,
            maxMods: 2,
            puzzleTier: 1,
            perModuleSeconds: 52,
            overheadSeconds: 30,
            timeMultiplier: 1.25,
            scoreMultiplier: 0.85,
            maxStrikes: 4,
            dispatchReliability: "86% (Mostly Legible)",
            dispatchConfidenceRange: [80, 92],
            manualStatus: "Binder Tab 2 (Clean)",
            summary: "2 modules • Visual & direct clues • 4 strikes • Reliable Dispatch"
        },
        3: {
            level: 3,
            name: "Standard Regulation",
            badge: "DIAL-03 // STANDARD REG",
            minMods: 2,
            maxMods: 3,
            puzzleTier: 2,
            perModuleSeconds: 45,
            overheadSeconds: 26,
            timeMultiplier: 1.1,
            scoreMultiplier: 1.0,
            maxStrikes: 3,
            dispatchReliability: "75% (Coffee-Stained)",
            dispatchConfidenceRange: [68, 82],
            manualStatus: "Coffee-Stained Copy",
            summary: "2–3 modules • Chassis telemetry calculations • 3 strikes • 1.0x Score"
        },
        4: {
            level: 4,
            name: "Sub-Basement Response",
            badge: "DIAL-04 // ELEVATED",
            minMods: 3,
            maxMods: 4,
            puzzleTier: 2,
            perModuleSeconds: 42,
            overheadSeconds: 24,
            timeMultiplier: 1.05,
            scoreMultiplier: 1.15,
            maxStrikes: 3,
            dispatchReliability: "64% (Missing Page 4)",
            dispatchConfidenceRange: [55, 72],
            manualStatus: "Missing Page 4",
            summary: "3–4 modules • Cross-chassis arithmetic & Override • 3 strikes • 1.15x Score"
        },
        5: {
            level: 5,
            name: "Inter-Agency Escalation",
            badge: "DIAL-05 // INTER-AGENCY",
            minMods: 4,
            maxMods: 4,
            puzzleTier: 2,
            perModuleSeconds: 39,
            overheadSeconds: 22,
            timeMultiplier: 1.0,
            scoreMultiplier: 1.35,
            maxStrikes: 3,
            dispatchReliability: "54% (Written in Pencil)",
            dispatchConfidenceRange: [45, 62],
            manualStatus: "Annotated in Pencil",
            summary: "4 diverse modules • Multi-step clues • 3 strikes • 1.35x Score"
        },
        6: {
            level: 6,
            name: "Overtime Protocol",
            badge: "DIAL-06 // OVERTIME",
            minMods: 4,
            maxMods: 5,
            puzzleTier: 3,
            perModuleSeconds: 36,
            overheadSeconds: 20,
            timeMultiplier: 0.95,
            scoreMultiplier: 1.55,
            maxStrikes: 3,
            dispatchReliability: "44% (Written in Crayon)",
            dispatchConfidenceRange: [35, 52],
            manualStatus: "Written in Crayon",
            summary: "4–5 modules • Advanced clue deduction & Port rules • 1.55x Score"
        },
        7: {
            level: 7,
            name: "Municipal Crisis",
            badge: "DIAL-07 // MUNICIPAL CRISIS",
            minMods: 5,
            maxMods: 6,
            puzzleTier: 3,
            perModuleSeconds: 34,
            overheadSeconds: 18,
            timeMultiplier: 0.9,
            scoreMultiplier: 1.8,
            maxStrikes: 2,
            dispatchReliability: "34% (Supervisor Gary Guessing)",
            dispatchConfidenceRange: [26, 42],
            manualStatus: "Folded Into Paper Airplane",
            summary: "5–6 modules • Reduced visual assistance • 2 strikes • 1.8x Score"
        },
        8: {
            level: 8,
            name: "Regional Containment",
            badge: "DIAL-08 // REGIONAL HAZARD",
            minMods: 6,
            maxMods: 6,
            puzzleTier: 3,
            perModuleSeconds: 33,
            overheadSeconds: 16,
            timeMultiplier: 0.86,
            scoreMultiplier: 2.1,
            maxStrikes: 2,
            dispatchReliability: "26% (Static & Panic)",
            dispatchConfidenceRange: [18, 34],
            manualStatus: "Partially Shredded",
            summary: "6 modules • High module diversity & cross-module links • 2.1x Score"
        },
        9: {
            level: 9,
            name: "Executive Boardroom Panic",
            badge: "DIAL-09 // EXECUTIVE PANIC",
            minMods: 6,
            maxMods: 7,
            puzzleTier: 4,
            perModuleSeconds: 31,
            overheadSeconds: 15,
            timeMultiplier: 0.82,
            scoreMultiplier: 2.45,
            maxStrikes: 2,
            dispatchReliability: "19% (Legal Dept. Redacted)",
            dispatchConfidenceRange: [12, 26],
            manualStatus: "Redacted by Legal",
            summary: "6–7 modules • Expert blind frequency & multi-constraints • 2.45x Score"
        },
        10: {
            level: 10,
            name: "Maximum Authorized Hazard",
            badge: "DIAL-10 // MAX AUTHORIZED",
            minMods: 7,
            maxMods: 8,
            puzzleTier: 4,
            perModuleSeconds: 30,
            overheadSeconds: 14,
            timeMultiplier: 0.78,
            scoreMultiplier: 2.85,
            maxStrikes: 2,
            dispatchReliability: "14% (Shouting Down Hallway)",
            dispatchConfidenceRange: [8, 20],
            manualStatus: "On Fire in Breakroom",
            summary: "7–8 modules • Full spectrum expert interlocks • 2 strikes • 2.85x Score"
        },
        11: {
            level: 11,
            name: "UNAUTHORIZED ELEVEN",
            badge: "⚠️ DIAL-11 // BEYOND REGULATION",
            minMods: 7,
            maxMods: 8,
            puzzleTier: 5,
            perModuleSeconds: 31,
            overheadSeconds: 16,
            timeMultiplier: 0.8,
            scoreMultiplier: 3.5,
            maxStrikes: 2,
            dispatchReliability: "11% (Existential Dread)",
            dispatchConfidenceRange: [5, 11],
            manualStatus: "Replaced by Fish Container",
            isSpecialEleven: true,
            summary: "7–8 modules • Chained Dual Overrides (A→B), Cross-Module Telemetry Links & Level-11 Anomalies • 3.5x Score"
        }
    },
    getDifficultyDialConfig(level) {
        const clamped = Math.max(1, Math.min(11, Math.round(Number(level) || 2)));
        return this.difficultyDialLevels[clamped] || this.difficultyDialLevels[3];
    },
    difficultySettings: {
        relaxed: {
            label: "Intern (Relaxed)",
            timeMultiplier: 1.35,
            scoreMultiplier: 0.8,
            maxStrikes: 4
        },
        normal: {
            label: "Standard Regulation",
            timeMultiplier: 1.0,
            scoreMultiplier: 1.0,
            maxStrikes: 3
        },
        high_pressure: {
            label: "Overtime Protocol",
            timeMultiplier: 0.78,
            scoreMultiplier: 1.5,
            maxStrikes: 2
        }
    },
    ranks: [
        {
            title: "Junior Boom Technician",
            minScore: 0,
            minMissions: 0,
            badge: "JBT-1",
            clearance: "Level 1 (Plastic Scissors)"
        },
        {
            title: "Boom Technician",
            minScore: 2500,
            minMissions: 2,
            badge: "BT-2",
            clearance: "Level 2 (Insulated Pliers)"
        },
        {
            title: "Senior Boom Technician",
            minScore: 7500,
            minMissions: 5,
            badge: "SBT-3",
            clearance: "Level 3 (Breakroom Key)"
        },
        {
            title: "Boom Analyst",
            minScore: 16000,
            minMissions: 9,
            badge: "BA-4",
            clearance: "Level 4 (Clipboard Authority)"
        },
        {
            title: "Principal Boom Engineer",
            minScore: 30000,
            minMissions: 14,
            badge: "PBE-5",
            clearance: "Level 5 (Annotated Manual)"
        },
        {
            title: "Director of Boom Mitigation",
            minScore: 50000,
            minMissions: 20,
            badge: "DBM-6",
            clearance: "Level 6 (Corner Cubicle)"
        },
        {
            title: "Vice President of Controlled Detonations",
            minScore: 80000,
            minMissions: 28,
            badge: "VPCD-7",
            clearance: "Level 7 (Executive Parking)"
        },
        {
            title: "Chief Executive of Not Booming",
            minScore: 125000,
            minMissions: 40,
            badge: "CENB-8",
            clearance: "Level 8 (Supreme Non-Combustion)"
        }
    ]
};
