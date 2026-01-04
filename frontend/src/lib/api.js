// LocalStorage-basierte API für offline Datenspeicherung
// Daten bleiben NUR auf deinem Gerät

const STORAGE_KEYS = {
  GOALS: 'jahresziele_goals',
  HABITS: 'jahresziele_habits',
};

// Helper: Generate UUID
const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Helper: Get today's date as ISO string
const getTodayISO = () => new Date().toISOString().split('T')[0];

// Goals API (LocalStorage)
export const goalsApi = {
  getAll: async (year) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const filtered = year ? goals.filter(g => g.year === year) : goals;
    return { data: filtered };
  },

  getOne: async (id) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const goal = goals.find(g => g.id === id);
    if (!goal) throw new Error('Goal not found');
    return { data: goal };
  },

  create: async (data) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const newGoal = {
      id: generateId(),
      ...data,
      current_value: data.start_value || 0,
      start_value: data.start_value || 0,
      starting_situation: data.starting_situation || null,
      milestones: [],
      created_at: new Date().toISOString(),
      year: data.year || new Date().getFullYear(),
    };
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: newGoal };
  },

  update: async (id, data) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    goals[index] = { ...goals[index], ...data };
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: goals[index] };
  },

  delete: async (id) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const filtered = goals.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
    return { data: { message: 'Deleted' } };
  },

  updateProgress: async (id, value) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    goals[index].current_value = value;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: goals[index] };
  },
};

// Milestones API (LocalStorage)
export const milestonesApi = {
  add: async (goalId, data) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const index = goals.findIndex(g => g.id === goalId);
    if (index === -1) throw new Error('Goal not found');
    
    const milestone = {
      id: generateId(),
      title: data.title,
      deadline: data.deadline || null,
      completed: false,
    };
    
    goals[index].milestones = goals[index].milestones || [];
    goals[index].milestones.push(milestone);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: goals[index] };
  },

  toggle: async (goalId, milestoneId) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) throw new Error('Goal not found');
    
    const milestone = goals[goalIndex].milestones?.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = !milestone.completed;
    }
    
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: goals[goalIndex] };
  },

  delete: async (goalId, milestoneId) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const goalIndex = goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) throw new Error('Goal not found');
    
    goals[goalIndex].milestones = goals[goalIndex].milestones?.filter(m => m.id !== milestoneId) || [];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return { data: goals[goalIndex] };
  },
};

// Habits API (LocalStorage)
export const habitsApi = {
  getAll: async () => {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    return { data: habits };
  },

  create: async (data) => {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    const newHabit = {
      id: generateId(),
      title: data.title,
      category: data.category,
      options: data.options || [], // Benutzerdefinierte Dropdown-Optionen
      streak: 0,
      completions: [],
      notes: {}, // { "2026-01-04": "Notiz für diesen Tag" }
      selectedOptions: {}, // { "2026-01-04": "Joggen" }
      created_at: new Date().toISOString(),
    };
    habits.push(newHabit);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    return { data: newHabit };
  },

  complete: async (id, date, note = null, selectedOption = null) => {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    const index = habits.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Habit not found');
    
    const habit = habits[index];
    const dateStr = date;
    
    // Toggle completion
    if (habit.completions.includes(dateStr)) {
      habit.completions = habit.completions.filter(d => d !== dateStr);
      // Remove note and option when uncompleting
      if (habit.notes) delete habit.notes[dateStr];
      if (habit.selectedOptions) delete habit.selectedOptions[dateStr];
    } else {
      habit.completions.push(dateStr);
      // Add note if provided
      if (note !== null) {
        habit.notes = habit.notes || {};
        habit.notes[dateStr] = note;
      }
      // Add selected option if provided
      if (selectedOption !== null) {
        habit.selectedOptions = habit.selectedOptions || {};
        habit.selectedOptions[dateStr] = selectedOption;
      }
    }
    
    // Calculate streak from today backwards
    const sortedCompletions = [...habit.completions].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) { // Check up to a year
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkStr = checkDate.toISOString().split('T')[0];
      
      if (sortedCompletions.includes(checkStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    habit.streak = streak;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    return { data: habit };
  },

  // Update note for a specific date
  updateNote: async (id, date, note, selectedOption = null) => {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    const index = habits.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Habit not found');
    
    const habit = habits[index];
    habit.notes = habit.notes || {};
    habit.selectedOptions = habit.selectedOptions || {};
    
    if (note && note.trim()) {
      habit.notes[date] = note.trim();
    } else {
      delete habit.notes[date];
    }
    
    if (selectedOption) {
      habit.selectedOptions[date] = selectedOption;
    }
    
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    return { data: habit };
  },

  delete: async (id) => {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    const filtered = habits.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filtered));
    return { data: { message: 'Deleted' } };
  },
};

// Backup API (Server für Cloud-Sync)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const backupApi = {
  // Export all data as JSON
  exportData: () => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    return {
      goals,
      habits,
      backup_date: new Date().toISOString(),
      version: '1.0',
    };
  },

  // Import data from JSON
  importData: (data) => {
    if (data.goals) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
    }
    if (data.habits) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits));
    }
    return true;
  },

  // Save to cloud (requires auth)
  saveToCloud: async () => {
    const data = backupApi.exportData();
    const response = await fetch(`${BACKEND_URL}/api/backup/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Backup failed');
    return response.json();
  },

  // Load from cloud (requires auth)
  loadFromCloud: async () => {
    const response = await fetch(`${BACKEND_URL}/api/backup/load`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Load failed');
    return response.json();
  },
};

// Auth API
export const authApi = {
  getMe: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      // Not logged in - this is OK
      return null;
    }
  },

  createSession: async (sessionId) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!response.ok) throw new Error('Session creation failed');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  getLoginUrl: () => {
    const redirectUrl = window.location.origin + '/';
    return `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  },
};

export default { goalsApi, milestonesApi, habitsApi, backupApi, authApi };
