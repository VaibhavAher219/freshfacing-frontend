import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from '@/collections/Users'
import { Tenants } from '@/collections/Tenants'
import { SiteContent } from '@/collections/SiteContent'
import { Media } from '@/collections/Media'
import { Leads } from '@/collections/Leads'
import { Upsells } from '@/collections/Upsells'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Use PostgreSQL in production (Neon/Vercel), SQLite for local dev
const usePostgres = !!process.env.POSTGRES_URL

const dbAdapter = usePostgres
  ? postgresAdapter({
      pool: { connectionString: process.env.POSTGRES_URL },
      push: true, // Auto-create/sync tables — no migration files needed
    })
  : sqliteAdapter({ client: { url: process.env.DATABASE_URL || `file:${path.resolve(dirname, 'freshfacing.db')}` } })

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: ' | FreshFacing Admin',
    },
    components: {
      graphics: {
        Logo: '/src/components/admin/Logo',
        Icon: '/src/components/admin/Icon',
      },
      beforeLogin: ['/src/components/admin/BeforeLogin'],
      beforeDashboard: ['/src/components/admin/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Tenants, SiteContent, Media, Leads, Upsells],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME-IN-PRODUCTION-super-secret-key-12345',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: dbAdapter,
  sharp,
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
})
