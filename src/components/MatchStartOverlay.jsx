import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import './MatchStartOverlay.css';

const START_DURATION_MS = 10_000;
const EXIT_DURATION_MS = 1_400;
const loadingVideoModules = import.meta.glob([
  '../../assets/**/*.{mp4,webm,mov,m4v}',
  '../../*.{mp4,webm,mov,m4v}',
], {
  eager: true,
  import: 'default',
});

const VIDEO_NAME_PATTERN = /(tech[-_\s]*token|techtoken|loading|loader|countdown|heist)/i;
const loadingVideoEntries = Object.entries(loadingVideoModules);
const preferredVideoEntries = loadingVideoEntries.filter(([path]) => VIDEO_NAME_PATTERN.test(path));
const getVideoPriority = (path) => {
  const lowerPath = path.toLowerCase();
  let priority = 0;
  if (lowerPath.includes('techtoken') || lowerPath.includes('tech-token') || lowerPath.includes('tech_token')) priority += 6;
  if (lowerPath.includes('loading') || lowerPath.includes('loader')) priority += 5;
  if (lowerPath.includes('countdown')) priority += 3;
  if (lowerPath.endsWith('.mp4')) priority += 2;
  if (lowerPath.endsWith('.webm')) priority += 1;
  return priority;
};
const getVideoType = (path) => (path.endsWith('.webm') ? 'video/webm' : 'video/mp4');
const LOADING_VIDEO_SOURCES = (preferredVideoEntries.length > 0 ? preferredVideoEntries : loadingVideoEntries)
  .sort(([pathA], [pathB]) => getVideoPriority(pathB) - getVideoPriority(pathA))
  .map(([path, src]) => ({
    src,
    type: getVideoType(path),
  }));

