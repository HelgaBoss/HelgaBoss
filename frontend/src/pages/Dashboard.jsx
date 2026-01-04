import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, Flame, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { goalsApi, habitsApi } from '@/lib/api';
import { calculateGoalProgress } from '@/lib/utils';
import { toast } from 'sonner';
import GoalCard from '@/components/GoalCard';
import HabitTracker from '@/components/HabitTracker';
import CreateGoalDialog from '@/components/CreateGoalDialog';
import CreateHabitDialog from '@/components/CreateHabitDialog';
import ProgressCircle from '@/components/ProgressCircle';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
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
      toast.error('Fehler beim Laden der Daten');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, goal) => acc + calculateGoalProgress(goal), 0) / goals.length)
    : 0;

  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="dashboard">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground" data-testid="dashboard-title">
              Jahresziele {currentYear}
            </h1>
            <p className="text-muted-foreground mt-1">Verfolge deine Ziele und Gewohnheiten</p>
          </div>
          <Link to="/calendar">
            <Button variant="ghost" size="icon" data-testid="calendar-link">
              <Calendar className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="bento-grid"
      >
        {/* Hero Card - Overall Progress */}
        <motion.div
          variants={itemVariants}
          className="col-span-full md:col-span-4 lg:col-span-4 row-span-2 bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors"
          data-testid="hero-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Gesamtfortschritt</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <ProgressCircle progress={overallProgress} size={200} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{goals.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Aktive Ziele</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-2xl font-bold">{totalStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Tage Streak</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Habits Card */}
        <motion.div
          variants={itemVariants}
          className="col-span-full md:col-span-2 lg:col-span-2 row-span-2 bg-card border border-border rounded-xl p-6 overflow-hidden"
          data-testid="habits-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Tägliche Gewohnheiten</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateHabit(true)}
              data-testid="create-habit-btn"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <HabitTracker habits={habits} onUpdate={fetchData} />
        </motion.div>

        {/* Goals Grid */}
        <motion.div
          variants={itemVariants}
          className="col-span-full"
          data-testid="goals-section"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl">Meine Ziele</h2>
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold tracking-wide uppercase text-xs px-6 py-3 glow-primary"
              data-testid="create-goal-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neues Ziel
            </Button>
          </div>

          {goals.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center" data-testid="empty-goals">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Ziele</h3>
              <p className="text-muted-foreground mb-4">Erstelle dein erstes Jahresziel</p>
              <Button
                onClick={() => setShowCreateGoal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                data-testid="create-first-goal-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ziel erstellen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GoalCard goal={goal} onUpdate={fetchData} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <CreateGoalDialog
        open={showCreateGoal}
        onOpenChange={setShowCreateGoal}
        onSuccess={fetchData}
      />
      <CreateHabitDialog
        open={showCreateHabit}
        onOpenChange={setShowCreateHabit}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Dashboard;
