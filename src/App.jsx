import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Formulario from './pages/Formulario';
import Confirmacao from './pages/Confirmacao';
import Privacidade from './pages/Privacidade';
import MeusDados from './pages/MeusDados';
import CookieBanner from './components/CookieBanner';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminTemas from './pages/admin/Temas';
import AdminPerguntas from './pages/admin/Perguntas';
import AdminEscala from './pages/admin/Escala';
import AdminMaxChars from './pages/admin/MaxChars';
import AdminAnalises from './pages/admin/Analises';
import AdminConfig from './pages/admin/Config';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/avaliacao" element={<Formulario />} />
      <Route path="/confirmacao" element={<Confirmacao />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/meus-dados" element={<MeusDados />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/temas" element={<AdminTemas />} />
      <Route path="/admin/perguntas" element={<AdminPerguntas />} />
      <Route path="/admin/escala" element={<AdminEscala />} />
      <Route path="/admin/max-chars" element={<AdminMaxChars />} />
      <Route path="/admin/analises" element={<AdminAnalises />} />
      <Route path="/admin/config" element={<AdminConfig />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
          <CookieBanner />
        </Router>
        <Toaster />
        </QueryClientProvider>
        </AuthProvider>
  )
}

export default App