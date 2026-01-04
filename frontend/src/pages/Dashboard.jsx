import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, Flame, TrendingUp, BarChart3, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { goalsApi, habitsApi, authApi, backupApi } from '@/lib/api';
import { calculateGoalProgress, getDailyQuote, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';
import GoalCard from '@/components/GoalCard';
import CreateGoalDialog from '@/components/CreateGoalDialog';
import CreateHabitDialog from '@/components/CreateHabitDialog';
import ProgressCircle from '@/components/ProgressCircle';
import BackupMenu from '@/components/BackupMenu';
import { DayView, WeekView, MonthView, YearView } from '@/components/HabitViews';
import { useAutoBackup } from '@/hooks/useAutoBackup';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';

const Dashboard = () => {
  const location = useLocation();
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [quote] = useState(getDailyQuote());
  const [user, setUser] = useState(location.state?.user || null);
  const [dataVersion, setDataVersion] = useState(0);
  const [habitView, setHabitView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = new Date().getFullYear();

  const { triggerBackup } = useAutoBackup(user, [dataVersion]);
  const { checkNow: checkDeadlines } = useDeadlineNotifications();

  useEffect(() => {
    if (location.state?.justLoggedIn) {
      toast.success(`Willkommen, ${location.state.user?.name}!`);
      window.history.replaceState({}, document.title);
    }
    
    const checkAuth = async () => {
      if (!user) {
        try {
          const currentUser = await authApi.getMe();
          if (currentUser) setUser(currentUser);
        } catch (e) {}
      }
    };
    checkAuth();
    fetchData();
  }, []);

  useEffect(() => {
    if (goals.length > 0) {
      checkDeadlines();
    }
  }, [goals, checkDeadlines]);

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

  const fetchDataAndBackup = useCallback(async () => {
    await fetchData();
    setDataVersion(v => v + 1);
    if (user) {
      setTimeout(() => triggerBackup(), 1000);
    }
  }, [user, triggerBackup]);

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, goal) => acc + calculateGoalProgress(goal), 0) / goals.length)
    : 0;

  const todayCompleted = habits.filter(h => h.completions?.includes(getTodayISO())).length;
  const bestStreak = Math.max(...habits.map(h => h.streak || 0), 0);

  // Date navigation
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (habitView === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (habitView === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (habitView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (habitView === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date display
  const getDateDisplay = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    if (habitView === 'day') {
      return currentDate.toLocaleDateString('de-DE', options);
    } else if (habitView === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.getDate()}.${start.getMonth() + 1}. - ${end.getDate()}.${end.getMonth() + 1}.${end.getFullYear()}`;
    } else if (habitView === 'month') {
      return currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    } else {
      return currentDate.getFullYear().toString();
    }
  };

  const isToday = currentDate.toISOString().split('T')[0] === getTodayISO();

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
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground" data-testid="dashboard-title">
              Jahresziele {currentYear}
            </h1>
          </div>
          <div className="flex gap-2">
            <BackupMenu user={user} onUserChange={setUser} onDataChange={fetchDataAndBackup} />
            <Link to="/weekly">
              <Button variant="ghost" size="icon" title="Wochenrückblick">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="icon" title="Kalender">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Current Date Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1">
            <h2 className="text-xl md:text-2xl font-black" data-testid="current-date">
              {getDateDisplay()}
            </h2>
            {!isToday && habitView === 'day' && (
              <Button variant="link" size="sm" onClick={goToToday} className="text-primary">
                Heute
              </Button>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Motivation Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3"
        data-testid="motivation-banner"
      >
        <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm md:text-base font-medium text-foreground italic">"{quote.text}"</p>
          <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
          <span className="text-2xl font-black">{overallProgress}%</span>
          <p className="text-xs text-muted-foreground">Ziele</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
          <span className="text-2xl font-black">{todayCompleted}/{habits.length}</span>
          <p className="text-xs text-muted-foreground">Heute</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
          <span className="text-2xl font-black">{bestStreak}</span>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </motion.div>

      {/* Habits Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-4 mb-6"
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

        {/* View Tabs */}
        <Tabs value={habitView} onValueChange={setHabitView} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="day" data-testid="tab-day">Tag</TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-week">Woche</TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-month">Monat</TabsTrigger>
            <TabsTrigger value="year" data-testid="tab-year">Jahr</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Content */}
        {habitView === 'day' && (
          <DayView 
            habits={habits} 
            onUpdate={fetchDataAndBackup} 
            selectedDate={currentDate.toISOString().split('T')[0]} 
          />
        )}
        {habitView === 'week' && (
          <WeekView habits={habits} currentDate={currentDate} />
        )}
        {habitView === 'month' && (
          <MonthView habits={habits} currentDate={currentDate} />
        )}
        {habitView === 'year' && (
          <YearView habits={habits} currentDate={currentDate} />
        )}
      </motion.div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        data-testid="goals-section"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Meine Ziele</h2>
          <Button
            onClick={() => setShowCreateGoal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs px-4"
            data-testid="create-goal-btn"
          >
            <Plus className="h-4 w-4 mr-1" />
            Neues Ziel
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center" data-testid="empty-goals">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Ziele</h3>
            <p className="text-muted-foreground mb-4">Erstelle dein erstes Jahresziel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <GoalCard goal={goal} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <CreateGoalDialog
        open={showCreateGoal}
        onOpenChange={setShowCreateGoal}
        onSuccess={fetchDataAndBackup}
      />
      <CreateHabitDialog
        open={showCreateHabit}
        onOpenChange={setShowCreateHabit}
        onSuccess={fetchDataAndBackup}
      />
    </div>
  );
};

export default Dashboard;
