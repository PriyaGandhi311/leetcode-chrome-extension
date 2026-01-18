import type { Reminder } from '../types/index.ts';

interface Props {
    reminders: Reminder[];
    loading: boolean;
    onDelete: (id: number) => void;
}

export function ReminderHistory({ reminders, loading, onDelete }: Props) {
    // 1. Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Syncing Data...
                </p>
            </div>
        );
    }

    // 2. Empty State
    if (reminders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mx-1">
                <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] text-gray-400 font-medium italic">
                    No reminders found.
                </p>
            </div>
        );
    }

    // 3. List View
    return (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {reminders.map((r) => (
                <div 
                    key={r.id} 
                    className="group relative p-3 border border-gray-100 rounded-lg bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                    {/* Status Badge & Date */}
                    <div className="flex justify-between items-center mb-1.5 pr-6">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                            r.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                        }`}>
                            {r.is_active ? '● Pending' : '✓ Sent'}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                            {new Date(r.send_at_utc).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* URL Link */}
                    <a 
                        href={r.question_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 truncate block hover:underline pr-6"
                        title={r.question_url}
                    >
                        {r.question_url.replace('https://leetcode.com/problems/', '')}
                    </a>

                    {/* Delete Button */}
                    <button
                        onClick={() => onDelete(r.id)}
                        className="absolute top-3 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Reminder"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            ))}

            {/* In-component styling for the scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
}