'use client'

import { useState, useTransition } from 'react'
import { login, signup } from './auth/actions'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage(null)

        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = isLogin ? await login(formData) : await signup(formData)

            if (result?.error) {
                setMessage({ type: 'error', text: result.error })
            }
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                        <svg
                            className="w-12 h-12 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Supabase Keep-Alive
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="tu@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            disabled={isPending}
                            minLength={6}
                        />
                        {!isLogin && (
                            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                        )}
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm ${message.type === 'success'
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                        {isPending ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center">
                    <p>
                        Para crear una cuenta, hazlo desde el panel de Supabase y luego vuelve aquí.
                    </p>

                </div>

                {/* Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Sistema de gestión de Keep-Alive para proyectos Supabase
                    </p>
                </div>
            </div>
        </div>
    )
}
