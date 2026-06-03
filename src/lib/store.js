// Store global en mémoire (remplacé par Supabase Realtime en prod)
import { PERSONNAGES_INITIAUX } from './supabase.js'

let listeners = []
let state = {
  personnages: JSON.parse(JSON.stringify(PERSONNAGES_INITIAUX)),
}

export function getState() { return state }

export function setState(updater) {
  state = updater(state)
  listeners.forEach(fn => fn(state))
}

export function subscribe(fn) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}

export function updatePersonnage(id, changes) {
  setState(s => ({
    ...s,
    personnages: s.personnages.map(p =>
      p.id === id ? { ...p, ...changes } : p
    )
  }))
}

export function updateAllPersonnages(changes) {
  setState(s => ({
    ...s,
    personnages: s.personnages.map(p => ({ ...p, ...changes }))
  }))
}
