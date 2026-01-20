import { SignIn, SignUp } from "@clerk/chrome-extension";
import { useState } from "react";

export const AuthForm = () => {
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-medium text-gray-900">{authMode === 'signIn' ? "Welcome back" : "Create Account"}</h2>
      </div>

      {authMode === 'signIn' ? (
        <SignIn 
          routing="virtual" 
          appearance={{ elements: { footerAction: "hidden" } }} 
        />
      ) : (
        <SignUp 
          routing="virtual" 
          appearance={{ elements: { footerAction: "hidden" } }} 
        />
      )}

      <button
        onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
        className="mt-4 w-full text-xs text-gray-500 hover:text-black underline"
      >
        {authMode === 'signIn' ? "New here? Sign up" : "Have an account? Sign in"}
      </button>
    </div>
  );
};
