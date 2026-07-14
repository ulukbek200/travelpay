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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setProgress(0);
    setHasVideoError(false);
    setIsPlaying(true);
    setIsMuted(true);
  }, [content.video]);

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

    setProgress((video.currentTime / video.duration) * 100);
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
            autoPlay
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
