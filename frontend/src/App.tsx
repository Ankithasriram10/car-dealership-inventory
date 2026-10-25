import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';

function Shell() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      {user ? <Dashboard /> : <AuthPage />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
