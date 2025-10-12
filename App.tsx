
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SustainabilityPage from './pages/SustainabilityPage';
import SeasonalForecastPage from './pages/SeasonalForecastPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white text-black">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/seasonal-forecast" element={<SeasonalForecastPage />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;