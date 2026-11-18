# Publicar Clipeo Rota en App Store y Google Play

Las compilaciones se hacen en la nube con **EAS** (Expo Application Services), así que no hacen falta Xcode ni Android Studio. Todos los comandos se lanzan desde el contenedor de desarrollo, con la sesión de Expo ya iniciada (`npx expo whoami`).

Textos e imágenes de las fichas: [`store/textos.md`](../store/textos.md). Política de privacidad: https://rota.clipeostats.com/privacy (ruta `/privacy` de la propia app, texto en [`src/privacyPolicy.ts`](../src/privacyPolicy.ts); `?lang=en` para la versión en inglés).

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

- **Capturas:** `store/screenshots/<idioma>/iphone/` (iPhone 6,9", 1320 × 2868), `iphone-6.3/` (iPhone 6,3", 1206 × 2622) e `ipad/` (iPad 13"), en cada idioma. Sube en cada casilla la carpeta cuyo tamaño pida App Store Connect. Ver `store/textos.md`.
- **Header and Search Results:** `store/graphics/appstore-header-<idioma>.png` y `appstore-search-<idioma>.png`.
- **Inglés:** añade el idioma Inglés (EE. UU.) en la ficha. `metadata:push` sube sus textos desde `store.config.json`.
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
| Política de privacidad | https://rota.clipeostats.com/privacy |
| Acceso a la aplicación | Toda la funcionalidad está disponible sin restricciones |
| Anuncios | No contiene anuncios |
| Clasificación de contenido (IARC) | Categoría «Utilidades, productividad…» o «Referencia»; todas las respuestas «No» → PEGI 3 |
| Público objetivo | 18 años o más (la usan entrenadores y árbitros; elegir menores de 13 activaría el programa de Familias) |
| Seguridad de los datos | No se recogen ni se comparten datos. La cámara se usa solo en el dispositivo y no cuenta como dato recogido |
| App gubernamental, financiera, de salud | No |

Ficha principal de la tienda: título, descripción breve, descripción completa, icono de 512 px, imagen destacada y capturas (`store/screenshots/<idioma>/android/`), todo en `store/textos.md`, `store/graphics/` y `store/screenshots/`. Añade la traducción en-US (Gestionar traducciones) con los textos en inglés, la imagen destacada `-en` y las capturas `en/`.

Si la cuenta de Play Console es **personal y se creó después de noviembre de 2023**, Google exige una prueba cerrada con al menos 12 testers durante 14 días antes de poder publicar en producción. Las cuentas de organización no tienen este requisito.

## 7. Publicar

- **iOS:** en App Store Connect, añade la compilación a la versión 1.0.0 y envíala a revisión.
- **Android:** pasa la versión de Prueba interna a Producción y envíala a revisión.

## Pendiente antes de la primera publicación

- [ ] Decidir el título de Google Play (el de los requisitos no cabe en 30 caracteres).
- [ ] Confirmar con la federación que acepta la rotación en pantalla (pregunta abierta de los requisitos).

## Versiones siguientes

1. Sube `expo.version` en `app.json` (por ejemplo, 1.0.1 o 1.1.0).
2. `eas build --profile production --platform all` y `eas submit --platform all --latest`.
3. Actualiza `releaseNotes` en `store.config.json` y `eas metadata:push`.

## Versión web (Vercel)

La misma app se publica como web estática. `vercel.json` lleva la configuración:
- instala con `npm ci`;
- compila con `npx expo export --platform web` y publica la carpeta `dist/`;
- envía todas las rutas a `index.html`, para que recargar en `/entrenador/6x6` funcione.

`public/` tiene el `index.html` (en español, con fondo oscuro) y el manifiesto para instalarla en la pantalla de inicio; los iconos de `public/` salen de `scripts/render-icons.mjs`.

Diferencias con las apps:
- Los avisos y confirmaciones usan los diálogos del navegador (`src/ui/dialog.web.ts`).
- La cámara necesita HTTPS (Vercel ya lo da) y su permiso se cambia desde el candado de la barra de direcciones.
- La primera vez hace falta conexión para cargarla.

Para desplegar hay dos formas:
- **Automático:** en vercel.com → Add New → Project, importa `VoleyStats/clipeoRota`. No hay que tocar ningún ajuste porque los lee de `vercel.json`. Cada push a `main` despliega a producción y cada rama tiene su URL de vista previa.
- **Desde el contenedor:** con `VERCEL_TOKEN` en `.env` (se crea en vercel.com/account/tokens), ejecuta `docker compose run --rm dev npx vercel@latest deploy --prod --token "$VERCEL_TOKEN"`.

Dominio: en el proyecto de Vercel, Settings → Domains, añade por ejemplo `rota.clipeostats.com` y crea en el DNS el registro CNAME que indique Vercel.
