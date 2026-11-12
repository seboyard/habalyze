import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {};

    // Test 1: Multiple individual queries (OLD METHOD)
    const start1 = Date.now();
    const ownProjects = await db.entities.Project.filter({ created_by: user.email });
    const collaborations = await db.entities.ProjectCollaborator.filter({ 
      user_email: user.email, 
      status: 'accepted' 
    });
    
    const projectIds = [...ownProjects.map(p => p.id), ...collaborations.map(c => c.project_id)];
    
    const tasksByProject = await Promise.all(
      projectIds.map(pid => db.entities.ProjectTask.filter({ project_id: pid }))
    );
    const collabsByProject = await Promise.all(
      projectIds.map(pid => db.entities.ProjectCollaborator.filter({ project_id: pid }))
    );
    
    const oldMethodTime = Date.now() - start1;
    const oldMethodTasks = tasksByProject.flat().length;
    const oldMethodCollabs = collabsByProject.flat().length;

    // Test 2: Single query with $in operator (NEW METHOD)
    const start2 = Date.now();
    const allTasks = await db.entities.ProjectTask.filter({ 
      project_id: { $in: projectIds } 
    });
    const allCollabs = await db.entities.ProjectCollaborator.filter({ 
      project_id: { $in: projectIds } 
    });
    const newMethodTime = Date.now() - start2;
    
    results.oldMethod = {
      time_ms: oldMethodTime,
      projects_count: projectIds.length,
      tasks_count: oldMethodTasks,
      collaborators_count: oldMethodCollabs,
      queries_made: projectIds.length * 2 + 2
    };
    
    results.newMethod = {
      time_ms: newMethodTime,
      tasks_count: allTasks.length,
      collaborators_count: allCollabs.length,
      queries_made: 2
    };
    
    results.improvement = {
      time_saved_ms: oldMethodTime - newMethodTime,
      time_saved_percentage: Math.round(((oldMethodTime - newMethodTime) / oldMethodTime) * 100),
      queries_saved: results.oldMethod.queries_made - results.newMethod.queries_made,
      faster_by: `${(oldMethodTime / newMethodTime).toFixed(2)}x`
    };

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});