import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResumeOptimizer from './pages/ResumeOptimizer';
import PracticeInterview from './pages/PracticeInterview';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Pricing from './pages/Pricing';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<ResumeOptimizer />} />
          <Route path="/interview" element={<PracticeInterview />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
