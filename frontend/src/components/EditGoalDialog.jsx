import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { goalsApi } from '@/lib/api';
import { CATEGORIES } from '@/lib/utils';
import { toast } from 'sonner';

const EditGoalDialog = ({ open, onOpenChange, goal, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_value: '',
    deadline: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || '',
        target_value: goal.target_value?.toString() || '',
        deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      });
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    try {
      await goalsApi.update(goal.id, {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        target_value: formData.target_value ? parseInt(formData.target_value) : null,
        deadline: formData.deadline || null,
      });
      toast.success('Ziel aktualisiert!');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border" data-testid="edit-goal-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Ziel bearbeiten</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titel *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12"
              data-testid="edit-goal-title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Beschreibung</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="edit-goal-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-12" data-testid="edit-goal-category-select">
                <SelectValue placeholder="Wählen..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goal.goal_type === 'numeric' && (
            <div className="space-y-2">
              <Label htmlFor="edit-target">Zielwert</Label>
              <Input
                id="edit-target"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="h-12"
                data-testid="edit-goal-target-input"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Deadline</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="h-12 pl-10"
                data-testid="edit-goal-deadline-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
              data-testid="edit-goal-submit"
            >
              {loading ? 'Speichere...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;
