import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habit_name, habit_description } = await req.json();

    // Use AI to analyze the habit and categorize it
    const response = await db.integrations.Core.InvokeLLM({
      prompt: `Analiza el siguiente hábito y determina a qué categoría pertenece. Debes responder SOLO con una de estas categorías: empresario, atleta, artista, cientifico, chef, musico, lector, meditador, viajero, evangelizador.

Categorías:
- empresario: negocios, emprendimiento, ventas, networking, productividad empresarial, liderazgo
- atleta: ejercicio, deporte, fitness, entrenamiento, actividad física, salud física
- artista: arte, dibujo, pintura, diseño, creatividad visual, escultura
- cientifico: estudio, aprendizaje, investigación, ciencia, tecnología, programación
- chef: cocina, nutrición, recetas, alimentación saludable
- musico: música, instrumentos, canto, composición, práctica musical
- lector: lectura, libros, literatura, escritura
- meditador: meditación, mindfulness, yoga, paz interior, espiritualidad
- viajero: viajes, exploración, aventuras, idiomas, culturas
- evangelizador: religión, fe, oración, biblia, evangelización, actos de caridad

Hábito:
Nombre: ${habit_name}
Descripción: ${habit_description || 'Sin descripción'}

Responde SOLO con la categoría correspondiente, sin explicaciones adicionales.`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" }
        }
      }
    });

    const category = response.category;

    // Validate category
    const validCategories = ['empresario', 'atleta', 'artista', 'cientifico', 'chef', 'musico', 'lector', 'meditador', 'viajero', 'evangelizador'];
    if (!validCategories.includes(category)) {
      return Response.json({ category: null });
    }

    return Response.json({ category });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});