# 🚀 Supabase Keep-Alive Manager

Sistema automatizado de Keep-Alive para múltiples instancias de Supabase, optimizado para Vercel con Edge Runtime y **protegido con autenticación**.

> **⚠️ ACTUALIZACIÓN IMPORTANTE (Enero 2026):** Este proyecto usa las **nuevas API Keys de Supabase** (`PUBLISHABLE_KEY` en lugar de `ANON_KEY`). Si estás migrando desde una versión anterior, consulta [docs/API_KEYS_MIGRATION.md](docs/API_KEYS_MIGRATION.md).

## 📋 Características

- ✅ **Autenticación con Supabase Auth** - Login seguro para acceder al dashboard
- ✅ **Edge Runtime** para máxima velocidad y mínimo costo
- ✅ **Múltiples instancias** de Supabase en un solo lugar
- ✅ **Cron automático** ejecutado por Vercel cada 3 días
- ✅ **Seguridad** con validación de CRON_SECRET
- ✅ **Dashboard protegido** para gestionar proyectos
- ✅ **Server Actions** para CRUD de proyectos
- ✅ **Ejecución manual** para testing

## 🏗️ Arquitectura

```
┌─────────────────┐
│  Vercel Cron    │ Ejecuta cada 3 días
└────────┬────────┘
         │
         v
┌─────────────────┐
│  API Route      │ /api/cron/keep-alive
│  (Edge Runtime) │ Valida CRON_SECRET
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Base Control   │ Lee tabla "projects"
│  (Supabase)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Keep-Alive     │ Ping a cada proyecto
│  Loop           │ Actualiza last_ping
└─────────────────┘
```

## 📦 Instalación

### 1. Clonar y instalar dependencias

```bash
git clone <tu-repo>
cd SupabaseManager
npm install
```

### 2. Configurar Base de Datos de Control

1. Crea un proyecto en Supabase (o usa uno existente)
2. Abre el **SQL Editor**
3. Ejecuta el script en `database/schema.sql`
4. Esto creará la tabla `projects`

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Base de datos de control (donde está la tabla "projects")
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...

# Genera una clave secreta fuerte
CRON_SECRET=tu-secreto-super-seguro-aqui

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Para generar `CRON_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Crear Usuario Administrador

**Opción A: Desde la aplicación**
1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000`
3. Click en "¿No tienes cuenta? Regístrate"
4. Crea tu cuenta de administrador

**Opción B: Desde Supabase Dashboard**
1. Ve a **Authentication** → **Users** en tu proyecto Supabase
2. Click en **Add user** → **Create new user**
3. Ingresa email y contraseña
4. Click en **Create user**

📖 **Más información:** Ver [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) para detalles completos sobre autenticación.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión

## 🚀 Despliegue en Vercel

### 1. Conectar con Vercel

```bash
npm i -g vercel
vercel
```

### 2. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL` (tu URL de producción)

### 3. Configurar Cron Job

El archivo `vercel.json` ya está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 0 */3 * *"
    }
  ]
}
```

**Schedule**: `0 0 */3 * *` = Cada 3 días a las 00:00 UTC

Vercel automáticamente incluirá el header `Authorization: Bearer ${CRON_SECRET}` en cada ejecución.

### 4. Desplegar

```bash
vercel --prod
```

## 📱 Uso

### Iniciar Sesión

1. Ve a tu aplicación (local o producción)
2. Ingresa tu email y contraseña
3. Serás redirigido al dashboard en `/app`

### Agregar Proyectos

1. En el dashboard (`/app`)
2. Completa el formulario:
   - **Nombre**: Nombre descriptivo del proyecto
   - **URL**: `https://xxxxx.supabase.co`
   - **API Key**: Clave anónima (pública) del proyecto

3. Click en "Agregar Proyecto"

### Ver Proyectos

La tabla muestra:
- Nombre del proyecto
- URL (clickeable)
- Último ping ejecutado
- Botón para eliminar

### Ejecutar Manualmente

Click en "🚀 Ejecutar Keep-Alive Ahora" para probar el sistema sin esperar al cron.

## 🔒 Seguridad

### Validación de CRON_SECRET

El endpoint `/api/cron/keep-alive` valida el header:

```
Authorization: Bearer ${CRON_SECRET}
```

Si no coincide, retorna `401 Unauthorized`.

### API Keys

- Solo se almacenan las API Keys **anónimas (públicas)** de los proyectos
- No se almacenan service keys ni secrets
- Las keys se usan solo para hacer operaciones de lectura ligeras

## 🛠️ Estructura del Proyecto

