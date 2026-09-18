import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { ErfaringerPage } from './pages/ErfaringerPage'
import { HandlelistePage } from './pages/HandlelistePage'
import { PakkelistePage } from './pages/PakkelistePage'
import { ForberedelserPage } from './pages/ForberedelserPage'
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
        <Route path="/tilbakemeldinger" element={<TilbakemeldingerPage />} />
      </Route>
    </Routes>
  )
}

export default App
