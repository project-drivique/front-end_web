import AppRouter from './routes/AppRouter.jsx'
import { useSincronizarPerfil } from './hooks/useSincronizarPerfil'

export default function App() {
  useSincronizarPerfil()
  return <AppRouter />
}
