// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import MatchSetup from './pages/MatchSetup';
import MatchPage from './pages/MatchPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <MatchProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<MatchSetup />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </MatchProvider>
  );
}