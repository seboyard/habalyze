import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, total_weeks, start_date } = await req.json();

    if (!project_id || !total_weeks || !start_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const projectStartDate = new Date(start_date);
    const year = projectStartDate.getFullYear();
    const weekStatuses = [];

    // Crear ProjectWeekStatus para cada semana
    for (let weekNum = 1; weekNum <= total_weeks; weekNum++) {
      const weekStartDate = new Date(projectStartDate);
      weekStartDate.setDate(projectStartDate.getDate() + (weekNum - 1) * 7);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const weekStatus = await db.asServiceRole.entities.ProjectWeekStatus.create({
        project_id,
        week_number: weekNum,
        year,
        start_date: weekStartDate.toISOString().split('T')[0],
        end_date: weekEndDate.toISOString().split('T')[0],
        status: weekNum === 1 ? 'in_progress' : 'pending',
        tasks_completed_count: 0,
        total_tasks_count: 0,
        progress_percentage: 0
      });

      weekStatuses.push(weekStatus);
    }

    // Actualizar el proyecto
    await db.asServiceRole.entities.Project.update(project_id, {
      weekly_tracking_enabled: true,
      current_week_number: 1,
      total_weeks
    });

    return Response.json({
      success: true,
      weeks_created: weekStatuses.length,
      message: `Plan semanal creado: ${total_weeks} semanas`
    });

  } catch (error) {
    console.error('Error creating weekly plan:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});