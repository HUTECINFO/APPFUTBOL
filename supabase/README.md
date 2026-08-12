# Migraciones de Supabase

Estas migraciones son PostgreSQL estándar y sustituyen al historial de Prisma.
Se aplican en este orden:

1. `20260703003204_init.sql`
2. `20260722002922_add_sede_google_maps_url.sql`
3. `20260722003707_registro_membresias.sql`
4. `20260722004816_compliance_auditoria_expediente.sql`
5. `20260722010000_enable_rls.sql`

Desde el dashboard de Supabase, abre **SQL Editor**, pega el contenido de cada
archivo en ese orden y ejecuta la consulta. El último archivo habilita RLS sin
políticas públicas; las rutas de servidor usan la clave secreta para aplicar
la autorización de la aplicación antes de acceder a los datos.

Las claves API de Supabase no sirven para ejecutar DDL. Para automatizar este
paso fuera del SQL Editor se requiere el connection string PostgreSQL o un
token personal de Supabase con acceso de administración.
