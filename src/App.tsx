import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import WantedListPage from './pages/WantedListPage'
import WantedDetailPage from './pages/WantedDetailPage'
import NewsFeedPage from './pages/NewsFeedPage'
import NewsDetailPage from './pages/NewsDetailPage'
import SagasPage from './pages/SagasPage'
import SagaStoryPage from './pages/SagaStoryPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wanted" element={<WantedListPage />} />
          <Route path="/wanted/:id" element={<WantedDetailPage />} />
          <Route path="/news" element={<NewsFeedPage />}>
            {/* El detalle se abre encima del feed: el feed no se desmonta y conserva posición y datos */}
            <Route path=":id" element={<NewsDetailPage />} />
          </Route>
          <Route path="/sagas" element={<SagasPage />} />
          <Route path="/sagas/:id" element={<SagaStoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
