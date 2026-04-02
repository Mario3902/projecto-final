// Base URL for the new Node.js backend
const API_URL = `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:4000/api`;

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem("nzila_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API_URL}/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateProfile: async (data: any) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Progress
  getProgress: async () => {
    const res = await fetch(`${API_URL}/progress`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  addXP: async (amount: number) => {
    const res = await fetch(`${API_URL}/progress/xp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  addStudyTime: async (minutes: number) => {
    const res = await fetch(`${API_URL}/progress/study`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ minutes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  resetProgress: async () => {
    const res = await fetch(`${API_URL}/progress/reset`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Tasks
  getTasks: async () => {
    const res = await fetch(`${API_URL}/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  createTask: async (title: string, date?: string) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, date }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  toggleTask: async (id: number) => {
    const res = await fetch(`${API_URL}/tasks/${id}/toggle`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteTask: async (id: number) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Subjects
  getSubjects: async () => {
    const res = await fetch(`${API_URL}/subjects`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  addSubject: async (name: string, emoji?: string) => {
    const res = await fetch(`${API_URL}/subjects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, emoji }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteSubject: async (id: number) => {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateSubject: async (id: number, data: { name?: string; emoji?: string }) => {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Performance
  getPerformance: async () => {
    const res = await fetch(`${API_URL}/performance`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  saveGrade: async (subjectId: number, grade: number, trimester: "T1"|"T2"|"T3", testType: "p1"|"p2") => {
    const res = await fetch(`${API_URL}/performance/grade`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ subjectId, grade, trimester, testType }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Quizzes
  getQuizResults: async () => {
    const res = await fetch(`${API_URL}/quizzes/results`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  saveQuizResult: async (data: any) => {
    const res = await fetch(`${API_URL}/quizzes/result`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  saveVocationalResult: async (data: any) => {
    const res = await fetch(`${API_URL}/quizzes/vocational`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  addMaterial: async (subjectId: string | number, data: any) => {
    const res = await fetch(`${API_URL}/subjects/${subjectId}/materials`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteMaterial: async (id: string | number) => {
    const res = await fetch(`${API_URL}/subjects/materials/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateMaterial: async (id: string | number, data: { title?: string; type?: string; content?: string }) => {
    const res = await fetch(`${API_URL}/subjects/materials/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Chat
  getChatHistory: async () => {
    const res = await fetch(`${API_URL}/chat`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  saveChatMessage: async (data: { role: string; content: string }) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Pomodoro
  savePomodoroSession: async (data: { subject_id?: number; subject_name?: string; topic?: string; duration_minutes: number; xp_earned: number }) => {
    const res = await fetch(`${API_URL}/pomodoro`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getPomodoroSessions: async (date?: string) => {
    let url = `${API_URL}/pomodoro`;
    if (date) url += `?date=${encodeURIComponent(date)}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getPomodoroCalendar: async (year?: number, month?: number) => {
    let url = `${API_URL}/pomodoro/calendar`;
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getPomodoroStats: async () => {
    const res = await fetch(`${API_URL}/pomodoro/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

