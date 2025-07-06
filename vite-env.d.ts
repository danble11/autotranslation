// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WS_URL: string;
    // 他の変数があればここに追加
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  