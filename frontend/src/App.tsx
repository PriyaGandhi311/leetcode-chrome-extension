import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm';
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
    <div className="popup-container">
      {isAuthenticated ? (
        <div>
          <h1>LeetCode Reminders</h1>
          <button className="bg-green-500 p-2 text-white">Save This Problem</button>
          <button onClick={() => { clearAuth(); setIsAuthenticated(false); }}>Logout</button>
        </div>
      ) : (
        <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}
export default App;