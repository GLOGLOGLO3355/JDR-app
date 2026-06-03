-- NEXUS JDR - Schéma Supabase
-- Coller dans l'éditeur SQL de ton projet Supabase

CREATE TABLE personnages (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  classe TEXT,
  avatar TEXT,
  pv_max INTEGER DEFAULT 100,
  pv_actuel INTEGER DEFAULT 100,
  argent INTEGER DEFAULT 1000,
  force INTEGER DEFAULT 10,
  agilite INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  charisme INTEGER DEFAULT 10,
  furtivite INTEGER DEFAULT 10,
  defense INTEGER DEFAULT 10,
  actions INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer le realtime sur cette table
ALTER TABLE personnages REPLICA IDENTITY FULL;
SELECT supabase_realtime.enable_extension('realtime', 'public', 'personnages');

-- Insérer les 3 personnages de départ
INSERT INTO personnages VALUES
  ('p1','KIRA-7','Infiltratrice','🥷',80,80,2400,8,18,10,12,19,11,2,NOW()),
  ('p2','ZARAK','Hacker Netrunner','🧠',65,65,1800,6,9,20,14,8,7,1,NOW()),
  ('p3','BRIX','Mercenaire Augmenté','🦾',120,120,950,20,11,6,7,5,18,3,NOW());

-- Politique RLS (Row Level Security) - accès public pour la démo
ALTER TABLE personnages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique" ON personnages FOR SELECT USING (true);
CREATE POLICY "Modification publique" ON personnages FOR UPDATE USING (true);
