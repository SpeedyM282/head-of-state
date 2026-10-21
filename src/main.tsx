import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initPersistence } from './store/persistence';
import { initNativeShell } from './ui/nativeShell';
import './index.css';

// Stores read their saved state when their modules load, so storage must be hydrated before
// App (and with it every store) is imported.
async function boot(): Promise<void> {
  await initPersistence();
  initNativeShell();
  const { App } = await import('./App');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void boot();
