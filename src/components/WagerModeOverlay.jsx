import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import './WagerModeOverlay.css';

// Procedural sound design utilities using Web Audio API
const playBassDrop = (ctx, time, duration = 2, startFreq = 100, endFreq = 30) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(startFreq, time);
  osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
  
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.start(time);
  osc.stop(time + duration);
};

const playGlitchNoise = (ctx, time, duration = 0.3) => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, time);
  filter.Q.setValueAtTime(5, time);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(time);
  noise.stop(time + duration);
};

const playFlickerSynth = (ctx, time, startFreq = 1200, endFreq = 200, duration = 0.5) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(startFreq, time);
  osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
  
  // Create modular volume flicker
  gain.gain.setValueAtTime(0.4, time);
  for (let i = 0; i < 5; i++) {
    const tickTime = time + (duration / 5) * i;
    gain.gain.setValueAtTime(0.4, tickTime);
    gain.gain.setValueAtTime(0.05, tickTime + 0.05);
  }
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.start(time);
  osc.stop(time + duration);
};

const playBubbleGlitch = (ctx, time, duration = 0.8) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(150, time);
  for (let i = 0; i < 10; i++) {
    const bubbleTime = time + (duration / 10) * i;
    osc.frequency.setValueAtTime(150 + Math.sin(i) * 80, bubbleTime);
  }
  
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.start(time);
  osc.stop(time + duration);
};

const playBeepSequence = (ctx, time, freqs = [600, 400, 500, 300], noteDur = 0.1) => {
  freqs.forEach((freq, idx) => {
    const noteTime = time + idx * noteDur;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(freq, noteTime);
    gain.gain.setValueAtTime(0.2, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDur - 0.01);
    
    osc.start(noteTime);
    osc.stop(noteTime + noteDur);
  });
};

const playSiren = (ctx, time, duration = 1.2) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(500, time);
  osc.frequency.linearRampToValueAtTime(800, time + duration * 0.3);
  osc.frequency.linearRampToValueAtTime(400, time + duration * 0.6);
  osc.frequency.linearRampToValueAtTime(800, time + duration * 0.9);
  
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.start(time);
  osc.stop(time + duration);
};

const playHeartbeat = (ctx, time, pitch = 55) => {
  const playThump = (t, vol) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.15);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  };
  playThump(time, 0.8);
  playThump(time + 0.18, 0.5);
};

let globalAudioCtx = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  return globalAudioCtx;
};

const playProceduralSound = (second) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn("Failed to resume AudioContext:", e));
    }
    const time = ctx.currentTime;
    
    switch (second) {
      case 10:
        playBassDrop(ctx, time, 2.5, 120, 30);
        playGlitchNoise(ctx, time, 0.5);
        break;
      case 9:
        playFlickerSynth(ctx, time, 1200, 100, 0.6);
        break;
      case 8:
        playBubbleGlitch(ctx, time, 0.8);
        break;
      case 7:
        playBeepSequence(ctx, time, [700, 500, 600, 400], 0.12);
        break;
      case 6:
        playSiren(ctx, time, 1.2);
        break;
      case 5:
        playBassDrop(ctx, time, 1.8, 80, 20);
        break;
      case 4:
        playGlitchNoise(ctx, time, 0.3);
        break;
      case 3:
        playBassDrop(ctx, time, 3.0, 140, 25);
        break;
      case 2:
        playHeartbeat(ctx, time, 50);
        break;
      case 1:
        // Complete silence for tension
        break;
      case 0:
        playBassDrop(ctx, time, 1.5, 160, 35);
        playGlitchNoise(ctx, time, 1.0);
        break;
      default:
        break;
    }
  } catch (err) {
    console.warn("AudioContext error:", err);
  }
};

const speakVoiceText = (text) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.includes('en'));
    if (engVoice) utterance.voice = engVoice;
    
    utterance.pitch = 0.45; // Low robotic pitch
    utterance.rate = 0.80;  // Intentionally sluggish
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
};

