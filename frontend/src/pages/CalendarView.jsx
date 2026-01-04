import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { goalsApi, habitsApi } from '@/lib/api';
import { CATEGORIES, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const CalendarView = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, habitsRes] = await Promise.all([
        goalsApi.getAll(),
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

  // Get deadlines for calendar highlighting
  const deadlineDates = goals
    .filter(g => g.deadline)
    .map(g => new Date(g.deadline));

  // Get habit completions for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const habitsForDate = habits.map(habit => ({
    ...habit,
    completedOnDate: habit.completions?.includes(selectedDateStr),
  }));

  // Get goals with deadlines on selected date
  const goalsOnDate = goals.filter(g => {
    if (!g.deadline) return false;
    return g.deadline.split('T')[0] === selectedDateStr;
  });

  // Milestones due on selected date
  const milestonesOnDate = goals.flatMap(goal =>
    (goal.milestones || [])
      .filter(m => m.deadline && m.deadline.split('T')[0] === selectedDateStr)
      .map(m => ({ ...m, goalTitle: goal.title, goalId: goal.id }))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="calendar-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="calendar-view">
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
          data-testid="calendar-back-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl md:text-4xl font-black" data-testid="calendar-title">
          Kalender
        </h1>
        <p className="text-muted-foreground mt-1">Überblick über Deadlines und Gewohnheiten</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
          data-testid="calendar-card"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
            modifiers={{
              deadline: deadlineDates,
            }}
            modifiersStyles={{
              deadline: {
                backgroundColor: 'rgba(190, 242, 100, 0.2)',
                borderRadius: '50%',
              },
            }}
          />
        </motion.div>

        {/* Selected Date Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4" data-testid="selected-date-title">
              {formatDate(selectedDate.toISOString())}
            </h2>

            {/* Goals with deadline on this date */}
            {goalsOnDate.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Ziel-Deadlines
                </h3>
                <div className="space-y-2">
                  {goalsOnDate.map(goal => {
                    const category = CATEGORIES[goal.category];
                    return (
                      <button
                        key={goal.id}
                        onClick={() => navigate(`/goal/${goal.id}`)}
                        className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        data-testid={`goal-deadline-${goal.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{goal.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestones due on this date */}
            {milestonesOnDate.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Meilenstein-Deadlines
                </h3>
                <div className="space-y-2">
                  {milestonesOnDate.map(milestone => (
                    <button
                      key={milestone.id}
                      onClick={() => navigate(`/goal/${milestone.goalId}`)}
                      className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      data-testid={`milestone-deadline-${milestone.id}`}
                    >
                      <span className="font-medium">{milestone.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ziel: {milestone.goalTitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Habits status for this date */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Gewohnheiten an diesem Tag
              </h3>
              {habitsForDate.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="no-habits-message">
                  Keine Gewohnheiten vorhanden
                </p>
              ) : (
                <div className="space-y-2">
                  {habitsForDate.map(habit => {
                    const category = CATEGORIES[habit.category];
                    return (
                      <div
                        key={habit.id}
                        className={`p-3 rounded-lg flex items-center gap-3 ${
                          habit.completedOnDate
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-secondary/30'
                        }`}
                        data-testid={`habit-calendar-${habit.id}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="flex-1">{habit.title}</span>
                        {habit.completedOnDate && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {goalsOnDate.length === 0 && milestonesOnDate.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4" data-testid="no-deadlines-message">
                Keine Deadlines an diesem Tag
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarView;
