'use client'

import { useState, useTransition } from 'react'

interface Project {
  id: string
  name: string
  url: string
  api_key: string
  last_ping: string | null
  created_at: string
}

interface ProjectsListProps {
  projects: Project[]
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>
}

export default function ProjectsList({ projects, deleteProject }: ProjectsListProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(projectId: string) {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) {
      return
    }

    setDeletingId(projectId)

    startTransition(async () => {
      await deleteProject(projectId)
      setDeletingId(null)
    })
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Nunca'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay proyectos agregados aún.</p>
        <p className="text-sm mt-2">Agrega tu primer proyecto usando el formulario de arriba.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">URL</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Último Ping</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900">{project.name}</td>
              <td className="py-3 px-4">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                >
                  {project.url}
                </a>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {formatDate(project.last_ping)}
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={isPending && deletingId === project.id}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {isPending && deletingId === project.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
