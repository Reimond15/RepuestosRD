# src/hooks/useSesion.tsx

<!-- 4 bloques · 13 líneas · original del commit 1310672 -->

4 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 13

> Ancla: `export function ProveedorSesion({ children }: { children: ReactNode }) {`

```
/**
 * Sesión del usuario + su fila en `usuarios`.
 *
 * El trigger de la base crea la fila de `usuarios` en el mismo instante del
 * registro, así que acá solo hay que leerla. Si por alguna razón no existe
 * todavía (registro a medias, email sin confirmar), devolvemos null.
 *
 * En la Etapa 2 se le agrega el login con email y contraseña.
 */
```

## Línea 26

> Ancla: `const [cargando, setCargando] = useState(supabase !== null);`

```
// Sin Supabase configurado no hay nada que esperar: arrancamos ya "cargado"
  // y la sesión queda cerrada. Evita un setState sincrónico dentro del efecto.
```

## Línea 46

> Ancla: `if (fila?.rol === 'tienda') {`

```
// si es tienda, cargamos su ficha (para ver si está aprobada)
```

## Línea 72

> Ancla: `const { data: listener } = supabase.auth.onAuthStateChange((_evento, sesion: Session | null) => {`

```
// reacciona a login y logout
```
