import { useState, useEffect } from 'react';
import { getActiveLeetCodeTab } from '../utils/tabs';
import { getAuthToken } from '../utils/storage';
import { authAPI } from '../api/authService';
import { ReminderHistory } from './ReminderHistory';
import type { Reminder, LeetCodeProblem } from '../types';

export function Dashboard() {
    const [view, setView] = useState<'schedule' | 'history'>('schedule');
    const [problem, setProblem] = useState<LeetCodeProblem | null>(null);
    const [reminderDays, setReminderDays] = useState<number[]>([]);
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
            setMessage("Saved successfully");
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
        <div className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {view === 'schedule' ? "New Reminder" : "History"}
                    </span>
                </div>
                <button
                    onClick={handleSwitchView}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-all border border-transparent hover:border-gray-200"
                >
                    {view === 'schedule' ? "View History" : "New Reminder"}
                </button>
            </div>

            {view === 'schedule' ? (
                <div className="space-y-6">
                    {problem ? (
                        <>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block tracking-wider">Current Problem</span>
                                <p className="text-sm font-medium text-gray-900 truncate leading-tight">{problem.leetcode_problem_title}</p>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Remind me in</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 7, 14, 20, 30].slice(0, 4).map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setReminderDays(prev =>
                                                prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                            )}
                                            className={`text-xs py-2 rounded-md font-medium transition-all ${reminderDays.includes(day)
                                                ? 'bg-black text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {day}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveReminders}
                                disabled={loading || reminderDays.length === 0}
                                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {loading ? "Scheduling..." : "Save Reminders"}
                            </button>
                        </>
                    ) : (
                        <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                            <p className="text-sm text-gray-500 mb-1">No active LeetCode problem found.</p>
                            <p className="text-xs text-gray-400">Open a problem page to set a reminder.</p>
                        </div>
                    )}
                </div>
            ) : (
                <ReminderHistory
                    reminders={reminders}
                    loading={loading}
                    onDelete={handleDeleteReminder}
                />
            )}

            {message && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50 animate-fade-in-up">
                    {message}
                </div>
            )}
        </div>
    );
}