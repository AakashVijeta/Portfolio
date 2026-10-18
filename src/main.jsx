import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes.css'
import './styles/sections.css'
import './styles/Global.css'
import './styles/flow.css'
import './styles/desktop.css'
import './styles/mobile.css'
// After mobile.css: the shared hero/contact composition overrides generic section rules
import './styles/hero-contact.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
