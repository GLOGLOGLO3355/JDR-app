export const CLASSES = {
  Humain: {
    nom: 'Humain',
    emoji: '🧑',
    arme: 'Blaster',
    combat: 'À distance longue/moyenne',
    description: 'Pour les big losers qui sont racistes des aliens. A distance comme des petites salopes',
    couleur: '#7ab8f5',
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
    description: 'Robots nés d\'une civilisation détruite par leurs propres créations (les robots en gros ils ont pris le dessus genre chatgpt qui nous tue car il y a trop de fétichistes des pieds sur terre).',
    couleur: '#a0d4a0',
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
    description: 'Aliens ailés fiers de leurs ailes mais tout le monde se fout de leur gueule vu qu\'ils volent genre 2 metres. Ils sont super rapides et font des attaques éclairs, mais sont fragiles et pas très forts.',
    couleur: '#d4a0d4',
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
    description: 'Ils portent bien leur nom: ils vivent pour la bagarre, mais l\'intelligence est optionnelle. Oscar?',
    couleur: '#e07070',
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
    description: 'Pieuvres aux pouvoirs psychiques. Rien avoir avec les poulpes aux tentacules des series cochonnes japonaises.',
    couleur: '#8a7fff',
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
    description: 'Furtifs et charismatiques, mais fragiles au combat direct. Ils peuvent se transformer en n\'importe quelle forme et s\'infiltrer partout, mais ils ne vont pas se transformer en femme sexy et coquine pour vous car ils sont complètement asexués (triste).',
    couleur: '#5ce0b8',
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

// Calcul PV : Défense + 50
export function calculerPV(stats) {
  return stats.defense + 50
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