export const getActiveLeetCodeTab = async() =>{
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if(tab?.url?.includes("leetcode.com/problems")){
        const urlParts = tab.url.split("/");
        const problemSlug = urlParts[urlParts.indexOf("problems") + 1]; // Extract the problem slug from the URL
        return {title : problemSlug.replace(/-/g, " "), url : tab.url};
    }
};