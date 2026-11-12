import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProductiveDays({ logs }) {
  const dayStats = logs.reduce((acc, log) => {
    const dayOfWeek = format(new Date(log.completed_date), 'EEEE', { locale: es });
    if (!acc[dayOfWeek]) {
      acc[dayOfWeek] = { count: 0, dates: [] };
    }
    acc[dayOfWeek].count += 1;
    acc[dayOfWeek].dates.push(log.completed_date);
    return acc;
  }, {});

  const sortedDays = Object.entries(dayStats)
    .map(([day, data]) => ({ day, count: data.count }))
    .sort((a, b) => b.count - a.count);

  const topDay = sortedDays[0];

  const dayOrder = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const orderedDays = dayOrder.map(day => {
    const found = sortedDays.find(d => d.day.toLowerCase() === day);
    return found || { day: day.charAt(0).toUpperCase() + day.slice(1), count: 0 };
  });

  const maxCount = Math.max(...orderedDays.map(d => d.count), 1);

  return (
    <Card className="shadow-lg border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-green-600" />
          Días Más Productivos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {topDay && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600">Tu día más productivo es:</p>
            </div>
            <p className="text-3xl font-bold text-green-700 capitalize">{topDay.day}</p>
            <p className="text-sm text-gray-600 mt-1">{topDay.count} hábitos completados</p>
          </div>
        )}

        <div className="space-y-3">
          {orderedDays.map((dayData, index) => {
            const percentage = (dayData.count / maxCount) * 100;
            return (
              <motion.div
                key={dayData.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{dayData.day}</span>
                  <span className="text-sm font-bold text-green-600">{dayData.count}</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-end pr-2"
                  >
                    {dayData.count > 0 && (
                      <TrendingUp className="w-4 h-4 text-white" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}