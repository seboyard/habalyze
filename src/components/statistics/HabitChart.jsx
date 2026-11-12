import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HabitChart({ logs, period = 'week', habitName }) {
  const generateChartData = () => {
    const today = new Date();
    let data = [];
    
    if (period === 'week') {
      const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
      data = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = logs.filter(log => log.completed_date === dateStr).length;
        return {
          date: format(day, 'EEE', { locale: es }),
          completions: count,
          fullDate: dateStr
        };
      });
    } else if (period === 'month') {
      const weeks = eachWeekOfInterval({ start: subDays(today, 29), end: today });
      data = weeks.map(week => {
        const weekStart = startOfWeek(week);
        const weekEnd = endOfWeek(week);
        const count = logs.filter(log => {
          const logDate = new Date(log.completed_date);
          return logDate >= weekStart && logDate <= weekEnd;
        }).length;
        return {
          date: format(weekStart, 'd MMM', { locale: es }),
          completions: count
        };
      });
    } else if (period === 'year') {
      const months = eachMonthOfInterval({ start: subMonths(today, 11), end: today });
      data = months.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        const count = logs.filter(log => log.completed_date.startsWith(monthStr)).length;
        return {
          date: format(month, 'MMM', { locale: es }),
          completions: count
        };
      });
    }
    
    return data;
  };

  const data = generateChartData();
  const totalCompletions = data.reduce((sum, d) => sum + d.completions, 0);
  const avgCompletions = totalCompletions / data.length;

  const periodLabels = {
    week: 'Última Semana',
    month: 'Último Mes',
    year: 'Último Año'
  };

  return (
    <Card className="shadow-lg border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{habitName} - {periodLabels[period]}</span>
          <div className="text-sm font-normal text-gray-600">
            Promedio: <span className="font-bold text-purple-600">{avgCompletions.toFixed(1)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={250}>
          {period === 'week' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '2px solid #A855F7', borderRadius: '8px' }}
                labelStyle={{ color: '#7C3AED', fontWeight: 'bold' }}
              />
              <Bar dataKey="completions" fill="#A855F7" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '2px solid #A855F7', borderRadius: '8px' }}
                labelStyle={{ color: '#7C3AED', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="completions" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#A855F7', r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}