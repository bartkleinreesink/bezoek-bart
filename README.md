# 🚪 Langskomen bij Bart — PWA

Een echte Progressive Web App waarmee vrienden een bezoek kunnen aanvragen bij Bart,
en Bart een pushmelding ontvangt (ook als de app gesloten is).

## 📁 Bestanden
```
/
├── index.html        ← De volledige app
├── manifest.json     ← PWA manifest (naam, icoon, kleur)
├── sw.js             ← Service Worker (offline + push notificaties)
└── icons/
    ├── icon-192.png  ← App icoon (maak zelf, zie hieronder)
    └── icon-512.png  ← App icoon groot
```

## 🚀 Deployen op Netlify (aanbevolen, gratis)

1. Maak een account op https://netlify.com
2. Sleep de hele map naar het Netlify dashboard, OF:
3. Gebruik Netlify CLI:
   ```
   npm i -g netlify-cli
   netlify deploy --prod --dir .
   ```
4. Je krijgt een URL zoals: `https://jouw-bart-app.netlify.app`

> ⚠️ Push notificaties werken ALLEEN via HTTPS. Netlify geeft gratis HTTPS.

## 🖼️ Iconen maken

Maak een simpel 512×512 PNG met emoji 🚪 of een deur icoon.
Gebruik https://favicon.io of https://realfavicongenerator.net

Sla op als:
- `icons/icon-192.png` (192×192 px)
- `icons/icon-512.png` (512×512 px)

## 🔔 Notificaties instellen (als Bart)

1. Open de app → klik "🏠 Ik ben Bart"
2. Klik "Zet notificaties aan" → geef toestemming
3. Klaar! Je ontvangt nu pushberichten als iemand wil langskomen
4. Vanuit de melding kun je direct Ja/Nee klikken

## 📲 App installeren op telefoon

### Android (Chrome):
- Tap het banner bovenin "Installeer de app"
- Of via het menu → "App installeren" / "Toevoegen aan startscherm"

### iPhone (Safari):
- Tap het deel-icoon (vierkantje met pijl omhoog)
- Tap "Zet op beginscherm"
- (iPhone ondersteunt push notificaties in Safari sinds iOS 16.4+)

## 🔑 Echte push notificaties (optioneel, voor later)

De app werkt nu met browser Notification API (werkt als app open/actief is).
Voor notificaties als de app écht gesloten is, heb je een backend nodig:

1. Genereer VAPID keys:
   ```
   npm install web-push
   npx web-push generate-vapid-keys
   ```

2. Vervang in `index.html` de `VAPID_PUBLIC_KEY` met jouw public key

3. Maak een simpele backend (Node.js/Netlify Function):
   ```js
   // netlify/functions/notify.js
   const webpush = require('web-push');
   webpush.setVapidDetails('mailto:jij@example.com', PUBLIC_KEY, PRIVATE_KEY);
   
   exports.handler = async (event) => {
     const { subscription, visit } = JSON.parse(event.body);
     await webpush.sendNotification(subscription, JSON.stringify({
       title: '🚪 Iemand wil langskomen!',
       body: `${visit.visitor} wil op ${visit.date} om ${visit.time} langskomen`,
       visitId: visit.id
     }));
     return { statusCode: 200 };
   };
   ```

## 🤣 Hoe werkt de app?

**Voor bezoekers:**
- Inloggen met Google (gesimuleerd)
- Datum, tijd, reden, duur invullen
- Optioneel een +1 meenemen
- Versturen → Bart krijgt een melding

**Als Bart:**
- Klik "🏠 Ik ben Bart" (onderaan de header)
- Zet notificaties aan
- Zie alle verzoeken, klik Ja/Nee
- Grappige reacties bij elke keuze 🎉
