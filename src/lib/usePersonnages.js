import { useState, useEffect, useCallback } from 'react'
import { supabase, PERSONNAGES_DEFAUT } from '../lib/supabase'

// Mode démo : utilise les données locales si Supabase n'est pas configuré
const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL'

export function usePersonnages() {
  const [personnages, setPersonnages] = useState(PERSONNAGES_DEFAUT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (IS_DEMO) return

    // Charge depuis Supabase
    const fetchAll = async () => {
      setLoading(true)
      const { data } = await supabase.from('personnages').select('*')
      if (data && data.length > 0) setPersonnages(data)
      setLoading(false)
    }
    fetchAll()

    // Écoute les changements en temps réel
    const channel = supabase
      .channel('personnages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personnages' }, (payload) => {
        setPersonnages(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const updatePersonnage = useCallback(async (id, changes) => {
    if (IS_DEMO) {
      setPersonnages(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
      return
    }
    await supabase.from('personnages').update(changes).eq('id', id)
  }, [])

  return { personnages, loading, updatePersonnage, isDemo: IS_DEMO }
}

export function usePersonnage(id) {
  const { personnages, updatePersonnage, isDemo } = usePersonnages()
  const [perso, setPerso] = useState(null)

  useEffect(() => {
    const found = personnages.find(p => p.id === id)
    setPerso(found || null)
  }, [personnages, id])

  // Realtime pour un seul perso
  useEffect(() => {
    if (IS_DEMO || !id) return
    const channel = supabase
      .channel(`perso-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'personnages',
        filter: `id=eq.${id}`
      }, (payload) => {
        setPerso(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const update = useCallback((changes) => updatePersonnage(id, changes), [id, updatePersonnage])

  return { perso, update }
}
