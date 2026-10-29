# src/lib/supabase.ts

<!-- 8 bloques · 29 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 6

> Ancla: `const url = process.env.EXPO_PUBLIC_SUPABASE_URL;`

```
// ============================================================================
//  VARIABLES DE ENTORNO
//  Vienen de `.env` (expo las inyecta con el prefijo EXPO_PUBLIC_).
//  Si el archivo no existe, estas dos valen undefined y la app NO crashea:
//  se muestra la pantalla SetupRequired.
// ============================================================================
```

## Línea 16

> Ancla: `export const isConfigured: boolean =`

```
/**
 * ¿Tenemos un proyecto de Supabase real?
 * - la URL tiene que ser https://...supabase.co
 * - la anon key siempre empieza con "eyJ" (es un JWT en base64)
 */
```

## Línea 29

> Ancla: `let cliente: SupabaseClient<Database> | null = null;`

```
/**
 * Cliente de Supabase.
 *
 * IMPORTANTE: se crea de forma perezosa. Si las keys no están puestas,
 * `createClient` lanza una excepción y la app se cae en pantalla blanca.
 * Por eso acá solo se construye cuando `isConfigured` es true.
 */
```

## Línea 43

> Ancla: `persistSession: true,`

```
// dejar la sesión en el dispositivo: el usuario no tiene que
      // iniciar sesión cada vez que abre la app. Sin `storage`,
      // supabase-js en React Native usa memoria y la sesión se pierde
      // cada vez que se cierra la app (o recarga Metro en desarrollo).
```

## Línea 60

> Ancla: `export function getSupabase(): SupabaseClient<Database> {`

```
/**
 * Acceso al cliente. Lanza un error claro si faltan las keys,
 * en vez del error críptico de supabase-js.
 */
```

## Línea 75

> Ancla: `export const supabase: SupabaseClient<Database> | null = isConfigured`

```
/** Cliente o null, para los hooks que quieren manejar el caso "sin config". */
```

## Línea 80

> Ancla: `export const BUCKETS = {`

```
/** Buckets de Storage del proyecto. */
```

## Línea 84

> Ancla: `verificacion: 'verificacion',`

```
/** Privado: fotos de verificación de la tienda. Solo dueño + admin. */
```
