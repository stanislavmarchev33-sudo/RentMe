import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { I18nProvider } from '@/lib/i18n.jsx';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import ListingDetail from '@/pages/ListingDetail';
import CreateListing from '@/pages/CreateListing';
import BookingFlow from '@/pages/BookingFlow';
import BookingDetail from '@/pages/BookingDetail';
import Dashboard from '@/pages/Dashboard';
import WalletPage from '@/pages/WalletPage';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import HowItWorksPage from '@/pages/HowItWorksPage';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import AdminDashboard from '@/pages/AdminDashboard';
import Favorites from '@/pages/Favorites';
import ListingChat from '@/pages/ListingChat';
import DisputePage from '@/pages/DisputePage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-heading font-bold text-lg">R</span>
          </div>
          <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/book/:id" element={<BookingFlow />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

        {/* Authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/booking/:id" element={<BookingDetail />} />
          <Route path="/dispute/:id" element={<DisputePage />} />
          <Route path="/listing/:listingId/chat" element={<ListingChat />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <I18nProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <SonnerToaster position="top-right" richColors />
          <Toaster />
        </I18nProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App