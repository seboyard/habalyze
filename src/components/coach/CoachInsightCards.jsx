import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';

const VARIANTS = {
  danger: { wrap: 'bg-red-50 border-red-200', title: 'text-red-800', body: 'text-red-700/80', btn: 'bg-red-500 hover:bg-red-600 text-white' },
  warn: { wrap: 'bg-amber-50 border-amber-200', title: 'text-amber-900', body: 'text-amber-800/80', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
  success: { wrap: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-900', body: 'text-emerald-800/80', btn: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  info: { wrap: 'bg-violet-50 border-violet-200', title: 'text-violet-900', body: 'text-violet-800/80', btn: 'bg-violet-600 hover:bg-violet-700 text-white' },
};

export default function CoachInsightCards({ nudges = [], onComplete, isCompleting }) {
  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {nudges.map((nudge) => {
        const v = VARIANTS[nudge.variant] || VARIANTS.info;
        return (
          <div key={nudge.id} className={`rounded-2xl border p-3 ${v.wrap}`}>
            <div className="flex gap-2.5">
              <span className="text-xl leading-none mt-0.5">{nudge.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm leading-snug ${v.title}`}>{nudge.title}</p>
                <p className={`text-xs mt-0.5 leading-snug ${v.body}`}>{nudge.body}</p>

                {nudge.habit && (
                  <Button
                    size="sm"
                    onClick={() => onComplete(nudge.habit)}
                    disabled={isCompleting}
                    className={`mt-2 h-8 text-xs rounded-xl ${v.btn}`}
                  >
                    {isCompleting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {nudge.actionLabel || 'Marcar hecho'}
                  </Button>
                )}

                {!nudge.habit && nudge.link && (
                  <Link to={nudge.link.url}>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`mt-2 h-8 text-xs rounded-xl bg-white/70 border-gray-200 ${v.title}`}
                    >
                      {nudge.link.label}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}