const toMillis = (value) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const asNumber = Number(trimmed);
      return Number.isNaN(asNumber) ? null : asNumber;
    }
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const MatchStartOverlay = () => {
  const { gameState } = useGameState();
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(10);
  const [phase, setPhase] = useState(0);
  const [isTearing, setIsTearing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [timerPulse, setTimerPulse] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const activeRef = useRef(false);
  const audioPlayedRef = useRef(false);
  const flashPlayedRef = useRef(false);
  const timerPulseRef = useRef(false);
  const pendingTimeoutsRef = useRef([]);
  const countdownKeyRef = useRef(null);
  const videoSource = LOADING_VIDEO_SOURCES[0] || null;

  const clearPendingTimeouts = () => {
    pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
    pendingTimeoutsRef.current = [];
  };

  const scheduleTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    pendingTimeoutsRef.current.push(id);
  };

  const resetOverlay = () => {
    activeRef.current = false;
    setActive(false);
    setIsFinished(false);
    setIsTearing(false);
    setShowAnnouncement(true);
    setShowSubtitles(false);
    setFlashActive(false);
    setTimerPulse(false);
    setPhase(0);
    setTimer(10);
    audioPlayedRef.current = false;
    flashPlayedRef.current = false;
    timerPulseRef.current = false;
  };

  useEffect(() => {
    const isCountdownStarting = gameState.status === 'starting';
    const countdownStartedAt = toMillis(gameState.countdownStartedAt);
    const countdownDurationMs = Number(gameState.countdownDurationMs) || START_DURATION_MS;
    const targetTime = toMillis(gameState.gameStartedAt) || (countdownStartedAt ? countdownStartedAt + countdownDurationMs : null);
    const countdownKey = `${countdownStartedAt || 'none'}:${targetTime || 'none'}:${countdownDurationMs}`;

    if (!isCountdownStarting || !countdownStartedAt || !targetTime) {
      if (!gameState.isGameActive && !activeRef.current) {
        countdownKeyRef.current = null;
        resetOverlay();
      }
      return;
    }

    if (countdownKeyRef.current === countdownKey) return;

    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    clearPendingTimeouts();

    countdownKeyRef.current = countdownKey;
    activeRef.current = true;
    audioPlayedRef.current = false;
    flashPlayedRef.current = false;
    timerPulseRef.current = false;
    setActive(true);
    setIsFinished(false);
    setIsTearing(false);
    setShowAnnouncement(true);
    setShowSubtitles(false);
    setFlashActive(false);
    setTimerPulse(false);
    setPhase(0);

    const tick = () => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - countdownStartedAt);
      const remainingMs = Math.max(0, targetTime - now);
      const progress = Math.min(1, elapsedMs / Math.max(1, countdownDurationMs));

      setTimer(Math.max(0, remainingMs / 1000));
      setShowAnnouncement(progress < 0.42);
      setShowSubtitles(progress >= 0.36);

      if (progress >= 0.38 && !audioPlayedRef.current) {
        audioPlayedRef.current = true;
        audioRef.current?.play().catch((error) => console.log('Audio play blocked', error));
      }

      if (progress >= 0.42 && !flashPlayedRef.current) {
        flashPlayedRef.current = true;
        setFlashActive(true);
        scheduleTimeout(() => setFlashActive(false), 700);
      }

      if (progress >= 0.72 && !timerPulseRef.current) {
        timerPulseRef.current = true;
        setTimerPulse(true);
      }

      if (progress >= 0.72) {
        setPhase(2);
      } else if (progress >= 0.42) {
        setPhase(1);
      } else {
        setPhase(0);
      }

      if (remainingMs <= 0) {
        setIsTearing(true);
        setTimer(0);

        if (now - targetTime >= EXIT_DURATION_MS) {
          activeRef.current = false;
          setIsFinished(true);
          setActive(false);
          setShowSubtitles(false);
          setShowAnnouncement(false);
          cancelAnimationFrame(timerRef.current);
          return;
        }
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [gameState.countdownDurationMs, gameState.countdownStartedAt, gameState.gameStartedAt, gameState.isGameActive, gameState.status]);

  useEffect(() => () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    clearPendingTimeouts();
  }, []);

  if (!active || isFinished) return null;

  return (
    <div className={`match-start-overlay infinite-void ${videoSource ? 'has-loading-video' : 'has-image-fallback'} ${isTearing ? 'tearing' : ''} ${phase === 2 ? 'void-mode' : ''} ${timerPulse ? 'pulse-timer' : ''}`}>
      <audio ref={audioRef} src={new URL('../../assets/anant.mp3', import.meta.url).href} />

      <div className="background-container" aria-hidden="true" />
      {videoSource && (
        <video
          className="loading-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={videoSource.src} type={videoSource.type} />
        </video>
      )}
      <div className="overlay" />
      <div className={`flash-screen ${flashActive ? 'flash-animation' : ''}`} />
      <div className="void-aura aura-left" />
      <div className="void-aura aura-right" />
      <div className="infinite-void-ring ring-one" />
      <div className="infinite-void-ring ring-two" />
      <div className="infinite-void-ring ring-three" />

      <div className="tear-wrapper">
        <div className="tear-part tear-left" />
        <div className="tear-part tear-right" />

        <div className="content-container void-countdown-shell">
          <div className={`announcement ${showAnnouncement ? 'visible' : ''}`}>
            LIMITLESS COUNTDOWN
          </div>

          <div className="void-eye-mark" aria-hidden="true">
            <span />
            <span />
          </div>

          <div className="timer-container">
            <div className={`timer-value ${phase >= 1 ? 'glitch' : ''}`}>{Math.ceil(timer)}</div>
            <div className="timer-caption">SECONDS UNTIL BREACH</div>
          </div>

          <div className={`subtitles ${showSubtitles ? 'visible' : ''}`}>
            {phase === 1 && (
              <div className="subtitle-phase phase-1" key="phase-1">
                <div className="english">DOMAIN EXPANSION</div>
                <div className="translation">LIMITLESS TECHNIQUE DEPLOYING</div>
              </div>
            )}
            {phase === 2 && (
              <div className="subtitle-phase phase-2" key="phase-2">
                <div className="english">ANANT SHUNYATA</div>
                <div className="translation">INFINITE VOID</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchStartOverlay;
