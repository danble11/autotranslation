import React from 'react';

interface TranscriptPair {
  original: string;
  translated?: string;
}

interface Props {
  transcripts: TranscriptPair[];
}

const TranscriptDisplay: React.FC<Props> = ({ transcripts }) => (
  <div style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem' }}>
    {transcripts.map((item, idx) => (
  <div key={idx} style={{ marginBottom: '1rem' }}>
    <strong>原文：</strong>
    <div>{item.original}</div>
    <strong>訳文：</strong>
    <div>{item.translated ?? '（訳文なし）'}</div>
  </div>
))}
  </div>
);

export default TranscriptDisplay;