const WAGER_PLAYLIST = [
  {
    title: "BELLA CIAO",
    subtitle: "WAGER MODE ANTHEM",
    url: new URL('../../assets/Bella Ciao.mp3', import.meta.url).href
  },
  {
    title: "CAN'T STOP CRYING",
    subtitle: "CYBERPUNK EMOTION",
    url: new URL('../../assets/cantstopcrying.mp3', import.meta.url).href
  },
  {
    title: "FADO BOEMIO VADIO",
    subtitle: "DYSTOPIAN HARMONY",
    url: new URL('../../assets/Fado Boemio Vadio.mp3', import.meta.url).href
  },
  {
    title: "LIKE A FALLING STAR",
    subtitle: "NEON BALLAD",
    url: new URL('../../assets/Like a Falling Star - Marc Ferrari & Michael McGregor.mp3', import.meta.url).href
  }
];

const WagerModeOverlay = () => {
  const { gameState } = useGameState();
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [countdownCompleted, setCountdownCompleted] = useState(() => {
    return sessionStorage.getItem('wager-countdown-played') === 'true';
  });

  const [isSongPlaying, setIsSongPlaying] = useState(() => {
    return sessionStorage.getItem('wager-countdown-played') === 'true';
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const audioRef = useRef(null);
  const prevPhaseRef = useRef(gameState.phase);
  const isSongPlayingRef = useRef(isSongPlaying);

  // Sync ref with state safely inside useEffect to adhere to render purity rules
  useEffect(() => {
    isSongPlayingRef.current = isSongPlaying;
  }, [isSongPlaying]);

  // Sync state transitions from the server
  useEffect(() => {
    if (gameState.phase === 'phase1') {
      sessionStorage.removeItem('wager-countdown-played');
      const timerId = setTimeout(() => {
        setCountdownCompleted(false);
        setActive(false);
        setIsPlaying(false);
        setIsSongPlaying(false);
        setIsCollapsed(false);
        setCurrentTrackIndex(0);
      }, 0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      prevPhaseRef.current = 'phase1';
      return () => clearTimeout(timerId);
    } else if (gameState.phase === 'phase2') {
      const hasPlayed = sessionStorage.getItem('wager-countdown-played') === 'true';
      const wasPhase1 = prevPhaseRef.current === 'phase1';
      
      if (!hasPlayed && wasPhase1 && !isPlaying) {
        const timerId = setTimeout(() => {
          setActive(true);
          setIsPlaying(true);
          setTimer(10);
        }, 0);
        prevPhaseRef.current = 'phase2';
        return () => clearTimeout(timerId);
      } else {
        const timerId = setTimeout(() => {
          setCountdownCompleted(true);
        }, 0);
        // Automatically try to resume the background song if we want it to be playing
        if (audioRef.current && isSongPlaying) {
          audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
        prevPhaseRef.current = 'phase2';
        return () => clearTimeout(timerId);
      }
    }
    prevPhaseRef.current = gameState.phase;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.phase]);

  // Main countdown ticking timeline
  useEffect(() => {
    if (!active || !isPlaying) return undefined;

    // First sound on start
    playProceduralSound(10);

    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = Math.max(0, prev - 1);
        
        if (next === 0) {
          clearInterval(interval);
          playProceduralSound(0);
          
          setTimeout(() => {
            sessionStorage.setItem('wager-countdown-played', 'true');
            setCountdownCompleted(true);
            setActive(false);
            setIsPlaying(false);
            // Autostart playlist
            setIsSongPlaying(true);
            setCurrentTrackIndex(0);
            if (audioRef.current) {
              audioRef.current.load();
              audioRef.current.play().catch(e => console.warn('Music play blocked:', e));
            }
          }, 1800);
          
          return 0;
        }

        // Ticking audio triggers
        playProceduralSound(next);

        // At 4s trigger robotic voice
        if (next === 4) {
          speakVoiceText("Reality integrity compromised");
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, isPlaying]);

  // Handle track load/play on index change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isSongPlayingRef.current) {
        audioRef.current.play().catch(e => console.warn('Audio play failed on track change:', e));
      }
    }
  }, [currentTrackIndex]);

  // Track background song status changes
  const toggleSongPlay = () => {
    if (!audioRef.current) return;
    if (isSongPlaying) {
      audioRef.current.pause();
      setIsSongPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsSongPlaying(true))
        .catch(e => console.warn('Audio play failed:', e));
    }
  };

  const resetSong = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    if (!isSongPlaying) {
      audioRef.current.play()
        .then(() => setIsSongPlaying(true))
        .catch(e => console.warn('Audio play failed:', e));
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % WAGER_PLAYLIST.length);
    setIsSongPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + WAGER_PLAYLIST.length) % WAGER_PLAYLIST.length);
    setIsSongPlaying(true);
  };

  const handleSongEnded = () => {
    nextTrack();
  };

  // Content map for second-by-second cyberpunk overlay sequence
  const getOverlayContents = () => {
    switch (timer) {
      case 10:
        return {
          title: "SYSTEM OVERRIDE DETECTED",
          subtitle: "CRITICAL BREACH // PROTOCOL ENFORCEMENT COMPROMISED",
          class: "step-10 glitch-heavy",
          action: "OVERRIDE"
        };
      case 9:
        return {
          title: "ALL PROTOCOL ARMORMENTS REMOVED",
          subtitle: "EQUIPMENT NULLIFIED // SHIELD HARNESS OFFLINE",
          class: "step-9 glitch-flicker",
          action: "PURGE"
        };
      case 8:
        return {
          title: "RULESET FAILURE INITIATED",
          subtitle: "STANDARD DIRECTIVES DELETED // COMPILING EMERGENCY PARADIGM",
          class: "step-8 melting-ui",
          action: "CORRUPTION"
        };
      case 7:
        return {
          title: "IDENTITY LOCKS DISABLED",
          subtitle: "OPERATIVE ENCRYPTIONS DECRYPTED // SECURITY ANONYMITY TERMINATED",
          class: "step-7 flickering-screen",
          action: "IDENTITY_LOSS"
        };
      case 6:
        return {
          title: "ENVIRONMENTAL STABILITY COLLAPSING",
          subtitle: "ARENA GRID OVERHEATING // STRUCTURAL CRACKING DETECTED",
          class: "step-6 red-lightning-flashes",
          action: "GRID_WARP"
        };
      case 5:
        return {
          title: "ALL GOVERNING RULES HAVE BEEN REVOKED",
          subtitle: "THE DECREE IS CLEAR // SURVIVAL OF THE FITTEST SECURED",
          class: "step-5 full-red-hue",
          action: "CHAOS"
        };
      case 4:
        return {
          title: "REALITY INTEGRITY COMPROMISED",
          subtitle: "CORE SYSTEM FAILURE // STANDBY FOR VIRTUAL RECONSTRUCTION",
          class: "step-4 complete-darkness",
          action: "VOID_STATE"
        };
      case 3:
        return {
          title: "INITIATING WAGOR MODE",
          subtitle: "REDISTRIBUTING TOKEN RESERVES // PREPARING VAULT CHAMBERS",
          class: "step-3 grid-shockwave",
          action: "COMPILING"
        };
      case 2:
        return {
          title: "2",
          subtitle: "INTEGRATION STABILIZING // HEARTBEAT LOCK-IN",
          class: "step-2 heartbeat-sync",
          action: "STABILIZE"
        };
      case 1:
        return {
          title: "WELCOME TO WAGOR MODE",
          subtitle: "THE CHAOS COMMENCES // BRACE YOURSELVES OPERATIVES",
          class: "step-1 intense-silence",
          action: "LOCKED"
        };
      case 0:
        return {
          title: "WAGOR MODE ACTIVE",
          subtitle: "SURVIVE THE CHAOS // WINNER TAKES ALL // HIGH STAKES VAULT",
          class: "step-0 maximum-glitch",
          action: "EXECUTE"
        };
      default:
        return { title: "", subtitle: "", class: "", action: "" };
    }
  };

  const currentContent = getOverlayContents();

  return (
    <>
      {/* Hidden audio element loading the playlist track */}
      <audio
        ref={audioRef}
        src={WAGER_PLAYLIST[currentTrackIndex].url}
        onEnded={handleSongEnded}
      />

      {/* Cinematic Fullscreen Wager Overlay */}
      {active && (
        <div className={`wager-mode-overlay-container ${currentContent.class}`}>
          {/* Cyberpunk background styling */}
          <div className="wager-crt-scanlines" />
          <div className="wager-vignette-glitch" />
          
          <div className="wager-cyber-grid" />
          <div className="wager-lightning-flashes" />

          {/* Glitching overlay UI boxes */}
          <div className="wager-security-corner tl heist-mono">SYS_OVERRIDE_0x82A</div>
          <div className="wager-security-corner tr heist-mono">PORT_8080_SECURED</div>
          <div className="wager-security-corner bl heist-mono">PHASE_02_WAGER</div>
          <div className="wager-security-corner br heist-mono">INTEGRITY_COMPROMISED</div>

          {/* Main sequence content block */}
          <div className="wager-sequence-center">
            <div className="wager-status-ticker heist-mono">
              <span className="ticker-tag">[STATUS]</span> {currentContent.action} ACTIVE
            </div>
            
            <div className="wager-giant-display">
              <h1 className="heist-font text-shadow-red" data-text={currentContent.title}>
                {currentContent.title}
              </h1>
            </div>

            <div className="wager-caption-text heist-mono">
              <p>{currentContent.subtitle}</p>
            </div>

            {/* Micro timer display */}
            <div className="wager-ticker-bar">
              <div className="wager-ticker-fill" style={{ width: `${(timer / 10) * 100}%` }} />
            </div>

            <div className="wager-second-subtext heist-mono">
              SEC TO ANARCHY: {timer}S // DESTRUCTIVE INTEGRATION
            </div>
          </div>
        </div>
      )}

      {/* Mini Spinning Audio Player in Bottom Right */}
      {countdownCompleted && gameState.phase === 'phase2' && (
        <div className={`wager-mini-player-widget ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="player-widget-brand heist-mono">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
              <div className="glowing-red-dot animate-pulse" />
              <span>WAGOR AMBIENT</span>
            </div>
            <button 
              className="player-collapse-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(true);
              }}
              title="Minimize Player"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div 
            className="player-widget-core"
            onClick={() => {
              if (isCollapsed) setIsCollapsed(false);
            }}
            style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
          >
            {/* Spinning Vinyl */}
            <div 
              className={`vinyl-disc ${isSongPlaying ? 'spinning' : 'paused'} ${isCollapsed ? 'collapsed-vinyl' : ''}`}
              title={isCollapsed ? (isSongPlaying ? "Playing - Click to Expand" : "Paused - Click to Expand") : ""}
            >
              <div className="vinyl-groove" />
              <div className="vinyl-center" />
              {isCollapsed && (
                <div className="collapsed-expand-hint heist-mono">＋</div>
              )}
            </div>

            {/* Details and Actions */}
            <div className="player-widget-details">
              <div className="song-title-wrapper heist-mono">
                <div className="song-title-ticker">
                  {WAGER_PLAYLIST[currentTrackIndex].title} — {WAGER_PLAYLIST[currentTrackIndex].subtitle}
                </div>
              </div>
              
              <div className="player-widget-controls">
                <button 
                  className="control-btn prev-btn heist-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevTrack();
                  }}
                  title="Previous Song"
                >
                  ◀
                </button>

                <button 
                  className="control-btn play-pause-btn heist-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSongPlay();
                  }}
                  title={isSongPlaying ? "Pause Track" : "Play Track"}
                >
                  {isSongPlaying ? 'PAUSE' : 'PLAY'}
                </button>

                <button 
                  className="control-btn next-btn heist-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextTrack();
                  }}
                  title="Next Song"
                >
                  ▶
                </button>
                
                <button 
                  className="control-btn reset-btn heist-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetSong();
                  }}
                  title="Restart Track"
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WagerModeOverlay;
