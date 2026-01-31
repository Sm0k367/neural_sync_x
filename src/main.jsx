import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// This ensures the React DOM only attempts to render once the root element is present.
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: 'root' element not found in index.html");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
