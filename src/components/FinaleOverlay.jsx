import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Trophy, Activity, Radio, ShieldAlert } from 'lucide-react';
import './FinaleOverlay.css';

const TOTAL_ROUNDS = 5;

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
const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 3.37) % 100}%`,
  animationDelay: `${(i * 0.11) % 3}s`,
  animationDuration: `${2 + ((i * 0.23) % 3)}s`
}));

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

/* ─── Confetti Particles for Victory ─── */
const ConfettiParticles = () => (
  <div className="victory-confetti">
    {CONFETTI_PIECES.map((piece, i) => (
      <div key={i} className="victory-confetti-piece" style={piece} />
    ))}
  </div>
);

/* ─── Victory Screen ─── */
const VictoryScreen = ({ winnerName, scoreA, scoreB, teamAName, teamBName, audioRef, songTitle }) => {
  const [show, setShow] = useState(false);
  const [isSongPlaying, setIsSongPlaying] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (audioRef && audioRef.current) {
      setIsSongPlaying(!audioRef.current.paused);
    }
  }, [audioRef]);

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
    <div className="finale-victory-overlay" style={{ opacity: show ? 1 : 0, transition: 'opacity 1s ease-in' }}>
      <div className="victory-bg-burst" />
      <div className="victory-flare" />
      <div className="victory-rings" />
      <ConfettiParticles />
      <div className="finale-scanlines" />

      <div className="victory-crown-emblem">
        <Trophy size={96} className="victory-trophy-icon" />
      </div>
      <div className="victory-title">CHAMPION CROWNED</div>
      <div className="victory-winner-name">{winnerName}</div>
      <div className="victory-score">
        <span className="victory-score-a">{String(scoreA).padStart(2, '0')}</span>
        <span className="victory-score-sep">—</span>
        <span className="victory-score-b">{String(scoreB).padStart(2, '0')}</span>
      </div>
      <div className="victory-team-rosters">
        <span className="roster-red">{teamAName}</span>
        <span className="roster-vs">VS</span>
        <span className="roster-blue">{teamBName}</span>
      </div>
      <div className="victory-subtitle">THE SYSTEM HAS ELECTED ITS SUPREME CONQUEROR</div>

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
  const [songSrc, setSongSrc] = useState(new URL('../../assets/finale.mp3', import.meta.url).href);
  const [songTitle, setSongTitle] = useState("FINALE — THE SYSTEM'S LAST HYMN");
  const isAmplifiedRef = useRef(false);

  // Dynamic victory music switch effect
  useEffect(() => {
    if (!finaleState || !finaleState.isFinaleActive) return;

    if (finaleWinner) {
      // 1. Switch to Bella Ciao
      const bellaCiaoUrl = new URL('../../assets/Bella Ciao.mp3', import.meta.url).href;
      setSongSrc(bellaCiaoUrl);
      setSongTitle("BELLA CIAO — CHAMPIONSHIP ANTHEM");

      // 2. Set volume amplification to 175%
      if (audioRef.current && !isAmplifiedRef.current) {
        isAmplifiedRef.current = true;
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const sourceNode = audioCtx.createMediaElementSource(audioRef.current);
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 1.75;
            sourceNode.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            if (audioCtx.state === 'suspended') {
              audioCtx.resume();
            }
          }
        } catch (err) {
          console.log("Web Audio Context already initialized or blocked:", err);
          audioRef.current.volume = 1.0;
        }
      }
    } else {
      // Reset source when active but not won
      const finaleUrl = new URL('../../assets/finale.mp3', import.meta.url).href;
      setSongSrc(finaleUrl);
      setSongTitle("FINALE — THE SYSTEM'S LAST HYMN");
    }
  }, [finaleWinner, finaleState?.isFinaleActive]);

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
              <div className="hologram-emblem-crimson">★</div>
              
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
              <div className="hologram-emblem-blue">🐺</div>

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

        </div>
      )}
    </>
  );
};

export default FinaleOverlay;
