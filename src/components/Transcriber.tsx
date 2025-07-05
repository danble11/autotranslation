import React, { useEffect, useRef, useState } from 'react';

const CLOUD_RUN_WS_URL = 'wss://realtime-speech-backend-613532060585.asia-northeast1.run.app/';

type TranscriptPair = {
  original: string;
  translated?: string;
};

const Transcriber = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('ja-JP');
  const [targetLang, setTargetLang] = useState('en');
  const [transcripts, setTranscripts] = useState<TranscriptPair[]>([]);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const ws = new WebSocket(CLOUD_RUN_WS_URL);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onerror = () => {
        alert('WebSocket接続に失敗しました。Cloud RunのURLを確認してください。');
        stopRecording();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcript) {
          const sentences = data.transcript.split(/(?<=[。！？.!?])\s*/);
          for (const sentence of sentences) {
            if (sentence.trim() === '') continue;
            setTranscripts((prev) => [
              ...prev,
              { original: sentence.trim(), translated: data.translation?.trim() || '' },
            ]);
          }
        }

        if (data.audioBase64) {
          setAudioQueue((prev) => [...prev, data.audioBase64]);
        }
      };

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

      setTranscripts([]);
      setIsRecording(true);
    } catch (err) {
      alert('マイクの使用が許可されていません。ブラウザの設定をご確認ください。');
    }
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    wsRef.current?.close();
    setIsRecording(false);
  };

  const downloadText = () => {
    const content = transcripts
      .map(({ original, translated }) => `原文: ${original}\n訳文: ${translated || ''}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 音声の再生処理
  useEffect(() => {
    if (audioQueue.length === 0 || isPlayingRef.current) return;

    const next = audioQueue[0];
    const audio = new Audio(`data:audio/mp3;base64,${next}`);
    isPlayingRef.current = true;

    audio.play().catch((err) => {
      console.error('音声再生エラー:', err);
      isPlayingRef.current = false;
    });

    audio.onended = () => {
      setAudioQueue((q) => q.slice(1));
      isPlayingRef.current = false;
    };
  }, [audioQueue]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>🎤 リアルタイム文字起こし＋翻訳＋音声出力</h1>

      <label>
        言語を選択：
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: '0.5rem' }}>
          <option value="ja-JP">日本語</option>
          <option value="en-US">英語（アメリカ）</option>
          <option value="es-ES">スペイン語</option>
          <option value="zh-CN">中国語（簡体）</option>
        </select>
      </label>

      <label style={{ marginLeft: '1rem' }}>
        翻訳先：
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{ marginLeft: '0.5rem' }}>
          <option value="en">英語</option>
          <option value="ja">日本語</option>
          <option value="es">スペイン語</option>
          <option value="zh">中国語（簡体）</option>
        </select>
      </label>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? '停止' : '録音開始'}
        </button>
        <button onClick={() => navigator.clipboard.writeText(transcripts.map(t => `${t.original}\n${t.translated}`).join('\n\n'))} disabled={!transcripts.length}>
          コピー
        </button>
        <button onClick={downloadText} disabled={!transcripts.length}>
          ダウンロード
        </button>
      </div>

      <div style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
        {transcripts.length === 0 ? (
          'ここに文字起こしと翻訳結果が表示されます'
        ) : (
          transcripts.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>原文：</strong>
              <div>{item.original}</div>
              {item.translated && (
                <>
                  <strong>訳文：</strong>
                  <div>{item.translated}</div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function float32ToInt16(buffer: Float32Array) {
  const l = buffer.length;
  const result = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return result.buffer;
}

export default Transcriber;
