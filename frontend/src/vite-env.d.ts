/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEEDBACK_API_URL?: string;
  readonly NEXT_PUBLIC_FEEDBACK_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
