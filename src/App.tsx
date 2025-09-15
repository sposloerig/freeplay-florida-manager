import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { BusinessHoursProvider } from './context/BusinessHoursContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import GameDetailPage from './pages/GameDetailPage';
import AddGamePage from './pages/AddGamePage';
import EditGamePage from './pages/EditGamePage';
import StatsPage from './pages/StatsPage';
import AddRepairPage from './pages/AddRepairPage';
import PublicRepairPage from './pages/PublicRepairPage';
import RepairDashboardPage from './pages/RepairDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminGameApprovalPage from './pages/AdminGameApprovalPage';
import AdminBuyerInquiriesPage from './pages/AdminBuyerInquiriesPage';
import AdminCheckInPage from './pages/AdminCheckInPage';
import GameSalesPage from './pages/GameSalesPage';
import QRCodePrintPage from './pages/QRCodePrintPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SubmitGamePage from './pages/SubmitGamePage';
import MarketplacePage from './pages/MarketplacePage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BusinessHoursProvider>
          <GameProvider>
              <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/game/:slug" element={<GameDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/submit-game" element={<SubmitGamePage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    
                    {/* Public repair reporting - no authentication required */}
                    <Route path="/report-issue" element={<PublicRepairPage />} />
                    
                    {/* Private sales page - not linked in public UI */}
                    <Route path="/games-for-sale" element={<GameSalesPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/game-approval" element={
                      <ProtectedRoute>
                        <AdminGameApprovalPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/buyer-inquiries" element={
                      <ProtectedRoute>
                        <AdminBuyerInquiriesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/check-in" element={
                      <ProtectedRoute>
                        <AdminCheckInPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/add" element={
                      <ProtectedRoute>
                        <AddGamePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/edit/:id" element={
                      <ProtectedRoute>
                        <EditGamePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/repairs" element={
                      <ProtectedRoute>
                        <RepairDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/repairs/new" element={
                      <ProtectedRoute>
                        <AddRepairPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/qr-codes" element={
                      <ProtectedRoute>
                        <QRCodePrintPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            </GameProvider>
        </BusinessHoursProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;