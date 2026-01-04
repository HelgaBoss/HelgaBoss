import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { habitsApi } from '@/lib/api';
import { CATEGORIES, getTodayISO } from '@/lib/utils';
import { toast } from 'sonner';

// Day View - Today's habits to check off
export const DayView = ({ habits, onUpdate, selectedDate }) => {
  const [completing, setCompleting] = useState(null);
  const dateStr = selectedDate || getTodayISO();
  const isToday = dateStr === getTodayISO();

  const handleComplete = async (habitId) => {
    if (!isToday) {
      toast.error('Nur heute kann abgehakt werden');
      return;
    }
    
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
      {habits.map((habit, index) => {
        const category = CATEGORIES[habit.category];
        const isCompleted = habit.completions?.includes(dateStr);
        const todayOption = habit.selectedOptions?.[dateStr];
        const todayNote = habit.notes?.[dateStr];

        return (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleComplete(habit.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isCompleted
                ? 'bg-primary/10 border-primary/30'
                : 'bg-card border-border hover:border-primary/30'
            } ${!isToday ? 'opacity-60 cursor-not-allowed' : ''}`}
            data-testid={`day-habit-${habit.id}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                } ${completing === habit.id ? 'animate-pulse' : ''}`}
              >
                {isCompleted && <Check className="h-5 w-5 text-primary-foreground" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className={`font-medium ${isCompleted ? 'text-muted-foreground' : ''}`}>
                    {habit.title}
                  </span>
                </div>
                {(todayOption || todayNote) && (
                  <div className="flex gap-2 mt-1">
                    {todayOption && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        {todayOption}
                      </span>
                    )}
                    {todayNote && (
                      <span className="text-xs text-muted-foreground">📝 {todayNote}</span>
                    )}
                  </div>
                )}
              </div>

              {habit.streak > 0 && (
                <span className="text-sm font-bold text-accent">🔥 {habit.streak}</span>
              )}
            </div>
          </motion.div>
        );
      })}
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
            <p className="text-xs text-muted-foreground">Längster Streak</p>
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
