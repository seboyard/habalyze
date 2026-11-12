import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function TimeOfDayChart({ logs }) {
  // Categorize by time of day (using created_date timestamp)
  const timeCategories = {
    morning: { name: '🌅 Mañana (6-12)', count: 0, color: '#fbbf24' },
    afternoon: { name: '☀️ Tarde (12-18)', count: 0, color: '#fb923c' },
    evening: { name: '🌆 Noche (18-24)', count: 0, color: '#a78bfa' },
    night: { name: '🌙 Madrugada (0-6)', count: 0, color: '#6366f1' }
  };

  logs.forEach(log => {
    const date = new Date(log.created_date);
    const hour = date.getHours();
    
    if (hour >= 6 && hour < 12) timeCategories.morning.count++;
    else if (hour >= 12 && hour < 18) timeCategories.afternoon.count++;
    else if (hour >= 18 && hour < 24) timeCategories.evening.count++;
    else timeCategories.night.count++;
  });

  const data = Object.values(timeCategories).filter(cat => cat.count > 0);
  const total = data.reduce((sum, cat) => sum + cat.count, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          ⏰ Horarios de Completación
        </h3>
        <p className="text-center text-gray-500 py-8">
          Aún no hay suficientes datos
        </p>
      </div>
    );
  }

  const mostProductiveTime = data.reduce((max, cat) => 
    cat.count > max.count ? cat : max
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800">
        ⏰ Horarios de Completación
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} completaciones`, 'Total']}
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '8px 12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">⏰ Momento más productivo:</span> {mostProductiveTime.name}
        </p>
      </div>
    </div>
  );
}