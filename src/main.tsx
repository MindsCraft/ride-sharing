import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@sarap422/font-overused-grotesk/font-face.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
