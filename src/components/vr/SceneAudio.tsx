// SceneAudio.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface SceneAudioProps {
  audioUrl: string;
}

export default function SceneAudio({ audioUrl }: SceneAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.src = audioUrl;
    if (playing) audioEl.play().catch(() => setPlaying(false));
  }, [audioUrl]);
  console.log(audioUrl)

  return (
    <>
      {/* Hidden audio element that doesn't affect layout */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <audio ref={audioRef} loop />
      </div>

      {/* Toggle button */}
      <button
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          if (el.paused) {
            el.play();
            setPlaying(true);
          } else {
            el.pause();
            setPlaying(false);
          }
        }}
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        {playing ? '🔊 Đang phát' : '🔇 Tạm dừng'}
      </button>
    </>
  );
}
