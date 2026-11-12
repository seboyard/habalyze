import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { shopCategories } from '../common/shopConstants';

export default function ShopCategories({ category, setCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      {shopCategories.map((cat) => (
        <Button
          key={cat.id}
          onClick={() => setCategory(cat.id)}
          variant={category === cat.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "transition-all",
            category === cat.id && "bg-gradient-to-r from-amber-500 to-orange-500"
          )}
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.label}
        </Button>
      ))}
    </div>
  );
}