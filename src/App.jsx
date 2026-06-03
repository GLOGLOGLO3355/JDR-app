import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Accueil from './pages/Accueil.jsx'
import Joueur from './pages/Joueur.jsx'
import MaitreLogin from './pages/MaitreLogin.jsx'
import Maitre from './pages/Maitre.jsx'

export default function App() {
  const [mjConnecte, setMjConnecte] = useState(false)

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/joueur/:id" element={<Joueur />} />
      <Route path="/maitre/login" element={<MaitreLogin onSuccess={() => setMjConnecte(true)} />} />
      <Route
        path="/maitre"
        element={mjConnecte ? <Maitre /> : <Navigate to="/maitre/login" replace />}
      />
    </Routes>
  )
}
