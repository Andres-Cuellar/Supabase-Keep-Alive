'use client'

import { useTransition } from 'react'
import { logout } from '../auth/actions'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    >
      {isPending ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  )
}
