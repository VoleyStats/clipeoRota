# Fichas de tienda — Clipeo Rota

Idioma principal: español (España). Límites comprobados con la longitud real de cada texto.
Los textos de App Store también están en `store.config.json` para subirlos con `eas metadata:push`.

## App Store

| Campo | Texto | Límite |
| --- | --- | --- |
| Nombre | Clipeo Rota | 11/30 |
| Subtítulo | Rotación de voleibol en QR | 26/30 |
| Texto promocional | Prepara la rotación de cada set y entrégala con un QR. El árbitro la escanea y la tiene al momento: sin papel, sin cuentas y sin conexión. | 138/170 |
| Palabras clave | voley,vóley,minivoley,alineacion,alineación,arbitro,anotador,entrenador,set,acta,hoja,6x6,partido | 97/100 |
| Categoría | Deportes (principal) | — |
| Precio | Gratis, sin compras dentro de la app | — |
| Clasificación por edad | 4+ (todas las respuestas del cuestionario: «No») | — |
| URL de soporte | https://clipeostats.com | — |
| URL de la política de privacidad | https://clipeostats.com/rota/privacidad (hay que publicarla, ver `store/privacidad.md`) | — |
| Copyright | 2026 Clipeo | — |
| Notas de la versión 1.0.0 | Primera versión de Clipeo Rota. | — |

Las palabras clave no repiten «voleibol» ni «rotación» porque ya están en el nombre y el subtítulo, que Apple también indexa.

## Google Play

| Campo | Texto | Límite |
| --- | --- | --- |
| Título | Clipeo Rota: rotación voleibol | 30/30 |
| Descripción breve | Escribe la rotación de cada set y entrégala al árbitro con un QR. Sin conexión. | 79/80 |
| Categoría | Deportes | — |
| Etiquetas | Deportes, Voleibol (si aparece en la lista) | — |
| Correo de contacto | hola@clipeostats.com | — |
| Sitio web | https://clipeostats.com | — |
| Política de privacidad | https://clipeostats.com/rota/privacidad | — |

El título que pedían los requisitos, «Clipeo Rota: alineación de voleibol», tiene 35 caracteres y Google Play admite 30. Alternativa con el mismo patrón «Marca: categoría»: «Clipeo Rota: alineación vóley» (29).

## Descripción (las dos tiendas)

Google Play admite 4000 caracteres y App Store 4000; este texto tiene 1194.

```
Clipeo Rota sustituye la hoja de rotación en papel que el entrenador entrega antes de cada set.

ENTRENADOR
• Escribe el dorsal de cada zona sobre la pista y gira la rotación con un toque, en los dos sentidos.
• Prepara los sets uno tras otro. ¿Repites la rotación de un set anterior? Ábrelo y úsala en el set actual.
• Pulsa «Mostrar QR»: la rotación sale a pantalla completa, lista para escanear a uno o dos metros.
• La pantalla no se apaga mientras preparas la rotación.

ÁRBITRO Y ANOTADOR
• Escanea el QR de cada equipo y ve las dos rotaciones juntas, cada dorsal en su zona de la pista.
• La app avisa si un QR no es válido, si es de otra modalidad o si los equipos han entregado sets distintos.

MODALIDADES
• Voleibol 6x6, con las zonas oficiales I–VI.
• Minivoley 3x3 y 4x4.

SIN CUENTAS NI CONEXIÓN
Todo funciona sin internet, también en pabellones sin cobertura. No hay registro ni publicidad, y la app no recoge datos personales: solo guarda en tu dispositivo el código de equipo y los dorsales.

Antes de usarla en competición, comprueba que tu federación o tu liga aceptan la entrega de la rotación en pantalla.

Clipeo Rota es la app hermana de Clipeo, estadísticas de voleibol.
```

## Capturas de pantalla

Mismas cinco escenas en las dos tiendas, con un texto corto encima de cada una (plantilla de las capturas de Clipeo, RV-07):

| # | Escena | Texto |
| --- | --- | --- |
| 1 | Entrenador, 6x6, rotación completa | Escribe tu rotación en segundos |
| 2 | QR a pantalla completa | Entrégala con un QR |
| 3 | Árbitro con los equipos A y B cargados | El árbitro ve las dos rotaciones |
| 4 | Entrenador, minivoley 4x4 | También minivoley 3x3 y 4x4 |
| 5 | Pantalla inicial | Sin cuentas y sin conexión |

Tamaños:

- **App Store, iPhone 6,9"** (obligatorio): 1320 × 2868 px, de 3 a 10 capturas.
- **App Store, iPad 13"** (obligatorio porque la app admite iPad): 2064 × 2752 px.
- **Google Play, teléfono** (obligatorio): de 2 a 8 capturas, por ejemplo 1080 × 1920 px.
- **Google Play, tablet de 7" y 10"** (opcional, necesario para aparecer como app optimizada para tablet).

## Otros gráficos

- **Icono de App Store (1024 px):** sale de `assets/icon.png` al compilar; no se sube aparte.
- **Icono de Google Play (512 px):** `store/graphics/play-icon-512.png`.
- **Imagen destacada de Google Play (1024 × 500):** `store/graphics/play-feature-1024x500.png`.

Se regeneran con `scripts/render-icons.mjs` y `scripts/render-store-graphics.mjs`.
