import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Activity, Radio, ShieldAlert } from 'lucide-react';
import './FinaleOverlay.css';
import tokenImg from '../../assets/token.png';

const TOTAL_ROUNDS = 5;
const FINALE_AUDIO_SRC = new URL('../../assets/finale.mp3', import.meta.url).href;
const BELLA_CIAO_AUDIO_SRC = new URL('../../assets/Bella Ciao.mp3', import.meta.url).href;
const DANCE_GIF_SRC = new URL('../../assets/dance.gif', import.meta.url).href;
const FINALE_AUDIO_TITLE = "FINALE — THE SYSTEM'S LAST HYMN";
const BELLA_CIAO_AUDIO_TITLE = "BELLA CIAO — CHAMPIONSHIP ANTHEM";

// Bottom captions to cycle automatically
const DYNAMIC_CAPTIONS = [
  "EXPECT THE UNEXPECTED.",
  "STRATEGY ENDS. INSTINCTS BEGIN.",
  "GLORY IS 1 ROUND AWAY.",
  "WITNESS CYBERPUNK HISTORY IN THE MAKING.",
  "THE ARENA DEMANDS ULTIMATE VENGEANCE.",
  "NO MERCY. NO PROTOCOLS. ONLY VICTORY."
];

// Pre-calculate stable visual styles to preserve render purity and support React StrictMode / React 19
const EMBER_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  left: `${(i * 6.73) % 100}%`,
  animationDelay: `${(i * 0.29) % 4}s, 0s`,
  animationDuration: `${3 + ((i * 0.47) % 4)}s, 2s`
}));

const SPARK_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  left: `${(i * 7.19) % 100}%`,
  animationDelay: `${(i * 0.23) % 4}s, 0s`,
  animationDuration: `${3 + ((i * 0.51) % 4)}s, 2s`
}));

