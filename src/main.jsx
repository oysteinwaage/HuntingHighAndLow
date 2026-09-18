import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './styles/global.scss'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'

const theme = createTheme({
  primaryColor: 'forest',
  colors: {
    forest: [
      '#f1f6ee',
      '#dfe9d8',
      '#c0d3b3',
      '#9ebb8b',
      '#80a568',
      '#6b954f',
      '#558040',
      '#35502b',
      '#293f21',
      '#1f2e1a',
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
