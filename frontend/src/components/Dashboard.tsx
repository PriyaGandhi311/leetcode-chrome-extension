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
    const [showCustom, setShowCustom] = useState(false);
    const [customValue, setCustomValue] = useState<{ type: 'days' | 'date', value: string }>({
        type: 'days',
        value: ''
    });

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

    // Helper to calculate the preview date string
    const getRelativePreview = () => {
        if (!customValue.value) return "";
        let targetDate: Date;
        
        if (customValue.type === 'days') {
            targetDate = new Date();
            const days = parseInt(customValue.value);
            if (isNaN(days) || days <= 0) return "";
            targetDate.setDate(targetDate.getDate() + days);
        } else {
            // Create date from "YYYY-MM-DD" string
            // Using the parts avoids the local timezone "day-shifter" bug
            const [year, month, day] = customValue.value.split('-').map(Number);
            targetDate = new Date(Date.UTC(year, month - 1, day));
        }

        return `Will remind you on: ${targetDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric',
            timeZone: 'UTC' // Force preview to show the UTC date
        })} (UTC)`;
    };

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
            if (!token) throw new Error("No auth token found");

            let finalDates: string[] = reminderDays.map(days => {
                const d = new Date();
                d.setDate(d.getDate() + days);
                return d.toISOString();
            });

            if (showCustom && customValue.value) {
                if (customValue.type === 'days') {
                    const d = new Date();
                    d.setDate(d.getDate() + parseInt(customValue.value));
                    finalDates.push(d.toISOString());
                } else {
                    // 1. Split the string
                    const [year, month, day] = customValue.value.split('-').map(Number);
                    
                    // 2. Create the date at 12:00 PM (Noon) UTC instead of 00:00
                    // Date.UTC(year, month, day, hours)
                    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                    
                    // 3. Log this to your console to verify before saving
                    console.log("Saving Date:", utcDate.toISOString()); 
                    // Should show: "2026-01-21T12:00:00.000Z"
                    
                    finalDates.push(utcDate.toISOString());
                }
            }

            const requests = finalDates.map(isoDate => 
                authAPI.createReminder(token, {
                    send_at_utc: isoDate,
                    question_url: problem.leetcode_problem_url,
                    leetcode_problem_name: problem.leetcode_problem_title,
                    leetcode_problem_number: problem.leetcode_problem_number
                })
            );

            await Promise.all(requests);
            setMessage("Saved successfully");
            setReminderDays([]);
            setCustomValue({ type: 'days', value: '' });
            setShowCustom(false);
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

    const canSave = reminderDays.length > 0 || (showCustom && customValue.value !== "");

    return (
        <div className="p-4 w-full bg-white min-h-[300px]">
            {/* Header */}
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
                            {/* Problem Card */}
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block tracking-wider">Current Problem</span>
                                <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                                    {problem.leetcode_problem_number}. {problem.leetcode_problem_title}
                                </p>
                            </div>

                            {/* Preset Buttons Grid */}
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">Remind me in</span>
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {[1, 3, 7, 14].map(day => (
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
                                    <button
                                        onClick={() => setShowCustom(!showCustom)}
                                        className={`text-xs py-2 rounded-md font-medium transition-all ${showCustom 
                                            ? 'bg-gray-800 text-white shadow-sm' 
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {showCustom ? '✕' : 'Custom'}
                                    </button>
                                </div>

                                {/* Custom Input Section */}
                                {showCustom && (
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setCustomValue({ ...customValue, type: 'days' })}
                                                className={`text-[10px] px-2 py-1 rounded transition-colors ${customValue.type === 'days' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}
                                            >
                                                Days
                                            </button>
                                            <button 
                                                onClick={() => setCustomValue({ ...customValue, type: 'date' })}
                                                className={`text-[10px] px-2 py-1 rounded transition-colors ${customValue.type === 'date' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}
                                            >
                                                Pick Date
                                            </button>
                                        </div>
                                        
                                        <input
                                            type={customValue.type === 'days' ? 'number' : 'date'}
                                            min={customValue.type === 'days' ? "1" : new Date().toISOString().split('T')[0]}
                                            placeholder={customValue.type === 'days' ? "Enter number of days..." : ""}
                                            className="w-full text-xs p-2 border border-gray-300 rounded focus:border-black outline-none bg-white"
                                            value={customValue.value}
                                            onChange={(e) => setCustomValue({ ...customValue, value: e.target.value })}
                                        />

                                        {customValue.value && (
                                            <p className="text-[10px] text-blue-600 font-medium italic animate-pulse">
                                                {getRelativePreview()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSaveReminders}
                                disabled={loading || !canSave}
                                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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

            {/* Toast Message */}
            {message && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg z-50">
                    {message}
                </div>
            )}
        </div>
    );
}