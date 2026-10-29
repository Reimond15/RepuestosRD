# src/app/ingresar.tsx

<!-- 5 bloques · 11 líneas · original del commit 1310672 -->

5 bloques de comentarios, tal como estaban antes de quitarlos del código.
El **ancla** es la línea de código justo debajo del comentario: sirve para ubicarlo.

## Línea 13

> Ancla: `export default function PantallaIngresar() {`

```
/**
 * Ingreso (email + contraseña) y registro con datos mínimos.
 *
 * El registro le manda el rol y los datos en `options.data`; el trigger
 * `manejar_nuevo_usuario` de la base crea la fila de `usuarios` y, si el
 * rol es `tienda`, también la tienda (pendiente de aprobación).
 */
```

## Línea 27

> Ancla: `const [email, setEmail] = useState('');`

```
// campos comunes
```

## Línea 31

> Ancla: `const [nombre, setNombre] = useState('');`

```
// campos del registro
```

## Línea 83

> Ancla: `acepta_terminos: new Date().toISOString(),`

```
// Constancia del consentimiento legal dado al registrarse.
```

## Línea 96

> Ancla: `if (!data.session) {`

```
// si el proyecto exige confirmar el email, no hay sesión todavía
```
