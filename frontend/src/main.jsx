import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './hooks/useLanguage'
import { KidsModeProvider } from './hooks/useKidsMode'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <KidsModeProvider>
        <App />
      </KidsModeProvider>
    </LanguageProvider>
  </StrictMode>,
)
