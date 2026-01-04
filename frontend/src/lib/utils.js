import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = {
  health: { label: 'Gesundheit', color: '#fe4939', icon: 'Heart' },
  career: { label: 'Karriere', color: '#ff904D', icon: 'Briefcase' },
  finance: { label: 'Finanzen', color: '#fafafa', icon: 'Wallet' },
  personal: { label: 'Persönlich', color: '#fe4939', icon: 'User' },
  education: { label: 'Bildung', color: '#ff904D', icon: 'GraduationCap' },
  relationships: { label: 'Beziehungen', color: '#fafafa', icon: 'Users' },
};

// Motivations-Quotes auf Deutsch
export const MOTIVATION_QUOTES = [
  { text: "Der beste Zeitpunkt anzufangen war gestern. Der zweitbeste ist jetzt.", author: "Chinesisches Sprichwort" },
  { text: "Kleine Schritte führen zu großen Veränderungen.", author: "Unbekannt" },
  { text: "Disziplin ist die Brücke zwischen Zielen und Erfolg.", author: "Jim Rohn" },
  { text: "Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.", author: "Robert Collier" },
  { text: "Du musst nicht perfekt sein, um anzufangen. Du musst anfangen, um perfekt zu werden.", author: "Zig Ziglar" },
  { text: "Jeder Tag ist eine neue Chance, das zu werden, was du sein könntest.", author: "George Eliot" },
  { text: "Gewohnheiten formen deinen Charakter, und dein Charakter formt dein Schicksal.", author: "Unbekannt" },
  { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was du tust.", author: "Steve Jobs" },
  { text: "Fortschritt, nicht Perfektion.", author: "Unbekannt" },
  { text: "Wer aufhört besser zu werden, hat aufgehört gut zu sein.", author: "Philip Rosenthal" },
];

export const getRandomQuote = () => {
  return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
};

// Täglicher Quote - basiert auf dem Datum, wechselt täglich
export const getDailyQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % MOTIVATION_QUOTES.length;
  return MOTIVATION_QUOTES[index];
};

export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
