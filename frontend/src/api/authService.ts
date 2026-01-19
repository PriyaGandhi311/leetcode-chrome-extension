const BASE_URL = "http://localhost:8000/v1";

export const authAPI = {
  signup: async (email: any, password: any) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  login: async (email: any, password: any) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json(); 
  },

  getMe: async (token: string) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },

  createReminder: async (token: string, payload: { send_at_utc: string; question_url: string; leetcode_problem_name: string; leetcode_problem_number: number }) => {
    console.log("Reminder created successfully", `Bearer ${token}`);
    const response = await fetch(`${BASE_URL}/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to capture Pydantic validation errors (422 Unprocessable Entity)
      const errorData = await response.json();

      console.error("Backend Validation Error:", errorData);
      throw new Error(errorData.detail || "Failed to create reminder");
    }

    return response.json();
  },

  getAllRemindersByUser: async (token: string) => {
    const response = await fetch(`${BASE_URL}/reminders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      // Try to capture Pydantic validation errors (422 Unprocessable Entity)
      const errorData = await response.json();

      console.error("Backend Validation Error:", errorData);
      throw new Error(errorData.detail || "Failed to get all reminder");
    }
    return response.json();
  },

  deleteReminder: async (token: string, reminderId: number) => {
    const response = await fetch(`${BASE_URL}/reminders/${reminderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete reminder");
    }
    return true;
  }
};