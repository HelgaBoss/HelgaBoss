import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { goalsApi } from '@/lib/api';
import { CATEGORIES, GOAL_TYPES, cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const CreateGoalDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goal_type: '',
    target_value: '',
    start_value: '',
    starting_situation: '',
    deadline: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.goal_type) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    try {
      await goalsApi.create({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        goal_type: formData.goal_type,
        target_value: formData.goal_type === 'numeric' ? parseInt(formData.target_value) || null : null,
        start_value: formData.goal_type === 'numeric' ? parseInt(formData.start_value) || 0 : 0,
        starting_situation: formData.starting_situation || null,
        deadline: formData.deadline ? formData.deadline.toISOString() : null,
      });
      toast.success('Ziel erstellt!');
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        goal_type: '',
        target_value: '',
        start_value: '',
        starting_situation: '',
        deadline: null,
      });
      onSuccess();
    } catch (error) {
      toast.error('Fehler beim Erstellen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border" data-testid="create-goal-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Neues Ziel erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="z.B. 50 Bücher lesen"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12"
              data-testid="goal-title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Optionale Beschreibung..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="goal-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12" data-testid="goal-category-select">
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

            <div className="space-y-2">
              <Label>Zieltyp *</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
              >
                <SelectTrigger className="h-12" data-testid="goal-type-select">
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.goal_type === 'numeric' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_value">Ausgangslage (Startwert)</Label>
                <Input
                  id="start_value"
                  type="number"
                  placeholder="z.B. 5"
                  value={formData.start_value}
                  onChange={(e) => setFormData({ ...formData, start_value: e.target.value })}
                  className="h-12"
                  data-testid="goal-start-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_value">Zielwert</Label>
                <Input
                  id="target_value"
                  type="number"
                  placeholder="z.B. 50"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="h-12"
                  data-testid="goal-target-input"
                />
              </div>
            </div>
          )}

          {/* Ausgangslage für alle Zieltypen */}
          <div className="space-y-2">
            <Label htmlFor="starting_situation">Wo stehe ich jetzt? (Ausgangslage)</Label>
            <Textarea
              id="starting_situation"
              placeholder="Beschreibe deine aktuelle Situation... z.B. 'Ich laufe aktuell 2x pro Woche 3km'"
              value={formData.starting_situation}
              onChange={(e) => setFormData({ ...formData, starting_situation: e.target.value })}
              className="min-h-[80px]"
              data-testid="goal-starting-situation-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="deadline"
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="h-12 pl-10"
                data-testid="goal-deadline-input"
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
              data-testid="create-goal-submit"
            >
              {loading ? 'Erstelle...' : 'Ziel erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;
