import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = {
  health: { label: 'Gesundheit', color: '#22c55e', icon: 'Heart' },
  career: { label: 'Karriere', color: '#3b82f6', icon: 'Briefcase' },
  finance: { label: 'Finanzen', color: '#eab308', icon: 'Wallet' },
  personal: { label: 'Persönlich', color: '#a855f7', icon: 'User' },
  education: { label: 'Bildung', color: '#f97316', icon: 'GraduationCap' },
  relationships: { label: 'Beziehungen', color: '#ec4899', icon: 'Users' },
};

export const GOAL_TYPES = {
  milestone: { label: 'Meilensteine', description: 'Ziel mit Teilzielen' },
  numeric: { label: 'Numerisch', description: 'z.B. 50 Bücher lesen' },
  habit: { label: 'Gewohnheit', description: 'Tägliche Wiederholung' },
};

export const calculateGoalProgress = (goal) => {
  if (goal.goal_type === 'milestone') {
    const total = goal.milestones?.length || 0;
    if (total === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / total) * 100);
  }
  if (goal.goal_type === 'numeric') {
    if (!goal.target_value) return 0;
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  }
  return 0;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};
