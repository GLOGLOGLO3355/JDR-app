# JDR App

Application de gestion de jeu de rôle.

## Lancer en local

```bash
npm install
npm run dev
```

## Routes

- `/` — Accueil, choix du personnage
- `/joueur/:id` — Interface joueur (1, 2, 3, 4)
- `/maitre/login` — Connexion MJ (mot de passe : `grimoire42`)
- `/maitre` — Interface MJ

## Mot de passe MJ

Changer la constante `MJ_PASSWORD` dans `src/pages/MaitreLogin.jsx`.

## Supabase (temps réel en production)

1. Créer un projet sur https://supabase.com
2. Copier `.env.example` → `.env` et remplir les clés
3. Exécuter ce SQL dans Supabase :

```sql
create table personnages (
  id bigint primary key,
  nom text, classe text,
  pv_max int, pv_actuel int, argent int,
  force int, agilite int, intelligence int,
  charisme int, actions int, furtivite int, defense int,
  updated_at timestamptz default now()
);
alter table personnages enable row level security;
create policy "public read" on personnages for select using (true);
create policy "public write" on personnages for all using (true);
```

4. Insérer les personnages initiaux depuis `src/lib/supabase.js`
5. Dans `src/lib/store.js`, remplacer le store local par des appels Supabase + subscription realtime

## Déploiement

```bash
npm run build
# Déployer le dossier dist/ sur Vercel, Netlify, ou autre
```
