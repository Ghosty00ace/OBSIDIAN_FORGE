import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Functional pages (wired to backend)
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from './pages/AuthScreens'
import ResetPasswordPage from './pages/ResetPassword'
import ProductsPage from './pages/ProductsScreen'
import ProductPage from './pages/ProductScreen'
import CartPage from './pages/CartScreen'
import CheckoutPage from './pages/CheckoutScreen'
import { OrderConfirmScreen, OrderTrackingScreen, DashboardScreen, ProfileScreen, WishlistScreen, SettingsScreen, BillingScreen, TrackingHubScreen } from './pages/DashboardScreens'
import SupportScreen from './pages/SupportScreen'
import AppErrorBoundary from './components/AppErrorBoundary'
import FloatingChatWidget from './components/FloatingChatWidget'

import HomePage from './pages/Home'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/support" element={<SupportScreen />} />

          {/* Auth-required storefront pages */}
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/product" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmScreen /></ProtectedRoute>} />
          <Route path="/order-tracking" element={<ProtectedRoute><OrderTrackingScreen /></ProtectedRoute>} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/dashboard/wishlist" element={<ProtectedRoute><WishlistScreen /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/dashboard/billing" element={<ProtectedRoute><BillingScreen /></ProtectedRoute>} />
          <Route path="/dashboard/tracking" element={<ProtectedRoute><TrackingHubScreen /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingChatWidget />
        </AppErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}
