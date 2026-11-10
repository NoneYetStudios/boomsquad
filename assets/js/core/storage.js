/**
 * BOOM SQUAD - Storage Manager (localStorage)
 * Persists Settings, Progress, Statistics, Achievements, Ranks, and Local Leaderboards
 */

const STORAGE_KEYS = {
    SETTINGS: "boomsquad_settings_v1",
    STATS: "boomsquad_stats_v1",
    PROGRESS: "boomsquad_progress_v1",
    ACHIEVEMENTS: "boomsquad_achievements_v1",
    LEADERBOARD: "boomsquad_leaderboard_v1"
};

const DEFAULT_STATS = {
    missionsAttempted: 0,
    missionsCompleted: 0,
    totalScore: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    fastestDefusal: null, // seconds (float)
    fishIncidentsSurvived: 0,
    fishEncounters: 0,
    dispatchMessagesHeard: 0,
    dispatchMessagesIgnored: 0,
    totalModulesSolved: 0,
    totalStrikes: 0,
    highestRankIndex: 0
};

const DEFAULT_PROGRESS = {
    trainingCompleted: [], // array of completed training mission IDs (1..8)
    hasTouchedDevice: false,
    campaignLevel: 1,
    fishLoreStage: 1
};

const SEEDED_LEADERBOARD = [
    {
        playerName: "BRENDA_HR",
        score: 64200,
        rank: "Director of Boom Mitigation",
        missionsCompleted: 22,
        longestStreak: 9,
        date: "2026-10-18"
    },
    {
        playerName: "GARY_NIGHTSHIFT",
        score: 41850,
        rank: "Principal Boom Engineer",
        missionsCompleted: 16,
        longestStreak: 7,
        date: "2026-10-24"
    },
    {
        playerName: "BASSLIFT_CHAMP99",
        score: 28900,
        rank: "Boom Analyst",
        missionsCompleted: 11,
        longestStreak: 6,
        date: "2026-11-01"
    },
    {
        playerName: "KEVIN_ACCOUNTING",
        score: 14500,
        rank: "Senior Boom Technician",
        missionsCompleted: 6,
        longestStreak: 4,
        date: "2026-11-03"
    },
    {
        playerName: "INTERN_TIMMY",
        score: 4200,
        rank: "Boom Technician",
        missionsCompleted: 3,
        longestStreak: 2,
        date: "2026-11-08"
    }
];

class StorageManager {
    constructor() {
        this.settings = this.loadSettings();
        this.stats = this.loadStats();
        this.progress = this.loadProgress();
        this.achievements = this.loadAchievements();
    }

