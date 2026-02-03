# Schema SQL

Este archivo contiene la estructura de la tabla `projects` necesaria para el funcionamiento del sistema de Keep-Alive.

## Instrucciones de instalación

1. Abre tu proyecto de Supabase (la base de datos de control)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `schema.sql`
4. Ejecuta la consulta

## Estructura de la tabla

- **id**: UUID único generado automáticamente
- **name**: Nombre descriptivo del proyecto
- **url**: URL completa del proyecto Supabase
- **api_key**: API Key anónima (pública)
- **last_ping**: Timestamp de la última ejecución del keep-alive
- **created_at**: Fecha de creación del registro
- **updated_at**: Fecha de última actualización (se actualiza automáticamente)
