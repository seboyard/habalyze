import React, { useState } from 'react';
import { db } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ProjectAIAssistant({ project, tasks = [], onRefresh }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const suggest = async () => {
    setBusy(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Proyecto: ${project?.name || ''}. Ya hay ${tasks.length} tareas. ${note}`,
        response_json_schema: { type: 'object', properties: { tasks: { type: 'array' } } },
      });
      const created = response?.tasks || [];
      for (const task of created) {
        await db.entities.ProjectTask.create({
          project_id: project.id,
          title: task.title,
          description: task.description,
          type: task.type || 'one-time',
          status: 'pending',
          is_setup: Boolean(task.is_setup),
          is_milestone: Boolean(task.is_milestone),
          phase: task.phase || 'General',
        });
      }
      toast.success(created.length ? 'Tareas añadidas con el coach local' : 'El coach no propuso tareas');
      setNote('');
      onRefresh?.();
    } catch (error) {
      toast.error(error.message || 'No se pudieron crear las tareas');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#555267]">
        El asistente de caminos usa el coach local: propone tres pasos concretos y los guarda en este camino. No hay un modelo externo conectado.
      </p>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Qué te está costando de este camino"
      />
      <Button onClick={suggest} disabled={busy || !project?.id}>
        {busy ? 'Pensando…' : 'Proponer tareas'}
      </Button>
    </div>
  );
}
