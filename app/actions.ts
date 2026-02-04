'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface Project {
  id: string
  name: string
  url: string
  api_key: string
  last_ping: string | null
  created_at: string
  updated_at: string
}

interface AddProjectData {
  name: string
  url: string
  api_key: string
}

// Obtener cliente de Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Soportar tanto la nueva PUBLISHABLE_KEY como la legacy ANON_KEY
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Verificar autenticación
async function checkAuth() {
  const supabase = await createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return user
}

// Listar todos los proyectos
export async function getProjects(): Promise<Project[]> {
  await checkAuth()
  
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw new Error('Failed to fetch projects')
    }

    return data || []
  } catch (error) {
    console.error('Error in getProjects:', error)
    throw error
  }
}

// Agregar un nuevo proyecto
export async function addProject(formData: FormData) {
  await checkAuth()
  
  try {
    const name = formData.get('name') as string
    const url = formData.get('url') as string
    const api_key = formData.get('api_key') as string

    // Validaciones
    if (!name || !url || !api_key) {
      return { 
        success: false, 
        error: 'Todos los campos son obligatorios' 
      }
    }

    // Validar formato de URL
    try {
      new URL(url)
    } catch {
      return { 
        success: false, 
        error: 'URL inválida. Debe incluir https://' 
      }
    }

    // Validar que la URL sea de Supabase
    if (!url.includes('supabase.co')) {
      return { 
        success: false, 
        error: 'La URL debe ser de un proyecto Supabase' 
      }
    }

    const supabase = await createAuthClient()

    const { error } = await supabase
      .from('projects')
      .insert([
        {
          name: name.trim(),
          url: url.trim(),
          api_key: api_key.trim()
        }
      ])

    if (error) {
      console.error('Error adding project:', error)
      return { 
        success: false, 
        error: 'Error al agregar el proyecto: ' + error.message 
      }
    }

    revalidatePath('/app')
    return { success: true }

  } catch (error) {
    console.error('Error in addProject:', error)
    return { 
      success: false, 
      error: 'Error inesperado al agregar el proyecto' 
    }
  }
}

// Eliminar un proyecto
export async function deleteProject(projectId: string) {
  await checkAuth()
  
  try {
    if (!projectId) {
      return { 
        success: false, 
        error: 'ID de proyecto inválido' 
      }
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return { 
        success: false, 
        error: 'Error al eliminar el proyecto' 
      }
    }

    revalidatePath('/app')
    return { success: true }

  } catch (error) {
    console.error('Error in deleteProject:', error)
    return { 
      success: false, 
      error: 'Error inesperado al eliminar el proyecto' 
    }
  }
}

// Ejecutar keep-alive manualmente
export async function triggerKeepAlive() {
  await checkAuth()
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return { 
        success: false, 
        error: 'CRON_SECRET no configurado' 
      }
    }

    const response = await fetch(`${baseUrl}/api/cron/keep-alive`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || 'Error al ejecutar keep-alive' 
      }
    }

    revalidatePath('/app')
    return { 
      success: true, 
      data 
    }

  } catch (error) {
    console.error('Error in triggerKeepAlive:', error)
    return { 
      success: false, 
      error: 'Error al conectar con el endpoint de keep-alive' 
    }
  }
}
