import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResumeOptimizer from './pages/ResumeOptimizer';
import PracticeInterview from './pages/PracticeInterview';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import JobListing from './pages/JobListing';
import OllamaHub from './pages/OllamaHub';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<ResumeOptimizer />} />
          <Route path="/interview" element={<PracticeInterview />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/engine" element={<OllamaHub />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
