import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trash2, MessageSquare, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { habitsApi } from '@/lib/api';
import { CATEGORIES, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';

const HabitTracker = ({ habits, onUpdate }) => {
  const [completing, setCompleting] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const today = getTodayISO();

  const handleComplete = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    const isCompleted = habit?.completions?.includes(today);
    
    // If completing (not uncompleting), show input
    if (!isCompleted) {
      setEditingNote(habitId);
      setNoteText(habit?.notes?.[today] || '');
      setSelectedOption(habit?.selectedOptions?.[today] || '');
      return;
    }
    
    // If uncompleting, just toggle
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

  const handleSaveWithNote = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    
    // If habit has options and none selected, show error
    if (habit?.options?.length > 0 && !selectedOption) {
      toast.error('Bitte wähle eine Option aus');
      return;
    }
    
    setCompleting(habitId);
    try {
      await habitsApi.complete(habitId, today, noteText.trim() || null, selectedOption || null);
      setEditingNote(null);
      setNoteText('');
      setSelectedOption('');
      onUpdate();
      toast.success('Erledigt! 🎉');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setCompleting(null);
    }
  };

  const handleUpdateNote = async (habitId) => {
    try {
      await habitsApi.updateNote(habitId, today, noteText.trim(), selectedOption || null);
      setEditingNote(null);
      setNoteText('');
      setSelectedOption('');
      onUpdate();
      toast.success('Gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
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

  const openNoteEditor = (habit, e) => {
    e.stopPropagation();
    setEditingNote(habit.id);
    setNoteText(habit.notes?.[today] || '');
    setSelectedOption(habit.selectedOptions?.[today] || '');
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
          const todayNote = habit.notes?.[today];
          const todayOption = habit.selectedOptions?.[today];
          const isEditing = editingNote === habit.id;
          const hasOptions = habit.options && habit.options.length > 0;

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative rounded-lg border transition-all ${
                isCompletedToday
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-secondary/30 border-border hover:border-primary/20'
              }`}
              data-testid={`habit-item-${habit.id}`}
            >
              {/* Main habit row */}
              <div
                className="p-3 cursor-pointer flex items-center gap-3"
                onClick={() => handleComplete(habit.id)}
              >
                {/* Check button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
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

                {/* Note/Option indicator */}
                {isCompletedToday && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${(todayNote || todayOption) ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => openNoteEditor(habit, e)}
                    data-testid={`habit-note-btn-${habit.id}`}
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                )}

                {/* Serie */}
                {habit.streak > 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      habit.streak >= 7 ? 'bg-orange-500/20 text-orange-400 streak-pulse' : 'bg-secondary text-muted-foreground'
                    }`}
                    data-testid={`habit-serie-${habit.id}`}
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

              {/* Display selected option and/or note */}
              {isCompletedToday && (todayOption || todayNote) && !isEditing && (
                <div 
                  className="px-3 pb-3 pt-0 flex flex-wrap gap-2"
                  onClick={(e) => openNoteEditor(habit, e)}
                >
                  {todayOption && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full cursor-pointer hover:bg-accent/30">
                      {todayOption}
                    </span>
                  )}
                  {todayNote && (
                    <p className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1 cursor-pointer hover:bg-secondary/70 flex-1">
                      📝 {todayNote}
                    </p>
                  )}
                </div>
              )}

              {/* Editor */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3 space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dropdown for options */}
                  {hasOptions && (
                    <Select
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                    >
                      <SelectTrigger className="h-10" data-testid={`habit-option-select-${habit.id}`}>
                        <SelectValue placeholder="Option wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {habit.options.map((option, idx) => (
                          <SelectItem key={idx} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Note input */}
                  <Textarea
                    placeholder="Notiz hinzufügen... (optional)"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[60px] text-sm"
                    autoFocus={!hasOptions}
                    data-testid={`habit-note-input-${habit.id}`}
                  />
                  
                  <div className="flex gap-2">
                    {isCompletedToday ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNote(habit.id)}
                          className="flex-1"
                        >
                          Speichern
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNote(null);
                            setNoteText('');
                            setSelectedOption('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveWithNote(habit.id)}
                          className="flex-1 bg-primary text-primary-foreground"
                          disabled={completing === habit.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Erledigt
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNote(null);
                            setNoteText('');
                            setSelectedOption('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;
