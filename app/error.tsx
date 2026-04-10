"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aqui pode-se integrar com um serviço de monitoramento (ex: Sentry)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Algo deu errado</h2>
        <p className="text-zinc-400 mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <button
          onClick={reset}
          className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
