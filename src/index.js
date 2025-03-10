import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
// Import i18n configuration
import './shared/utils/i18n';

// Get the publishable key from environment variables
const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Check if the key is available
if (!publishableKey) {
  throw new Error("Missing Publishable Key");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);