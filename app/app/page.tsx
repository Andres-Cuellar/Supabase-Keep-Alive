import { getProjects, addProject, deleteProject, triggerKeepAlive } from '../actions'
import AddProjectForm from '../components/AddProjectForm'
import ProjectsList from '../components/ProjectsList'
import KeepAliveButton from '../components/KeepAliveButton'
import LogoutButton from '../components/LogoutButton'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const projects = await getProjects()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Supabase Keep-Alive Manager
              </h1>
              <p className="text-gray-600">
                Mantén activas tus instancias de Supabase automáticamente
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Sesión iniciada como:</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario para agregar proyectos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Agregar Proyecto
            </h2>
            <AddProjectForm addProject={addProject} />
          </div>

          {/* Información y botón de test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Información
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Keep-Alive Automático:</strong> Vercel ejecutará el keep-alive cada 3 días automáticamente.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Total de proyectos:</strong> {projects.length}
                </p>
              </div>

              <div>
                <KeepAliveButton triggerKeepAlive={triggerKeepAlive} />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Proyectos Monitoreados ({projects.length})
          </h2>
          <ProjectsList projects={projects} deleteProject={deleteProject} />
        </div>
      </div>
    </main>
  )
}