```
SupabaseManager/
├── app/
│   ├── actions.ts              # Server Actions para CRUD (protegidas)
│   ├── page.tsx                # Página de login
│   ├── layout.tsx              # Layout raíz
│   ├── globals.css             # Estilos globales
│   ├── app/
│   │   └── page.tsx            # Dashboard (requiere auth)
│   ├── auth/
│   │   └── actions.ts          # Actions de login/logout
│   ├── api/
│   │   └── cron/
│   │       └── keep-alive/
│   │           └── route.ts    # API Route con Edge Runtime
│   └── components/
│       ├── AddProjectForm.tsx
│       ├── ProjectsList.tsx
│       ├── KeepAliveButton.tsx
│       └── LogoutButton.tsx
├── lib/
│   └── supabase/
│       ├── client.ts           # Cliente para componentes
│       └── server.ts           # Cliente para server
├── database/
│   ├── schema.sql              # Script SQL para tabla projects
│   └── README.md
├── docs/
│   └── AUTHENTICATION.md       # Guía completa de autenticación
├── middleware.ts               # Protección de rutas
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── vercel.json                 # Configuración de Cron
└── .env.example
```

## ⚙️ Cómo Funciona el Keep-Alive

1. **Vercel Cron** ejecuta el endpoint cada 3 días
2. El endpoint valida `CRON_SECRET`
3. Consulta todos los proyectos de la tabla `projects`
4. Por cada proyecto:
   - Crea un cliente temporal de Supabase
   - Ejecuta una operación ligera (count sin datos)
   - Actualiza el campo `last_ping` en la BD de control
5. Retorna un resumen con éxitos y errores

## 🧪 Testing

### Probar el endpoint manualmente

```bash
curl -X GET https://tu-app.vercel.app/api/cron/keep-alive \
  -H "Authorization: Bearer tu-cron-secret"
```

Respuesta exitosa:

```json
{
  "message": "Keep-alive completed",
  "summary": {
    "total": 3,
    "success": 3,
    "errors": 0
  },
  "results": [...],
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

## 📊 Monitoreo

### Ver logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en la pestaña "Logs"
3. Filtra por "Cron" para ver ejecuciones automáticas

### Verificar ejecuciones

Revisa la columna "Último Ping" en la tabla de proyectos para confirmar que se están ejecutando correctamente.

### Ver usuarios autenticados

1. Ve a **Authentication** → **Users** en Supabase
2. Verás todos los usuarios con acceso al sistema
3. Puedes gestionar usuarios desde aquí

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad:

1. **Autenticación con Supabase Auth** - Solo usuarios autenticados pueden acceder
2. **Middleware de protección** - Rutas protegidas automáticamente
3. **Server Actions protegidas** - Todas las operaciones verifican autenticación
4. **CRON_SECRET** - Endpoint de keep-alive protegido con token
5. **Cookies HTTP-only** - Sesiones seguras

📖 **Guía completa:** Ver [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) para más detalles.

## 🔧 Personalización

### Cambiar frecuencia del Cron

Edita `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 0 */1 * *"  // Cada día
    }
  ]
}
```

Formatos comunes:
- `0 0 */1 * *` - Cada día
- `0 0 */7 * *` - Cada 7 días
- `0 */6 * * *` - Cada 6 horas

### Cambiar operación de Keep-Alive

Edita [app/api/cron/keep-alive/route.ts](app/api/cron/keep-alive/route.ts) línea ~90:

```typescript
// Operación actual
const { error } = await projectClient
  .from('projects')
  .select('*', { count: 'exact', head: true })

// Alternativas:
// 1. Ping a tabla específica
await projectClient.from('users').select('id').limit(1)

// 2. Health check
await projectClient.from('_realtime').select('*').limit(0)
```

## 🐛 Troubleshooting

### No puedo iniciar sesión

- Verifica que el usuario existe en **Authentication** → **Users** en Supabase
- Si tienes confirmación de email activada, asegúrate de haber confirmado el email
- Para desarrollo, desactiva la confirmación de email en Supabase Settings

### Error: "Missing control database configuration"

- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` estén configuradas

### Error: "Unauthorized" en el cron

- Verifica que `CRON_SECRET` sea el mismo en local y en Vercel
- Vercel automáticamente incluye este header en los cron jobs

### Redirección infinita

- Limpia las cookies del navegador
- Verifica que el middleware esté configurado correctamente
- Revisa las variables de entorno

### No se ejecuta el cron

- Verifica que `vercel.json` esté en la raíz del proyecto
- Despliega nuevamente después de cambios en `vercel.json`
- Los cron jobs solo funcionan en **producción**, no en preview deployments

### Proyecto no hace ping

- Verifica que la URL y API Key sean correctas
- Verifica que la API Key sea la **anónima (pública)**, no la service key
- Revisa los logs en Vercel para ver el error específico

📖 **Más soluciones:** Ver [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) para troubleshooting de autenticación.

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir cambios mayores.

---

Hecho con ❤️ en Colombia, por Andrés Cuéllar, para mantener Supabase siempre activo
