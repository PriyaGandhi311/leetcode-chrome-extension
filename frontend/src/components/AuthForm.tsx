import { SignIn } from "@clerk/chrome-extension";

export const AuthForm = () => {
  return (
    <div className="w-full max-w-sm">
      {/* Your original Header Style */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-medium text-gray-900 tracking-tight mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">
          Enter your details to access your reminders
        </p>
      </div>

      {/* Clerk Component styled to match your original form */}
      <SignIn 
        routing="virtual"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-none p-0 w-full bg-transparent",
            headerTitle: "hidden", // We use your custom <h2> instead
            headerSubtitle: "hidden",
            formButtonPrimary: 
              "w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-black transition-colors mt-2 normal-case",
            formFieldInput: 
              "w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors",
            footerAction: "hidden", // We can use your custom toggle button if needed
            identityPreviewText: "text-sm text-gray-600",
            formFieldLabel: "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
          },
          layout: {
            helpPageUrl: "https://clerk.com/support", // Optional
          }
        }}
      />
    </div>
  );
};
