import { supabase, PERSONNAGES_INITIAUX } from './supabase.js'

let listeners = []
let state = { personnages: [] }

export function getState() { return state }

function setState(updater) {
  state = updater(state)
  listeners.forEach(fn => fn(state))
}

export function subscribe(fn) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}

// Chargement initial depuis Supabase
export async function init() {
  if (!supabase) {
    // Fallback local si pas de Supabase configuré
    state = { personnages: JSON.parse(JSON.stringify(PERSONNAGES_INITIAUX)) }
    listeners.forEach(fn => fn(state))
    return
  }

  const { data, error } = await supabase
    .from('personnages')
    .select('*')
    .order('id')

  if (error) {
    console.error('Supabase load error:', error)
    state = { personnages: JSON.parse(JSON.stringify(PERSONNAGES_INITIAUX)) }
  } else {
    state = { personnages: data }
  }
  listeners.forEach(fn => fn(state))

  // Abonnement Realtime — toutes les mises à jour se propagent instantanément
  supabase
    .channel('personnages-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'personnages' }, payload => {
      if (payload.eventType === 'UPDATE') {
        setState(s => ({
          ...s,
          personnages: s.personnages.map(p =>
            p.id === payload.new.id ? payload.new : p
          )
        }))
      } else if (payload.eventType === 'INSERT') {
        setState(s => ({
          ...s,
          personnages: [...s.personnages, payload.new]
        }))
      } else if (payload.eventType === 'DELETE') {
        setState(s => ({
          ...s,
          personnages: s.personnages.filter(p => p.id !== payload.old.id)
        }))
      }
    })
    .subscribe()
}

// Recharge les données sans recréer le channel Realtime
export async function refresh() {
  if (!supabase) return
  const { data, error } = await supabase
    .from('personnages')
    .select('*')
    .order('id')
  if (!error) {
    state = { personnages: data }
    listeners.forEach(fn => fn(state))
  }
}


export async function updatePersonnage(id, changes) {
  // Mise à jour optimiste locale immédiate
  setState(s => ({
    ...s,
    personnages: s.personnages.map(p => p.id === id ? { ...p, ...changes } : p)
  }))

  if (!supabase) return

  const { error } = await supabase
    .from('personnages')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) console.error('Supabase update error:', error)
}

// Modifier tous les personnages (onglet Global)
export async function updateAllPersonnages(changes) {
  const ids = state.personnages.map(p => p.id)

  setState(s => ({
    ...s,
    personnages: s.personnages.map(p => ({ ...p, ...changes }))
  }))

  if (!supabase) return

  for (const id of ids) {
    await supabase
      .from('personnages')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
  }
}