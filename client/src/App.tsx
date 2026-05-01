import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import MasterDex from './pages/MasterDex';
import DeckBuilder from './pages/DeckBuilder';
import Lists from './pages/Lists';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import PaymentCallback from './pages/PaymentCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ProRoute from './components/ProRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/masterdex" element={<ProRoute><MasterDex /></ProRoute>} />
      <Route path="/decks" element={<ProtectedRoute><DeckBuilder /></ProtectedRoute>} />
      <Route path="/lists" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
      <Route path="/payment/pending" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
    </Routes>
  );
}
