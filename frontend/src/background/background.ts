import { createClerkClient } from '@clerk/chrome-extension/background';
import { PUBLISHABLE_KEY } from '../App';
async function getAuthToken() {
  try {
    const clerk = await createClerkClient({
      publishableKey: PUBLISHABLE_KEY,
    });

    if (!clerk.session) {
      return null;
    }
    const token = await clerk.session.getToken();
    return token;
  } catch (error) {
    console.error("Error fetching Clerk token in background:", error);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_TOKEN") {
    getAuthToken().then(token => sendResponse({ token }));
    return true; 
  }
});