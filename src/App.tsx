import { useState } from "react"
import { HomeBlock } from "./blocks/Home"
import { SessionBlock } from "./blocks/Session"
import { GameBlock } from "./blocks/Game"

export default function App() {
  const [showHome, setShowHome] = useState(true)
  const [showSession, setShowSession] = useState(false)
  const [showGame, setShowGame] = useState(false)

  const openHome = () => { setShowHome(true); setShowSession(false); setShowGame(false) }
  const openSession = () => { setShowHome(false); setShowSession(true); setShowGame(false) }
  const openGame = () => { setShowHome(false); setShowSession(false); setShowGame(true) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header + Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-4xl font-extrabold text-indigo-600">WebApp Planning Poker Online</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        {showHome && <HomeBlock onOpenSession={openSession} onOpenGame={openGame} />}
        {showSession && <SessionBlock onOpenGame={openGame} onOpenHome={openHome} />}
        {showGame && <GameBlock onOpenHome={openHome} />}
      </main>
    </div>
  )
}