import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { project_id } = await req.json();

    if (!project_id) {
      return Response.json({ error: 'Missing project_id' }, { status: 400 });
    }

    // Obtener el proyecto
    const projects = await db.asServiceRole.entities.Project.filter({ id: project_id });
    if (projects.length === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];

    if (!project.weekly_tracking_enabled) {
      return Response.json({ message: 'Weekly tracking not enabled' }, { status: 200 });
    }

    const currentWeekNumber = project.current_week_number || 1;

    // Obtener el estado de la semana actual
    const weekStatuses = await db.asServiceRole.entities.ProjectWeekStatus.filter({
      project_id,
      week_number: currentWeekNumber
    });

    if (weekStatuses.length === 0) {
      return Response.json({ error: 'Week status not found' }, { status: 404 });
    }

    const weekStatus = weekStatuses[0];

    // Obtener todas las tareas de la semana actual
    const allTasks = await db.asServiceRole.entities.ProjectTask.filter({ project_id });
    const weekTasks = allTasks.filter(t => t.assigned_week_number === currentWeekNumber);
    
    const completedTasks = weekTasks.filter(t => t.status === 'completed').length;
    const totalTasks = weekTasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Determinar el estado de la semana
    const today = new Date();
    const weekEndDate = new Date(weekStatus.end_date);
    let newStatus = weekStatus.status;

    if (progressPercentage >= (project.weekly_completion_threshold || 80)) {
      newStatus = 'completed';
    } else if (today > weekEndDate) {
      newStatus = 'missed';
    } else if (completedTasks > 0) {
      newStatus = 'in_progress';
    }

    // Actualizar el estado de la semana
    await db.asServiceRole.entities.ProjectWeekStatus.update(weekStatus.id, {
      tasks_completed_count: completedTasks,
      total_tasks_count: totalTasks,
      progress_percentage: progressPercentage,
      status: newStatus
    });

    // Si la semana actual ha terminado, avanzar a la siguiente
    if (today > weekEndDate && currentWeekNumber < (project.total_weeks || 52)) {
      const nextWeekNumber = currentWeekNumber + 1;
      
      await db.asServiceRole.entities.Project.update(project_id, {
        current_week_number: nextWeekNumber
      });

      // Actualizar el estado de la siguiente semana a 'in_progress'
      const nextWeekStatuses = await db.asServiceRole.entities.ProjectWeekStatus.filter({
        project_id,
        week_number: nextWeekNumber
      });

      if (nextWeekStatuses.length > 0) {
        await db.asServiceRole.entities.ProjectWeekStatus.update(nextWeekStatuses[0].id, {
          status: 'in_progress'
        });
      }
    }

    return Response.json({
      success: true,
      week_number: currentWeekNumber,
      status: newStatus,
      progress: progressPercentage,
      completed: completedTasks,
      total: totalTasks
    });

  } catch (error) {
    console.error('Error updating weekly progress:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});