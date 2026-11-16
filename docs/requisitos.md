# Requerimientos – Clipeo Rota

16 nov 2026 · Borrador v0.4 (v0.2 + decisiones del 16/11)

## 1. Contexto y objetivo

AppLineup (Veiem360) sustituía la hoja de rotaciones en papel que el entrenador entrega antes de cada set, y algunas federaciones la aceptan con la misma validez que la hoja (por ejemplo, la Federación Aragonesa de Voleibol). Queremos una app que cubra esa función.

**Nombre:** Clipeo Rota, app hermana de Clipeo. En App Store, «Clipeo Rota» con subtítulo aparte; en Google Play, «Clipeo Rota: alineación de voleibol».

**Objetivo:** una app muy simple. El entrenador escribe su rotación y la muestra en un QR; el árbitro escanea el QR de cada equipo y ve las dos rotaciones.

**Stack:** Expo (React Native) + TypeScript, un solo código para iOS y Android. Los tokens de diseño (colores, radios, espaciados) viven en `tokens.json`, que también pueden consumir las apps nativas de Clipeo.

## 2. Flujo de la app

1. Al abrir la app, elegir perfil: **Entrenador** o **Árbitro**.
2. Elegir modalidad: **3x3**, **4x4** o **6x6**.
3. Entrar directamente a la vista de ese perfil.

No hay registro, cuentas, menús ni más pantallas. Desde la vista de perfil se puede volver atrás para cambiar de perfil o de modalidad.

- RF-00. **La app recuerda el último perfil y modalidad** y, al abrirse, entra directamente en esa vista.

## 3. Modalidades

| Modalidad | Zonas | Disposición en pista |
| --- | --- | --- |
| 3x3 | ZN1–ZN3 | Triángulo. Delante, centro: ZN2 — Detrás: ZN3 (izquierda) · ZN1 (derecha) |
| 4x4 | ZN1–ZN4 | Rombo. Delante, centro: ZN3 — Medio: ZN4 (izquierda) · ZN2 (derecha) — Detrás, centro: ZN1 |
| 6x6 | ZN1–ZN6 | Delante: ZN4 · ZN3 · ZN2 — Detrás: ZN5 · ZN6 · ZN1 |

ZN1 es la zona de saque. En 6x6, las zonas siguen la numeración oficial I–VI. Las tres disposiciones coinciden con las de Clipeo (`Court.swift`).

El líbero no entra en la rotación y la app no lo gestiona.

## 4. Vista del entrenador

- RF-01. **Pista con las zonas** de la modalidad elegida. En cada zona hay un campo para el dorsal.
- RF-01b. **Dorsales:** solo números del 1 al 99 (máximo 2 cifras). Los ceros a la izquierda se eliminan («07» se guarda como «7»).
- RF-02. **Código de equipo:** exactamente 3 caracteres alfanuméricos, en mayúsculas (se convierten solos al escribir).
- RF-03. **Sets:** una fila de botones, uno por set (1 a 5).
  - El **set en curso** aparece resaltado y es el que se edita. La app lo lleva sola: empieza en el set 1 y avanza con el botón **Pasar al set N →**, que solo se activa cuando la rotación del set en curso está completa. Al avanzar, el set nuevo empieza en blanco.
  - Cada set guarda su propia rotación en el dispositivo (sobrevive a cerrar la app).
  - Tocar el botón de un set anterior **copia su rotación** al set en curso como punto de partida. Si el set en curso ya tiene dorsales, la app pide confirmación antes de sustituirlos. Los sets futuros están desactivados.
  - Botón **Nuevo partido**: borra todos los sets y vuelve al set 1 (con confirmación). El código de equipo se mantiene.
  - Cada modalidad guarda su propio estado.
- RF-04. **Botones Rotar ↻ y ↺:** mueven los dorsales una posición en un sentido o en el otro.
  - ↻ (sentido de rotación del voleibol, horario): ZN2 → ZN1, ZN3 → ZN2… ZN1 → última zona.
  - ↺ (sentido contrario): ZN1 → ZN2, ZN2 → ZN3… última zona → ZN1.
  - Funciona igual en 3x3, 4x4 y 6x6.
- RF-05. **QR:** se muestra en la misma vista, generado con el código de equipo y los dorsales (formato en la sección 6), y se actualiza solo al escribir o rotar.
- RF-06. **Validación:** el QR solo se muestra cuando el código de equipo tiene 3 caracteres y todas las zonas tienen dorsal, sin repetidos. Si falta algo, la app indica qué.
- RF-06b. Mientras se muestra la vista del entrenador, la pantalla no se apaga.

## 5. Vista del árbitro

