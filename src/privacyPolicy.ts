/**
 * Privacy policy, published at https://rota.clipeostats.com/privacy (route
 * src/app/privacy.tsx) and linked from both store listings. Spanish and
 * English; `?lang=en` opens the English one. Update `updated` on any change.
 */

export type PolicyLang = 'es' | 'en';

export type Block =
  | { h: string }
  | { p: string }
  | { li: string[] };

export interface Policy {
  title: string;
  updated: string;
  blocks: Block[];
}

export const PRIVACY_POLICY: Record<PolicyLang, Policy> = {
  es: {
    title: 'Política de privacidad',
    updated: 'Última actualización: 18 de noviembre de 2026',
    blocks: [
      {
        p: 'Esta política explica qué datos trata Clipeo Rota, en sus apps para iPhone, iPad y Android y en la web rota.clipeostats.com. Clipeo Rota sirve para que el entrenador prepare la rotación de cada set de voleibol y la entregue al árbitro con un código QR.',
      },
      { h: 'Responsable' },
      {
        p: 'Clipeo Rota la desarrolla Pau Hermosilla, autor de Clipeo. Para cualquier duda sobre privacidad, escribe a hola@clipeostats.com.',
      },
      { h: 'Sin cuentas y sin datos personales' },
      {
        p: 'Clipeo Rota no tiene cuentas ni registro, no recoge datos personales y no envía los datos que escribes a ningún servidor. Tampoco tiene publicidad, analítica ni servicios de terceros que sigan lo que haces.',
      },
      { h: 'Qué se guarda y dónde' },
      { p: 'La app guarda solo en tu dispositivo (en la web, en el almacenamiento local del navegador):' },
      {
        li: [
          'el perfil (entrenador o árbitro) y la modalidad que elegiste por última vez;',
          'el código de equipo de tres caracteres;',
          'los dorsales de cada zona y de cada set;',
          'en el perfil de árbitro, las dos últimas rotaciones escaneadas.',
        ],
      },
      {
        p: 'Estos datos no salen del dispositivo, salvo cuando enseñas el QR a otra persona para que lo escanee. El QR contiene únicamente el código de equipo, la modalidad, el número de set y los dorsales; no contiene nombres ni otros datos de los jugadores.',
      },
      { h: 'Cámara' },
      {
        p: 'La app pide permiso de cámara solo en el perfil de árbitro, para leer los QR. Las imágenes se procesan en el dispositivo en ese momento; no se guardan ni se envían a ningún sitio.',
      },
      { h: 'Menores' },
      {
        p: 'La app no pide ni guarda nombres, fechas de nacimiento, fotos ni ningún otro dato de los jugadores, solo sus dorsales. Por eso puede usarse con equipos de menores.',
      },
      { h: 'Web' },
      {
        p: 'La web no usa cookies, así que no verás ningún aviso de cookies. Está alojada en Vercel, que, como cualquier servidor web, registra datos técnicos de cada visita (como la dirección IP) para servir la página y protegerla frente a abusos. No usamos esos registros para identificarte ni para seguir tu navegación.',
      },
      { h: 'Cómo borrar tus datos' },
      {
        p: 'En la vista del entrenador, «Nuevo partido» borra el código de equipo y todas las rotaciones. Al desinstalar la app se borra todo lo que guarda; en la web, al borrar los datos del sitio en el navegador.',
      },
      { h: 'Tus derechos' },
      {
        p: 'Como no guardamos datos tuyos en ningún servidor, no tenemos nada que consultar, corregir o borrar por ti: todo está en tu dispositivo y lo controlas tú. Aun así, puedes escribirnos a hola@clipeostats.com para cualquier consulta sobre tus derechos de acceso, rectificación y supresión.',
      },
      { h: 'Cambios' },
      {
        p: 'Si esta política cambia, publicaremos la nueva versión en esta misma dirección, con su fecha de actualización.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: November 18, 2026',
    blocks: [
      {
        p: 'This policy explains what data Clipeo Rota processes, in its apps for iPhone, iPad and Android and on the website rota.clipeostats.com. Clipeo Rota lets volleyball coaches prepare the rotation for each set and hand it to the referee with a QR code.',
      },
      { h: 'Data controller' },
      {
        p: 'Clipeo Rota is developed by Pau Hermosilla, the author of Clipeo. For any privacy questions, write to hola@clipeostats.com.',
      },
      { h: 'No accounts and no personal data' },
      {
        p: 'Clipeo Rota has no accounts or sign-up, does not collect personal data and does not send what you type to any server. It has no advertising, no analytics and no third-party services that track what you do.',
      },
      { h: 'What is stored and where' },
      { p: 'The app stores only on your device (on the website, in the browser’s local storage):' },
      {
        li: [
          'the profile (coach or referee) and the format you chose last;',
          'the three-character team code;',
          'the player numbers for each zone and each set;',
          'in the referee profile, the last two rotations scanned.',
        ],
      },
      {
        p: 'This data never leaves your device, except when you show the QR code to someone so they can scan it. The QR code contains only the team code, the format, the set number and the player numbers; it contains no names or any other player data.',
      },
      { h: 'Camera' },
      {
        p: 'The app asks for camera permission only in the referee profile, to read QR codes. The images are processed on the device at that moment; they are neither stored nor sent anywhere.',
      },
      { h: 'Children' },
      {
        p: 'The app does not ask for or store names, dates of birth, photos or any other player data, only their numbers. That is why it can be used with youth teams.',
      },
      { h: 'Website' },
      {
        p: 'The website uses no cookies, so you will not see a cookie banner. It is hosted on Vercel, which, like any web server, logs technical data about each visit (such as the IP address) to serve the page and protect it against abuse. We do not use those logs to identify you or to track your browsing.',
      },
      { h: 'How to delete your data' },
      {
        p: 'In the coach view, «Nuevo partido» (New match) deletes the team code and all the rotations. Uninstalling the app deletes everything it stores; on the website, so does clearing the site data in your browser.',
      },
      { h: 'Your rights' },
      {
        p: 'Since we keep none of your data on any server, there is nothing for us to access, correct or delete on your behalf: everything is on your device and under your control. You can still write to hola@clipeostats.com with any question about your rights of access, rectification and erasure.',
      },
      { h: 'Changes' },
      {
        p: 'If this policy changes, we will publish the new version at this same address, with its update date.',
      },
    ],
  },
};
