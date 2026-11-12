# Avatares Neo Pixel Cozy

La ficha aprobada pide capas PNG de 96×128, el mismo origen, vista 3/4 y cuatro rigs. El pack maestro no cumple ese contrato: son recortes sueltos, de tamaños distintos, con alpha antialias y sin pivote. Esta integración **no importa los 1200 archivos**. Se queda con un set que sí se puede vestir.

## Qué hay en el repo

- Cuerpos en `public/assets/neo_pixel_cozy/v1/bodies/` sobre un lienzo 96×128, pies hacia `y = 118`.
- Pelo, ropa, sombreros, alas, props y mascotas ya recortados, con alpha endurecido (umbral 128) y escala por vecino más cercano.
- Expresiones y auras dibujadas en píxel, porque los ojos del pack son un solo ojo grande y no forman un par.
- Ocho escenarios. Se guarda el 640×360 original y una copia 320×180.
- Manifiesto: `src/avatar/neoPixelManifest.json` (anclas por rig, tienda, presets de Brasa, Vek, Mora, Nix y Lumo).
- Vestidor en **Mi avatar**. La tienda equipa la misma `style_id`.
- Vista previa de los cinco presets: `public/assets/neo_pixel_cozy/v1/previews/presets.jpg`.

El componente `NeoPixelAvatar` apila las capas con `image-rendering: pixelated`. Si `avatar_config.engine` es `legacy`, vuelve el avatar dibujado en SVG.

## Huecos (no se forzaron piezas malas)

- Ningún recorte nativo es 96×128 ni comparte ancla. La posición sale de anclas medidas sobre cada cuerpo.
- La vista del pack es frontal, no el 3/4 hacia la izquierda del canon.
- No hay cuerpo demonio ni una base de tez muy oscura. Mora y Brasa salen de un tinte sobre el cuerpo claro.
- No había silla de ruedas, bufanda, guantes, tatuaje ni piercing utilizables. La silla de Nix es un dibujo simple y se lee poco debajo de la ropa.
- No están Chispa, Glu, Tinta, Bip ni Miga. Cada preset usa un animal cercano y lo dice en su nota.
- No hay plaza solar ni invernadero orbital. Los fondos más cercanos son la azotea, el planeta, el bosque y el jardín.
- Los fondos de escena traen mucho detalle ilustrado; no son tiles de 320×180 pensados como parallax.

Los cosméticos de la tienda tienen precio fijo en monedas de hábito. El cofre entrega la siguiente pieza en orden alfabético: no es una caja aleatoria de pago.
