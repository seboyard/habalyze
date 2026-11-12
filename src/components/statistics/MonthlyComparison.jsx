import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MonthlyComparison({ logs }) {
  const now = new Date();
  const last6Months = eachMonthOfInterval({
    start: subMonths(now, 5),
    end: now
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const completions = logs.filter(log => {
      const logDate = new Date(log.completed_date);
      return logDate >= monthStart && logDate <= monthEnd;
    }).length;

    return {
      month: format(month, 'MMM', { locale: es }),
      completions
    };
  });

  const currentMonth = monthlyData[monthlyData.length - 1]?.completions || 0;
  const previousMonth = monthlyData[monthlyData.length - 2]?.completions || 0;
  const trend = currentMonth - previousMonth;
  const trendPercent = previousMonth > 0 ? ((trend / previousMonth) * 100).toFixed(1) : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Comparación Mensual</h3>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-bold">{Math.abs(trendPercent)}%</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={monthlyData}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="completions" radius={[8, 8, 0, 0]}>
            {monthlyData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === monthlyData.length - 1 ? '#3b82f6' : '#94a3b8'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-800">{currentMonth}</p>
        <p className="text-sm text-gray-600">Completados este mes</p>
      </div>
    </Card>
  );
}