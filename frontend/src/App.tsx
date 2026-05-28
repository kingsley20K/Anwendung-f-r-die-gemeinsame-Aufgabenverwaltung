import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from './components/ui/ToastContainer';
import { BoardPage } from './pages/BoardPage';
import { BoardsPage } from './pages/BoardsPage';
import { LoginPage } from './pages/LoginPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isBooting } = useAuthStore();
  if (isBooting) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, isBooting } = useAuthStore();
  if (isBooting) return null;
  if (user) return <Navigate to="/boards" replace />;
  return <>{children}</>;
}

export function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />

        <Route path="/boards" element={<RequireAuth><BoardsPage /></RequireAuth>} />
        <Route path="/boards/:boardId" element={<RequireAuth><BoardPage /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}
