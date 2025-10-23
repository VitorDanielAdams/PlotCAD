/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_TITLE: string;
  readonly VITE_API_URL: string;
	readonly VITE_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}