/* ─── High-Performance Interactive Canvas Celebration Engine ─── */
const ChampionshipCelebrationCanvas = ({ active, winnerName }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let blastWaves = [];

    // Load the gold token coin image
    const coinImg = new Image();
    coinImg.src = tokenImg;
    let imgLoaded = false;
    coinImg.onload = () => {
      imgLoaded = true;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const COLORS = [
      '#fdd835', // Premium Gold
      '#ff003c', // Cyberpunk Crimson
      '#00d2ff', // Electric Cyan
      '#e040fb', // Neon Pink/Purple
      '#00e676', // Toxic Green
      '#ffffff', // Pristine White
    ];

    const createParticle = (x, y, angle, speed, type = 'coin') => {
      // Coins are larger to reveal details; stars and streamers add ambient flair
      const size = type === 'coin' 
        ? Math.random() * 24 + 14 
        : type === 'streamer' 
          ? Math.random() * 6 + 4 
          : Math.random() * 8 + 4;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * (type === 'coin' ? 0.12 : 0.25),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        type, // 'coin' | 'star' | 'streamer'
        opacity: 1,
        decay: type === 'coin' ? Math.random() * 0.007 + 0.004 : Math.random() * 0.012 + 0.008,
        gravity: type === 'coin' ? 0.22 : 0.15,
        wind: (Math.random() - 0.5) * 0.06,
        streamerPoints: type === 'streamer' ? Array.from({ length: 6 }, () => ({ x, y })) : [],
      };
    };

    const fireCannon = (side) => {
      const x = side === 'left' ? 60 : canvas.width - 60;
      const y = canvas.height - 30;
      const angleMin = side === 'left' ? -Math.PI / 2.8 : -Math.PI * 2.2 / 3;
      const angleMax = side === 'left' ? -Math.PI / 12 : -Math.PI * 11 / 12;

      // Blast wave shock ring
      blastWaves.push({
        x,
        y,
        radius: 0,
        maxRadius: 160 + Math.random() * 80,
        color: side === 'left' ? 'rgba(255, 0, 60, 0.45)' : 'rgba(0, 210, 255, 0.45)',
        speed: 9,
      });

      // High velocity coin particles
      for (let i = 0; i < 75; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = Math.random() * 18 + 9;
        particles.push(createParticle(x, y, angle, speed, 'coin'));
      }

      // Shimmering stars
      for (let i = 0; i < 40; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = Math.random() * 14 + 6;
        particles.push(createParticle(x, y, angle, speed, 'star'));
      }

      // Metallic foil ribbons/streamers
      for (let i = 0; i < 10; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = Math.random() * 22 + 13;
        particles.push(createParticle(x, y, angle, speed, 'streamer'));
      }
    };

    // Intense sequence of popper launches
    const timeouts = [
      setTimeout(() => { fireCannon('left'); fireCannon('right'); }, 200),
      setTimeout(() => { fireCannon('left'); fireCannon('right'); }, 1000),
      setTimeout(() => { fireCannon('left'); }, 1800),
      setTimeout(() => { fireCannon('right'); }, 2300),
      setTimeout(() => { fireCannon('left'); fireCannon('right'); }, 3200),
    ];

    // Constant chaotic ambient falling pieces
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        fireCannon(Math.random() > 0.5 ? 'left' : 'right');
      }
    }, 2800);

    // Interactive window clicking spawns massive bursts of flying coins at the cursor!
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      blastWaves.push({
        x,
        y,
        radius: 0,
        maxRadius: 100,
        color: 'rgba(253, 216, 53, 0.5)',
        speed: 8,
      });

      // Spawn flying gold coins
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        particles.push(createParticle(x, y, angle, speed, 'coin'));
      }

      // Spawn shimmering gold stars
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push(createParticle(x, y, angle, speed, 'star'));
      }
    };

    window.addEventListener('click', handleClick);

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw shockwaves
      blastWaves = blastWaves.filter(wave => {
        wave.radius += wave.speed;
        const pct = wave.radius / wave.maxRadius;
        const opacity = 1 - pct;
        if (pct >= 1) return false;

        ctx.strokeStyle = wave.color.replace('0.45', String(opacity * 0.45)).replace('0.5', String(opacity * 0.5));
        ctx.lineWidth = 6 * (1 - pct);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      // 2. Draw active particles
      particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx += p.wind;
        p.vx *= 0.985; // Air drag
        p.vy *= 0.985;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
          return false;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'coin') {
          if (imgLoaded) {
            ctx.drawImage(coinImg, -p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            // Fallback gold shiny circle
            ctx.fillStyle = '#fdd835';
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.type === 'star') {
          ctx.fillStyle = p.color;
          // Draw four pointed diamond star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.4, -p.size * 0.4);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.4, p.size * 0.4);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.4, p.size * 0.4);
          ctx.lineTo(-p.size, 0);
          ctx.lineTo(-p.size * 0.4, -p.size * 0.4);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'streamer') {
          ctx.restore();
          p.streamerPoints.push({ x: p.x, y: p.y });
          if (p.streamerPoints.length > 18) p.streamerPoints.shift();

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(p.streamerPoints[0].x, p.streamerPoints[0].y);
          for (let pt of p.streamerPoints) {
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        ctx.restore();
        return true;
      });

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="celebration-particles-canvas"
      aria-label={`${winnerName || 'Winner'} championship celebration particle effects`}
    />
  );
};

/* ─── Victory Screen ─── */
const VictoryScreen = ({ winnerName, scoreA, scoreB, teamAName, teamBName, audioRef, songTitle }) => {
  const [show, setShow] = useState(false);
  const [isSongPlaying, setIsSongPlaying] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Intense Screen Shake, Glitches and Strobe states
  const [bassShake, setBassShake] = useState(false);
  const [strobeColor, setStrobeColor] = useState('transparent');
  const [heavyGlitch, setHeavyGlitch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (audioRef && audioRef.current) {
      setIsSongPlaying(!audioRef.current.paused);
    }
  }, [audioRef]);

  // Synchronized intense celebration rhythm (Flashes, Glitches, Shakes)
  useEffect(() => {
    if (!show) return;

    const strobeColors = ['rgba(255, 0, 60, 0.15)', 'rgba(0, 210, 255, 0.15)', 'rgba(253, 216, 53, 0.15)', 'transparent'];
    
    // Fast Strobe flash synced to championship energy
    const strobeInterval = setInterval(() => {
      const nextColor = strobeColors[Math.floor(Math.random() * strobeColors.length)];
      setStrobeColor(nextColor);
    }, 450);

    // Screen-shattering bass shake loop
    const shakeInterval = setInterval(() => {
      setBassShake(true);
      setTimeout(() => setBassShake(false), 500);
    }, 3800);

    // Chromatic heavy glitch overlay trigger
    const glitchInterval = setInterval(() => {
      setHeavyGlitch(true);
      setTimeout(() => setHeavyGlitch(false), 350);
    }, 5500);

    return () => {
      clearInterval(strobeInterval);
      clearInterval(shakeInterval);
      clearInterval(glitchInterval);
    };
  }, [show]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef || !audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsSongPlaying(true))
        .catch(err => console.log("Play failed:", err));
    } else {
      audioRef.current.pause();
      setIsSongPlaying(false);
    }
  };

  const resetPlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsSongPlaying(true))
        .catch(err => console.log("Play failed:", err));
    } else {
      setIsSongPlaying(true);
    }
  };

  return (
    <div 
      className={`finale-victory-overlay ${bassShake ? 'victory-bass-shake' : ''} ${heavyGlitch ? 'victory-heavy-glitch' : ''}`} 
      style={{ opacity: show ? 1 : 0, transition: 'opacity 0.8s ease-in' }}
    >
      {/* Dynamic Strobe Flasher */}
      <div className="victory-strobe-overlay" style={{ backgroundColor: strobeColor }} />

      {/* Cyber ambient filters */}
      <div className="victory-bg-burst" />
      <div className="victory-flare" />
      <div className="victory-rings" />
      <div className="finale-scanlines" />
      
      {/* Holographic Glowing side sweep lasers */}
      <div className="victory-laser-sweeps">
        <div className="laser-beam laser-red" />
        <div className="laser-beam laser-blue" />
        <div className="laser-beam laser-gold" />
      </div>

      {/* Scrolling Holographic Background Rows */}
      <div className="victory-glitch-ticker-bg">
        <div className="ticker-bg-row row-left">CHAMPIONSHIP SECURED // DISTRICT V CROWNED // SYSTEM CONQUERED // HELSINKI //</div>
        <div className="ticker-bg-row row-right">CHAMPIONSHIP SECURED // DISTRICT V CROWNED // SYSTEM CONQUERED // RIO //</div>
      </div>

      {/* Interactive physics-based canvas particles (Manual click triggers poppers!) */}
      <ChampionshipCelebrationCanvas active={show} winnerName={winnerName} />

      {/* Real animated holographic party popper cannons at bottom corners */}
      <div className="party-popper-cannon cannon-left">
        <div className="cannon-barrel" />
        <div className="cannon-base" />
        <div className="cannon-muzzle-flash" />
      </div>
      <div className="party-popper-cannon cannon-right">
        <div className="cannon-barrel" />
        <div className="cannon-base" />
        <div className="cannon-muzzle-flash" />
      </div>

      {/* CHAMPIONSHIP HUD INTERFACE */}
      <div className="victory-content-card victory-championship-panel">
        <div className="victory-card-glow-back" />
        
        <div className="victory-crown-emblem victory-crown-badge">
          <img src={DANCE_GIF_SRC} className="victory-dance-gif" alt="Winner Celebration" />
          <div className="victory-crown-code heist-mono">CHAMPION LOCKED</div>
        </div>
        
        <div className="victory-title-wrapper">
          <div className="victory-title-glitch" data-text="CHAMPIONSHIP CROWNED">CHAMPIONSHIP CROWNED</div>
        </div>
        
        <div className="victory-winner-name-glow">{winnerName}</div>
        
        <div className="victory-score">
          <span className="victory-score-a">{String(scoreA).padStart(2, '0')}</span>
          <span className="victory-score-sep">—</span>
          <span className="victory-score-b">{String(scoreB).padStart(2, '0')}</span>
        </div>
        
        <div className="victory-team-rosters">
          <span className="roster-red glow-crimson">{teamAName}</span>
          <span className="roster-vs">VS</span>
          <span className="roster-blue glow-cyan">{teamBName}</span>
        </div>
        
        <div className="victory-subtitle">THE SYSTEM HAS ELECTED ITS SUPREME CONQUEROR</div>
        <div className="victory-click-hint heist-mono">TAP SCREEN TO BLAST EXTRA CONFETTI POPPERS</div>
      </div>

      {/* Mini Collapsible Spinning Vinyl Player */}
      <div className={`victory-mini-player-widget ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="victory-player-widget-brand heist-mono">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
            <div className="glowing-gold-dot animate-pulse" />
            <span>FINALE ANTHEM</span>
          </div>
          <button 
            className="victory-player-collapse-btn" 
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
          className="victory-player-widget-core"
          onClick={() => {
            if (isCollapsed) setIsCollapsed(false);
          }}
          style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
        >
          {/* Spinning Vinyl */}
          <div 
            className={`victory-vinyl-disc ${isSongPlaying ? 'spinning' : 'paused'} ${isCollapsed ? 'collapsed-vinyl' : ''}`}
            title={isCollapsed ? (isSongPlaying ? "Playing - Click to Expand" : "Paused - Click to Expand") : ""}
          >
            <div className="victory-vinyl-groove" />
            <div className="victory-vinyl-center" />
            {isCollapsed && (
              <div className="victory-collapsed-expand-hint heist-mono">＋</div>
            )}
          </div>

          {/* Details and Actions */}
          <div className="victory-player-widget-details">
            <div className="victory-song-title-wrapper heist-mono">
              <div className="victory-song-title-ticker">
                {songTitle}
              </div>
            </div>
            
            <div className="victory-player-widget-controls">
              <button 
                className="victory-control-btn victory-play-pause-btn heist-mono"
                onClick={togglePlay}
                title={isSongPlaying ? "Pause Anthem" : "Play Anthem"}
              >
                {isSongPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              
              <button 
                className="victory-control-btn victory-reset-btn heist-mono"
                onClick={resetPlay}
                title="Restart Anthem"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Round Tracker dots ─── */
const RoundTracker = ({ finaleResults, currentRound }) => {
  return (
    <div className="showdown-round-tracker">
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
        const result = finaleResults?.[i];
        let className = 'showdown-round-dot';
        if (result === 'a') className += ' won-a';
        else if (result === 'b') className += ' won-b';
        else if (i === currentRound) className += ' active';
        
        return (
          <React.Fragment key={i}>
            {i > 0 && <div className="showdown-round-line" />}
            <div className={className}>
              <span className="dot-label">R{i + 1}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const FinaleRoundTimer = ({ startTime, className = '' }) => {
  const [display, setDisplay] = useState('00:00');

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const ms = Date.now() - startTime;
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      setDisplay(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  if (!startTime) return null;
  return <span className={`showdown-timer-val ${className}`}>{display}</span>;
};

const restartAudioElement = (audio) => {
  if (!audio) return Promise.resolve();
  audio.currentTime = 0;
  return audio.play();
};

const FinaleAudioPlayer = ({ audioRef, songTitle }) => {
  const [isSongPlaying, setIsSongPlaying] = useState(true);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return undefined;

    const syncPlayback = () => setIsSongPlaying(!audio.paused);
    audio.addEventListener('play', syncPlayback);
    audio.addEventListener('pause', syncPlayback);
    syncPlayback();

    return () => {
      audio.removeEventListener('play', syncPlayback);
      audio.removeEventListener('pause', syncPlayback);
    };
  }, [audioRef, songTitle]);

  const togglePlay = () => {
    const audio = audioRef?.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play()
        .then(() => setIsSongPlaying(true))
        .catch(err => console.log("Finale audio play blocked:", err));
    } else {
      audio.pause();
      setIsSongPlaying(false);
    }
  };

  const resetPlay = () => {
    restartAudioElement(audioRef?.current)
      .then(() => setIsSongPlaying(true))
      .catch(err => console.log("Finale audio restart blocked:", err));
  };

  return (
    <div className="finale-audio-player heist-mono">
      <div className="finale-audio-title">
        <span>FINALE AUDIO</span>
        <strong>{songTitle}</strong>
      </div>
      <div className="finale-audio-controls">
        <button type="button" onClick={togglePlay}>{isSongPlaying ? 'PAUSE' : 'PLAY'}</button>
        <button type="button" onClick={resetPlay}>RESTART</button>
      </div>
    </div>
  );
};

/* ─── Main Finale Overlay ─── */
const FinaleOverlay = () => {
  const { gameState, user, myTeam } = useGameState();
  const finaleState = gameState?.finaleState;
  const {
    teamAName = 'HELSINKI',
    teamBName = 'RIO',
    finaleResults,
    currentRound = 0,
    currentDomain,
    finaleWinner,
    winsA = 0,
    winsB = 0,
    roundStartedAt,
    pendingDomain
  } = finaleState || {};

  const [shaking, setShaking] = useState(false);
  const [currentCaptionIdx, setCurrentCaptionIdx] = useState(0);
  const prevRoundRef = useRef(-1);
  const audioRef = useRef(null);
  const audioGraphRef = useRef(null);
  const isFinaleActive = Boolean(finaleState?.isFinaleActive);
  const songSrc = finaleWinner ? BELLA_CIAO_AUDIO_SRC : FINALE_AUDIO_SRC;
  const songTitle = finaleWinner ? BELLA_CIAO_AUDIO_TITLE : FINALE_AUDIO_TITLE;

  // Dynamic victory music amplification.
  useEffect(() => {
    if (!isFinaleActive || !audioRef.current) return;

    if (!finaleWinner) {
      if (audioGraphRef.current) {
        audioGraphRef.current.gainNode.gain.value = 1;
      }
      return;
    }

    try {
      if (!audioGraphRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          audioRef.current.volume = 1.0;
          return;
        }

        const audioCtx = new AudioContextClass();
        const sourceNode = audioCtx.createMediaElementSource(audioRef.current);
        const gainNode = audioCtx.createGain();
        sourceNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        audioGraphRef.current = { audioCtx, gainNode };
      }

      audioGraphRef.current.gainNode.gain.value = 1.75;
      if (audioGraphRef.current.audioCtx.state === 'suspended') {
        audioGraphRef.current.audioCtx.resume();
      }
    } catch (err) {
      console.log("Web Audio Context already initialized or blocked:", err);
      audioRef.current.volume = 1.0;
    }
  }, [finaleWinner, isFinaleActive]);

  // Load and replay audio when dynamic source changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .catch(e => console.log('Audio dynamic source play blocked:', e));
    }
  }, [songSrc]);

  const resolvedWinsA = winsA || 0;
  const resolvedWinsB = winsB || 0;
  const isFinalist = myTeam?.status === 'finalist';
  const bannerText = isFinalist
    ? 'FINALISTS LOCKED IN — SETTLE THE SCORE'
    : 'FINALE IN PROGRESS — SPECTATOR MODE';

  // Cycle footer captions
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentCaptionIdx(prev => (prev + 1) % DYNAMIC_CAPTIONS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  // Screen shake on round changes
  useEffect(() => {
    if (!finaleState?.isFinaleActive || user?.role === 'admin') {
      prevRoundRef.current = -1;
      return undefined;
    }
    if (currentRound !== prevRoundRef.current && currentRound > 0) {
      prevRoundRef.current = currentRound;
      const startTimeoutId = setTimeout(() => setShaking(true), 0);
      const stopTimeoutId = setTimeout(() => setShaking(false), 500);
      return () => {
        clearTimeout(startTimeoutId);
        clearTimeout(stopTimeoutId);
      };
    }
    return undefined;
  }, [currentRound, finaleState?.isFinaleActive, user?.role]);

  // Autoplay audio handler
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
    }
  }, []);

  if (!finaleState || !finaleState.isFinaleActive || user?.role === 'admin') return null;

  // Calculates score difference system with dual perspective
  const getScoreDifferenceUI = () => {
    const diff = resolvedWinsA - resolvedWinsB;
    let gap;
    let leadingTeam;
    
    const userIsTeamA = myTeam?.name === teamAName;
    const userIsTeamB = myTeam?.name === teamBName;
    
    if (isFinalist && (userIsTeamA || userIsTeamB)) {
      // Finalist perspective: gap is relative to the user's team
      gap = userIsTeamA ? diff : -diff;
      leadingTeam = myTeam.name;
    } else {
      // Spectator perspective: gap is positive, relative to the current leader
      gap = Math.abs(diff);
      leadingTeam = diff >= 0 ? teamAName : teamBName;
    }

    if (diff === 0) {
      return {
        cardClass: 'gap-even',
        header: "DEAD EVEN",
        title: "DEAD EVEN",
        description: "The next round decides fate."
      };
    }

    if (gap >= 3) {
      return {
        cardClass: 'gap-domination',
        header: `+${gap} ${leadingTeam} LEADS`,
        title: "TOTAL DOMINATION",
        description: "They are crushing the battlefield."
      };
    } else if (gap === 2) {
      return {
        cardClass: 'gap-control',
        header: `+${gap} ${leadingTeam} LEADS`,
        title: "CONTROL ESTABLISHED",
        description: "Momentum heavily favors them."
      };
    } else if (gap === 1) {
      return {
        cardClass: 'gap-narrow',
        header: `+${gap} ${leadingTeam} LEADS`,
        title: "NARROW ADVANTAGE",
        description: "One mistake changes everything."
      };
    } else if (gap === -1) {
      // trailing side: only active when user is a finalist trailing by 1
      return {
        cardClass: 'gap-pressure',
        header: `-${Math.abs(gap)} BEHIND`,
        title: "UNDER PRESSURE",
        description: "They are one round away from collapse."
      };
    } else {
      // trailing side: only active when user is a finalist trailing by 2 or more
      return {
        cardClass: 'gap-deficit',
        header: `-${Math.abs(gap)} BEHIND`,
        title: "CRITICAL DEFICIT",
        description: "Only a miracle comeback remains."
      };
    }
  };

  const scoreDiffData = getScoreDifferenceUI();

  return (
    <>
      <audio
        ref={audioRef}
        src={songSrc}
        loop
        autoPlay
      />
      {finaleWinner ? (
        <VictoryScreen
          winnerName={finaleWinner === 'a' ? teamAName : teamBName}
          scoreA={resolvedWinsA}
          scoreB={resolvedWinsB}
          teamAName={teamAName}
          teamBName={teamBName}
          audioRef={audioRef}
          songTitle={songTitle}
        />
      ) : (
        <div className={`finale-overlay ${shaking ? 'finale-shake' : ''}`}>
          
          {/* Cyberpunk Scanline Grid Ambient Filters */}
          <div className="showdown-ambient-cyber" />
          <div className="showdown-crt-flicker" />
          
          {/* TOP SPECTATOR BROADCAST BAR */}
          <header className="showdown-header-panel">
            <div className="broadcast-live-tag">
              <span className="live-dot" />
              <Radio size={12} className="broadcast-icon" />
              <span>{bannerText}</span>
            </div>
            
            <div className="broadcast-title-group">
              <h1 className="broadcast-main-title">THE ULTIMATE SHOWDOWN</h1>
              <p className="broadcast-subtitle">ONLY ONE WILL BE CROWNED VICTOR</p>
            </div>
            
            <div className="broadcast-format-capsule">
              <Activity size={12} className="format-pulse-icon" />
              <span>BO5 DEATHMATCH</span>
            </div>
          </header>

          {/* SPLIT BATTLEFIELD CONTAINER */}
          <main className="showdown-battlefield-grid">
            
            {/* LEFT SPLIT SCREEN: CRIMSON RED (HELSINKI) */}
            <section className="battlefield-side side-left-crimson">
              <div className="grid-overlay" />
              <div className="hologram-emblem-crimson" aria-hidden="true" />
              
              {/* Embers and Smoke Emitter */}
              <div className="ambient-ember-emitter">
                {EMBER_PARTICLES.map((particle, i) => (
                  <div key={i} className="ember-particle" style={particle} />
                ))}
              </div>

              {/* Roster & Formation */}
              <div className="soldier-formation-crimson">
                <div className="operator-shadow op-left-1" />
                <div className="operator-shadow op-left-2 op-leader" />
                <div className="operator-shadow op-left-3" />
              </div>

              {/* Roster Details */}
              <div className="battle-side-hud">
                <span className="side-hud-label">CRIMSON FORCE A</span>
                <h2 className="side-team-name-display text-glitch-red">{teamAName}</h2>
                <div className="side-score-panel text-neon-red">
                  {String(resolvedWinsA).padStart(2, '0')}
                </div>
              </div>
            </section>

            {/* EPIC CENTER COLLISION COMPONENT */}
            <div className="center-collision-anchor">
              <div className="collision-ring ring-cyan-fast" />
              <div className="collision-ring ring-crimson-slow" />
              <div className="collision-particle-blast" />
              
              <div className="showdown-vs-badge">
                <div className="vs-glow-backing" />
                <span className="vs-badge-text">VS</span>
              </div>
            </div>

            {/* RIGHT SPLIT SCREEN: ELECTRIC BLUE (RIO) */}
            <section className="battlefield-side side-right-neon">
              <div className="grid-overlay" />
              <div className="hologram-emblem-blue" aria-hidden="true" />

              {/* Cold Electric Smoke and Sparks Emitter */}
              <div className="ambient-spark-emitter">
                {SPARK_PARTICLES.map((particle, i) => (
                  <div key={i} className="spark-particle" style={particle} />
                ))}
              </div>

              {/* Roster & Formation */}
              <div className="soldier-formation-blue">
                <div className="operator-shadow op-right-1" />
                <div className="operator-shadow op-right-2 op-leader" />
                <div className="operator-shadow op-right-3" />
              </div>

              {/* Roster Details */}
              <div className="battle-side-hud">
                <span className="side-hud-label">NEON COLD B</span>
                <h2 className="side-team-name-display text-glitch-blue">{teamBName}</h2>
                <div className="side-score-panel text-neon-blue">
                  {String(resolvedWinsB).padStart(2, '0')}
                </div>
              </div>
            </section>
          </main>

          {/* LOWER INTERACTIVE HUB */}
          <footer className="showdown-hud-deck">
            <div className="hud-deck-container">
              
              {/* CURRENT LIVE DOMAIN CARD */}
              <div className="showdown-status-deck">
                {currentDomain ? (
                  <div className="hud-domain-card domain-live">
                    <div className="domain-hud-meta">LIVE ENVIRONMENT — ROUND {currentRound + 1}</div>
                    <div className="domain-hud-title">{currentDomain}</div>
                    {roundStartedAt && (
                      <div className="domain-hud-timer">
                        <span className="timer-hud-lbl">SECURE TIME</span>
                        <FinaleRoundTimer startTime={roundStartedAt} className="timer-hud-val" />
                      </div>
                    )}
                  </div>
                ) : pendingDomain ? (
                  <div className="hud-domain-card domain-pending">
                    <div className="domain-hud-meta">ENVIRONMENT STAGED</div>
                    <div className="domain-hud-title">{pendingDomain}</div>
                    <div className="domain-hud-subtext">AWAITING ADMIN COMMENCEMENT TRIGGER...</div>
                  </div>
                ) : (
                  <div className="hud-domain-card domain-awaiting">
                    <div className="domain-hud-meta">BROADCAST STANDBY</div>
                    <div className="domain-hud-title">AWAITING SELECTION</div>
                    <div className="domain-hud-subtext">System synchronizing tactical server slots...</div>
                  </div>
                )}
              </div>

              {/* MISSION SEGMENT ROUND DOTS */}
              <div className="hud-middle-deck">
                <RoundTracker finaleResults={finaleResults || []} currentRound={currentRound} />
                
                {/* DYNAMIC SCORE DIFFERENCE ADVANTAGE PANEL */}
                <div className={`score-advantage-hud-card ${scoreDiffData.cardClass}`}>
                  <div className="advantage-meta-glow" />
                  <div className="advantage-header">{scoreDiffData.header}</div>
                  <div className="advantage-title">{scoreDiffData.title}</div>
                  <div className="advantage-desc">{scoreDiffData.description}</div>
                </div>
              </div>

            </div>

            {/* CINEMATIC TICKER CAPTION STRIP */}
            <div className="showdown-ticker-ribbon">
              <div className="ticker-capsule">
                <ShieldAlert size={14} className="ticker-alert-icon" />
                <span className="ticker-message">{DYNAMIC_CAPTIONS[currentCaptionIdx]}</span>
              </div>
            </div>
          </footer>

          <FinaleAudioPlayer audioRef={audioRef} songTitle={songTitle} />
        </div>
      )}
    </>
  );
};

export default FinaleOverlay;
