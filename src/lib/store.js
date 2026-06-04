import { supabase, PERSONNAGES_INITIAUX } from './supabase.js'

let listeners = []
let jetListeners = []
let state = { personnages: [], jetActif: null }

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