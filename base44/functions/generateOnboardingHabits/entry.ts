import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await db.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal, motivation, timeAvailability } = await req.json();

    if (!goal || !motivation || !timeAvailability) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Map motivation to difficulty description
    const motivationMap = {
      beginner: 'principiante (hábitos muy simples y fáciles de mantener)',
      intermediate: 'intermedio (hábitos con dificultad moderada)',
      advanced: 'avanzado (hábitos desafiantes y ambiciosos)'
    };

    // Map time to number of habits
    const timeMap = {
      minimal: { habits: 2, time: '15-30 minutos al día' },
      moderate: { habits: 4, time: '30-60 minutos al día' },
      dedicated: { habits: 6, time: 'más de 1 hora al día' }
    };

    // Map goal to description
    const goalMap = {
      health: 'mejorar mi salud física (ejercicio, nutrición, hidratación)',
      productivity: 'ser más productivo (organización, enfoque, gestión del tiempo)',
      mental_wellness: 'bienestar mental (meditación, mindfulness, reducción del estrés)',
      learning: 'aprender más (lectura, cursos, nuevas habilidades)',
      fitness: 'ponerme en forma (rutinas de ejercicio, fuerza, resistencia)',
      sleep: 'dormir mejor (rutinas de sueño, higiene del sueño)'
    };

    const motivationDesc = motivationMap[motivation] || 'intermedio';
    const timeConfig = timeMap[timeAvailability] || { habits: 3, time: '30 minutos al día' };
    const goalDesc = goalMap[goal] || goal;

    const prompt = `Eres un experto en formación de hábitos y coaching de vida. Genera ${timeConfig.habits} hábitos personalizados para una persona que quiere: ${goalDesc}.

Características del usuario:
- Nivel de experiencia: ${motivationDesc}
- Tiempo disponible: ${timeConfig.time}
- Objetivo principal: ${goalDesc}

IMPORTANTE: 
- Los hábitos deben ser ESPECÍFICOS, MEDIBLES y REALISTAS
- Deben estar adaptados al nivel de experiencia (no pedir cosas muy difíciles a principiantes)
- Deben ser alcanzables con el tiempo disponible
- Deben ser variados pero todos relacionados con el objetivo
- Usa verbos de acción claros
- Incluye el beneficio específico de cada hábito

Responde SOLO con el JSON, sin texto adicional.`;

    const response = await db.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          habits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nombre del hábito, específico y accionable' },
                icon: { 
                  type: 'string', 
                  description: 'DEBE ser uno de: dumbbell, book, droplet, moon, utensils, heart, coffee, brain, smile, music',
                  enum: ['dumbbell', 'book', 'droplet', 'moon', 'utensils', 'heart', 'coffee', 'brain', 'smile', 'music']
                },
                color: { 
                  type: 'string', 
                  description: 'DEBE ser uno de: purple, blue, green, orange, pink, red, teal, yellow',
                  enum: ['purple', 'blue', 'green', 'orange', 'pink', 'red', 'teal', 'yellow']
                },
                benefit: { type: 'string', description: 'Beneficio específico y motivador (máximo 50 caracteres)' }
              },
              required: ['name', 'icon', 'color', 'benefit']
            }
          }
        },
        required: ['habits']
      }
    });

    // Validate and return habits
    const habits = response.habits || [];
    
    if (habits.length === 0) {
      return Response.json({ error: 'No habits generated' }, { status: 500 });
    }

    // Add selected flag to all habits
    const habitsWithSelection = habits.map(h => ({ ...h, selected: true }));

    return Response.json({ 
      habits: habitsWithSelection,
      metadata: {
        goal,
        motivation,
        timeAvailability
      }
    });

  } catch (error) {
    console.error('Error generating habits:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});