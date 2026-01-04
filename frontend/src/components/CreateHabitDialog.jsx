import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { habitsApi } from '@/lib/api';
import { CATEGORIES } from '@/lib/utils';
import { toast } from 'sonner';

const CreateHabitDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast.error('Bitte fülle alle Felder aus');
      return;
    }

    setLoading(true);
    try {
      await habitsApi.create({
        title: formData.title,
        category: formData.category,
      });
      toast.success('Gewohnheit erstellt!');
      onOpenChange(false);
      setFormData({ title: '', category: '' });
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
      <DialogContent className="sm:max-w-[400px] bg-card border-border" data-testid="create-habit-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Neue Gewohnheit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Was möchtest du täglich tun?</Label>
            <Input
              id="habit-title"
              placeholder="z.B. Sport machen, Meditieren, Posten..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12"
              data-testid="habit-title-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Kategorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-12" data-testid="habit-category-select">
                <SelectValue placeholder="Kategorie wählen..." />
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
              data-testid="create-habit-submit"
            >
              {loading ? 'Erstelle...' : 'Gewohnheit erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHabitDialog;
