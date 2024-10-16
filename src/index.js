import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RowndProvider } from '@rownd/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RowndProvider appKey="key_vvltstc6c3c2wurliw5eaie0">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </RowndProvider>
);
