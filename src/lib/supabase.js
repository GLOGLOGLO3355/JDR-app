import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export const PERSONNAGES_INITIAUX = [
  {
    id: 1, nom: 'Aldric le Brave', classe: 'Guerrier',
    pv_max: 120, pv_actuel: 120, argent: 450,
    force: 18, agilite: 10, intelligence: 6, charisme: 12,
    actions: 3, furtivite: 7, defense: 15,
  },
  {
    id: 2, nom: 'Sylvara', classe: 'Rôdeuse',
    pv_max: 85, pv_actuel: 85, argent: 320,
    force: 11, agilite: 19, intelligence: 9, charisme: 13,
    actions: 4, furtivite: 20, defense: 12,
  },
  {
    id: 3, nom: 'Ezrath le Sage', classe: 'Mage',
    pv_max: 60, pv_actuel: 60, argent: 580,
    force: 5, agilite: 8, intelligence: 22, charisme: 15,
    actions: 2, furtivite: 6, defense: 7,
  },
  {
    id: 4, nom: 'Mira Doucevoix', classe: 'Barde',
    pv_max: 75, pv_actuel: 75, argent: 290,
    force: 8, agilite: 14, intelligence: 13, charisme: 21,
    actions: 3, furtivite: 12, defense: 9,
  },
]

export const STATS_CONFIG = [
  { key: 'force',        label: 'Force',        icon: '⚔️',  color: '#e05c5c' },
  { key: 'agilite',      label: 'Agilité',      icon: '🌪️',  color: '#5ce0b8' },
  { key: 'intelligence', label: 'Intelligence',  icon: '✨',  color: '#8a7fff' },
  { key: 'charisme',     label: 'Charisme',     icon: '👑',  color: '#f0c060' },
  { key: 'actions',      label: 'Actions',      icon: '⚡',  color: '#ff9944' },
  { key: 'furtivite',    label: 'Furtivité',    icon: '🌑',  color: '#6699cc' },
  { key: 'defense',      label: 'Défense',      icon: '🛡️',  color: '#77cc77' },
]
