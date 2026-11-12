import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HeatmapCalendar({ logs, habit }) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  
  // Get all days in the last 3 months
  const days = eachDayOfInterval({
    start: threeMonthsAgo,
    end: today
  });

  // Group logs by date
  const logsByDate = {};
  logs.forEach(log => {
    const date = format(new Date(log.completed_date), 'yyyy-MM-dd');
    logsByDate[date] = (logsByDate[date] || 0) + 1;
  });

  // Get intensity color based on completion count
  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  // Group days by week
  const weeks = [];
  let currentWeek = [];
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (day.getDay() === 6 || index === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800">
        📅 Calendario de Actividad (últimos 3 meses)
      </h3>
      
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-1 mb-2 text-xs text-gray-500 pl-8">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={i} className="w-3 text-center">{day}</div>
            ))}
          </div>
          
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 items-center">
              <div className="w-6 text-xs text-gray-500 text-right">
                {weekIndex % 4 === 0 && format(week[0], 'MMM', { locale: es })}
              </div>
              
              {week.map((day, dayIndex) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = logsByDate[dateStr] || 0;
                const isToday = isSameDay(day, today);
                
                return (
                  <motion.div
                    key={dayIndex}
                    whileHover={{ scale: 1.5 }}
                    className={`
                      w-3 h-3 rounded-sm ${getIntensityColor(count)}
                      ${isToday ? 'ring-2 ring-purple-500' : ''}
                      cursor-pointer transition-all
                    `}
                    title={`${format(day, 'd MMM yyyy', { locale: es })}: ${count} ${count === 1 ? 'vez' : 'veces'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}