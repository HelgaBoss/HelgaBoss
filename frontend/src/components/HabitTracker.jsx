import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { habitsApi } from '@/lib/api';
import { CATEGORIES, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';

const HabitTracker = ({ habits, onUpdate }) => {
  const [completing, setCompleting] = useState(null);
  const today = getTodayISO();

  const handleComplete = async (habitId) => {
    setCompleting(habitId);
    try {
      await habitsApi.complete(habitId, today);
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setCompleting(null);
    }
  };

  const handleDelete = async (habitId, e) => {
    e.stopPropagation();
    if (!window.confirm('Gewohnheit wirklich löschen?')) return;

    try {
      await habitsApi.delete(habitId);
      onUpdate();
      toast.success('Gewohnheit gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-habits">
        <p className="text-muted-foreground text-sm">
          Noch keine täglichen Gewohnheiten.
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Klicke auf + um eine hinzuzufügen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto" data-testid="habit-list">
      <AnimatePresence>
        {habits.map((habit, index) => {
          const category = CATEGORIES[habit.category];
          const isCompletedToday = habit.completions?.includes(today);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                isCompletedToday
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-secondary/30 border-border hover:border-primary/20'
              }`}
              onClick={() => handleComplete(habit.id)}
              data-testid={`habit-item-${habit.id}`}
            >
              <div className="flex items-center gap-3">
                {/* Check button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompletedToday
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground group-hover:border-primary'
                  } ${completing === habit.id ? 'animate-pulse' : ''}`}
                  data-testid={`habit-check-${habit.id}`}
                >
                  {isCompletedToday && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="check-bounce"
                    >
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span
                      className={`font-medium truncate ${
                        isCompletedToday ? 'text-muted-foreground' : ''
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>
                </div>

                {/* Streak */}
                {habit.streak > 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      habit.streak >= 7 ? 'bg-orange-500/20 text-orange-400 streak-pulse' : 'bg-secondary text-muted-foreground'
                    }`}
                    data-testid={`habit-streak-${habit.id}`}
                  >
                    <Flame className="h-3 w-3" />
                    {habit.streak}
                  </div>
                )}

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(habit.id, e)}
                  data-testid={`habit-delete-${habit.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;
