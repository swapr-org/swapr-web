import { createContext, useContext, type ReactNode } from 'react';

export type Environment = 'local' | 'qa' | 'prod';

export interface AppConfig {
  environment: Environment;
  supabaseUrl: string;
  supabaseAnonKey: string;
  userServiceUrl: string;
}

const environments: readonly string[] = ['local', 'qa', 'prod'];
const keys = ['environment', 'supabaseUrl', 'supabaseAnonKey', 'userServiceUrl'] as const;

function isAppConfig(value: unknown): value is AppConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    keys.every((key) => typeof record[key] === 'string' && record[key] !== '') &&
    environments.includes(record.environment as string)
  );
}

export async function loadConfig(): Promise<AppConfig> {
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error(`Config request failed with status ${response.status}`);
  }
  const body: unknown = await response.json();
  if (!isAppConfig(body)) {
    throw new Error('Config is missing a key or has an invalid value');
  }
  return {
    environment: body.environment,
    supabaseUrl: body.supabaseUrl,
    supabaseAnonKey: body.supabaseAnonKey,
    userServiceUrl: body.userServiceUrl,
  };
}

const ConfigContext = createContext<AppConfig | null>(null);

export function ConfigProvider({ config, children }: { config: AppConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): AppConfig {
  const config = useContext(ConfigContext);
  if (config === null) {
    throw new Error('useConfig must be used inside ConfigProvider');
  }
  return config;
}
