import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app';
import './theme/main.scss';

patchConsoleWarn();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <CssBaseline>
      <App />
    </CssBaseline>
  </React.StrictMode>,
);

/**
 * Silence a warning message printed by Cytoscape.
 */
function patchConsoleWarn(): void {
  const WARNING_TO_SUPPRESS = 'You have set a custom wheel sensitivity.';

  const originalConsoleWarnFn = console.warn;

  console.warn = (...data: unknown[]): void => {
    if (
      typeof data[0] === 'string' &&
      data[0].startsWith(WARNING_TO_SUPPRESS)
    ) {
      // `console.warn()` has been called with the message we want to silence? --> Do not print anything to the console.
      return;
    }

    // Call the original warning function so that developers can use `console.warn()` like they are used to.
    originalConsoleWarnFn(...data);
  };
}
