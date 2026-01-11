const BASE_URL = "http://localhost:8000/v1/auth";

export const authAPI = {
  signup: async (email:any, password:any) => {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  login: async (email:any, password:any) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json(); // Should return { access_token: "..." }
  },

  getMe: async (token: string) => {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  }
};