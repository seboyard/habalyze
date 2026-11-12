import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, Edit, Trash2, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

const getActionIcon = (type) => {
  switch (type) {
    case 'complete': return CheckCircle2;
    case 'update': return Edit;
    case 'delete': return Trash2;
    default: return History;
  }
};

const getActionColor = (type) => {
  switch (type) {
    case 'complete': return 'from-green-500 to-emerald-600';
    case 'update': return 'from-blue-500 to-cyan-600';
    case 'delete': return 'from-red-500 to-rose-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getActionLabel = (action) => {
  switch (action.type) {
    case 'complete':
      return `Completaste un hábito`;
    case 'update':
      return `Editaste: ${action.oldData?.name || 'Hábito'}`;
    case 'delete':
      return `Eliminaste: ${action.habit?.name || 'Hábito'}`;
    default:
      return 'Acción desconocida';
  }
};

export default function ActionHistory({ open, onOpenChange, actions, onUndo }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Historial de Acciones
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay acciones recientes</p>
              <p className="text-sm text-gray-400 mt-2">Las acciones que realices aparecerán aquí</p>
            </div>
          ) : (
            actions.slice().reverse().map((action, index) => {
              const Icon = getActionIcon(action.type);
              const realIndex = actions.length - 1 - index;
              
              return (
                <motion.div
                  key={action.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 border-2 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getActionColor(action.type)} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800">
                            {getActionLabel(action)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true, locale: es })}
                          </p>
                          
                          {action.type === 'complete' && (
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                +{action.xpGained || 10} XP
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                Racha: {action.oldStreak + 1}
                              </Badge>
                            </div>
                          )}
                          
                          {action.type === 'delete' && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 mt-2">
                              Eliminado
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUndo(realIndex)}
                        className="hover:bg-amber-50 hover:border-amber-300"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Deshacer
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {actions.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (confirm(`¿Deshacer todas las ${actions.length} acciones?`)) {
                  for (let i = actions.length - 1; i >= 0; i--) {
                    onUndo(i);
                  }
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Deshacer Todas
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}