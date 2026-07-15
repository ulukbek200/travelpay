import React, { useEffect, useRef, useState } from 'react';
import {
  FullscreenOutlined,
  MutedOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  SoundOutlined,
} from '@ant-design/icons';

const getVideoSources = (src) => {
  if (src?.toLowerCase().endsWith('.mov')) {
    return [
      { src, type: 'video/mp4' },
      { src, type: 'video/quicktime' },
    ];
  }

  return [{ src, type: 'video/mp4' }];
};

const AboutVideoPanel = ({ content }) => {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const progressFrameRef = useRef(null);
  const nextProgressRef = useRef(0);
  const autoPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setProgress(0);
    setHasVideoError(false);
    setIsPlaying(true);
    setIsMuted(true);
    autoPausedRef.current = false;
  }, [content.video]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return undefined;
    }

    const node = frameRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '240px 0px', threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasVideoError) {
      return;
    }

    if (!isInView) {
      if (!video.paused) {
        autoPausedRef.current = true;
        video.pause();
      }
      return;
    }

    if (isPlaying || autoPausedRef.current) {
      autoPausedRef.current = false;
      video.play().catch(() => setIsPlaying(false));
    }
  }, [hasVideoError, isInView, isPlaying, content.video]);

  useEffect(() => () => {
    if (progressFrameRef.current) {
      window.cancelAnimationFrame(progressFrameRef.current);
    }
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video || hasVideoError) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    } else {
      autoPausedRef.current = false;
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video?.duration) {
      setProgress(0);
      return;
    }

    nextProgressRef.current = (video.currentTime / video.duration) * 100;

    if (!progressFrameRef.current) {
      progressFrameRef.current = window.requestAnimationFrame(() => {
        progressFrameRef.current = null;
        setProgress(nextProgressRef.current);
      });
    }
  };

  const handleSeek = (event) => {
    const video = videoRef.current;

    if (!video?.duration) {
      return;
    }

    const value = Number(event.target.value);
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  const openFullscreen = () => {
    const frame = frameRef.current;

    if (frame?.requestFullscreen) {
      frame.requestFullscreen();
    }
  };

  return (
    <figure className="about-video-panel">
      <div className="about-video-panel__frame" ref={frameRef}>
        {!hasVideoError && (
          <video
            autoPlay={isInView}
            key={content.video}
            loop
            muted={isMuted}
            onCanPlay={() => setHasVideoError(false)}
            onError={() => {
              setHasVideoError(true);
              setIsPlaying(false);
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            poster={content.poster}
            preload="metadata"
            ref={videoRef}
          >
            {getVideoSources(content.video).map((source) => (
              <source key={source.type} src={source.src} type={source.type} />
            ))}
          </video>
        )}

        {hasVideoError && (
          <div
            className="about-video-panel__fallback"
            style={{ backgroundImage: `url(${content.poster})` }}
          >
            <span>{content.fallbackTitle}</span>
            <p>{content.fallbackText}</p>
          </div>
        )}

        {!hasVideoError && (content.videoLabel || content.videoSubtitle) && (
          <div className="about-video-panel__badge" aria-hidden="true">
            {content.videoLabel && <span>{content.videoLabel}</span>}
            {content.videoSubtitle && <strong>{content.videoSubtitle}</strong>}
          </div>
        )}

        {!hasVideoError && (
          <>
            <button
              aria-label={isPlaying ? 'Поставить видео на паузу' : 'Воспроизвести видео'}
              className="about-video-panel__play"
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
            </button>

            <div className="about-video-panel__controls" aria-label="Управление видео">
              <button
                aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                className="about-video-panel__icon-button"
                onClick={toggleMute}
                type="button"
              >
                {isMuted ? <MutedOutlined /> : <SoundOutlined />}
              </button>

              <input
                aria-label="Прогресс видео"
                aria-valuetext={`${Math.round(progress)}%`}
                className="about-video-panel__progress"
                max="100"
                min="0"
                onChange={handleSeek}
                style={{ '--video-progress': `${progress}%` }}
                type="range"
                value={progress}
              />

              <button
                aria-label="Открыть видео на весь экран"
                className="about-video-panel__icon-button"
                onClick={openFullscreen}
                type="button"
              >
                <FullscreenOutlined />
              </button>
            </div>
          </>
        )}
      </div>
      <figcaption className="about-video-panel__caption">{content.caption}</figcaption>
    </figure>
  );
};

export default AboutVideoPanel;
