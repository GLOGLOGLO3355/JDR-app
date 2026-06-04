export const CLASSES = {
  Humain: {
    nom: 'Humain',
    emoji: '🧑',
    arme: 'Blaster',
    combat: 'À distance longue/moyenne',
    description: 'Polyvalents et adaptables, maîtres du blaster.',
    couleur: '#7ab8f5',
    avatars: [
      '/avatars/Humain/humain.png',
      '/avatars/Humain/humain2.png',
      '/avatars/Humain/humain3.png',
      '/avatars/Humain/humain4.png',
      '/avatars/Humain/humain5.png',
      '/avatars/Humain/humain6.png',
    ],
    stats: {
      force:        { min: 0,  max: 20 },
      agilite:      { min: 20, max: 40 },
      intelligence: { min: 10, max: 30 },
      charisme:     { min: 10, max: 30 },
      actions:      { min: 0,  max: 20 },
      furtivite:    { min: 10, max: 30 },
      defense:      { min: 0,  max: 20 },
    },
  },
  Klank: {
    nom: 'Klank',
    emoji: '🤖',
    arme: 'Sabre laser',
    combat: 'Corps à corps / distance moyenne',
    description: 'Robots nés d\'une civilisation détruite par leurs propres créations.',
    couleur: '#a0d4a0',
    avatars: [
      '/avatars/Klank/Klank.png',
      '/avatars/Klank/Klank2.png',
      '/avatars/Klank/Klank3.png',
      '/avatars/Klank/Klank4.png',
      '/avatars/Klank/Klank5.png',
      '/avatars/Klank/Klank6.png',
    ],
    stats: {
      force:        { min: 20, max: 40 },
      agilite:      { min: 10, max: 30 },
      intelligence: { min: 10, max: 30 },
      charisme:     { min: 0,  max: 20 },
      actions:      { min: 0,  max: 20 },
      furtivite:    { min: 0,  max: 20 },
      defense:      { min: 10, max: 30 },
    },
  },
  Mush: {
    nom: 'Mush',
    emoji: '🪰',
    arme: 'Lance',
    combat: 'Corps à corps, voltigeur',
    description: 'Aliens ailés fiers de leurs ailes — que tout le monde moque.',
    couleur: '#d4a0d4',
    avatars: [
      '/avatars/Mush/Mush.png',
      '/avatars/Mush/Mush2.png',
      '/avatars/Mush/Mush3.png',
      '/avatars/Mush/Mush4.png',
      '/avatars/Mush/Mush5.png',
      '/avatars/Mush/Mush6.png',
    ],
    stats: {
      force:        { min: 10, max: 30 },
      agilite:      { min: 10, max: 30 },
      intelligence: { min: 0,  max: 20 },
      charisme:     { min: 0,  max: 20 },
      actions:      { min: 20, max: 40 },
      furtivite:    { min: 10, max: 30 },
      defense:      { min: 0,  max: 20 },
    },
  },
  Trysault: {
    nom: 'Trysault',
    emoji: '💢',
    arme: 'Poings',
    combat: 'Corps à corps brutal',
    description: 'Vivent pour la bagarre. L\'intelligence est optionnelle.',
    couleur: '#e07070',
    avatars: [
      '/avatars/Trysault/Trysault.png',
      '/avatars/Trysault/Trysault2.png',
      '/avatars/Trysault/Trysault3.png',
      '/avatars/Trysault/Trysault4.png',
      '/avatars/Trysault/Trysault5.png',
      '/avatars/Trysault/Trysault6.png',
    ],
    stats: {
      force:        { min: 20, max: 40 },
      agilite:      { min: 10, max: 30 },
      intelligence: { min: 0,  max: 20 },
      charisme:     { min: 10, max: 30 },
      actions:      { min: 0,  max: 20 },
      furtivite:    { min: 0,  max: 20 },
      defense:      { min: 10, max: 30 },
    },
  },
  Cthulu: {
    nom: 'Cthulu',
    emoji: '🐙',
    arme: 'Psychique',
    combat: 'À distance, magie',
    description: 'Pieuvres aux pouvoirs psychiques redoutables.',
    couleur: '#8a7fff',
    avatars: [
      '/avatars/Cthulu/Cthulu.png',
      '/avatars/Cthulu/Cthulu2.png',
      '/avatars/Cthulu/Cthulu3.png',
      '/avatars/Cthulu/Cthulu4.png',
      '/avatars/Cthulu/Cthulu5.png',
    ],
    stats: {
      force:        { min: 0,  max: 20 },
      agilite:      { min: 0,  max: 20 },
      intelligence: { min: 20, max: 40 },
      charisme:     { min: 10, max: 30 },
      actions:      { min: 10, max: 30 },
      furtivite:    { min: 0,  max: 20 },
      defense:      { min: 10, max: 30 },
    },
  },
  Metamorphe: {
    nom: 'Métamorphe',
    emoji: '🌀',
    arme: 'Couteau',
    combat: 'Corps à corps discret',
    description: 'Furtifs et charismatiques, mais fragiles au combat direct.',
    couleur: '#5ce0b8',
    avatars: [
      '/avatars/Metamorphes/Metamorphe.png',
      '/avatars/Metamorphes/Metamorphe2.png',
      '/avatars/Metamorphes/Metamorphe3.png',
      '/avatars/Metamorphes/Metamorphe4.png',
      '/avatars/Metamorphes/Metamorphe5.png',
      '/avatars/Metamorphes/Metamorphe6.png',
    ],
    stats: {
      force:        { min: 0,  max: 20 },
      agilite:      { min: 10, max: 30 },
      intelligence: { min: 0,  max: 20 },
      charisme:     { min: 10, max: 30 },
      actions:      { min: 0,  max: 20 },
      furtivite:    { min: 20, max: 40 },
      defense:      { min: 10, max: 30 },
    },
  },
}

export const STATS_LABELS = {
  force:        { label: 'Force',        icon: '⚔️' },
  agilite:      { label: 'Agilité',      icon: '🌪️' },
  intelligence: { label: 'Intelligence', icon: '✨' },
  charisme:     { label: 'Charisme',     icon: '👑' },
  actions:      { label: 'Actions',      icon: '⚡' },
  furtivite:    { label: 'Furtivité',    icon: '🌑' },
  defense:      { label: 'Défense',      icon: '🛡️' },
}

export const TOTAL_POINTS = 100

// Calcul PV : Défense × 5
export function calculerPV(stats) {
  return stats.defense * 5
}

// Initialise les stats au minimum de chaque stat pour la classe
export function statsInitiales(classe) {
  const cfg = CLASSES[classe].stats
  return Object.fromEntries(
    Object.entries(cfg).map(([k, v]) => [k, v.min])
  )
}

// Points restants
export function pointsRestants(stats, classe) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  return TOTAL_POINTS - total
}