import React, { useState } from 'react';
import { useTranscription } from './hooks/useTranscription';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import LanguageSelector from './components/LanguageSelector';
import ControlButtons from './components/ControlButtons';
import TranscriptDisplay from './components/TranscriptDisplay';
import InterimDisplay from './components/InterimDisplay';

const Transcriber = () => {
  const [language, setLanguage] = useState('ja-JP');
  const [targetLang, setTargetLang] = useState('en');

  const {
    isRecording,
    startRecording,
    stopRecording,
    transcripts,
    interimTranscript,
    audioQueue,
    setAudioQueue,
  } = useTranscription(language, targetLang);

  useAudioPlayer(audioQueue, setAudioQueue);

  return (
    <div style={{
      padding: '1rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontSize: '1.1rem',
      backgroundColor: '#ffffff',
      color: '#000000',
      lineHeight: '1.6',
    }}>
      <h1　style={{ fontSize: '1.5rem' }}>Re:connect</h1>
      <section
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
        aria-label="言語選択セクション"
      >
        <h2 style={{ fontSize: '1.2rem' }}>🌐 言語設定</h2>
        <LanguageSelector
          language={language}
          setLanguage={setLanguage}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
        />
      </section>

      <section
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
        aria-label="操作セクション"
      >
        <h2 style={{ fontSize: '1.2rem' }}>🎮 録音コントロール</h2>
        <ControlButtons
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          transcripts={transcripts}
        />
        <div aria-live="polite" style={{ marginTop: '0.5rem' }}>
          {audioQueue.length > 0 ? (
            <p>🔊 音声出力中（残り {audioQueue.length}）</p>
          ) : (
            <p>🟢 音声出力はありません</p>
          )}
        </div>
      </section>

      <section
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
        aria-label="リアルタイム文字表示セクション"
      >
        <h2 style={{ fontSize: '1.2rem' }}>📡 現在の認識中テキスト</h2>
        <InterimDisplay interim={interimTranscript} />
      </section>

      <section
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
        aria-label="確定文字表示セクション"
      >
        <h2 style={{ fontSize: '1.2rem' }}>📝 確定テキストと翻訳結果</h2>
        <TranscriptDisplay transcripts={transcripts} />
      </section>
    </div>
  );
};

export default Transcriber;