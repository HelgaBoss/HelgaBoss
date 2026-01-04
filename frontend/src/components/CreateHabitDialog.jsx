import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { habitsApi } from '@/lib/api';
import { CATEGORIES } from '@/lib/utils';
import { toast } from 'sonner';

const CreateHabitDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
  });
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove) => {
    setOptions(options.filter(opt => opt !== optionToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

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
        options: options,
      });
      toast.success('Gewohnheit erstellt!');
      onOpenChange(false);
      setFormData({ title: '', category: '' });
      setOptions([]);
      setNewOption('');
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
      <DialogContent className="sm:max-w-[450px] bg-card border-border" data-testid="create-habit-dialog">
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

          {/* Custom Options */}
          <div className="space-y-2">
            <Label>Auswahloptionen (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Füge Optionen hinzu, die du beim Abhaken auswählen kannst
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="z.B. Joggen, Yoga, Schwimmen..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-10"
                data-testid="habit-option-input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddOption}
                className="h-10 w-10 flex-shrink-0"
                data-testid="habit-add-option-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Options Tags */}
            {options.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {options.map((option, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                  >
                    {option}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option)}
                      className="hover:text-primary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
