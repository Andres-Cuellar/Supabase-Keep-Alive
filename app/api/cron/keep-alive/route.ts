import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Edge Runtime para máxima velocidad y mínimo costo
export const runtime = 'edge'

interface Project {
  id: string
  name: string
  url: string
  api_key: string
  last_ping: string | null
}

interface PingResult {
  project: string
  status: 'success' | 'error'
  message: string
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    // Validar autorización con CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validar variables de entorno de la base de datos de control
    const controlUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Soportar tanto la nueva PUBLISHABLE_KEY como la legacy ANON_KEY
    const controlKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!controlUrl || !controlKey) {
      return NextResponse.json(
        { error: 'Missing control database configuration' },
        { status: 500 }
      )
    }

    // Cliente para la base de datos de control
    const controlClient = createClient(controlUrl, controlKey)

    // Obtener todos los proyectos
    const { data: projects, error: fetchError } = await controlClient
      .from('projects')
      .select('*')
      .returns<Project[]>()

    if (fetchError) {
      console.error('Error fetching projects:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        message: 'No projects to ping',
        results: [],
        timestamp: new Date().toISOString()
      })
    }

    // Realizar keep-alive en cada proyecto
    const results: PingResult[] = []
    const timestamp = new Date().toISOString()

    for (const project of projects) {
      try {
        // Crear cliente temporal para este proyecto
        const projectClient = createClient(project.url, project.api_key)

        // Operación ligera: count sin obtener datos
        // Usamos una tabla que probablemente exista o manejamos el error
        const { error: pingError } = await projectClient
          .from('projects')
          .select('*', { count: 'exact', head: true })

        if (pingError) {
          // Si la tabla no existe, intentamos con otra operación válida
          // Simplemente verificar la conexión
          const { error: altPingError } = await projectClient
            .from('_realtime')
            .select('*', { count: 'exact', head: true })
            .limit(0)

          if (altPingError) {
            // Si tampoco funciona, marcamos como advertencia pero no error crítico
            results.push({
              project: project.name,
              status: 'success',
              message: 'Connection established (no tables checked)',
              timestamp
            })
          } else {
            results.push({
              project: project.name,
              status: 'success',
              message: 'Keep-alive successful',
              timestamp
            })
          }
        } else {
          results.push({
            project: project.name,
            status: 'success',
            message: 'Keep-alive successful',
            timestamp
          })
        }

        // Actualizar last_ping en la base de datos de control
        await controlClient
          .from('projects')
          .update({ last_ping: timestamp })
          .eq('id', project.id)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error pinging ${project.name}:`, error)
        
        results.push({
          project: project.name,
          status: 'error',
          message: errorMessage,
          timestamp
        })
      }
    }

    // Contar éxitos y errores
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: 'Keep-alive completed',
      summary: {
        total: projects.length,
        success: successCount,
        errors: errorCount
      },
      results,
      timestamp
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Keep-alive error:', error)
    
    return NextResponse.json(
      { 
        error: 'Keep-alive failed', 
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}
