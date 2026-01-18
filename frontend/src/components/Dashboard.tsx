import { useState, useEffect } from 'react';
import { getActiveLeetCodeTab } from '../utils/tabs';
import { getAuthToken } from '../utils/storage';
import { authAPI } from '../api/authService';
import { ReminderHistory } from './ReminderHistory';
import type { Reminder, LeetCodeProblem } from '../types';

export function Dashboard() {
    const [view, setView] = useState<'schedule' | 'history'>('schedule');
    const [problem, setProblem] = useState<LeetCodeProblem | null>(null);
    const [reminderDays, setReminderDays] = useState<number[]>([7, 20]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const init = async () => {
            try {
                const activeTabDetails = await getActiveLeetCodeTab();
                if (activeTabDetails) setProblem(activeTabDetails);
            } catch (err) {
                console.error("Tab fetch error", err);
            }
        };
        init();
    }, []);

    const handleSwitchView = async () => {
        const nextView = view === 'schedule' ? 'history' : 'schedule';
        setView(nextView);
        
        if (nextView === 'history') {
            setLoading(true);
            setMessage("");
            try {
                const token = await getAuthToken();
                if (!token) throw new Error("Unauthorized");
                const data = await authAPI.getAllRemindersByUser(token);
                setReminders(data);
            } catch (err: any) {
                setMessage(err.message || "Load error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveReminders = async () => {
        if (loading || !problem) return;
        setLoading(true);
        setMessage("");

        try {
            const token = await getAuthToken();
            const requests = reminderDays.map(days => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                return authAPI.createReminder(token!, {
                    send_at_utc: date.toISOString(),
                    question_url: problem.leetcode_problem_url,
                    leetcode_problem_name: problem.leetcode_problem_title,
                    leetcode_problem_number: problem.leetcode_problem_number
                });
            });

            await Promise.all(requests);
            setMessage("Reminders saved");
            setReminderDays([]);
        } catch (err: any) {
            setMessage("Save failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReminder = async (id: number) => {
        try {
            const token = await getAuthToken();
            await authAPI.deleteReminder(token!, id);
            setReminders(prev => prev.filter(r => r.id !== id));
            setMessage("Deleted");
            setTimeout(() => setMessage(""), 2000);
        } catch (err) {
            setMessage("Delete failed");
        }
    };

    return (
        <div className="p-4 w-80">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-sm font-bold">LEET REMIND</h1>
                <button 
                    onClick={handleSwitchView}
                    className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
                >
                    {view === 'schedule' ? "History" : "Back"}
                </button>
            </div>

            {view === 'schedule' ? (
                <div className="space-y-4">
                    {problem ? (
                        <>
                            <div className="p-2 bg-gray-100 rounded">
                                <p className="text-xs font-semibold truncate">{problem.leetcode_problem_title}</p>
                            </div>
                            <div className="flex gap-2">
                                {[1, 7, 20, 30].map(day => (
                                    <button 
                                        key={day}
                                        onClick={() => setReminderDays(prev => 
                                            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                        )}
                                        className={`flex-1 py-1 text-xs border rounded ${
                                            reminderDays.includes(day) ? 'bg-blue-600 text-white' : ''
                                        }`}
                                    >
                                        {day}d
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSaveReminders}
                                disabled={loading || reminderDays.length === 0}
                                className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded disabled:bg-gray-300"
                            >
                                {loading ? "Saving..." : "Confirm"}
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-gray-500">No problem detected.</p>
                    )}
                </div>
            ) : (
                <ReminderHistory 
                    reminders={reminders} 
                    loading={loading} 
                    onDelete={handleDeleteReminder} 
                />
            )}

            {message && <p className="mt-4 text-center text-xs font-bold">{message}</p>}
        </div>
    );
}