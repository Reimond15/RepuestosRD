# src/store/ubicacion.ts

<!-- 5 bloques · 13 líneas · original del commit 1310672 -->

5 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 6

> Ancla: `export type EstadoUbicacion = 'sin-permiso' | 'preguntando' | 'listo' | 'denegado' | 'indisponible';`

```
/**
 * Estado del permiso de ubicación.
 *  · sin-permiso → todavía no se preguntó (default, no molesta al abrir)
 *  · preguntando → pedido en curso
 *  · listo       → hay posición
 *  · denegado    → el usuario dijo que no
 *  · indisponible→ error técnico (web sin https, sensor apagado, etc.)
 */
```

## Línea 20

> Ancla: `zona: string | null;`

```
/** Nombre legible de la zona ("Santo Domingo Este"), si se pudo resolver. */
```

## Línea 24

> Ancla: `localizar: () => Promise<boolean>;`

```
/** Pide el permiso y guarda la posición. Devuelve true si quedó lista. */
```

## Línea 42

> Ancla: `if (typeof Location?.requestForegroundPermissionsAsync !== 'function') {`

```
// El módulo nativo puede no estar en el binario (build viejo, Expo Go, web).
      // Importar/usar expo-location es opcional: si no está, no rompemos nada.
```

## Línea 66

> Ancla: `void Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })`

```
// el nombre de la zona es un extra: no bloquea ni rompe si falla
```
