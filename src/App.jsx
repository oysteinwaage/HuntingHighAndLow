import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { AdminPage } from './pages/AdminPage'
import { ErfaringerPage } from './pages/ErfaringerPage'
import { HandlelistePage } from './pages/HandlelistePage'
import { PakkelistePage } from './pages/PakkelistePage'
import { ForberedelserPage } from './pages/ForberedelserPage'
import { JaktbilderPage } from './pages/JaktbilderPage'
import { SangerPage } from './pages/SangerPage'
import { TilbakemeldingerPage } from './pages/TilbakemeldingerPage'

function App() {
  return (
    <Routes>
      <Route path="/logg-inn" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/erfaringer" element={<ErfaringerPage />} />
        <Route path="/handleliste" element={<HandlelistePage />} />
        <Route path="/pakkeliste" element={<PakkelistePage />} />
        <Route path="/forberedelser" element={<ForberedelserPage />} />
        <Route path="/jaktbilder" element={<JaktbilderPage />} />
        <Route path="/sanger" element={<SangerPage />} />
        <Route path="/tilbakemeldinger" element={<TilbakemeldingerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default App
