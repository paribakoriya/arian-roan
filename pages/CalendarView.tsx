
import React, { useState, useMemo } from 'react';
import { useExams } from '../hooks/useExams';
import { TimelineEvent } from '../types';
import { DATE_FIELDS, DATE_FIELD_LABELS } from '../constants';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';
import { Link } from 'react-router-dom';

const CalendarView: React.FC = () => {
  const { exams } = useExams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const eventsByDate = useMemo(() => {
    const eventMap: { [key: string]: TimelineEvent[] } = {};
    exams.forEach(exam => {
      DATE_FIELDS.forEach(field => {
        const dateStr = exam[field as keyof typeof exam] as string | undefined;
        if (dateStr) {
          const date = new Date(dateStr);
          // Adjust for timezone offset
          const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
          const key = `${adjustedDate.getFullYear()}-${adjustedDate.getMonth()}-${adjustedDate.getDate()}`;
          if (!eventMap[key]) {
            eventMap[key] = [];
          }
          eventMap[key].push({
            examId: exam.id,
            examName: exam.examName,
            type: DATE_FIELD_LABELS[field] as TimelineEvent['type'],
            date: dateStr,
          });
        }
      });
    });
    return eventMap;
  }, [exams]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    const key = `${year}-${month}-${selectedDay}`;
    return eventsByDate[key] || [];
  }, [selectedDay, year, month, eventsByDate]);

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
    setSelectedDay(null);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex-grow">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&lt;</button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleString('default', { month: 'long' })} {year}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 dark:text-gray-400">
            {weekDays.map(day => <div key={day} className="font-semibold">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
            {monthDays.map(day => {
              const key = `${year}-${month}-${day}`;
              const hasEvents = eventsByDate[key] && eventsByDate[key].length > 0;
              return (
                <div 
                  key={day} 
                  className={`p-2 h-20 md:h-24 flex flex-col items-center justify-start cursor-pointer border rounded-md transition-colors ${selectedDay === day ? 'bg-primary-100 dark:bg-primary-900 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full ${new Date().toDateString() === new Date(year, month, day).toDateString() ? 'bg-primary-500 text-white' : ''}`}>{day}</span>
                  {hasEvents && <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1"></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-full">
            <h3 className="font-semibold text-lg">
              {selectedDay ? `Events on ${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDay}` : 'Select a day'}
            </h3>
            <div className="mt-4 space-y-3">
              {selectedDayEvents.length > 0 ? selectedDayEvents.map((event, i) => (
                <Link to={`/exam/${event.examId}`} key={i} className="block p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <p className="font-semibold text-sm">{event.examName}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">{event.type}</p>
                </Link>
              )) : selectedDay && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No events for this day.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
