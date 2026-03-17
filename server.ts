import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'lumina_db.json');

// Initialize DB
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({
    users: [{ username: "Mat", password: "211008", role: "admin" }],
    config: { googleHomeConnected: false, zimaIp: "" }
  }));
}

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDB = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Users
  app.get('/api/users', (req, res) => {
    res.json(readDB().users);
  });
  
  app.post('/api/users', (req, res) => {
    const db = readDB();
    db.users.push(req.body);
    writeDB(db);
    res.json({ success: true });
  });
  
  app.delete('/api/users/:username', (req, res) => {
    const db = readDB();
    db.users = db.users.filter((u: any) => u.username !== req.params.username);
    writeDB(db);
    res.json({ success: true });
  });

  // API: Config (Google Home, ZimaOS IP, Discord Token)
  app.get('/api/config', (req, res) => {
    res.json(readDB().config);
  });
  
  app.post('/api/config', (req, res) => {
    const db = readDB();
    db.config = { ...db.config, ...req.body };
    writeDB(db);
    res.json({ success: true });
  });

  // API: Discord Bot Status
  app.get('/api/discord/status', async (req, res) => {
    try {
      const token = readDB().config.discordBotToken;
      if (!token) return res.json({ connected: false });

      const userRes = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token}` }
      });
      
      if (!userRes.ok) {
        return res.json({ connected: false, error: 'Token invalide' });
      }
      
      const userData = await userRes.json();
      
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bot ${token}` }
      });
      const guildsData = await guildsRes.ok ? await guildsRes.json() : [];

      res.json({
        connected: true,
        username: userData.username,
        avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
        serverCount: guildsData.length
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- SPOTIFY INTEGRATION ---
  const getRedirectUri = (req: any) => {
    if (process.env.SPOTIFY_REDIRECT_URI) {
      return process.env.SPOTIFY_REDIRECT_URI;
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}/api/spotify/callback`;
  };

  async function getValidSpotifyToken(username: string, req: any) {
    const db = readDB();
    const user = db.users.find((u: any) => u.username === username);
    if (!user || !user.spotify) return null;

    if (Date.now() > user.spotify.expiresAt) {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotify.refreshToken
      });
      const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
      try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authHeader}`
          },
          body: params.toString()
        });
        const data = await tokenRes.json();
        if (data.access_token) {
          user.spotify.accessToken = data.access_token;
          if (data.refresh_token) user.spotify.refreshToken = data.refresh_token;
          user.spotify.expiresAt = Date.now() + (data.expires_in - 60) * 1000;
          writeDB(db);
          return data.access_token;
        }
      } catch (e) {
        return null;
      }
      return null;
    }
    return user.spotify.accessToken;
  }

  app.get('/api/spotify/auth-url', (req, res) => {
    if (!process.env.SPOTIFY_CLIENT_ID) {
      return res.status(200).json({ error: "SPOTIFY_CLIENT_ID manquant dans le fichier .env" });
    }
    const username = req.query.username as string;
    const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope,
      redirect_uri: getRedirectUri(req),
      state: username
    });
    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get('/api/spotify/callback', async (req, res) => {
    const code = req.query.code as string;
    const username = req.query.state as string;
    
    if (!code || !username) return res.send('Erreur: Paramètres manquants');

    try {
      const params = new URLSearchParams({
        code,
        redirect_uri: getRedirectUri(req),
        grant_type: 'authorization_code'
      });

      const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        },
        body: params.toString()
      });

      const data = await tokenRes.json();
      if (data.access_token) {
        const db = readDB();
        const userIndex = db.users.findIndex((u: any) => u.username === username);
        if (userIndex !== -1) {
          db.users[userIndex].spotify = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + (data.expires_in - 60) * 1000
          };
          writeDB(db);
        }
      }

      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script></body></html>
      `);
    } catch (e) {
      res.send('Erreur lors de l\'authentification Spotify');
    }
  });

  app.get('/api/spotify/player', async (req, res) => {
    const username = req.query.username as string;
    const token = await getValidSpotifyToken(username, req);
    if (!token) return res.json({ connected: false });

    try {
      const playerRes = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (playerRes.status === 204) return res.json({ connected: true, is_playing: false, item: null });
      if (!playerRes.ok) return res.json({ connected: true, error: 'Erreur API Spotify' });

      const data = await playerRes.json();
      res.json({ connected: true, data });
    } catch (e) {
      res.json({ connected: true, error: 'Erreur réseau' });
    }
  });

  app.post('/api/spotify/player/control', async (req, res) => {
    const { username, action } = req.body;
    const token = await getValidSpotifyToken(username, req);
    if (!token) return res.status(401).json({ error: 'Not connected' });

    let url = `https://api.spotify.com/v1/me/player/${action}`;
    let method = action === 'next' || action === 'previous' ? 'POST' : 'PUT';

    try {
      await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Erreur contrôle' });
    }
  });
  // --- END SPOTIFY INTEGRATION ---

  // API: ZimaOS Proxy (Bypass CORS)
  app.get('/api/zimaos', async (req, res) => {
    try {
      const ip = req.query.ip as string;
      if (!ip) return res.status(400).json({ error: 'IP required' });
      
      const protocol = ip.startsWith('http') ? '' : 'http://';
      const url = `${protocol}${ip}/v1/sys/info`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur ${response.status}: ${text.substring(0, 50)}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error("ZimaOS Proxy Error:", e.message);
      res.status(500).json({ error: e.message.includes('abort') ? 'Délai d\'attente dépassé (Timeout)' : e.message });
    }
  });

  // ═══════════════════════════════════════════════════════
  //  LUMY — Personal Intelligence Engine (100% Local)
  // ═══════════════════════════════════════════════════════

  function fridayTimeOfDay(h: number) {
    if (h < 5) return 'nuit';
    if (h < 12) return 'matin';
    if (h < 18) return 'après-midi';
    return 'soir';
  }

  function fridayDetectIntent(msg: string): string {
    const m = msg.toLowerCase();
    if (/\b(bonjour|salut|hello|hey|coucou|bonsoir|bonne nuit|hi)\b/.test(m)) return 'GREETING';
    if (/\b(au revoir|bye|bonne nuit|à bientôt|ciao)\b/.test(m)) return 'FAREWELL';
    if (/\b(qui es.tu|tu es qui|tu t.appelles|ton nom|c.est quoi ton nom|t.appelles comment)\b/.test(m)) return 'IDENTITY';
    if (/\b(que peux.tu faire|fonctionnalit|quelles sont tes capabilit|qu.est.ce que tu sais|aide.moi avec|aide)\b/.test(m)) return 'CAPABILITIES';
    if (/\b(bilan|résumé|rapport|comment je .* aujourd|ma journ|j.en suis|progrès aujourd)\b/.test(m)) return 'STATUS';
    if (/\b(habitude|habit|streak|série|compléter|fait)\b/.test(m)) return 'HABITS';
    if (/\b(pomodoro|focus|session|concentrat|travailler|timer|minuteur)\b/.test(m)) return 'POMODORO';
    if (/\b(todo|tâche|faire|liste|ajouter tâche)\b/.test(m)) return 'TODO';
    if (/\b(rappel|rappelle|remind|n.oublie pas|dans .* heure|dans .* minute)\b/.test(m)) return 'REMINDER';
    if (/\b(souviens.toi|retiens|mémorise|n.oublie pas que|sache que|je suis|j.ai \d+ ans|mon (?:prénom|nom est)|je travaille|j.aime)\b/.test(m)) return 'REMEMBER';
    if (/\b(qu.est.ce que tu sais sur moi|tu te souviens|ce que tu sais de moi|mes infos|mon profil)\b/.test(m)) return 'RECALL';
    if (/\b(conseil|astuce|recommande|suggestion|idée|que devrais.je|que dois.je|comment .* mieux|améliorer)\b/.test(m)) return 'ADVICE';
    if (/\b(ouvre|va sur|affiche|montre|accède|navigue|aller sur)\b/.test(m)) return 'NAVIGATE';
    if (/\b(météo|temps qu.il fait|température)\b/.test(m)) return 'WEATHER';
    if (/\b(heure|quelle heure|il est)\b/.test(m)) return 'TIME';
    if (/\b(date|on est|quel jour|aujourd.hui c.est)\b/.test(m)) return 'DATE';
    if (/\b(merci|super|parfait|bien joué|impressionnant|top|génial)\b/.test(m)) return 'COMPLIMENT';
    if (/^[\d\s\+\-\*\/\(\)\.\,]+$/.test(m.trim()) && m.trim().length > 1) return 'MATH';
    if (/[\+\-\*\/]/.test(m) && /\d/.test(m) && /\b(combien|calcul|fait|vaut|égal)\b/.test(m)) return 'MATH';
    return 'UNKNOWN';
  }

  function fridayExtractFacts(msg: string, facts: Record<string, string>): Record<string, string> {
    const newFacts = { ...facts };
    const ageMatch = msg.match(/j.?ai (\d+) ans/i);
    if (ageMatch) newFacts['age'] = ageMatch[1];
    const metierMatch = msg.match(/(?:je suis|je travaille comme|mon métier est) ([^,.!?]+)/i);
    if (metierMatch) newFacts['metier'] = metierMatch[1].trim();
    const villeMatch = msg.match(/(?:j.habite|je vis) (?:à|a) ([^,.!?]+)/i);
    if (villeMatch) newFacts['ville'] = villeMatch[1].trim();
    const goûtMatch = msg.match(/j.aime (?:beaucoup |vraiment |surtout )?([^,.!?]+)/i);
    if (goûtMatch) newFacts['aime'] = goûtMatch[1].trim();
    return newFacts;
  }

  function fridayDetectTarget(msg: string): string | null {
    const m = msg.toLowerCase();
    if (/\b(pomodoro|focus|timer)\b/.test(m)) return 'pomodoro';
    if (/\b(habitude|habit|tracking)\b/.test(m)) return 'habits';
    if (/\b(calculatr|calcul)\b/.test(m)) return 'calculator';
    if (/\b(outil|convertis|genère|password|base64)\b/.test(m)) return 'tools';
    if (/\b(serveur|zima|proxmox)\b/.test(m)) return 'server';
    if (/\b(maison|home|domotique|google)\b/.test(m)) return 'home';
    if (/\b(friday|lumi|ia|intelligence)\b/.test(m)) return 'lumy';
    if (/\b(accueil|dashboard|principal)\b/.test(m)) return 'dashboard';
    return null;
  }

  function fridayPickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fridayBuildResponse(intent: string, msg: string, db: any, ctx: any): { reply: string; commands?: any[] } {
    const now = new Date();
    const hour = now.getHours();
    const tod = fridayTimeOfDay(hour);
    const name = ctx?.userName || db.users?.[0]?.username || 'Patron';
    const habits: any[] = ctx?.habits || [];
    const reminders: any[] = db.friday?.reminders || [];
    const facts: Record<string, string> = db.friday?.facts || {};
    const totalSessions = ctx?.pomodoroSessions || 0;
    const completedHabits = habits.filter((h: any) => h.completedToday).length;
    const totalHabits = habits.length;
    const pendingReminders = reminders.filter((r: any) => !r.done && r.timestamp > Date.now() - 86400000);

    switch (intent) {
      case 'GREETING': {
        const variants = [
          `Bonne ${tod}, ${name}. Systèmes opérationnels. ${totalHabits > 0 ? `Vous avez ${completedHabits}/${totalHabits} habitude${completedHabits !== 1 ? 's' : ''} complétée${completedHabits !== 1 ? 's' : ''} aujourd'hui.` : ''} Que puis-je faire pour vous ?`,
          `${name}. En ligne. ${tod === 'matin' ? "Bonne journée qui s'annonce." : tod === 'soir' ? 'La journée tire à sa fin.' : 'Tout est nominal.'} Comment puis-je vous assister ?`,
          `Systèmes actifs. Bonjour, ${name}. ${pendingReminders.length > 0 ? `Note : vous avez ${pendingReminders.length} rappel${pendingReminders.length > 1 ? 's' : ''} en attente.` : 'Aucun rappel en cours.'} Je suis à votre disposition.`,
        ];
        return { reply: fridayPickRandom(variants) };
      }

      case 'FAREWELL': {
        return { reply: fridayPickRandom([
          `À bientôt, ${name}. Je reste en veille.`,
          `Bonne continuation. Je serai là à votre retour.`,
          `Systèmes en veille. À très vite, ${name}.`,
        ])};
      }

      case 'IDENTITY': {
        return { reply: `Je suis Lumy — votre intelligence personnelle intégrée à LuminaOS. Contrairement aux IA génériques, je suis construite exclusivement pour vous : je mémorise vos habitudes, vos préférences, vos rappels, et j'analyse vos données en temps réel. Tout reste sur votre système. Aucune donnée ne sort.` };
      }

      case 'CAPABILITIES': {
        return { reply: `Voici ce que je sais faire, ${name} :\n\n**Mémoire** — Je retiens tout ce que vous me dites sur vous. Profession, préférences, informations personnelles.\n\n**Analyse** — Je surveille vos habitudes, sessions Pomodoro et vous donne un bilan en temps réel.\n\n**Rappels** — Dites-moi "rappelle-moi de X dans 30 minutes" et je le ferai.\n\n**Navigation** — Je peux ouvrir n'importe quelle section du dashboard pour vous.\n\n**Conseils** — Productivité, organisation, bien-être.\n\n**Calculs** — Toute opération mathématique.\n\nTout fonctionne hors ligne. Aucune API externe.` };
      }

      case 'STATUS': {
        const habitSummary = totalHabits === 0
          ? "Aucune habitude configurée."
          : `${completedHabits}/${totalHabits} habitude${totalHabits > 1 ? 's' : ''} complétée${completedHabits > 1 ? 's' : ''}.`;
        const focusSummary = totalSessions > 0 ? `${totalSessions} session${totalSessions > 1 ? 's' : ''} Pomodoro effectuée${totalSessions > 1 ? 's' : ''}` : "Aucune session focus";
        const reminderSummary = pendingReminders.length > 0 ? `${pendingReminders.length} rappel${pendingReminders.length > 1 ? 's' : ''} en attente` : "Aucun rappel en attente";
        const perf = completedHabits === totalHabits && totalHabits > 0 ? "🔥 Performance optimale — toutes vos habitudes sont faites." : totalHabits > 0 ? `${totalHabits - completedHabits} habitude${totalHabits - completedHabits > 1 ? 's' : ''} restante${totalHabits - completedHabits > 1 ? 's' : ''} pour la journée.` : '';

        return { reply: `**Bilan du ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}**\n\n📋 Habitudes : ${habitSummary}\n⏱ Focus : ${focusSummary}\n🔔 Rappels : ${reminderSummary}\n\n${perf}` };
      }

      case 'HABITS': {
        if (totalHabits === 0) {
          return { reply: `Vous n'avez encore aucune habitude configurée. Rendez-vous dans la section Habitudes pour en créer — je suivrai vos progrès en temps réel.`, commands: [{ type: 'navigate', view: 'habits' }] };
        }
        const done = habits.filter((h: any) => h.completedToday);
        const todo = habits.filter((h: any) => !h.completedToday);
        let reply = `**Vos habitudes :**\n\n`;
        if (done.length) reply += done.map((h: any) => `✅ ${h.name}${h.streak > 1 ? ` — ${h.streak}j de suite 🔥` : ''}`).join('\n') + '\n';
        if (todo.length) reply += todo.map((h: any) => `⬜ ${h.name}`).join('\n');
        if (done.length === totalHabits) reply += `\n\n🎯 Parfait — toutes faites !`;
        return { reply, commands: [{ type: 'navigate', view: 'habits' }] };
      }

      case 'POMODORO': {
        const suggest = totalSessions === 0 ? "Vous n'avez pas encore démarré de session aujourd'hui. C'est le moment." : totalSessions < 4 ? `${totalSessions} session${totalSessions > 1 ? 's' : ''} effectuée${totalSessions > 1 ? 's' : ''}. Continuez — la concentration s'accumule.` : `${totalSessions} sessions ! Solide. Prenez une vraie pause si ce n'est pas fait.`;
        return { reply: `⏱ **Pomodoro**\n\n${suggest}\n\nTechnique recommandée : 25 min focus → 5 min pause. Après 4 sessions : 20-30 min de vraie pause.`, commands: [{ type: 'navigate', view: 'pomodoro' }] };
      }

      case 'REMINDER': {
        const timeMatch = msg.match(/dans (\d+) (minute|heure|min|h)/i);
        const contentMatch = msg.match(/(?:rappelle.moi de?|rappel pour|n.oublie pas de?) (.+?)(?:\s+dans|\s*$)/i);
        if (contentMatch) {
          const content = contentMatch[1].trim();
          let ms = 0;
          if (timeMatch) {
            const val = parseInt(timeMatch[1]);
            ms = timeMatch[2].toLowerCase().startsWith('h') ? val * 3600000 : val * 60000;
          }
          const reminder = {
            id: Date.now().toString(),
            text: content,
            timestamp: ms > 0 ? Date.now() + ms : Date.now() + 3600000,
            done: false,
            created: Date.now()
          };
          if (!db.friday) db.friday = { memory: [], facts: {}, reminders: [] };
          if (!db.friday.reminders) db.friday.reminders = [];
          db.friday.reminders.push(reminder);
          const when = ms > 0 ? (timeMatch![2].toLowerCase().startsWith('h') ? `dans ${timeMatch![1]}h` : `dans ${timeMatch![1]} minutes`) : "dans 1 heure";
          return { reply: `📌 Rappel enregistré : **"${content}"** — ${when}. Je vous notifierai.` };
        }
        if (pendingReminders.length === 0) {
          return { reply: `Aucun rappel actif. Dites-moi par exemple : *"Rappelle-moi de vérifier mes emails dans 30 minutes"*.` };
        }
        const list = pendingReminders.map((r: any) => `• ${r.text} — ${new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`).join('\n');
        return { reply: `**Rappels actifs :**\n\n${list}` };
      }

      case 'REMEMBER': {
        return { reply: `Mémorisé. ${fridayPickRandom(["Je me souviendrai de cela.", "Information enregistrée dans votre profil.", "Noté dans ma mémoire."])}` };
      }

      case 'RECALL': {
        const known = Object.entries(facts);
        if (known.length === 0) {
          return { reply: `Je n'ai encore aucune information personnelle sur vous, ${name}. Parlez-moi de vous — votre métier, vos habitudes, ce que vous aimez — et je mémoriserai tout.` };
        }
        const factLines = known.map(([k, v]) => {
          if (k === 'age') return `• Âge : ${v} ans`;
          if (k === 'metier') return `• Profession : ${v}`;
          if (k === 'ville') return `• Ville : ${v}`;
          if (k === 'aime') return `• Vous aimez : ${v}`;
          return `• ${k} : ${v}`;
        }).join('\n');
        return { reply: `**Ce que je sais sur vous :**\n\n${factLines}\n\nPlus vous me parlez, plus je vous connais.` };
      }

      case 'ADVICE': {
        const advices = [
          `**Conseil pour ${tod === 'matin' ? 'bien démarrer' : tod === 'soir' ? 'terminer la journée' : 'rester productif'} :**\n\n${tod === 'matin' ? 'Commencez par votre tâche la plus difficile dans les 90 premières minutes. Le cerveau est au maximum de ses capacités tôt le matin.' : tod === 'soir' ? 'Listez vos 3 priorités pour demain avant de vous déconnecter. Votre cerveau travaillera dessus pendant la nuit.' : 'La règle des 2 minutes : si une tâche prend moins de 2 minutes, faites-la maintenant.'}\n\n${completedHabits < totalHabits && totalHabits > 0 ? `💡 Vous avez encore ${totalHabits - completedHabits} habitude${totalHabits - completedHabits > 1 ? 's' : ''} à compléter aujourd'hui.` : ''}`,
          `**Productivité :**\n\nLe batching de tâches similaires réduit le temps de commutation cognitive de 40%. Groupez vos emails, vos réunions, vos appels.\n\n${totalSessions > 0 ? `Vous avez ${totalSessions} session${totalSessions > 1 ? 's' : ''} de focus aujourd'hui — continuez.` : 'Essayez votre première session Pomodoro maintenant.'}`,
          `**Énergie :**\n\nVotre énergie suit un cycle de 90 minutes. Travaillez par blocs de 90 min, puis faites une vraie pause (pas juste changer d'écran). Buvez de l'eau — une déshydratation de 2% réduit les performances cognitives de 20%.`,
        ];
        return { reply: fridayPickRandom(advices) };
      }

      case 'NAVIGATE': {
        const target = fridayDetectTarget(msg);
        if (!target) {
          return { reply: `Quelle section souhaitez-vous ouvrir ? Pomodoro, Habitudes, Calculatrice, Outils, Serveur ou Maison connectée ?` };
        }
        const names: Record<string, string> = { pomodoro: 'Pomodoro', habits: 'Habitudes', calculator: 'Calculatrice', tools: 'Outils', server: 'Serveur', home: 'Maison', lumy: 'Lumy', dashboard: 'Accueil' };
        return { reply: `Ouverture de **${names[target] || target}**.`, commands: [{ type: 'navigate', view: target }] };
      }

      case 'TIME': {
        return { reply: `Il est actuellement **${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}**. Bonne ${tod}, ${name}.` };
      }

      case 'DATE': {
        return { reply: `Nous sommes le **${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}**.` };
      }

      case 'WEATHER': {
        return { reply: `Je n'ai pas accès aux données météo en temps réel — je fonctionne entièrement hors ligne. Pour la météo, je vous recommande de consulter votre application habituelle.` };
      }

      case 'COMPLIMENT': {
        return { reply: fridayPickRandom([
          `Je vous remercie. C'est mon rôle d'être utile, ${name}.`,
          `Apprécie la reconnaissance. Que puis-je faire d'autre pour vous ?`,
          `Je me contente de faire mon travail. À votre service, ${name}.`,
        ])};
      }

      case 'MATH': {
        try {
          const expr = msg.replace(/[^0-9\+\-\*\/\(\)\.\,\s]/g, '').replace(',', '.').trim();
          const result = Function('"use strict"; return (' + expr + ')')();
          if (typeof result === 'number' && isFinite(result)) {
            return { reply: `**${expr} = ${parseFloat(result.toFixed(10))}**` };
          }
        } catch {}
        return { reply: `Je n'ai pas pu calculer cette expression. Essayez via la Calculatrice intégrée pour plus de précision.`, commands: [{ type: 'navigate', view: 'calculator' }] };
      }

      default: {
        const defaultReplies = [
          `Je n'ai pas saisi votre demande précisément. Vous pouvez me demander un bilan, démarrer un Pomodoro, vérifier vos habitudes, enregistrer un rappel, ou simplement discuter.`,
          `Pouvez-vous reformuler ? Je peux vous aider avec votre productivité, vos habitudes, des rappels, ou naviguer dans le dashboard.`,
          `Message reçu, ${name}, mais je n'ai pas su comment l'interpréter. Essayez de me poser une question directe — bilan du jour, conseil, rappel...`,
        ];
        return { reply: fridayPickRandom(defaultReplies) };
      }
    }
  }

  // FRIDAY Memory API
  app.get('/api/friday/memory', (req, res) => {
    const db = readDB();
    const username = (req.query.username as string) || db.users?.[0]?.username;
    const friday = db.friday || { facts: {}, reminders: [], memory: [] };
    res.json({ facts: friday.facts || {}, reminders: friday.reminders || [], memoryCount: (friday.memory || []).length });
  });

  app.post('/api/friday/reminders/:id/done', (req, res) => {
    const db = readDB();
    if (!db.friday?.reminders) return res.json({ success: false });
    const r = db.friday.reminders.find((r: any) => r.id === req.params.id);
    if (r) { r.done = true; writeDB(db); }
    res.json({ success: true });
  });

  // FRIDAY Main Endpoint
  app.post('/api/friday', (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message requis.' });
      }

      const db = readDB();
      if (!db.friday) db.friday = { facts: {}, reminders: [], memory: [] };
      if (!db.friday.facts) db.friday.facts = {};
      if (!db.friday.reminders) db.friday.reminders = [];
      if (!db.friday.memory) db.friday.memory = [];

      // Extract & store facts from this message
      db.friday.facts = fridayExtractFacts(message, db.friday.facts);

      // Store message in memory (last 200 exchanges)
      db.friday.memory.push({ role: 'user', content: message, ts: Date.now() });
      if (db.friday.memory.length > 200) db.friday.memory = db.friday.memory.slice(-200);

      // Detect intent and generate response
      const intent = fridayDetectIntent(message);
      const responseData = fridayBuildResponse(intent, message, db, context);

      // Store FRIDAY's reply
      db.friday.memory.push({ role: 'friday', content: responseData.reply, ts: Date.now() });
      writeDB(db);

      res.json({ reply: responseData.reply, commands: responseData.commands || [], intent, memoryCount: db.friday.memory.length });
    } catch (e: any) {
      console.error('FRIDAY error:', e.message);
      res.status(500).json({ error: 'Lumy rencontre une erreur interne : ' + e.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
