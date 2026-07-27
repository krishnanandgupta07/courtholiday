/**
 * Root app — providers live in main.tsx / entry-server.tsx.
 * Routing only; no in-memory page state.
 */
import { AppRoutes } from './routes'

export default function App() {
  return <AppRoutes />
}
