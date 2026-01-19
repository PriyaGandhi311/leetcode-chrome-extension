import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { getAuthToken, clearAuth } from './utils/storage';
import { authAPI } from './api/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        const isValid = await authAPI.getMe(token);
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <div className="min-w-[350px] min-h-[500px] bg-white text-gray-900 font-sans">
      {isAuthenticated ? (
        <div className="flex flex-col h-full">
          <header className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h1 className="text-sm font-semibold tracking-tight">LeetCode Reminders</h1>
            <button
              onClick={() => { clearAuth(); setIsAuthenticated(false); }}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </header>
          <div className="flex-1 overflow-y-auto">
            <Dashboard />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />
        </div>
      )}
    </div>
  );
}
export default App;