- RF-07. **Dos campos: Equipo A y Equipo B.** Cada uno tiene su botón **Escanear**, que abre la cámara.
- RF-08. Al escanear, el campo muestra el código de equipo y los dorsales colocados en su zona de la pista.
- RF-09. Volver a escanear un campo sustituye su contenido (por ejemplo, en el set siguiente).
- RF-10. Si el QR no tiene el formato correcto, o su modalidad o número de zonas no coincide con la modalidad elegida, la app muestra un aviso y no lo carga.
- RF-11. Si el código de equipo escaneado coincide con el del otro campo, la app avisa (el árbitro puede aceptar o cancelar).
- RF-12. Cada campo muestra el set del QR. Si los dos equipos han entregado sets distintos, la app lo avisa.

## 6. Formato del QR

Lo definimos nosotros; el único requisito es que **Clipeo pueda leerlo** (Clipeo tendrá que implementar el lector con esta especificación).

Un único objeto JSON en UTF-8:

```json
{"app":"clipeo-rota","v":1,"mod":"6x6","eq":"ABC","set":2,"zn":["22","4","7","10","1","15"]}
```

| Clave | Tipo | Contenido |
| --- | --- | --- |
| `app` | cadena | Siempre `"clipeo-rota"`. Sirve para descartar QR ajenos. |
| `v` | entero | Versión del formato. Empieza en 1; un lector rechaza versiones que no conoce. |
| `mod` | cadena | `"3x3"`, `"4x4"` o `"6x6"`. |
| `eq` | cadena | Código de equipo (3 caracteres). |
| `set` | entero | Número de set para el que el entrenador preparó la rotación (1–5). Si copia la del set 1 en el set 3, el QR dice `3`. |
| `zn` | array de cadenas | Dorsales en orden ZN1…ZNn (1–99, sin ceros a la izquierda ni repetidos). Su longitud debe coincidir con `mod`. |

Un lector rechaza el QR si `app` no es `clipeo-rota`, si no conoce la versión `v` o si algún campo no cumple lo anterior.

## 7. Requerimientos no funcionales

- RNF-01. **Sin conexión:** todo funciona offline. No hay servidor ni cuentas; el QR es la única vía de intercambio.
- RNF-02. **Plataformas:** iOS y Android, en móvil y tablet, en vertical y horizontal (sin bloquear la orientación).
- RNF-03. **Legibilidad:** dorsales y QR grandes, para leer o escanear a 1–2 m en un pabellón.
- RNF-04. **Idioma:** español.
- RNF-05. **Permisos:** solo la cámara, y solo en la vista del árbitro.
- RNF-06. **Datos:** solo se guardan en el dispositivo el perfil, la modalidad, el código de equipo y los dorsales por set. No hay datos personales.

## 8. Identidad visual: familia Clipeo

Tiene que parecer una app hermana de Clipeo.

Referencia: el código de la app iOS de Clipeo (`VoleyStats/voleyStatsApp`). Los valores están en `src/ui/tokens.json`.

- RV-01. **Colores:** fondo #070A12 (con #0F1524 y #24304F); volt #CBFB45 como acento principal (con #B6EE1F y #E4FF87); azul #3D6BFF como segundo color (con #6E93FF y #9CB8FF); textos en #FFFFFF / #E2E8F0 y secundarios en #94A3B8 / #64748B. En el logo y el icono se mantienen el fondo #0F1919, el azul #4A9FEE y el gris #E1E1E1.
- RV-02. **Tipografía:** como Clipeo, Space Grotesk (Medium) para títulos y la fuente del sistema para el texto.
- RV-03. **Componentes y estilo:** como Clipeo. Tarjetas en blanco al 10 % con radio 15; campos y botones con radio 8; chips en cápsula; acción principal en volt con texto oscuro; elementos seleccionados en volt; al pulsar, escala 0,97. La pista se dibuja como el tablero de rotación de Clipeo: celdas en blanco al 12 %, separación de 2 pt, esquinas de 4 pt y la fila de delante más baja.
- RV-04. **Icono:** misma familia que el de Clipeo (fondo, trazo azul de contorno y relleno gris), con símbolo propio: una flecha de rotación en sentido horario alrededor de un balón. Se genera con `scripts/render-icons.mjs`.

## 9. Fuera de alcance

- Voley playa (y minivoley en formatos distintos de 3x3 y 4x4).
- Plantillas de jugadores, partidos e histórico.
- Líbero y roles de jugador.
- Cuentas de usuario y sincronización.
- Envío al acta electrónica y estadísticas.

## 10. Preguntas abiertas

- **Clipeo:** ¿dónde lee Clipeo el QR? Encaja, por ejemplo, para cargar la rotación rival (`OpponentCourt`) escaneando el QR del otro entrenador. Falta implementarlo en iOS y Android.
