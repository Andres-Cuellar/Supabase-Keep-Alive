'use client'

import { useState, useTransition } from 'react'

interface KeepAliveButtonProps {
  triggerKeepAlive: () => Promise<{ success: boolean; error?: string; data?: any }>
}

export default function KeepAliveButton({ triggerKeepAlive }: KeepAliveButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleClick() {
    setMessage(null)

    startTransition(async () => {
      const result = await triggerKeepAlive()

      if (result.success) {
        const summary = result.data?.summary
        setMessage({ 
          type: 'success', 
          text: `✓ Keep-alive ejecutado: ${summary?.success || 0} exitosos, ${summary?.errors || 0} errores` 
        })
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error desconocido' })
      }
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {isPending ? 'Ejecutando...' : '🚀 Ejecutar Keep-Alive Ahora'}
      </button>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Esto ejecutará el keep-alive manualmente para probar
      </p>
    </div>
  )
}
