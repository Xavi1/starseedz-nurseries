import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Failed to find the root element');

// Create a root
const root = createRoot(rootElement);

// Render the app
root.render(<App />);