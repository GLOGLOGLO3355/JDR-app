import { supabase, PERSONNAGES_INITIAUX } from './supabase.js'

let listeners = []
let jetListeners = []
let state = { personnages: [], jetActif: null, bonusActif: null }

export function getState() { return state }

function setState(updater) {
  state = updater(state)
  listeners.forEach(fn => fn(state))
}

function setJet(jet) {
  state = { ...state, jetActif: jet }
  listeners.forEach(fn => fn(state))
  jetListeners.forEach(fn => fn(jet))
}

export function subscribe(fn) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}

export function subscribeJet(fn) {
  jetListeners.push(fn)
  return () => { jetListeners = jetListeners.filter(l => l !== fn) }
}

export async function init() {
  if (!supabase) {
    state = { personnages: JSON.parse(JSON.stringify(PERSONNAGES_INITIAUX)), jetActif: null }
    listeners.forEach(fn => fn(state))
    return
  }

  const { data, error } = await supabase
    .from('personnages')
    .select('*')
    .order('id')

  if (error) {
    state = { personnages: JSON.parse(JSON.stringify(PERSONNAGES_INITIAUX)), jetActif: null }
  } else {
    state = { personnages: data, jetActif: null }
  }
  listeners.forEach(fn => fn(state))

  // Abonnement personnages
  supabase
    .channel('personnages-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'personnages' }, payload => {
      if (payload.eventType === 'UPDATE') {
        setState(s => ({ ...s, personnages: s.personnages.map(p => p.id === payload.new.id ? payload.new : p) }))
      } else if (payload.eventType === 'INSERT') {
        setState(s => ({ ...s, personnages: [...s.personnages, payload.new] }))
      } else if (payload.eventType === 'DELETE') {
        setState(s => ({ ...s, personnages: s.personnages.filter(p => p.id !== payload.old.id) }))
      }
    })
    .subscribe()

  // Abonnement jets de dés
  supabase
    .channel('jets-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jets_de_des' }, payload => {
      if (payload.eventType === 'INSERT') {
        setJet(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        setJet(payload.new)
        // Auto-clear après 5s si résolu
        if (payload.new.statut === 'resolu') {
          setTimeout(() => setJet(null), 5000)
        }
      } else if (payload.eventType === 'DELETE') {
        setJet(null)
      }
    })
    .subscribe()
}

export async function refresh() {
  if (!supabase) return
  const { data, error } = await supabase.from('personnages').select('*').order('id')
  if (!error) {
    state = { ...state, personnages: data }
    listeners.forEach(fn => fn(state))
  }
}

export async function refreshJet() {
  if (!supabase) return
  const { data, error } = await supabase
    .from('jets_de_des')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // Aucun jet — clear si on en avait un
    if (state.jetActif) setJet(null)
    return
  }

  const jet = data
  const prevJet = state.jetActif

  // Nouveau jet ou changement de statut → propager
  if (!prevJet || prevJet.id !== jet.id || prevJet.statut !== jet.statut) {
    if (jet.statut === 'resolu' && prevJet?.statut === 'en_attente') {
      setJet(jet)
      setTimeout(() => setJet(null), 5000)
    } else if (jet.statut === 'en_attente') {
      setJet(jet)
    }
  }
}

export async function updatePersonnage(id, changes) {
  setState(s => ({ ...s, personnages: s.personnages.map(p => p.id === id ? { ...p, ...changes } : p) }))
  if (!supabase) return
  const { error } = await supabase.from('personnages').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('Supabase update error:', error)
}

// MJ : barrer/débarrer une compétence pour un joueur
export async function barrerCompetence(personnageId, nomCompetence) {
  const personnage = state.personnages.find(p => p.id === personnageId)
  if (!personnage) return
  const actuelles = personnage.competences_barrees || []
  const dejaBarree = actuelles.includes(nomCompetence)
  const nouvelles = dejaBarree
    ? actuelles.filter(n => n !== nomCompetence)
    : [...actuelles, nomCompetence]
  await updatePersonnage(personnageId, { competences_barrees: nouvelles })
}

// MJ : débarrer toutes les compétences de tous les joueurs
export async function debarrerToutesCompetences() {
  await updateAllPersonnages({ competences_barrees: [] })
}

export async function updateAllPersonnages(changes) {
  const ids = state.personnages.map(p => p.id)
  setState(s => ({ ...s, personnages: s.personnages.map(p => ({ ...p, ...changes })) }))
  if (!supabase) return
  for (const id of ids) {
    await supabase.from('personnages').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id)
  }
}

