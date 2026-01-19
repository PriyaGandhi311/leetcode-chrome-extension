import { createClerkClient } from '@clerk/chrome-extension/background';
const PUBLISHABLE_KEY = "pk_test_bGVnYWwtZG92ZS05Ni5jbGVyay5hY2NvdW50cy5kZXYk"; 
// Helper to get a fresh token from the background
async function getAuthToken() {
  try {
    const clerk = await createClerkClient({
      publishableKey: PUBLISHABLE_KEY,
    });

    // If no user is logged in, clerk.session will be null
    if (!clerk.session) {
      console.log("No active session found.");
      return null;
    }

    // This gets a fresh JWT token to send to your backend
    const token = await clerk.session.getToken();
    return token;
  } catch (error) {
    console.error("Error fetching Clerk token in background:", error);
    return null;
  }
}

// Example: Listening for messages from your extension or content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_TOKEN") {
    getAuthToken().then(token => sendResponse({ token }));
    return true; // Keep the message channel open for async response
  }
});