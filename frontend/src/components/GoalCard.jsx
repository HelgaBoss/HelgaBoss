import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Target, Hash, Plus, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { goalsApi } from '@/lib/api';
import { CATEGORIES, GOAL_TYPES, calculateGoalProgress, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const GoalCard = ({ goal, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const category = CATEGORIES[goal.category];
  const progress = calculateGoalProgress(goal);

  const handleIncrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (updating) return;
    
    const newValue = (goal.current_value || 0) + 1;
    if (goal.target_value && newValue > goal.target_value) {
      toast.info('Zielwert erreicht! 🎉');
      return;
    }
    
    setUpdating(true);
    try {
      await goalsApi.updateProgress(goal.id, newValue);
      if (onUpdate) onUpdate();
      if (newValue === goal.target_value) {
        toast.success('Ziel erreicht! 🎉🎉🎉');
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (updating) return;
    
    const newValue = Math.max(0, (goal.current_value || 0) - 1);
    
    setUpdating(true);
    try {
      await goalsApi.updateProgress(goal.id, newValue);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Link to={`/goal/${goal.id}`} data-testid={`goal-card-${goal.id}`}>
      <div className="bg-card border border-border rounded-xl p-6 card-hover group relative overflow-hidden">
        {/* Category indicator */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: category.color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mb-2"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.label}
            </span>
            <h3 className="font-bold text-lg truncate" data-testid={`goal-title-${goal.id}`}>
              {goal.title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Goal Type Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          {goal.goal_type === 'milestone' ? (
            <>
              <Target className="h-3 w-3" />
              <span>{goal.milestones?.filter(m => m.completed).length || 0} / {goal.milestones?.length || 0} Meilensteine</span>
            </>
          ) : goal.goal_type === 'numeric' ? (
            <>
              <Hash className="h-3 w-3" />
              <span>{goal.current_value || 0} / {goal.target_value}</span>
            </>
          ) : null}
        </div>

        {/* Numeric Goal: +/- Buttons */}
        {goal.goal_type === 'numeric' && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
              onClick={handleDecrement}
              disabled={updating || (goal.current_value || 0) <= 0}
              data-testid={`goal-decrement-${goal.id}`}
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            <div className="text-center min-w-[80px]">
              <span className="text-3xl font-black">{goal.current_value || 0}</span>
              <span className="text-lg text-muted-foreground"> / {goal.target_value}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-2 hover:bg-primary/10 hover:border-primary hover:text-primary"
              onClick={handleIncrement}
              disabled={updating || (goal.current_value || 0) >= goal.target_value}
              data-testid={`goal-increment-${goal.id}`}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Deadline */}
        {goal.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Deadline: {formatDate(goal.deadline)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default GoalCard;
