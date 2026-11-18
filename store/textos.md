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
| URL de la política de privacidad | https://rota.clipeostats.com/privacy (página de la propia web, texto en `src/privacyPolicy.ts`) | — |
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
| Política de privacidad | https://rota.clipeostats.com/privacy | — |

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

Ya generadas, en `store/screenshots/<idioma>/<dispositivo>/` (`es` y `en`), cinco escenas por dispositivo, con el marco del dispositivo y un texto encima:

| # | Escena | Texto (es) | Texto (en) |
| --- | --- | --- | --- |
| 1 | Entrenador, 6x6, rotación completa | Escribe tu rotación en segundos | Write your rotation in seconds |
| 2 | QR a pantalla completa | Entrégala con un QR | Hand it over with a QR code |
| 3 | Árbitro con los equipos A y B | El árbitro ve las dos rotaciones | The referee sees both rotations |
| 4 | Entrenador, minivoley 4x4 | También minivoley 3x3 y 4x4 | Mini volleyball 3v3 and 4v4 too |
| 5 | Pantalla inicial | Sin cuentas y sin conexión | No accounts, no connection |

| Carpeta | Tienda | Tamaño |
| --- | --- | --- |
| `iphone/` | App Store, iPhone 6,9" | 1320 × 2868 |
| `iphone-6.3/` | App Store, iPhone 6,3" (si App Store Connect pide 1206 × 2622 o 1179 × 2556) | 1206 × 2622 |
| `ipad/` | App Store, iPad 13" (obligatorio porque la app admite iPad) | 2064 × 2752 |
| `android/` | Google Play, teléfono | 1080 × 1920 |

La interfaz de la app solo está en español, así que en las capturas en inglés el texto de encima está en inglés y la app sigue en español.

Para regenerarlas (por ejemplo, después de cambiar la interfaz):

1. `docker compose run --rm dev npx expo export --platform web` compila la versión web en `dist/`.
2. `scripts/capture-screens.mjs` hace las capturas en bruto con Chromium (contenedor de Playwright; el comando está en la cabecera del script) y las guarda en `store/screenshots/raw/`.
3. `scripts/render-screenshots.mjs` añade el marco y los textos.

## Otros gráficos

- **Icono de App Store (1024 px):** sale de `assets/icon.png` al compilar; no se sube aparte.
- **Icono de Google Play (512 px):** `store/graphics/play-icon-512.png`.
- **Imagen destacada de Google Play (1024 × 500):** `store/graphics/play-feature-1024x500.png` (es) y `play-feature-1024x500-en.png` (en).
- **App Store, «Header and Search Results»** (iOS 27 en adelante; pestaña de la versión en App Store Connect). Llevan el nombre y el lema en la zona segura que marca Apple, con dos pantallas de la app a los lados. No tienen transparencia. Hay uno por idioma:
  - Cabecera de la ficha (Header): `store/graphics/appstore-header-es.png` / `-en.png`, 3840 × 1646.
  - Resultados de búsqueda (Search Results): `store/graphics/appstore-search-es.png` / `-en.png`, 3840 × 2560. No marques «usar la cabecera en los resultados de búsqueda»: cada sitio tiene su imagen.

Se regeneran con `scripts/render-icons.mjs`, `scripts/render-store-graphics.mjs` y `scripts/render-store-header.mjs`.

## English (en-US)

Segundo idioma de las dos fichas. En App Store Connect: Información de la app → idioma → «Añadir idioma» → Inglés (EE. UU.); en Play Console: Ficha de Play Store → Gestionar traducciones → Añadir → Inglés (Estados Unidos) – en-US. Los textos de App Store también están en `store.config.json` (`en-US`).

### App Store

| Campo | Texto | Límite |
| --- | --- | --- |
| Name | Clipeo Rota | 11/30 |
| Subtitle | Volleyball lineup in a QR | 25/30 |
| Promotional text | Set up the rotation for each set and hand it over with a QR code. The referee scans it and has it instantly: no paper, no accounts, no internet. | 144/170 |
| Keywords | volley,lineup sheet,line-up,rotation,referee,scorer,scoresheet,coach,minivolley,mini,6v6,match,set | 98/100 |
| Privacy Policy URL | https://rota.clipeostats.com/privacy?lang=en | — |
| What's New (1.0.0) | First release of Clipeo Rota. | — |

Categoría, URLs de soporte y copyright son los mismos que en español.

### Google Play

| Campo | Texto | Límite |
| --- | --- | --- |
| Title | Clipeo Rota: Volleyball Lineup | 30/30 |
| Short description | Write the rotation for each set and hand it to the referee with a QR. Offline. | 78/80 |

### Description (both stores, 1244 characters)

La descripción avisa de que la interfaz está en español, para que nadie la descargue esperando la app en inglés.

```
Clipeo Rota replaces the paper lineup sheet the coach hands in before every set.

COACH
• Type each player's number in their zone on the court, and rotate the lineup with one tap, in either direction.
• Prepare the sets one after another. Repeating the rotation of an earlier set? Open it and use it for the current set.
• Tap «Mostrar QR» (Show QR): the rotation fills the screen, ready to be scanned from one or two metres away.
• The screen stays on while you prepare the rotation.

REFEREE AND SCORER
• Scan each team's QR code and see both rotations together, every number in its zone on the court.
• The app warns you if a QR code is not valid, belongs to another format, or if the teams handed in different sets.

FORMATS
• Volleyball 6v6, with the official zones I–VI.
• Mini volleyball 3v3 and 4v4.

NO ACCOUNTS, NO CONNECTION
Everything works offline, even in gyms with no signal. There is no sign-up and no advertising, and the app does not collect personal data: it only stores the team code and the player numbers on your device.

The app's interface is in Spanish. Before using it in competition, check that your federation or league accepts the lineup on a screen.

Clipeo Rota is the sister app of Clipeo, volleyball statistics.
```
