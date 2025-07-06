// hooks/useAudioPlayer.ts
import { useEffect, useRef } from 'react';

export const useAudioPlayer = (audioQueue: string[], setAudioQueue: (q: string[]) => void) => {
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!audioQueue.length || isPlayingRef.current) return;

    const next = audioQueue[0];
    const audio = new Audio(`data:audio/mp3;base64,${next}`);
    isPlayingRef.current = true;

    audio.play().catch(() => {
      isPlayingRef.current = false;
    });

    audio.onended = () => {
      setAudioQueue(audioQueue.slice(1));
      isPlayingRef.current = false;
    };
  }, [audioQueue]);
};