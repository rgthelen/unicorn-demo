import React from 'react';
import { createRoot } from 'react-dom/client';
import { RowndProvider } from '@rownd/react';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RowndProvider appKey="key_vvltstc6c3c2wurliw5eaie0">
      <App />
    </RowndProvider>
  </React.StrictMode>
);
