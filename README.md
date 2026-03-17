# 🍃 LuminaOS

<div align="center">
  <br/>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/IA-100%25%20Locale-10b981?style=flat-square" />
  </p>
  <p><em>Ton espace de contrôle personnel. Sombre, rapide, offline-first.</em></p>
</div>

---

## 🚀 Lancement Rapide

```bash
npm install
npm run dev
```

> Accessible sur **[http://localhost:3000](http://localhost:3000)**

---

## 🧩 Modules Intégrés

| Module | Description |
|---|---|
| 🏠 **Dashboard** | Horloge, météo, Google, actualités, Spotify, notes, todo |
| 🤖 **Lumy** | IA personnelle 100% locale — zéro API, zéro cloud |
| 💡 **Maison** | Contrôle des appareils Google Home |
| 🖥️ **Serveur** | Monitoring ZimaOS — CPU, RAM, stockage, uptime |
| ⏱️ **Pomodoro** | Focus timer avec compteur de sessions |
| ✅ **Habitudes** | Suivi quotidien, streaks, progression |
| 🧮 **Calculette** | Calculs rapides intégrés |
| 🔧 **Outils** | Générateur mdp, encodeur base64, convertisseurs |
| ⚙️ **Paramètres** | Gestion des comptes, Discord bot, Spotify |

---

## 🧠 Philosophie

LuminaOS est né d'une idée simple : **tes données t'appartiennent**.

- 🔒 Aucune donnée envoyée vers un serveur externe
- 🌐 Fonctionne sans Internet (sauf les widgets météo/actualités)
- 🤖 Lumy tourne en local, sans clé API, sans abonnement
- 💾 Stockage JSON local uniquement — pas de base de données cloud
- ⚡ Interface rapide, dark-mode natif, conçue pour un usage quotidien

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│               Navigateur                │
│  React 19 · TypeScript · Tailwind v4   │
│  Motion · Lucide · Vite HMR            │
└────────────────────┬────────────────────┘
                     │ HTTP / API REST
┌────────────────────▼────────────────────┐
│            Express + tsx               │
│  /api/friday  /api/spotify  /api/zimaos │
│  /api/users   /api/config   /api/discord│
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│           lumina_db.json               │
│   Utilisateurs · Config · Mémoire Lumy │
└─────────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

```
Frontend   →  React 19 + TypeScript + Vite 6 + Tailwind CSS v4
Backend    →  Express.js + tsx (Node.js)
Animations →  Motion (Framer Motion)
Stockage   →  lumina_db.json — léger, local, portable
IA (Lumy)  →  Moteur local — 0 API externe
```

---

<div align="center">
  **✦ Conçu avec intention ✦**
</div>
