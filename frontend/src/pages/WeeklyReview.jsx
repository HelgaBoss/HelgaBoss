import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Flame, Target, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { goalsApi, habitsApi } from '@/lib/api';
import { CATEGORIES, calculateGoalProgress, getWeekNumber, getDailyQuote } from '@/lib/utils';
import { toast } from 'sonner';

const WeeklyReview = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(getDailyQuote());
  
  const currentYear = new Date().getFullYear();
  const currentWeek = getWeekNumber(new Date());

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
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly stats
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  
  // Calculate habit completions this week
  const weeklyHabitStats = habits.map(habit => {
    const completionsThisWeek = (habit.completions || []).filter(date => 
      weekDates.includes(date)
    ).length;
    return {
      ...habit,
      completionsThisWeek,
      percentage: Math.round((completionsThisWeek / 7) * 100)
    };
  });

  const totalHabitCompletions = weeklyHabitStats.reduce((acc, h) => acc + h.completionsThisWeek, 0);
  const maxPossibleCompletions = habits.length * 7;
  const weeklyHabitPercentage = maxPossibleCompletions > 0 
    ? Math.round((totalHabitCompletions / maxPossibleCompletions) * 100) 
    : 0;

  // Goal progress stats
  const overallGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, goal) => acc + calculateGoalProgress(goal), 0) / goals.length)
    : 0;

  const completedMilestones = goals.reduce((acc, goal) => {
    if (goal.goal_type === 'milestone') {
      return acc + (goal.milestones?.filter(m => m.completed).length || 0);
    }
    return acc;
  }, 0);

  const totalMilestones = goals.reduce((acc, goal) => {
    if (goal.goal_type === 'milestone') {
      return acc + (goal.milestones?.length || 0);
    }
    return acc;
  }, 0);

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="weekly-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="weekly-review">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
          data-testid="weekly-back-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Kalenderwoche {currentWeek}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black" data-testid="weekly-title">
          Wochenrückblick
        </h1>
      </motion.header>

      {/* Motivation Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6 mb-6"
        data-testid="motivation-quote"
      >
        <p className="text-lg md:text-xl font-medium italic text-foreground">
          "{quote.text}"
        </p>
        <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Target className="h-5 w-5" />
            <span className="text-xs font-medium text-muted-foreground">Zielfortschritt</span>
          </div>
          <span className="text-3xl font-black">{overallGoalProgress}%</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-accent mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-medium text-muted-foreground">Meilensteine</span>
          </div>
          <span className="text-3xl font-black">{completedMilestones}/{totalMilestones}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium text-muted-foreground">Woche Gewohnheiten</span>
          </div>
          <span className="text-3xl font-black">{weeklyHabitPercentage}%</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-accent mb-2">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-medium text-muted-foreground">Bester Streak</span>
          </div>
          <span className="text-3xl font-black">{bestStreak} Tage</span>
        </motion.div>
      </div>

      {/* Habit Weekly Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <h2 className="font-bold text-lg mb-4">Gewohnheiten diese Woche</h2>
        
        {weeklyHabitStats.length === 0 ? (
          <p className="text-muted-foreground">Noch keine Gewohnheiten erstellt.</p>
        ) : (
          <div className="space-y-4">
            {weeklyHabitStats.map((habit, index) => {
              const category = CATEGORIES[habit.category];
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{habit.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {habit.completionsThisWeek}/7 Tage
                      </span>
                      <span className="text-sm font-bold text-primary">{habit.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={habit.percentage} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="font-bold text-lg mb-4">Ziele Übersicht</h2>
        
        {goals.length === 0 ? (
          <p className="text-muted-foreground">Noch keine Ziele erstellt.</p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const category = CATEGORIES[goal.category];
              const progress = calculateGoalProgress(goal);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WeeklyReview;
