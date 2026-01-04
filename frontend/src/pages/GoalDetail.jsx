import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit2, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { goalsApi, milestonesApi } from '@/lib/api';
import { CATEGORIES, calculateGoalProgress, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import EditGoalDialog from '@/components/EditGoalDialog';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    try {
      const res = await goalsApi.getOne(id);
      setGoal(res.data);
      setProgressValue(res.data.current_value || 0);
    } catch (error) {
      toast.error('Ziel nicht gefunden');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;

    try {
      await milestonesApi.add(id, { title: newMilestone.trim() });
      setNewMilestone('');
      fetchGoal();
      toast.success('Meilenstein hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen');
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await milestonesApi.toggle(id, milestoneId);
      fetchGoal();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await milestonesApi.delete(id, milestoneId);
      fetchGoal();
      toast.success('Meilenstein gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleDeleteGoal = async () => {
    if (!window.confirm('Möchtest du dieses Ziel wirklich löschen?')) return;

    try {
      await goalsApi.delete(id);
      toast.success('Ziel gelöscht');
      navigate('/');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleUpdateProgress = async () => {
    try {
      await goalsApi.updateProgress(id, progressValue);
      setEditingProgress(false);
      fetchGoal();
      toast.success('Fortschritt aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="goal-detail-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!goal) return null;

  const category = CATEGORIES[goal.category];
  const progress = calculateGoalProgress(goal);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="goal-detail">
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
          data-testid="back-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                data-testid="goal-category"
              >
                {category.label}
              </span>
              {goal.deadline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(goal.deadline)}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black" data-testid="goal-title">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="text-muted-foreground mt-2">{goal.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
              data-testid="edit-goal-btn"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteGoal}
              className="text-destructive hover:text-destructive"
              data-testid="delete-goal-btn"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
        data-testid="progress-section"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Fortschritt</h2>
          <span className="text-2xl font-black text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />

        {goal.goal_type === 'numeric' && (
          <div className="mt-4">
            {editingProgress ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                  className="w-24"
                  data-testid="progress-input"
                />
                <span className="text-muted-foreground">/ {goal.target_value}</span>
                <Button size="sm" onClick={handleUpdateProgress} data-testid="save-progress-btn">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingProgress(false)}>
                  Abbrechen
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setEditingProgress(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="edit-progress-btn"
              >
                {goal.current_value} / {goal.target_value} - Klicken zum Bearbeiten
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Milestones Section */}
      {goal.goal_type === 'milestone' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
          data-testid="milestones-section"
        >
          <h2 className="font-bold text-lg mb-4">Meilensteine</h2>

          {/* Add Milestone Form */}
          <form onSubmit={handleAddMilestone} className="flex gap-2 mb-6">
            <Input
              placeholder="Neuer Meilenstein..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              className="flex-1"
              data-testid="new-milestone-input"
            />
            <Button type="submit" size="icon" data-testid="add-milestone-btn">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {/* Milestones List */}
          <div className="space-y-2">
            {goal.milestones?.length === 0 ? (
              <p className="text-muted-foreground text-sm" data-testid="no-milestones">
                Noch keine Meilensteine. Füge deinen ersten hinzu!
              </p>
            ) : (
              goal.milestones?.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    milestone.completed
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-secondary/30 border-border hover:border-primary/20'
                  }`}
                  data-testid={`milestone-${milestone.id}`}
                >
                  <button
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      milestone.completed
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                    data-testid={`toggle-milestone-${milestone.id}`}
                  >
                    {milestone.completed && <Check className="h-4 w-4 text-primary-foreground" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      milestone.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {milestone.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    data-testid={`delete-milestone-${milestone.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Edit Dialog */}
      <EditGoalDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        goal={goal}
        onSuccess={fetchGoal}
      />
    </div>
  );
};

export default GoalDetail;
