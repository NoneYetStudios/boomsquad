/**
 * BOOM SQUAD - Web Audio API Synthesizer & SpeechSynthesis Radio Engine
 * Pure procedural audio - zero external sound files required.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.musicInterval = null;
        this.isMusicPlaying = false;
        this.musicStep = 0;
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.onSpeechStateChange = null;
        this.mobileUnlocked = false;
        this.initVoices();
        this.initMobileAudioUnlock();
    }

    initMobileAudioUnlock() {
        if (!window || typeof window.addEventListener !== "function") return;
        const unlock = () => {
            if (this.mobileUnlocked) return;
            const ctx = this.ensureContext();
            if (ctx) {
                try {
                    const buf = ctx.createBuffer(1, 1, 22050);
                    const src = ctx.createBufferSource();
                    src.buffer = buf;
                    src.connect(ctx.destination);
                    src.start(0);
                    this.mobileUnlocked = true;
                } catch (e) {}
            }
        };
        window.addEventListener("touchstart", unlock, { passive: true, once: true });
        window.addEventListener("pointerdown", unlock, { passive: true, once: true });
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    initVoices() {
        if (!("speechSynthesis" in window)) return;
        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return;
            // Prefer clear English voices
            this.selectedVoice =
                voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David") || v.name.includes("Mark"))) ||
                voices.find((v) => v.lang.startsWith("en")) ||
                voices[0];
        };
        pickVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = pickVoice;
        }
    }

    getSfxGain() {
        const vol = storage.settings.sfxVolume !== undefined ? storage.settings.sfxVolume : 0.75;
        return Math.max(0, Math.min(1, vol));
    }

    getMusicGain() {
        const vol = storage.settings.musicVolume !== undefined ? storage.settings.musicVolume : 0.45;
        return Math.max(0, Math.min(1, vol));
    }

    // ==================================================
    // SOUND EFFECTS (Web Audio API)
    // ==================================================

    playTick(urgency = 0) {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // urgency: 0 = normal, 1 = under 30s, 2 = under 10s
        const freq = urgency === 2 ? 1320 : urgency === 1 ? 980 : 740;
        osc.type = urgency === 2 ? "square" : "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.045);

        gain.gain.setValueAtTime(0.18 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
    }

    playButton(pitch = 520) {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.setValueAtTime(pitch * 1.25, now + 0.02);

        gain.gain.setValueAtTime(0.22 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
    }

    playWireCut() {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        // Metallic snip + brief spark noise
        const bufferSize = ctx.sampleRate * 0.06;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.45 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
    }

    playSwitchToggle(up = true) {
        this.playButton(up ? 640 : 420);
    }

    playModuleSolved() {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = ctx.currentTime + idx * 0.065;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.24 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.23);
        });
    }

    playStrikeAlarm() {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const start = now + i * 0.16;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(165, start);
            osc.frequency.linearRampToValueAtTime(115, start + 0.14);

            gain.gain.setValueAtTime(0.32 * vol, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.155);
        }
    }

    playSuccessFanfare() {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
        chord.forEach((freq, i) => {
            const start = ctx.currentTime + i * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.25 * vol, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.56);
        });
    }

    playExplosion() {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        // 1. Low boom noise
        const duration = 1.1;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(420, now);
        filter.frequency.exponentialRampToValueAtTime(55, now + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.65 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);

        // 2. Comedic rubber-duck / gravy splat warble after the boom
        const quackStart = now + 0.38;
        const osc = ctx.createOscillator();
        const qGain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(580, quackStart);
        osc.frequency.exponentialRampToValueAtTime(290, quackStart + 0.18);
        qGain.gain.setValueAtTime(0.22 * vol, quackStart);
        qGain.gain.exponentialRampToValueAtTime(0.001, quackStart + 0.2);
        osc.connect(qGain);
        qGain.connect(ctx.destination);
        osc.start(quackStart);
        osc.stop(quackStart + 0.21);
    }

    playRadioStatic(duration = 0.09) {
        const ctx = this.ensureContext();
        const vol = this.getSfxGain();
        if (!ctx || vol <= 0.01) return;

        const now = ctx.currentTime;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1650, now);
        filter.Q.setValueAtTime(1.8, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
    }

    // ==================================================
    // SPEECH SYNTHESIS RADIO DISPATCH VOICE
    // ==================================================

    formatForSpeech(text) {
        return String(text)
            .replace(/\(s\)/gi, "s")
            .replace(/Ω(\d+)/g, "Node $1")
            .replace(/SW-(\d+)/g, "Switch $1")
            .replace(/#(\d+)/g, "number $1")
            .replace(/(\d+)V\b/g, "$1 volt")
            // Pronounce "Basslifting" / "Basslift" like the fish ("basse", rhymes with grass)
            // rather than the guitar ("base"), while preserving "Basslifting" in visual text output.
            .replace(/\bbass[\s-]*lifting\b/gi, "basse lifting")
            .replace(/\bbass[\s-]*lifter(s?)\b/gi, "basse lifter$1")
            .replace(/\bbass[\s-]*lift(s|ed)?\b/gi, "basse lift$1");
    }

    speakDispatch(text, priority = false) {
        this.playRadioStatic(0.08);

        if (!storage.settings.voiceEnabled || !("speechSynthesis" in window)) {
            return;
        }

        const voiceVol = storage.settings.voiceVolume !== undefined ? storage.settings.voiceVolume : 0.85;
        if (voiceVol <= 0.01) return;

        try {
            if (priority) {
                window.speechSynthesis.cancel();
            }

            const spokenText = this.formatForSpeech(text);
            const utterance = new SpeechSynthesisUtterance(spokenText);
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            utterance.volume = Math.max(0, Math.min(1, voiceVol));
            utterance.rate = 1.06;
            utterance.pitch = 0.96;

            utterance.onstart = () => {
                this.isSpeaking = true;
                if (this.onSpeechStateChange) this.onSpeechStateChange(true);
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                if (this.onSpeechStateChange) this.onSpeechStateChange(false);
                this.playRadioStatic(0.06);
            };

            utterance.onerror = () => {
                this.isSpeaking = false;
                if (this.onSpeechStateChange) this.onSpeechStateChange(false);
            };

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn("SpeechSynthesis error:", err);
        }
    }

    stopSpeech() {
        if ("speechSynthesis" in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
        this.isSpeaking = false;
        if (this.onSpeechStateChange) this.onSpeechStateChange(false);
    }

    // ==================================================
    // PROCEDURAL TENSE CORPORATE SYNTH LOOP
    // ==================================================

    startMusic() {
        if (this.isMusicPlaying) return;
        this.isMusicPlaying = true;
        this.musicStep = 0;

        const bassSequence = [110, 110, 130.81, 110, 146.83, 130.81, 98.0, 110];
        this.musicInterval = setInterval(() => {
            const vol = this.getMusicGain();
            if (vol <= 0.01 || !this.ctx || this.ctx.state !== "running") return;

            const now = this.ctx.currentTime;
            const freq = bassSequence[this.musicStep % bassSequence.length];
            this.musicStep++;

            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(360, now);

            gain.gain.setValueAtTime(0.07 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.34);
        }, 380);
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

const audio = new AudioManager();
