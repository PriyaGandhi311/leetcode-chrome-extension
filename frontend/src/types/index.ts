
export interface Reminder {
    id: number;
    send_at_utc: string;
    question_url: string;
    is_active: boolean;
    sent_at: string | null;
}

export interface LeetCodeProblem {
    title: string;
    url: string;
}