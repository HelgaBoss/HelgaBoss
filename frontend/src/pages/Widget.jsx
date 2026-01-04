import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { goalsApi, habitsApi } from '@/lib/api';
import { CATEGORIES, calculateGoalProgress, getDailyQuote, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';

const Widget = () => {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(getDailyQuote());
  const today = getTodayISO();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, habitsRes] = await Promise.all([
        goalsApi.getAll(currentYear),
        habitsApi.getAll(),
      ]);
      setGoals(goalsRes.data);
      setHabits(habitsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      await habitsApi.complete(habitId, today);
      fetchData();
    } catch (error) {
      toast.error('Fehler');
    }
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, goal) => acc + calculateGoalProgress(goal), 0) / goals.length)
    : 0;

  const completedToday = habits.filter(h => h.completions?.includes(today)).length;
  const totalStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" data-testid="widget-view">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black">Jahresziele</h1>
        <Link to="/" className="text-primary text-sm font-medium flex items-center gap-1">
          Öffnen <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-xl p-3 text-center"
        >
          <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
          <span className="text-2xl font-black">{overallProgress}%</span>
          <p className="text-[10px] text-muted-foreground">Ziele</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-3 text-center"
        >
          <Check className="h-4 w-4 mx-auto mb-1 text-primary" />
          <span className="text-2xl font-black">{completedToday}/{habits.length}</span>
          <p className="text-[10px] text-muted-foreground">Heute</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-3 text-center"
        >
          <Flame className="h-4 w-4 mx-auto mb-1 text-accent" />
          <span className="text-2xl font-black">{totalStreak}</span>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </motion.div>
      </div>

      {/* Daily Quote - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4"
      >
        <p className="text-xs italic text-foreground">"{quote.text}"</p>
        <p className="text-[10px] text-muted-foreground mt-1">— {quote.author}</p>
      </motion.div>

      {/* Quick Habits */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-muted-foreground">Tägliche Gewohnheiten</h2>
        {habits.length === 0 ? (
          <p className="text-xs text-muted-foreground">Keine Gewohnheiten</p>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = habit.completions?.includes(today);
            const category = CATEGORIES[habit.category];
            
            return (
              <motion.button
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => handleCompleteHabit(habit.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border active:bg-secondary'
                }`}
                data-testid={`widget-habit-${habit.id}`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}
                >
                  {isCompleted && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className={`text-sm flex-1 text-left ${isCompleted ? 'text-muted-foreground' : ''}`}>
                  {habit.title}
                </span>
                {habit.streak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Flame className="h-3 w-3" />
                    {habit.streak}
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Top Goals - Compact */}
      {goals.length > 0 && (
        <div className="mt-4 space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground">Top Ziele</h2>
          {goals.slice(0, 3).map((goal, index) => {
            const progress = calculateGoalProgress(goal);
            const category = CATEGORIES[goal.category];
            
            return (
              <Link key={goal.id} to={`/goal/${goal.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium truncate flex-1">{goal.title}</span>
                    <span className="text-xs font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground mt-6">
        Zum Startbildschirm hinzufügen für schnellen Zugriff
      </p>
    </div>
  );
};

export default Widget;