// MJ : demander un jet
export async function demanderJet(personnageId, stat, palier, faces) {
  if (!supabase) return
  // Supprimer l'ancien jet en attente s'il existe
  await supabase.from('jets_de_des').delete().eq('statut', 'en_attente')
  const { data, error } = await supabase.from('jets_de_des').insert([{
    personnage_id: personnageId,
    stat,
    palier,
    faces,
    statut: 'en_attente',
  }]).select().single()
  if (error) console.error('Erreur demanderJet:', error)
  return data
}

// MJ : annuler le jet en cours
export async function annulerJet() {
  if (!supabase) return
  await supabase.from('jets_de_des').delete().eq('statut', 'en_attente')
  setJet(null)
}

// Joueur : lancer le dé
export async function lancerJet(jetId, faces) {
  const valeur = Math.floor(Math.random() * faces) + 1
  if (!supabase) return valeur
  const { error } = await supabase.from('jets_de_des').update({ valeur, statut: 'resolu' }).eq('id', jetId)
  if (error) console.error('Erreur lancerJet:', error)
  return valeur
}

// ── Points bonus ──────────────────────────────────────────────────────────────

function setBonus(bonus) {
  state = { ...state, bonusActif: bonus }
  listeners.forEach(fn => fn(state))
}

export async function refreshBonus() {
  if (!supabase) return
  const { data, error } = await supabase
    .from('points_bonus')
    .select('*')
    .eq('statut', 'disponible')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (state.bonusActif) setBonus(null)
    return
  }

  const prevBonus = state.bonusActif
  if (!prevBonus || prevBonus.id !== data.id || prevBonus.statut !== data.statut) {
    setBonus(data)
  }
}

// MJ : accorder des points bonus à tous
export async function accorderBonus(montant) {
  if (!supabase) return
  // Clore l'ancien bonus disponible s'il existe
  await supabase.from('points_bonus').update({ statut: 'termine' }).eq('statut', 'disponible')
  const { data, error } = await supabase.from('points_bonus').insert([{ montant }]).select().single()
  if (error) console.error('Erreur accorderBonus:', error)
  setBonus(data)
  return data
}

// MJ : annuler le bonus en cours
export async function annulerBonus() {
  if (!supabase) return
  await supabase.from('points_bonus').update({ statut: 'termine' }).eq('statut', 'disponible')
  setBonus(null)
}

// Joueur : valider sa répartition de points
export async function validerBonus(bonusId, personnageId, changements) {
  if (!supabase) return

  // Si la défense augmente, recalculer pv_max et pv_actuel
  const personnage = state.personnages.find(p => p.id === personnageId)
  if (personnage && changements.defense !== undefined) {
    const nouvelleDefense = changements.defense
    const nouveauPvMax = nouvelleDefense * 2 + 30
    const delta = nouveauPvMax - personnage.pv_max
    changements.pv_max = nouveauPvMax
    changements.pv_actuel = Math.max(0, personnage.pv_actuel + delta)
  }

  await supabase.from('personnages')
    .update({ ...changements, updated_at: new Date().toISOString() })
    .eq('id', personnageId)
  await supabase.from('points_bonus_validation').insert([{ bonus_id: bonusId, personnage_id: personnageId }])
  setState(s => ({
    ...s,
    personnages: s.personnages.map(p => p.id === personnageId ? { ...p, ...changements } : p)
  }))
}

// Récupérer les IDs des personnages ayant validé un bonus
export async function getValidations(bonusId) {
  if (!supabase) return []
  const { data } = await supabase
    .from('points_bonus_validation')
    .select('personnage_id')
    .eq('bonus_id', bonusId)
  return data ? data.map(d => d.personnage_id) : []
}

// Clore le bonus si tout le monde a validé
export async function clorerBonusSiTermine(bonusId, nombreJoueurs) {
  if (!supabase) return
  const validations = await getValidations(bonusId)
  if (validations.length >= nombreJoueurs) {
    await supabase.from('points_bonus').update({ statut: 'termine' }).eq('id', bonusId)
    setBonus(null)
  }
}

// Vérifier si un personnage a déjà validé le bonus actif
export async function aDejaValide(bonusId, personnageId) {
  if (!supabase) return false
  const { data } = await supabase
    .from('points_bonus_validation')
    .select('*')
    .eq('bonus_id', bonusId)
    .eq('personnage_id', personnageId)
    .single()
  return !!data
}