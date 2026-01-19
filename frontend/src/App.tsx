import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/chrome-extension";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

const PUBLISHABLE_KEY = "pk_test_bGVnYWwtZG92ZS05Ni5jbGVyay5hY2NvdW50cy5kZXYk"; 

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function AppContent() {
  const { signOut } = useAuth();

  return (
    <div className="min-w-[350px] min-h-[500px] bg-white text-gray-900 font-sans">
      <SignedIn>
        <div className="flex flex-col h-full">
          <header className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h1 className="text-sm font-semibold tracking-tight">LeetCode Reminders</h1>
            <button
              onClick={() => signOut()}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </header>
          <div className="flex-1 overflow-y-auto">
            <Dashboard />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="h-full flex flex-col items-center justify-center p-6">
          <AuthForm />
        </div>
      </SignedOut>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => window.location.hash = to}
      routerReplace={(to) => window.location.hash = to}
    >
      <AppContent />
    </ClerkProvider>
  );
}