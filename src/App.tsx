import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ConfigProvider, loadConfig, type AppConfig } from './config';
import { ConfigError, HomePage, NotFoundPage } from './pages';
import Shell from './Shell';

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadConfig().then(setConfig, () => setFailed(true));
  }, []);

  if (failed) {
    return <ConfigError />;
  }

  if (config === null) {
    return null;
  }

  return (
    <ConfigProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
