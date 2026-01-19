import type { Reminder } from '../types/index.ts';

interface Props {
    reminders: Reminder[];
    loading: boolean;
    onDelete: (id: number) => void;
}

export function ReminderHistory({ reminders, loading, onDelete }: Props) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-3"></div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Loading...</p>
            </div>
        );
    }

    if (reminders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-medium">No active reminders.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1">
            {reminders.map((r) => (
                <div
                    key={r.id}
                    className="group relative p-3 border border-gray-100 rounded bg-white hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-3">
                            <a
                                href={r.question_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-gray-900 truncate block hover:underline decoration-gray-400 underline-offset-2"
                                title={r.question_url}
                            >
                                {r.leetcode_problem_name || r.question_url.replace('https://leetcode.com/problems/', '').replace(/\/$/, '')}
                            </a>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[9px] font-medium px-1.5 rounded ${r.is_active
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    {r.is_active ? 'Pending' : 'Done'}
                                </span>
                                <span className="text-[9px] text-gray-400 font-mono">
                                    {new Date(r.send_at_utc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => onDelete(r.id)}
                            className="text-gray-300 hover:text-red-600 transition-colors p-1 rounded-sm hover:bg-red-50"
                            title="Remove"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}