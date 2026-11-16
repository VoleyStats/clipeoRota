# Publicar Clipeo Rota en App Store y Google Play

Las compilaciones se hacen en la nube con **EAS** (Expo Application Services), así que no hacen falta Xcode ni Android Studio. Todos los comandos se lanzan desde el contenedor de desarrollo, con la sesión de Expo ya iniciada (`npx expo whoami`).

Textos e imágenes de las fichas: [`store/textos.md`](../store/textos.md). Política de privacidad: [`store/privacidad.md`](../store/privacidad.md).

## Datos fijos

| | |
| --- | --- |
| Bundle ID (iOS) y paquete (Android) | `com.clipeostats.rota` (no se puede cambiar tras la primera subida) |
| Cuentas | Las de Clipeo: Apple Developer, Play Console, soporte en hola@clipeostats.com |
| Versión | `expo.version` en `app.json` (1.0.0). Los números de compilación los lleva EAS (`appVersionSource: remote`, `autoIncrement`) |
| Cifrado | `usesNonExemptEncryption: false`: la app no usa cifrado, no hay que presentar documentación de exportación |

## 1. Vincular el proyecto con EAS (una vez)

```bash
docker compose run --rm dev npx eas-cli@latest init
```

Crea el proyecto en expo.dev y añade `extra.eas.projectId` y `owner` a `app.json`. Si Clipeo tiene una organización en Expo, elígela como propietaria para que el proyecto no dependa de una cuenta personal.

## 2. Probar una compilación real

```bash
# Android: APK instalable directamente en cualquier móvil
docker compose run --rm dev npx eas-cli@latest build --profile preview --platform android

# iOS: para el simulador del Mac (sirve también para las capturas de App Store)
docker compose run --rm dev npx eas-cli@latest build --profile simulator --platform ios
```

En iOS, para probar en un iPhone real lo más sencillo es TestFlight (paso 4).

Lo que hay que comprobar en la compilación real, porque Expo Go no lo enseña: el icono, la pantalla de arranque, el permiso de cámara (solo en Árbitro) y que todo funciona en modo avión.

## 3. Crear la app en las consolas (una vez)

**App Store Connect** → Apps → «+» → Nueva app:
- Plataforma iOS, nombre «Clipeo Rota», idioma principal Español (España).
- Bundle ID `com.clipeostats.rota` (EAS lo registra en el primer `build`; si no aparece, créalo en Certificates, Identifiers & Profiles).
- SKU: `clipeo-rota`.

**Play Console** → Crear aplicación:
- Nombre «Clipeo Rota: rotación voleibol», idioma predeterminado Español (España), aplicación, gratuita.
- Aceptar las declaraciones de políticas.

## 4. Compilar y subir la versión de producción

```bash
docker compose run --rm dev npx eas-cli@latest build --profile production --platform all
```

La primera vez EAS pide:
- **iOS:** iniciar sesión con el Apple ID del equipo de Clipeo; crea y guarda el certificado y el perfil de distribución.
- **Android:** generar la clave de firma (keystore). Déjala gestionada por EAS y activa «Firma de apps de Google Play».

Subir:

```bash
# iOS → TestFlight / App Store Connect
docker compose run --rm dev npx eas-cli@latest submit --platform ios --latest
```

- **Android:** Google exige que **la primera subida sea manual**. Descarga el `.aab` desde la página de la compilación en expo.dev y súbelo en Play Console → Pruebas → Prueba interna → Crear versión. A partir de la segunda versión se puede usar `eas submit --platform android` con una cuenta de servicio de Google Cloud con permiso de publicación (se configura en `eas.json` → `submit.production.android.serviceAccountKeyPath`; el archivo JSON **no** se sube a git).

## 5. Ficha de App Store

```bash
docker compose run --rm dev npx eas-cli@latest metadata:push
```

Sube nombre, subtítulo, texto promocional, descripción, palabras clave, URLs, categoría y copyright desde `store.config.json`. A mano en App Store Connect:

- **Capturas** (iPhone 6,9" e iPad 13"), ver `store/textos.md`.
- **Privacidad de la app:** «No recopilamos datos de esta app».
- **Clasificación por edad:** todas las respuestas «No» → 4+.
- **Precio:** gratis, todos los países donde se publique Clipeo.
- **Información para la revisión** (notas para el revisor):

  > Clipeo Rota no necesita cuenta ni conexión. Para probarla: elige «Voleibol 6x6» y «Entrenador», escribe un código de tres letras y un dorsal en cada zona, y pulsa «Mostrar QR». Para probar el perfil «Árbitro» con un solo dispositivo, escanea los QR adjuntos (equipo A y equipo B) con el botón «Escanear».

  Adjunta `store/graphics/review-qr-a.png` y `review-qr-b.png`.

## 6. Ficha y formularios de Google Play

En Play Console, sección «Contenido de la aplicación» (todo obligatorio antes de publicar):

| Formulario | Respuesta |
| --- | --- |
| Política de privacidad | https://clipeostats.com/rota/privacidad |
| Acceso a la aplicación | Toda la funcionalidad está disponible sin restricciones |
| Anuncios | No contiene anuncios |
| Clasificación de contenido (IARC) | Categoría «Utilidades, productividad…» o «Referencia»; todas las respuestas «No» → PEGI 3 |
| Público objetivo | 18 años o más (la usan entrenadores y árbitros; elegir menores de 13 activaría el programa de Familias) |
| Seguridad de los datos | No se recogen ni se comparten datos. La cámara se usa solo en el dispositivo y no cuenta como dato recogido |
| App gubernamental, financiera, de salud | No |

Ficha principal de la tienda: título, descripción breve, descripción completa, icono de 512 px, imagen destacada y capturas, todo en `store/textos.md` y `store/graphics/`.

Si la cuenta de Play Console es **personal y se creó después de noviembre de 2023**, Google exige una prueba cerrada con al menos 12 testers durante 14 días antes de poder publicar en producción. Las cuentas de organización no tienen este requisito.

## 7. Publicar

- **iOS:** en App Store Connect, añade la compilación a la versión 1.0.0 y envíala a revisión.
- **Android:** pasa la versión de Prueba interna a Producción y envíala a revisión.

## Pendiente antes de la primera publicación

- [ ] Publicar la política de privacidad en https://clipeostats.com/rota/privacidad (repositorio web), con el nombre del titular.
- [ ] Hacer las capturas (iPhone 6,9", iPad 13" y teléfono Android) y añadirles los textos.
- [ ] Decidir el título de Google Play (el de los requisitos no cabe en 30 caracteres).
- [ ] Confirmar con la federación que acepta la rotación en pantalla (pregunta abierta de los requisitos).

## Versiones siguientes

1. Sube `expo.version` en `app.json` (por ejemplo, 1.0.1 o 1.1.0).
2. `eas build --profile production --platform all` y `eas submit --platform all --latest`.
3. Actualiza `releaseNotes` en `store.config.json` y `eas metadata:push`.
