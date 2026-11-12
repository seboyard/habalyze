# CANON VISUAL OFICIAL — Habalyze Neo Pixel Cozy v1.0
Estado: **APROBADO para el sistema de avatares** (12-11-2026). Basado en la ficha visual **Neo Pixel Cozy (propuesta 1)** aprobada por el creador. La integración visual en producción queda pendiente.

## Dirección artística obligatoria
Pixel art 2D cozy, contornos oscuros nítidos 1–2 px, sombras escalonadas, colores violetas/lilas, crema, menta y dorado. No usar antialiasing, 3D, gradientes difusos ni avatares genéricos iguales entre sí. Diversidad real de personas y especies, expresiones, tamaños, contextos y capacidades.

**Cinco diseños canónicos del primer set:**
1. **Brasa**, demonio corpulento de piel granate, cuernos asimétricos, ropa de ejercicio punk; mascota **Chispa**, salamandra de lava; escenario **azotea-gimnasio nocturna**.
2. **Vek**, alien adulto alto y delgado, turquesa, con tres ojos y antenas; mascota **Glu**, babosa estelar; escenario **invernadero orbital**.
3. **Mora**, bruja adulta mayor, tez oscura, trenzas canosas, complexión robusta y gafas; mascota **Tinta**, cuervo; escenario **biblioteca-botica**.
4. **Nix**, cyborg adulto andrógino, piel oliva, silla de ruedas futurista; mascota **Bip**, perro robot de tres patas; escenario **plaza solar urbana accesible**.
5. **Lumo**, humano adulto de cuerpo grande, pecas, pelo recogido, jardinero; mascota **Miga**, capibara; escenario **huerto comunitario ribereño**.

## Contrato de assets para Grok Bot
**Avatar modular:** cada capa PNG-32 RGBA transparente de **96×128 px nativos**, idéntico origen y coordenadas; escalar x4 con nearest-neighbor; suelo en y=118. **Mascotas:** 48×48 px. **Escenarios independientes:** 320×180 px, sin personaje integrado. **Íconos:** 32×32 px. Los bocetos con escenario NO equivalen a PNG modular.

**Familias de rigs**: humanoid_standard, humanoid_wide, humanoid_tall y humanoid_seated. Cada prenda declara rig compatible. Silla de ruedas pertenece al rig seated (no se pega arbitrariamente sobre rig de pie). 
**Capas de atrás a adelante**: aura_back, companion_back, backpack_back, body_base, mobility_equipment, lower_clothing, shoes, upper_clothing, face_eyes, face_mouth, hair_back, horns_antennae, hair_front, headwear, glasses, hand_prop, aura_front, companion_front.
**Estructura:**
```
assets/neo_pixel_cozy/v1/
  manifest.json
  rigs/{rig_id}/guide.png
  avatars/{id}/concept_scene.png
  avatars/{id}/layers/{slot}/{item_id}.png
  avatars/{id}/expressions/{name}.png
  avatars/{id}/animations/{action}/frame_00.png
  companions/{companion_id}/idle_00.png
  scenes/{scene_id}/background_320x180.png
  ui/badges/{badge_id}_32x32.png
```
**Paleta**: #2B1741, #693CA1, #BA92EB, #FFF4DD, #78CAA8, #FFC95D, #ED87B0, #555267.
**QA:** transparencia real, contornos pixel-perfect, sin piezas cortadas, composición cruzada entre prendas y expresiones, anchors/rig correctos, no mezclar capas con escenas, sin autopublicar. 
**Instrucción de implementación**: producir primero una plantilla base 96×128 por rig, capas intercambiables, una pose idle maestra y 2 expresiones; comprobar en navegador; después ampliar animales, escenarios, animaciones, cosméticos de tienda. Gamificación cosmética por hábitos sin premios aleatorios de pago.
