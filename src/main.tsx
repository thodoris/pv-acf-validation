import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Verbatim from the prototype (frozen in docs/reference-prototype/). The visual register
// is approved as-is; do not refactor these files without explicit sign-off.
import './styles/styles.css';
import './styles/styles-phase-a.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Mount point #root not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
