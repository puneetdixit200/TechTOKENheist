// Using Web Audio API to synthesize sound effects for the game
// This avoids needing external MP3s/WAVs

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Low bass hit for elimination
export const playElimination = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    console.log('Audio error:', e);
  }
};

// High pitched coin chime for token gain
export const playCoin = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio error:', e);
  }
};

// Subtle impact sound for match start
export const playImpact = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio error:', e);
  }
};

// Deep dramatic voice for countdown
export const playCountdownVoice = (number) => {
  if (!('speechSynthesis' in window)) return;
  
  const msg = new SpeechSynthesisUtterance();
  msg.text = number.toString();
  msg.rate = 0.7; // Slow down
  msg.pitch = 0.5; // Deep voice
  
  // Try to find an English male voice if available
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') && v.lang.includes('en'));
  if (maleVoice) {
    msg.voice = maleVoice;
  }

  window.speechSynthesis.speak(msg);
};

// Play Bella Ciao with 175% volume using Web Audio API GainNode
export const playBellaCiao175 = () => {
  try {
    const ctx = getContext();
    if (!ctx) {
      throw new Error("Could not create AudioContext");
    }

    const audioUrl = new URL('../../assets/Bella Ciao.mp3', import.meta.url).href;
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";

    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    
    // Set volume multiplier to 1.75
    gainNode.gain.setValueAtTime(1.75, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    audio.play().catch(e => {
      console.warn("Amplified Bella Ciao play blocked by browser:", e);
      // Fallback: standard play if blocked
      const fallbackAudio = new Audio(audioUrl);
      fallbackAudio.volume = 1.0;
      fallbackAudio.play().catch(err => console.error("Fallback Bella Ciao play failed:", err));
    });
  } catch (err) {
    console.error("Web Audio Amplification failed for Bella Ciao:", err);
    try {
      const audioUrl = new URL('../../assets/Bella Ciao.mp3', import.meta.url).href;
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.play().catch(e => console.error("Direct Bella Ciao play failed:", e));
    } catch (e) {
      console.error(e);
    }
  }
};
