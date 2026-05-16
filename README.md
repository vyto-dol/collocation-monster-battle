# Collocation Monster Battle

Classroom battle game for practicing sports collocations with `play`, `go`, and `do`.

## Run Locally

```bash
npm start
```

Open:

```text
http://127.0.0.1:4173
```

For students on the same Wi-Fi, use the host machine's LAN IP with port `4173`.

## Deploy To Dokploy

Use the GitHub repository with Dokploy's Dockerfile deployment.

Recommended Dokploy settings:

```text
Repository: https://github.com/vyto-dol/collocation-monster-battle
Branch: main
Build type: Dockerfile
Dockerfile path: Dockerfile
Container port: 3000
Health check path: /health
```

The app reads `PORT` from the environment. The Docker image defaults to `3000`, while local development defaults to `4173`.

## Notes

- UI is DOM-based for crisp text and controls.
- Battle effects run in a Phaser canvas layer.
- Live classroom room sync uses the local Node server with Server-Sent Events.
- GitHub Pages can serve the static files, but it will not provide the live multi-device room server. Dokploy should run the Node server for live room sync.

## Asset Pipeline

The generation scripts read secrets from environment variables only:

```bash
GEMINI_API_KEY=... ELEVENLABS_API_KEY=... node tools/generate-assets.mjs
node tools/audit-assets.mjs
```

Generated assets are ignored until they pass audit.
