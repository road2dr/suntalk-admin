import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import PaymentsPage from './pages/PaymentsPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <ConfigProvider locale={koKR}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <PaymentsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/users" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;