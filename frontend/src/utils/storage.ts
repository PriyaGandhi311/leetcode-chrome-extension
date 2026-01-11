export const setAuthToken = (token: string) => {
    if(typeof chrome !== "undefined" && chrome.storage){
        return chrome.storage.local.set({ access_token: token });
    }
    else{
        localStorage.setItem("access_token", token);
    }
  
};

export const getAuthToken = async (): Promise<string | null> => {
    if(typeof chrome !== "undefined" && chrome.storage){
        const result = await chrome.storage.local.get("access_token") as {access_token: string};
        return result.access_token || null;
    }
    else{
        return localStorage.getItem("access_token");
    }
};

export const clearAuth = () => {
  return chrome.storage.local.remove(["access_token"]);
};