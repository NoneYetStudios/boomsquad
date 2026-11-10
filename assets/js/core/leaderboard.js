/**
 * BOOM SQUAD - Leaderboard System
 * Supports Online PHP Backend (./api/leaderboard_submit.php & ./api/leaderboard_fetch.php)
 * with automatic localStorage fallback so the game never breaks offline or on static hosts.
 */

class LeaderboardManager {
    constructor() {
        this.submitUrl = GAME_CONFIG.apiEndpoints.submitScore;
        this.fetchUrl = GAME_CONFIG.apiEndpoints.fetchScores;
        this.lastStatus = "READY";
    }

    async submitScore(scoreData) {
        const entry = {
            playerName: (scoreData.playerName || storage.settings.playerName || "TECH-404")
                .trim()
                .slice(0, 24),
            score: Math.max(0, Math.floor(Number(scoreData.score) || 0)),
            rank: scoreData.rank || storage.getCurrentRankObj().title,
            missionsCompleted: Number(scoreData.missionsCompleted ?? storage.stats.missionsCompleted),
            longestStreak: Number(scoreData.longestStreak ?? storage.stats.longestStreak),
            date: new Date().toISOString().split("T")[0]
        };

        // Always store in localStorage first so player never loses a score
        storage.addLocalLeaderboardEntry(entry);

        if (!storage.settings.onlineLeaderboard) {
            this.lastStatus = "SAVED TO LOCAL ARCHIVE (ONLINE DISABLED)";
            return { ok: true, mode: "local", entry };
        }

        try {
            const response = await fetch(this.submitUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result && result.status === "ok") {
                this.lastStatus = "SUBMITTED TO STF ONLINE LEADERBOARD";
                return { ok: true, mode: "online", entry, serverData: result };
            }
            throw new Error("Invalid PHP response");
        } catch (err) {
            this.lastStatus = "SAVED LOCALLY (PHP SERVER OFFLINE FALLBACK)";
            return { ok: true, mode: "fallback", entry };
        }
    }

    async updateOperatorName(oldName, newName) {
        const cleanNew = (newName || "TECH-404").trim().slice(0, 24);
        const cleanOld = (oldName || "").trim();

        // Always update all local leaderboard entries for this operator
        storage.renameOperatorInLeaderboard(cleanOld, cleanNew);

        if (!storage.settings.onlineLeaderboard || !cleanOld || cleanOld === cleanNew) {
            return { ok: true, mode: "local", newName: cleanNew };
        }

        try {
            const response = await fetch(this.submitUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "rename",
                    oldName: cleanOld,
                    newName: cleanNew
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            return { ok: true, mode: "online", newName: cleanNew, serverData: result };
        } catch (err) {
            return { ok: true, mode: "fallback", newName: cleanNew };
        }
    }

    async fetchLeaderboard() {
        if (!storage.settings.onlineLeaderboard) {
            this.lastStatus = "LOCAL ARCHIVE MODE";
            return {
                mode: "local",
                entries: storage.getLocalLeaderboard()
            };
        }

        try {
            const response = await fetch(`${this.fetchUrl}?limit=25`, {
                method: "GET",
                headers: { Accept: "application/json" },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data && Array.isArray(data.entries)) {
                this.lastStatus = "ONLINE LEADERBOARD CONNECTED";
                const merged = [...data.entries, ...storage.getLocalLeaderboard()];
                const seen = new Set();
                const unique = [];
                for (const item of merged) {
                    const key = `${item.playerName}|${item.score}|${item.date}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(item);
                    }
                }
                unique.sort((a, b) => b.score - a.score);
                return {
                    mode: "online",
                    entries: unique.slice(0, 25)
                };
            }
            throw new Error("Malformed JSON payload");
        } catch (err) {
            this.lastStatus = "LOCAL FALLBACK (STATIC SERVER DETECTED)";
            return {
                mode: "fallback",
                entries: storage.getLocalLeaderboard()
            };
        }
    }
}

const leaderboard = new LeaderboardManager();
