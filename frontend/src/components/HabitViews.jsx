import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Flame, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { habitsApi } from '@/lib/api';
import { CATEGORIES, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';

// Day View - Today's habits to check off with dropdown and notes
export const DayView = ({ habits, onUpdate, selectedDate }) => {
  const [completing, setCompleting] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  
  const dateStr = selectedDate || getTodayISO();
  const isToday = dateStr === getTodayISO();

  const handleHabitClick = (habit) => {
    const isCompleted = habit.completions?.includes(dateStr);
    
    // If already completed, toggle off
    if (isCompleted) {
      handleUncomplete(habit.id);
      return;
    }
    
    // Open editor for completion
    setEditingHabit(habit.id);
    setNoteText(habit.notes?.[dateStr] || '');
    setSelectedOption(habit.selectedOptions?.[dateStr] || '');
  };

  const handleUncomplete = async (habitId) => {
    setCompleting(habitId);
    try {
      await habitsApi.complete(habitId, dateStr);
      onUpdate();
    } catch (error) {
      toast.error('Fehler');
    } finally {
      setCompleting(null);
    }
  };

  const handleComplete = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    
    // If habit has options and none selected, show error
    if (habit?.options?.length > 0 && !selectedOption) {
      toast.error('Bitte wähle eine Option aus');
      return;
    }
    
    setCompleting(habitId);
    try {
      await habitsApi.complete(habitId, dateStr, noteText.trim() || null, selectedOption || null);
      setEditingHabit(null);
      setNoteText('');
      setSelectedOption('');
      onUpdate();
      toast.success('Erledigt! 🎉');
    } catch (error) {
      toast.error('Fehler');
    } finally {
      setCompleting(null);
    }
  };

  const handleUpdateNote = async (habitId) => {
    try {
      await habitsApi.updateNote(habitId, dateStr, noteText.trim(), selectedOption || null);
      setEditingHabit(null);
      setNoteText('');
      setSelectedOption('');
      onUpdate();
      toast.success('Gespeichert');
    } catch (error) {
      toast.error('Fehler');
    }
  };

  const openEditor = (habit, e) => {
    e.stopPropagation();
    setEditingHabit(habit.id);
    setNoteText(habit.notes?.[dateStr] || '');
    setSelectedOption(habit.selectedOptions?.[dateStr] || '');
  };

  const closeEditor = () => {
    setEditingHabit(null);
    setNoteText('');
    setSelectedOption('');
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Keine Gewohnheiten vorhanden</p>
        <p className="text-sm mt-1">Erstelle deine erste Gewohnheit!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {habits.map((habit, index) => {
          const category = CATEGORIES[habit.category];
          const isCompleted = habit.completions?.includes(dateStr);
          const todayOption = habit.selectedOptions?.[dateStr];
          const todayNote = habit.notes?.[dateStr];
          const isEditing = editingHabit === habit.id;
          const hasOptions = habit.options && habit.options.length > 0;

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-secondary/30 border-border hover:border-primary/30'
              }`}
              data-testid={`day-habit-${habit.id}`}
            >
              {/* Main row */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => handleHabitClick(habit)}
              >
                {/* Checkbox */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isCompleted
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground hover:border-primary'
                  } ${completing === habit.id ? 'animate-pulse' : ''}`}
                >
                  {isCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="h-5 w-5 text-primary-foreground" />
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
                    <span className={`font-medium ${isCompleted ? 'text-muted-foreground' : ''}`}>
                      {habit.title}
                    </span>
                  </div>
                </div>

                {/* Edit button for completed habits */}
                {isCompleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${(todayNote || todayOption) ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={(e) => openEditor(habit, e)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}

                {/* Serie */}
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 text-sm font-bold text-accent">
                    <Flame className="h-4 w-4" />
                    {habit.streak}
                  </div>
                )}
              </div>

              {/* Display selected option and note (when not editing) */}
              {isCompleted && (todayOption || todayNote) && !isEditing && (
                <div 
                  className="px-4 pb-4 pt-0 flex flex-wrap gap-2 cursor-pointer"
                  onClick={(e) => openEditor(habit, e)}
                >
                  {todayOption && (
                    <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">
                      {todayOption}
                    </span>
                  )}
                  {todayNote && (
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1 flex-1">
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
                  className="px-4 pb-4 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dropdown for options */}
                  {hasOptions && (
                    <Select value={selectedOption} onValueChange={setSelectedOption}>
                      <SelectTrigger className="h-11" data-testid={`habit-option-select-${habit.id}`}>
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
                    className="min-h-[80px] text-sm"
                    autoFocus={!hasOptions}
                    data-testid={`habit-note-input-${habit.id}`}
                  />
                  
                  {/* Buttons */}
                  <div className="flex gap-2">
                    {isCompleted ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdateNote(habit.id)} className="flex-1">
                          Speichern
                        </Button>
                        <Button size="sm" variant="ghost" onClick={closeEditor}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleComplete(habit.id)}
                          className="flex-1 bg-primary text-primary-foreground"
                          disabled={completing === habit.id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Erledigt
                        </Button>
                        <Button size="sm" variant="ghost" onClick={closeEditor}>
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

// Week View - 7 days overview
export const WeekView = ({ habits, currentDate }) => {
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('de-DE', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: d.toISOString().split('T')[0] === getTodayISO(),
      });
    }
    return days;
  }, [currentDate]);

  return (
    <div className="space-y-4">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={`text-center p-2 rounded-lg ${
              day.isToday ? 'bg-primary text-primary-foreground' : 'bg-card'
            }`}
          >
            <p className="text-xs font-medium">{day.dayName}</p>
            <p className="text-lg font-bold">{day.dayNum}</p>
          </div>
        ))}
      </div>

      {/* Habits grid */}
      {habits.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Keine Gewohnheiten</p>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const category = CATEGORIES[habit.category];
            return (
              <div key={habit.id} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-sm">{habit.title}</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const completed = habit.completions?.includes(day.date);
                    return (
                      <div
                        key={day.date}
                        className={`h-8 rounded-md flex items-center justify-center ${
                          completed
                            ? 'bg-primary/30'
                            : 'bg-secondary/30'
                        }`}
                      >
                        {completed && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Month View - Calendar style
export const MonthView = ({ habits, currentDate }) => {
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
    
    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d.toISOString().split('T')[0],
        day: i,
        isToday: d.toISOString().split('T')[0] === getTodayISO(),
      });
    }
    return days;
  }, [currentDate]);

  // Calculate completion rate per day
  const getCompletionRate = (dateStr) => {
    if (!habits.length) return 0;
    const completed = habits.filter(h => h.completions?.includes(dateStr)).length;
    return completed / habits.length;
  };

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const rate = getCompletionRate(day.date);
          
          return (
            <div
              key={day.date}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                day.isToday
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              style={{
                backgroundColor: rate > 0 
                  ? `rgba(254, 73, 57, ${0.2 + rate * 0.6})`
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className={day.isToday ? 'font-bold' : ''}>{day.day}</span>
              {rate > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(rate * 100)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <span>0%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(254, 73, 57, 0.5)' }} />
          <span>50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(254, 73, 57, 0.8)' }} />
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

// Year View - Heatmap style
export const YearView = ({ habits, currentDate }) => {
  const yearData = useMemo(() => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const days = [];
      
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, m, d);
        days.push({
          date: date.toISOString().split('T')[0],
          day: d,
        });
      }
      
      months.push({
        name: new Date(year, m, 1).toLocaleDateString('de-DE', { month: 'short' }),
        days,
      });
    }
    
    return months;
  }, [currentDate]);

  const getCompletionRate = (dateStr) => {
    if (!habits.length) return 0;
    const completed = habits.filter(h => h.completions?.includes(dateStr)).length;
    return completed / habits.length;
  };

  const today = getTodayISO();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {yearData.map((month) => (
          <div key={month.name} className="bg-card border border-border rounded-xl p-3">
            <h4 className="text-sm font-bold mb-2 text-center">{month.name}</h4>
            <div className="grid grid-cols-7 gap-[2px]">
              {month.days.map((day) => {
                const rate = getCompletionRate(day.date);
                const isToday = day.date === today;
                
                return (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${isToday ? 'ring-1 ring-white' : ''}`}
                    style={{
                      backgroundColor: rate > 0
                        ? `rgba(254, 73, 57, ${0.3 + rate * 0.7})`
                        : 'rgba(255,255,255,0.1)',
                    }}
                    title={`${day.date}: ${Math.round(rate * 100)}%`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-bold mb-3">Jahresstatistik</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-primary">
              {habits.reduce((acc, h) => acc + (h.completions?.length || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Erledigungen</p>
          </div>
          <div>
            <p className="text-2xl font-black text-accent">
              {Math.max(...habits.map(h => h.streak || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Längste Serie</p>
          </div>
          <div>
            <p className="text-2xl font-black">
              {habits.length}
            </p>
            <p className="text-xs text-muted-foreground">Gewohnheiten</p>
          </div>
          <div>
            <p className="text-2xl font-black">
              {(() => {
                const allDates = new Set();
                habits.forEach(h => h.completions?.forEach(d => allDates.add(d)));
                return allDates.size;
              })()}
            </p>
            <p className="text-xs text-muted-foreground">Aktive Tage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { DayView, WeekView, MonthView, YearView };
