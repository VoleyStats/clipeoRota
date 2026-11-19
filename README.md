# Clipeo Rota

App de rotaciones de voleibol (iOS y Android): el entrenador escribe su rotación y la muestra en un QR; el árbitro escanea el QR de cada equipo. Requisitos en [`docs/requisitos.md`](docs/requisitos.md).

Stack: Expo SDK 58 (React Native) + TypeScript + Expo Router.

## Desarrollo (Docker / OrbStack)

No hace falta instalar Node en el Mac: todo corre en el contenedor `dev`. Las `node_modules` viven en un volumen de Docker, no en la carpeta del proyecto.

```bash
docker compose build                                   # una vez
docker compose run --rm dev npm install                # tras cambiar dependencias

# Servidor de desarrollo, para abrir con Expo Go en el móvil (misma wifi que el Mac)
./scripts/dev.sh

docker compose run --rm dev npm test                   # pruebas (jest)
docker compose run --rm dev npm run typecheck          # tsc
docker compose run --rm dev npm run lint               # eslint
docker compose run --rm dev npx expo install <paquete> # añadir dependencias (versiones compatibles con el SDK)
```

Al arrancar el servidor, escanea el QR de la terminal con la app Expo Go (Android) o con la cámara (iOS). Si el móvil no conecta por la red local, usa `npx expo start --tunnel` dentro del contenedor.

Iconos y splash: se generan desde `scripts/render-icons.mjs`:
`docker compose run --rm dev bash -c "npm i --no-save sharp && node scripts/render-icons.mjs"`.

Las compilaciones para las tiendas se hacen en la nube con EAS, así que tampoco hace falta Xcode ni Android Studio. Pasos para publicar: [`docs/publicacion.md`](docs/publicacion.md); textos e imágenes de las fichas: [`store/`](store/).

## Estructura

```
src/
  app/                 Pantallas (Expo Router)
    index.tsx            Inicio: modalidad (desplegable) + rol; reabre la última vista
    entrenador/[mod].tsx Vista del entrenador: pista, sets, rotar, QR
    arbitro/[mod].tsx    Vista del árbitro: equipos A y B, escáner
  core/                Lógica pura y probada: formatos, dorsales, rotación, validación, QR, sets
  components/          Button, Court (pista), Scanner, Screen
  ui/tokens.json       Tokens de diseño sacados del código de Clipeo (colores, radios, espaciados)
  strings.ts           Todos los textos (español e inglés)
```

El formato del QR (`src/core/qr.ts`) es un contrato con Clipeo: cualquier cambio sube la versión `v` y se documenta en la sección 6 de los requisitos.
