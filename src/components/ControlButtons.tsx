import React from 'react';

interface Props {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcripts: { original: string; translated?: string }[];
}

const ControlButtons: React.FC<Props> = ({ isRecording, startRecording, stopRecording, transcripts }) => {
  const downloadText = () => {
    const content = transcripts.map(({ original, translated }) => `原文: ${original}\n訳文: ${translated || ''}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? '停止' : '録音開始'}
      </button>
      <button
        onClick={() =>
          navigator.clipboard.writeText(
            transcripts.map((t) => `${t.original}\n${t.translated}`).join('\n\n')
          )
        }
        disabled={!transcripts.length}
      >
        コピー
      </button>
      <button onClick={downloadText} disabled={!transcripts.length}>
        ダウンロード
      </button>
    </div>
  );
};

export default ControlButtons;