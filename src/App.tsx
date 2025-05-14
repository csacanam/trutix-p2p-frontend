import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreateTrade } from './pages/CreateTrade';
import { FAQ } from './pages/FAQ';
import { TradeDetail } from './pages/TradeDetail';
import { TradeDetailReal } from './pages/TradeDetailReal';
import { DashboardMock } from './pages/DashboardMock';
import { Footer } from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-mock" element={<DashboardMock />} />
              <Route path="/create-trade" element={<CreateTrade />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/trade/:id" element={<TradeDetailReal />} />
              <Route path="/trade-temp/:id" element={<TradeDetail />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;