    safeGet(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return JSON.parse(JSON.stringify(fallback));
            return { ...JSON.parse(JSON.stringify(fallback)), ...JSON.parse(raw) };
        } catch (err) {
            console.warn("Storage read fallback for", key, err);
            return JSON.parse(JSON.stringify(fallback));
        }
    }

    safeSet(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.warn("Storage write error for", key, err);
        }
    }

    loadSettings() {
        return this.safeGet(STORAGE_KEYS.SETTINGS, GAME_CONFIG.defaultSettings);
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.safeSet(STORAGE_KEYS.SETTINGS, this.settings);
        return this.settings;
    }

    loadStats() {
        return this.safeGet(STORAGE_KEYS.STATS, DEFAULT_STATS);
    }

    saveStats() {
        this.updateRankFromStats();
        this.safeSet(STORAGE_KEYS.STATS, this.stats);
    }

    loadProgress() {
        return this.safeGet(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
    }

    saveProgress() {
        this.safeSet(STORAGE_KEYS.PROGRESS, this.progress);
    }

    loadAchievements() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
            if (!raw) return {};
            return JSON.parse(raw);
        } catch (e) {
            return {};
        }
    }

    saveAchievements() {
        this.safeSet(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    }

    unlockAchievement(id) {
        if (this.achievements[id]) return null; // Already unlocked
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (!ach) return null;
        this.achievements[id] = {
            unlockedAt: new Date().toISOString()
        };
        this.saveAchievements();
        return ach;
    }

    isAchievementUnlocked(id) {
        return Boolean(this.achievements[id]);
    }

    getCurrentRankObj() {
        const idx = Math.min(
            GAME_CONFIG.ranks.length - 1,
            Math.max(0, this.stats.highestRankIndex || 0)
        );
        return GAME_CONFIG.ranks[idx];
    }

    getNextRankObj() {
        const idx = (this.stats.highestRankIndex || 0) + 1;
        if (idx >= GAME_CONFIG.ranks.length) return null;
        return GAME_CONFIG.ranks[idx];
    }

    updateRankFromStats() {
        let bestIdx = this.stats.highestRankIndex || 0;
        for (let i = 0; i < GAME_CONFIG.ranks.length; i++) {
            const r = GAME_CONFIG.ranks[i];
            if (
                this.stats.totalScore >= r.minScore &&
                this.stats.missionsCompleted >= r.minMissions
            ) {
                if (i > bestIdx) bestIdx = i;
            }
        }
        this.stats.highestRankIndex = bestIdx;
    }

    getSuccessRate() {
        if (!this.stats.missionsAttempted) return "0.0%";
        const pct = (this.stats.missionsCompleted / this.stats.missionsAttempted) * 100;
        return `${pct.toFixed(1)}%`;
    }

    markTrainingComplete(missionId) {
        if (!this.progress.trainingCompleted.includes(missionId)) {
            this.progress.trainingCompleted.push(missionId);
            this.saveProgress();
        }
    }

    recordFishEncounter(survived = false) {
        this.stats.fishEncounters = (this.stats.fishEncounters || 0) + 1;
        if (survived) {
            this.stats.fishIncidentsSurvived = (this.stats.fishIncidentsSurvived || 0) + 1;
        }
        this.progress.fishLoreStage = Math.min(7, (this.progress.fishLoreStage || 1) + 1);
        this.saveProgress();
        this.saveStats();
    }

    resetProgress() {
        this.progress = JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
        this.achievements = {};
        this.saveProgress();
        this.saveAchievements();
    }

    resetStatistics() {
        this.stats = JSON.parse(JSON.stringify(DEFAULT_STATS));
        this.saveStats();
    }

    getLocalLeaderboard() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
            if (!raw) {
                this.safeSet(STORAGE_KEYS.LEADERBOARD, SEEDED_LEADERBOARD);
                return [...SEEDED_LEADERBOARD];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEEDED_LEADERBOARD];
        } catch (e) {
            return [...SEEDED_LEADERBOARD];
        }
    }

    addLocalLeaderboardEntry(entry) {
        const list = this.getLocalLeaderboard();
        list.push({
            ...entry,
            isLocalOperator: true
        });
        list.sort((a, b) => b.score - a.score);
        const trimmed = list.slice(0, 50);
        this.safeSet(STORAGE_KEYS.LEADERBOARD, trimmed);
        return trimmed;
    }

    renameOperatorInLeaderboard(oldName, newName) {
        const cleanNew = (newName || "TECH-404").trim().slice(0, 24);
        const cleanOld = (oldName || "").trim();
        if (!cleanNew) return this.getLocalLeaderboard();

        const seededNames = new Set(SEEDED_LEADERBOARD.map((s) => s.playerName));
        const list = this.getLocalLeaderboard();
        let changed = false;

        const updated = list.map((item) => {
            if (
                item.isLocalOperator === true ||
                (cleanOld && item.playerName === cleanOld && !seededNames.has(cleanOld))
            ) {
                if (item.playerName !== cleanNew || !item.isLocalOperator) {
                    changed = true;
                    return {
                        ...item,
                        playerName: cleanNew,
                        isLocalOperator: true
                    };
                }
            }
            return item;
        });

        if (changed) {
            this.safeSet(STORAGE_KEYS.LEADERBOARD, updated);
        }
        return updated;
    }
}

const storage = new StorageManager();
