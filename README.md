# Hunting High & Low

App for jaktlaget: erfaringer fra tidligere år, felles handleliste, personlig pakkeliste og
forberedelser før jakta.

## Teknologi

- **React + Vite** – frontend
- **SASS** – styling (i tillegg til [Mantine](https://mantine.dev/) som komponentbibliotek)
- **Firebase Authentication** (Google-innlogging) + **Firebase Realtime Database**
- **Vercel** – hosting/deploy

## Komme i gang lokalt

1. Installer avhengigheter:

   ```bash
   npm install
   ```

2. Firebase-konfigurasjonen ligger i `.env` (ikke committet til Git – se `.env.example` for
   hvilke variabler som trengs). `.env` er allerede fylt ut med prosjektets nøkler, men
   **`VITE_FIREBASE_DATABASE_URL` må dobbeltsjekkes**: gå til Firebase Console →
   Realtime Database, og kopier riktig URL derfra (den avhenger av hvilken region databasen ble
   opprettet i).

3. Start dev-server med hot reload:

   ```bash
   npm run dev
   ```

   Endringer i koden oppdateres automatisk i nettleseren.

4. Bygg for produksjon:

   ```bash
   npm run build
   ```

## Firebase-oppsett

1. I [Firebase Console](https://console.firebase.google.com/), åpne prosjektet
   `hunting-erfaring-app`.
2. **Authentication** → Sign-in method → aktiver **Google**.
3. **Realtime Database** → opprett database (velg en region, f.eks. Europe). Kopier URL-en inn i
   `.env` som `VITE_FIREBASE_DATABASE_URL`.
4. Under Realtime Database → **Rules**, lim inn innholdet fra [`database.rules.json`](database.rules.json)
   i dette repoet (krever innlogging for lesing/skriving, og gjør pakkelister private per bruker).

## Datastruktur (Realtime Database)

```
users/{uid}                        Profil (navn, e-post, bilde)
experiences/{year}/{id}            Erfaringer (bra/dårlig) per år
shoppingTemplate/items/{id}        Standard handleliste (mal)
shoppingLists/{year}/items/{id}    Årets felles handleliste
packingTemplate/items/{id}         Standard pakkeliste (mal)
packingLists/{uid}/items/{id}      Personlig pakkeliste per bruker
prepTemplate/items/{id}            Standard forberedelses-sjekkliste (mal)
prepLists/{year}/items/{id}        Årets forberedelser
feedback/{id}                      Tilbakemeldinger fra brukere (kun lesbart for ADMIN)
```

Handleliste, pakkeliste og forberedelser kan importeres fra sin respektive standardliste
("mal"), og alle innloggede kan legge til nye ting og hake av det som er gjort/kjøpt.

## Deploy til Vercel

1. Push repoet til GitHub.
2. Importer prosjektet i [Vercel](https://vercel.com/) (autodetekterer Vite).
3. Legg inn de samme miljøvariablene som i `.env.example` under Vercel → Settings →
   Environment Variables.
4. Deploy.
