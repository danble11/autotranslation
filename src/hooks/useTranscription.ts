import { useState, useRef } from 'react';

type TranscriptPair = { original: string; translated?: string };

export const useTranscription = (language: string, targetLang: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptPair[]>([]);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptionStartRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const ws = new WebSocket(import.meta.env.VITE_WS_URL);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ languageCode: language, targetLang }));
        source.connect(processor);
        processor.connect(audioContext.destination);
        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const pcm = float32ToInt16(input);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcm);
          }
        };
      };

      ws.onerror = () => {
        alert('WebSocket接続に失敗しました。URLをご確認ください');
        stopRecording();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('受信:', data);
        if (data.transcript) {
          if (transcriptionStartRef.current === null) {
            transcriptionStartRef.current = Date.now();
          }

          const elapsed = Date.now() - transcriptionStartRef.current;

          if (data.isFinal) {
            const sentences = data.transcript.split(/(?<=[。！？.!?])\s*/);
            for (const sentence of sentences) {
              if (sentence.trim() === '') continue;
              setTranscripts((prev) => [
                ...prev,
                { original: sentence.trim(), translated: data.translation?.trim() || '(翻訳なし)'},
              ]);
            }
            setInterimTranscript('');
            transcriptionStartRef.current = null;
          } else if (elapsed >= 500) {
            setInterimTranscript(data.transcript.trim());
          }
        }

        if (data.audioBase64) {
          setAudioQueue((q) => [...q, data.audioBase64]);
        }
      };

      setTranscripts([]);
      setIsRecording(true);
    } catch {
      alert('マイクの使用が許可されていません。設定をご確認ください');
    }
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    wsRef.current?.close();
    setIsRecording(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    transcripts,
    interimTranscript,
    audioQueue,
    setAudioQueue,
  };
};

function float32ToInt16(buffer: Float32Array) {
  const result = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return result.buffer;
}

