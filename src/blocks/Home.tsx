import { useState, type JSX } from "react"
import { useSession } from "../context/SessionContext"
import { findParticipantByName, createParticipant } from "../services/participants"
import { joinSession } from "../services/sessions"

/**
 * Bloc Home : Login puis Créer/Rejoindre session
 */
export function HomeBlock({ onOpenSession, onOpenGame }: { onOpenSession: () => void; onOpenGame: () => void }): JSX.Element {
  const [pseudo, setPseudo] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [sessionCode, setSessionCode] = useState("")
  const [joinError, setJoinError] = useState<string | null>(null)

  const { setCurrentSession, setCurrentParticipant, currentParticipant } = useSession()

  // Valider le pseudo (chercher ou créer dans Supabase)
  const handleLogin = async () => {
    if (!pseudo.trim()) return
    let participant = await findParticipantByName(pseudo.trim())
    if (!participant) {
      participant = await createParticipant(pseudo.trim())
    }
    if (!participant) return
    setCurrentParticipant(participant)
    setLoggedIn(true)
  }

  // Rejoindre une session
  const handleJoin = async () => {
    setJoinError(null)
    if (!sessionCode.trim()) {
      setJoinError("Code de session requis.")
      return
    }
    const result = await joinSession(sessionCode.trim(), pseudo.trim(), setCurrentSession, setCurrentParticipant)
    if (!result.success) {
      setJoinError(result.error ?? "Impossible de rejoindre la session.")
      return
    }
    onOpenGame()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 w-auto">
      {!loggedIn ? (
        // Étape 1 : Login
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">Connexion</h2>
          <input
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            type="text"
            placeholder="Votre pseudo..."
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button onClick={handleLogin} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Valider</button>
        </div>
      ) : (
        // Étape 2 : Créer ou Rejoindre
        <div className="flex flex-col gap-6">
          <p className="text-lg text-gray-700">Bonjour <span className="font-bold text-indigo-600">{currentParticipant?.name ?? pseudo}</span> !</p>

          {/* Créer session */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Créer une session</label>
            <button onClick={onOpenSession} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">Créer une session</button>
          </div>

          {/* Rejoindre session */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Rejoindre une session</label>
            <div className="flex gap-2">
              <input
                value={sessionCode}
                onChange={e => {
                  setSessionCode(e.target.value)
                  if (joinError) setJoinError(null)
                }}
                type="text"
                placeholder="Code de session..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button onClick={handleJoin} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Rejoindre</button>
            </div>
            {joinError && (
              <p className="text-sm text-red-600">{joinError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
