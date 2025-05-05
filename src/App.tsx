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

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;