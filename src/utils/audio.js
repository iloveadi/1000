let audioCtx = null;

// Helper to initialize context only on user interaction
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function playSound(type) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'swipe') {
            // Soft swoosh/click
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);

        } else if (type === 'flip') {
            // Soft paper/pop sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);

        } else if (type === 'success') {
            // Gentle chime (two notes: e.g. C5 - E5)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5

            // Secondary oscillator for harmony
            const osc2 = ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, now); // E5

            const gainNode2 = ctx.createGain();
            osc2.connect(gainNode2);
            gainNode2.connect(ctx.destination);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            gainNode2.gain.setValueAtTime(0, now + 0.1);
            gainNode2.gain.linearRampToValueAtTime(0.2, now + 0.15);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

            osc.start(now);
            osc.stop(now + 0.5);

            osc2.start(now + 0.1);
            osc2.stop(now + 0.6);
        }
    } catch (err) {
        console.warn("Audio playback failed:", err);
    }
}
