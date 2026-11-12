# Canon Neo Pixel Cozy

Aprobado el 12 de noviembre de 2026. Esta nota es el contrato para quien produzca arte o lo integre. La ficha visual de referencia es la de los cinco personajes: Brasa, Vek, Mora, Nix y Lumo.

## Dirección

Pixel art 2D, contorno de 1 o 2 píxeles en `#2B1741`, sombra en escalones, sin antialias, sin degradados difusos y sin mezclar tamaños de píxel. Paleta base: `#2B1741`, `#693CA1`, `#BA92EB`, `#FFF4DD`, `#78CAA8`, `#FFC95D`, `#ED87B0`, `#555267`.

## Personajes

| Id | Quién | Rig | Mascota | Escenario |
|---|---|---|---|---|
| brasa | Demonio adulto corpulento, piel granate, cuernos asimétricos | `humanoid_wide` | Chispa, salamandra | Azotea gimnasio |
| vek | Alien adulto alto, piel turquesa, tres ojos y antenas | `humanoid_tall` | Glu, babosa estelar | Invernadero orbital |
| mora | Bruja adulta mayor, tez oscura, trenzas canosas, gafas | `humanoid_wide` | Tinta, cuervo | Biblioteca botica |
| nix | Persona adulta andrógina, piel oliva, silla de ruedas | `humanoid_seated` | Bip, perro robot de tres patas | Plaza solar |
| lumo | Persona adulta de cuerpo amplio, piel cálida con pecas | `humanoid_wide` | Miga, capibara | Huerto ribereño |

También hay cuerpos `humanoid_standard` de piel cálida, oscura y oliva. La silla pertenece al rig sentado: no se pega encima de un cuerpo de pie.

## Archivos

- Avatar: PNG 96×128, mismo origen en todas las capas del rig, pies en `y=118`, `safe_top=6`.
- Mascotas: 48×48.
- Escenarios: 320×180, sin personaje dentro. El 640×360 es el mismo dibujo escalado con vecino más cercano.
- Iconos de UI: 32×32.

El generador es `scripts/generate_neo_pixel_cozy.py`. Las anclas viven en ese script y se copian a `src/avatar/neoPixelManifest.json`. No se recoloca cada pieza a mano en el runtime: las capas de ropa ya vienen en coordenadas del lienzo.

## Qué no está

Los huecos están en `gaps` del manifest: no hay animación por fotogramas, no hay parallax, no hay alas, tatuaje ni piercing. Si una pieza no se puede hacer dentro de este canon, se documenta. No se cuela un sustituto y se le pone el nombre canónico.
