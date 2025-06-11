import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { BusinessHoursProvider } from './context/BusinessHoursContext';
import { ChatbotProvider } from './context/ChatbotContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
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
import AdminEventsPage from './pages/AdminEventsPage';
import AdminFaqPage from './pages/AdminFaqPage';
import AdminShopPage from './pages/AdminShopPage';
import AdminHoursPage from './pages/AdminHoursPage';
import AdminGameSalesPage from './pages/AdminGameSalesPage';
import AdminPasswordResetPage from './pages/AdminPasswordResetPage';
import AdminChatbotPage from './pages/AdminChatbotPage';
import GameSalesPage from './pages/GameSalesPage';
import QRCodePrintPage from './pages/QRCodePrintPage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import FaqPage from './pages/FaqPage';
import ShopPage from './pages/ShopPage';
import SellDonatePage from './pages/SellDonatePage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LLMInfoPage from './pages/LLMInfoPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BusinessHoursProvider>
          <ChatbotProvider>
            <GameProvider>
              <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/game/:slug" element={<GameDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/sell-donate" element={<SellDonatePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    
                    {/* Public repair reporting - no authentication required */}
                    <Route path="/report-issue" element={<PublicRepairPage />} />
                    
                    {/* LLM/SEO Information Page */}
                    <Route path="/museum-info" element={<LLMInfoPage />} />
                    
                    {/* Private sales page - not linked in public UI */}
                    <Route path="/games-for-sale" element={<GameSalesPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/hours" element={
                      <ProtectedRoute>
                        <AdminHoursPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/chatbot" element={
                      <ProtectedRoute>
                        <AdminChatbotPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/password-reset" element={
                      <ProtectedRoute>
                        <AdminPasswordResetPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/sales" element={
                      <ProtectedRoute>
                        <AdminGameSalesPage />
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
                    <Route path="/admin/events" element={
                      <ProtectedRoute>
                        <AdminEventsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/faq" element={
                      <ProtectedRoute>
                        <AdminFaqPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/shop" element={
                      <ProtectedRoute>
                        <AdminShopPage />
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
                <ChatbotWidget />
              </div>
            </GameProvider>
          </ChatbotProvider>
        </BusinessHoursProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;