import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, data } = await req.json();

    let prompt = '';
    let title = '';

    // Determine what kind of image to generate based on event type
    if (event_type === 'level_up') {
      title = `¡${user.full_name} alcanzó el nivel ${data.level}!`;
      prompt = `Create a vibrant, celebratory social media post image for Instagram/TikTok with these elements:
- Bold text at top: "¡NIVEL ${data.level} ALCANZADO!" in bright, energetic colors
- Prominent display: "⭐ ${user.full_name} ⭐" in the center
- Background: Purple and pink gradients with sparkles and celebration effects
- Include a subtle "HABALYZE" logo in the bottom corner
- Add decorative elements like stars, confetti, or level-up badges
- Modern, trendy design style suitable for Instagram stories
- Make it eye-catching and shareable
- Include at bottom: "Descarga Habalyze y mejora tus hábitos"
Style: Vibrant, modern, social media friendly, minimalist but impactful`;
    } else if (event_type === 'achievement') {
      title = `¡${user.full_name} desbloqueó: ${data.achievement_title}!`;
      prompt = `Create an eye-catching achievement unlock social media post for Instagram/TikTok:
- Large achievement icon at top: "${data.achievement_icon}"
- Bold title: "${data.achievement_title}"
- Subtitle: "Desbloqueado por ${user.full_name}"
- Description: "${data.achievement_description}"
- Rarity badge: "${data.achievement_rarity.toUpperCase()}"
- Background: Match the rarity with appropriate colors (legendary = gold, epic = purple, rare = blue)
- Add shine/glow effects around the achievement
- Include "HABALYZE" branding subtly at bottom
- Bottom text: "Únete a la comunidad"
Style: Game-like, exciting, achievement-focused, with dramatic lighting`;
    } else if (event_type === 'streak') {
      title = `¡${user.full_name} tiene ${data.streak} días de racha!`;
      prompt = `Create a fire-themed streak achievement post for social media:
- Giant flame emoji or fire graphic: "🔥"
- Bold numbers: "${data.streak} DÍAS"
- Text: "Racha de ${user.full_name}"
- Background: Orange, red, and yellow gradient with fire effects
- Include streak statistics or milestones
- Add "HABALYZE" branding
- Bottom: "¡Construye tu racha en Habalyze!"
Style: Energetic, hot, motivational, with fire/flame theme`;
    } else if (event_type === 'badge') {
      title = `¡${user.full_name} alcanzó ${data.badge_name} Nivel ${data.badge_level}!`;
      prompt = `Create a badge level-up social media post:
- Large badge icon: "${data.badge_icon}"
- Badge name: "${data.badge_name}"
- Level indicator: "NIVEL ${data.badge_level}"
- Username: "${user.full_name}"
- Progress stats: "${data.progress} acciones completadas"
- Background gradient matching the badge theme
- Add level-up effects (rays of light, particles)
- Include "HABALYZE" logo
- Bottom text: "Desbloquea tus propias placas"
Style: Achievement-focused, premium feel, game-like progression`;
    }

    // Generate the image using AI
    const imageResponse = await db.integrations.Core.GenerateImage({
      prompt: prompt
    });

    const imageUrl = imageResponse.url;

    return Response.json({ 
      success: true, 
      image_url: imageUrl,
      title: title
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});