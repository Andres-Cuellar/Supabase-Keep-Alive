'use client'

import { useState, useTransition } from 'react'

interface AddProjectFormProps {
  addProject: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export default function AddProjectForm({ addProject }: AddProjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget // Guardar referencia al formulario

    startTransition(async () => {
      const result = await addProject(formData)

      if (result.success) {
        setMessage({ type: 'success', text: '✓ Proyecto agregado correctamente' })
        form.reset() // Usar la referencia guardada
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error desconocido' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Proyecto
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Mi Proyecto Supabase"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL del Proyecto
        </label>
        <input
          type="url"
          id="url"
          name="url"
          required
          placeholder="https://xxx.supabase.co"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-1">
          Publishable Key
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Clave pública del proyecto (sb_publishable_xxx o anon key)
        </p>
        <textarea
          id="api_key"
          name="api_key"
          required
          rows={3}
          placeholder="sb_publishable_xxx... o eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
          disabled={isPending}
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {isPending ? 'Agregando...' : 'Agregar Proyecto'}
      </button>
    </form>
  )
}
