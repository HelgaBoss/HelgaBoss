import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Target, Hash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, GOAL_TYPES, calculateGoalProgress, formatDate } from '@/lib/utils';

const GoalCard = ({ goal }) => {
  const category = CATEGORIES[goal.category];
  const goalType = GOAL_TYPES[goal.goal_type];
  const progress = calculateGoalProgress(goal);

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
              <span>{goal.milestones?.length || 0} Meilensteine</span>
            </>
          ) : goal.goal_type === 'numeric' ? (
            <>
              <Hash className="h-3 w-3" />
              <span>{goal.current_value} / {goal.target_value}</span>
            </>
          ) : null}
        </div>

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
