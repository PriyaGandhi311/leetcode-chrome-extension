const BASE_URL = "http://localhost:8000/v1";

export const authAPI = {

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
    if (response.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    if (!response.ok) {
      const errorData = await response.json();
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
    if (response.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    if (!response.ok) {
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