import { useState, useEffect } from 'react';
import { getActiveLeetCodeTab } from '../utils/tabs';

export function Dashboard(){
    const [problem, setProblem] = useState<{title: string; url : string} | null>(null);
    const [reminderDays, setReminderDays] = useState<number[]>([7, 20]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCurrentLeetCodeProblem();
    }, []);

    const fetchCurrentLeetCodeProblem = async () => {
        const activeTab = await getActiveLeetCodeTab();
        if(activeTab){
            setProblem(activeTab);
        }
    };

    const toggleDay = (day: number) => {
        setReminderDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = async () => {
        if (!problem) return;
        setLoading(true);
        try {
        // Logic to call your FastAPI endpoint (e.g., authAPI.saveProblem)
            console.log("Saving problem:", problem.title, "with days:", reminderDays);
            setMessage("Saved successfully!");
        } catch (err) {
            setMessage("Failed to save.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex flex-col gap-4 p-2">
        {problem ? (
            <>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase">Current Problem</p>
                <h2 className="text-sm font-semibold truncate">{problem.title}</h2>
            </div>

            <div>
                <p className="text-xs font-medium mb-2 text-gray-600">Remind me in:</p>
                <div className="flex gap-2">
                {[1, 7, 20, 30].map((day) => (
                    <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        reminderDays.includes(day) 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    >
                    {day}d
                    </button>
                ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-bold text-sm transition-all"
            >
                {loading ? "Saving..." : "Set Reminder"}
            </button>
            </>
        ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">Please open a LeetCode problem page to set a reminder.</p>
            </div>
        )}
        {message && <p className="text-center text-xs font-medium text-blue-500 mt-2">{message}</p>}
        </div>
    );

}