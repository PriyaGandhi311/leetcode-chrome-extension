import type { LeetCodeProblem } from '../types';
export const getActiveLeetCodeTab = async (): Promise<LeetCodeProblem | null> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !tab.url?.includes("leetcode.com/problems")) {
        return null;
    }

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // LeetCode's current title selector
                const el = document.querySelector('div[class*="text-title-large"]');
                if (!el) return null;

                const fullText = (el as HTMLElement).innerText; // e.g., "1. Two Sum"
                const parts = fullText.split('.');
                
                return {
                    id: parts[0]?.trim() || "",
                    title: parts[1]?.trim() || fullText
                };
            }
        });

        const data = results[0]?.result;
        if (data) {
            return {
                leetcode_problem_number: Number(data.id),
                leetcode_problem_title: data.title,
                leetcode_problem_url: tab.url
            };
        }
    } catch (err) {
        console.error("Script injection failed:", err);
    }

    return null;
};