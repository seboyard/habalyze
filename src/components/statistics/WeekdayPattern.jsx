import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WeekdayPattern({ logs }) {
  // Count completions by day of week
  const weekdayCounts = {
    0: { name: 'Dom', count: 0, fullName: 'Domingo' },
    1: { name: 'Lun', count: 0, fullName: 'Lunes' },
    2: { name: 'Mar', count: 0, fullName: 'Martes' },
    3: { name: 'Mié', count: 0, fullName: 'Miércoles' },
    4: { name: 'Jue', count: 0, fullName: 'Jueves' },
    5: { name: 'Vie', count: 0, fullName: 'Viernes' },
    6: { name: 'Sáb', count: 0, fullName: 'Sábado' }
  };

  logs.forEach(log => {
    const date = new Date(log.completed_date);
    const dayOfWeek = date.getDay();
    weekdayCounts[dayOfWeek].count++;
  });

  const data = Object.values(weekdayCounts);
  const maxCount = Math.max(...data.map(d => d.count));
  const bestDay = data.reduce((best, current) => 
    current.count > best.count ? current : best
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          📊 Patrón por Día de la Semana
        </h3>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-green-600">{bestDay.fullName}</span> es tu mejor día
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '8px 12px'
            }}
            formatter={(value, name, props) => [
              `${value} completaciones`,
              props.payload.fullName
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.count === maxCount ? '#10b981' : '#a78bfa'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Insight:</span> {
            maxCount === 0 
              ? 'Aún no hay suficientes datos para analizar patrones'
              : `Completas más hábitos los ${bestDay.fullName.toLowerCase()}s. ¡Aprovecha este momento productivo!`
          }
        </p>
      </div>
    </div>
  );
}