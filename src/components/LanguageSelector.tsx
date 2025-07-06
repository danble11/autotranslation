import React from 'react';

interface Props {
  language: string;
  setLanguage: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

const LanguageSelector: React.FC<Props> = ({ language, setLanguage, targetLang, setTargetLang }) => (
  <div>
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
  </div>
);

export default LanguageSelector;