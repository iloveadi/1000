export function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR'; // Korean
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Find a Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.includes('ko') || voice.lang.includes('KR'));
    if (koreanVoice) {
        utterance.voice = koreanVoice;
    }

    try {
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn("TTS Playback failed:", e);
    }
}
