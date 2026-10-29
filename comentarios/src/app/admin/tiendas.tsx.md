# src/app/admin/tiendas.tsx

<!-- 8 bloques · 20 líneas · original del commit 1310672 -->

8 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 26

> Ancla: `export default function PantallaAdminTiendas() {`

```
/**
 * ============================================================================
 *  Panel de administración · Tiendas
 *
 *  Requisito de Google Play y de operación: nadie se auto-aprueba. Esta
 *  pantalla deja al admin aprobar/rechazar tiendas y marcarlas como fundadoras
 *  (RD$100/mes, 12 meses, tope 25) SIN entrar al SQL Editor de Supabase.
 *
 *  Solo para el rol `admin`. Las RPC `admin_*` validan `es_admin()` en la base,
 *  así que un no-admin no puede hacer nada aunque llegue a esta pantalla.
 * ============================================================================
 */
```

## Línea 52

> Ancla: `const [verificaciones, setVerificaciones] = useState<Record<string, VerificacionAdmin>>({});`

```
// Verificación con fotos: el estado se guarda por tienda y las URLs firmadas
  // se piden solo al abrir el diálogo (expiran, no tiene sentido cachearlas).
```

## Línea 67

> Ancla: `useEffect(() => {`

```
// Trae las verificaciones (incluye las rutas de las fotos) cuando cambia la lista.
```

## Línea 79

> Ancla: `});`

```
// Si falla, el panel sigue funcionando sin la parte de verificación.
```

## Línea 84

> Ancla: `}, [esAdmin, tiendas]);`

```
// `tiendas` cambia cada vez que se recarga el panel; sirve de disparador.
```

## Línea 132

> Ancla: `const abrirFotos = async (t: TiendaAdmin) => {`

```
/** Abre el diálogo con las fotos (pidiendo URLs firmadas temporales). */
```

## Línea 222

> Ancla: `<View style={styles.grupo}>`

```
{/* ---------------- pendientes ---------------- */}
```

## Línea 247

> Ancla: `<View style={styles.grupo}>`

```
{/* ---------------- aprobadas ---------------- */}
```
