import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Zap } from 'lucide-react';

export default function LeaderboardFilters({ activeFilter, onFilterChange }) {
  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid grid-cols-3 w-full bg-white border border-gray-200 p-1">
        <TabsTrigger 
          value="xp" 
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Experiencia</span>
        </TabsTrigger>
        <TabsTrigger 
          value="streak" 
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
        >
          <Flame className="w-4 h-4" />
          <span className="hidden sm:inline">Racha Total</span>
        </TabsTrigger>
        <TabsTrigger 
          value="best" 
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Mejor Racha</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}