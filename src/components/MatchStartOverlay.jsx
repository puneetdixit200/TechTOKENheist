import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import './MatchStartOverlay.css';

const START_DURATION_MS = 10_000;
const EXIT_DURATION_MS = 700;
const loadingVideoModules = import.meta.glob('../../assets/techtoken-loading.{mp4,webm}', {
  eager: true,
  import: 'default',
});
const LOADING_VIDEO_SOURCES = Object.entries(loadingVideoModules)
  .map(([path, src]) => ({
    src,
    type: path.endsWith('.webm') ? 'video/webm' : 'video/mp4',
  }))
  .sort((a, b) => (a.type === 'video/mp4' ? -1 : 1) - (b.type === 'video/mp4' ? -1 : 1));

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
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);
  const activeRef = useRef(false);
  const countdownKeyRef = useRef(null);
  const videoSource = LOADING_VIDEO_SOURCES[0] || null;

  const resetOverlay = () => {
    activeRef.current = false;
    setActive(false);
    setIsFinished(false);
    setTimer(10);
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

    countdownKeyRef.current = countdownKey;
    activeRef.current = true;
    setActive(true);
    setIsFinished(false);

    const tick = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, targetTime - now);

      setTimer(Math.max(0, remainingMs / 1000));

      if (remainingMs <= 0 && now - targetTime >= EXIT_DURATION_MS) {
        activeRef.current = false;
        setIsFinished(true);
        setActive(false);
        cancelAnimationFrame(timerRef.current);
        return;
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [gameState.countdownDurationMs, gameState.countdownStartedAt, gameState.gameStartedAt, gameState.isGameActive, gameState.status]);

  useEffect(() => () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, []);

  if (!active || isFinished) return null;

  return (
    <div className="match-start-overlay">
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

      <div className="void-countdown-shell">
        <div className="loading-kicker">TECHTOKEN HEIST</div>
        <div className="timer-value">{Math.ceil(timer)}</div>
        <div className="timer-caption">MATCH STARTS IN</div>
      </div>
    </div>
  );
};

export default MatchStartOverlay;
