# src/app/chat/[pedidoId].tsx

<!-- 5 bloques · 15 líneas · original del commit 1310672 -->

5 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 42

> Ancla: `export default function PantallaChat() {`

```
/**
 * ============================================================================
 *  Chat del pedido (anti-elusión).
 *
 *  Comprador y tienda se escriben acá, sin teléfono ni correo. El hilo se
 *  actualiza solo (Realtime) y se marcan como leídos los mensajes al abrirlo.
 *
 *  Google Play (contenido de usuarios): desde el menú de arriba se puede
 *  REPORTAR a la contraparte y BLOQUEARLA (deja de ver sus mensajes).
 * ============================================================================
 */
```

## Línea 73

> Ancla: `useEffect(() => {`

```
// Al abrir: quién es la contraparte y si ya la tengo bloqueada.
```

## Línea 92

> Ancla: `const visibles =`

```
// Al bloquear, ocultamos de una los mensajes de esa persona (además de la RLS).
```

## Línea 381

> Ancla: `burbujaMia: { backgroundColor: colors.primaryLight, borderBottomRightRadius: 4 },`

```
// Mis mensajes: fondo verde claro y texto negro (contraste 6.7:1).
```

## Línea 383

> Ancla: `burbujaOtra: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },`

```
// Los de la tienda: fondo elevado y texto claro (contraste 14:1).
```
