import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app';
import './theme/main.scss';

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
