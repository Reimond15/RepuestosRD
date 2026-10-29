# Comentarios del código, por archivo

El código se entrega **sin comentarios adentro**. Acá quedan guardados todos,
identificados por archivo y por número de línea del original.

- Código actual: sin comentarios (`src/`, `supabase/functions/`, `sql/`).
- Comentarios: en esta carpeta, un `.md` por cada archivo de origen.
- `src/` y `supabase/functions/`: original del commit `1310672`.
- `sql/`: original de las migraciones antes de pasarlas a `sql/`.

En cada archivo, el **ancla** es la línea de código que estaba justo debajo del
comentario, para poder ubicarlo rápido.

Para devolver un comentario al código: buscá el ancla en el archivo real y pegá
el bloque arriba.

## Resumen

- Bloques de comentarios: **847**
- Líneas de comentario: **3311**
- Archivos con comentarios: **97**

## Índice

| Archivo | Bloques | Líneas |
|---|---:|---:|
| `sql/01_esquema.sql` | 15 | 37 |
| `sql/02_funciones_triggers.sql` | 21 | 61 |
| `sql/03_vistas.sql` | 8 | 43 |
| `sql/04_rls.sql` | 17 | 67 |
| `sql/05_datos_iniciales.sql` | 5 | 17 |
| `sql/06_storage.sql` | 9 | 22 |
| `sql/07_verificacion.sql` | 19 | 30 |
| `sql/08_datos_demo.sql` | 41 | 204 |
| `sql/09_seguridad.sql` | 17 | 82 |
| `sql/10_ubicaciones.sql` | 14 | 45 |
| `sql/11_panel_tienda.sql` | 2 | 31 |
| `sql/12_tipos_repuesto.sql` | 2 | 39 |
| `sql/13_resenas.sql` | 5 | 33 |
| `sql/14_panel_productos.sql` | 2 | 17 |
| `sql/15_tiendas_rls.sql` | 1 | 13 |
| `sql/16_limpiar_demo.sql` | 8 | 39 |
| `sql/17_mensajes.sql` | 10 | 60 |
| `sql/18_tiendas_privacidad.sql` | 14 | 68 |
| `sql/19_catalogo_y_suscripcion.sql` | 14 | 64 |
| `sql/20_eliminar_cuenta.sql` | 8 | 95 |
| `sql/21_reportes_y_bloqueos.sql` | 12 | 62 |
| `sql/22_precio_fundador.sql` | 4 | 37 |
| `sql/23_hardening.sql` | 6 | 90 |
| `sql/24_blindaje_total.sql` | 30 | 159 |
| `sql/25_aprobar_tiendas.sql` | 12 | 86 |
| `sql/26_panel_admin_tiendas.sql` | 6 | 52 |
| `sql/27_limpiar_tipos.sql` | 15 | 96 |
| `sql/28_fix_rls_recursion.sql` | 12 | 82 |
| `sql/29_verificacion_tiendas.sql` | 30 | 107 |
| `sql/30_eliminar_cuenta_admin.sql` | 25 | 118 |
| `sql/31_contar_tiendas.sql` | 2 | 25 |
| `src/app/_layout.tsx` | 2 | 5 |
| `src/app/(tabs)/_layout.tsx` | 8 | 25 |
| `src/app/(tabs)/buscar.tsx` | 4 | 8 |
| `src/app/(tabs)/carrito.tsx` | 1 | 1 |
| `src/app/(tabs)/cuenta.tsx` | 8 | 8 |
| `src/app/(tabs)/index.tsx` | 9 | 17 |
| `src/app/(tabs)/pedidos.tsx` | 12 | 21 |
| `src/app/admin/eliminaciones.tsx` | 3 | 19 |
| `src/app/admin/tiendas.tsx` | 8 | 20 |
| `src/app/admin/tipos.tsx` | 4 | 12 |
| `src/app/calificar/[pedidoId].tsx` | 2 | 9 |
| `src/app/chat/[pedidoId].tsx` | 5 | 15 |
| `src/app/checkout.tsx` | 14 | 28 |
| `src/app/eliminar-cuenta.tsx` | 3 | 15 |
| `src/app/ingresar.tsx` | 5 | 11 |
| `src/app/legal/eliminar-cuenta.tsx` | 1 | 11 |
| `src/app/legal/index.tsx` | 1 | 1 |
| `src/app/mi-producto/[id].tsx` | 17 | 22 |
| `src/app/mis-productos.tsx` | 2 | 8 |
| `src/app/producto/[id].tsx` | 7 | 9 |
| `src/app/verificar-tienda.tsx` | 7 | 15 |
| `src/components/AppLogo.tsx` | 3 | 11 |
| `src/components/AvisoDatos.tsx` | 3 | 10 |
| `src/components/BannerSuscripcion.tsx` | 2 | 5 |
| `src/components/BarraProgresoPedido.tsx` | 2 | 8 |
| `src/components/ChecklistCategorias.tsx` | 2 | 8 |
| `src/components/ConsentimientoLegal.tsx` | 2 | 13 |
| `src/components/EmptyState.tsx` | 1 | 1 |
| `src/components/ErrorBoundary.tsx` | 2 | 15 |
| `src/components/LegalDoc.tsx` | 3 | 11 |
| `src/components/ProductCard.tsx` | 15 | 23 |
| `src/components/ReportarModal.tsx` | 3 | 11 |
| `src/components/SectionProductos.tsx` | 1 | 10 |
| `src/components/SelectorEstrellas.tsx` | 4 | 7 |
| `src/components/SetupRequired.tsx` | 1 | 10 |
| `src/components/Stars.tsx` | 4 | 8 |
| `src/components/WebShell.tsx` | 3 | 17 |
| `src/data/mock.ts` | 4 | 29 |
| `src/hooks/useCampoEnfocado.ts` | 3 | 19 |
| `src/hooks/useCatalogo.ts` | 10 | 50 |
| `src/hooks/useEliminacionesAdmin.ts` | 1 | 8 |
| `src/hooks/useMensajes.ts` | 6 | 17 |
| `src/hooks/useMisProductos.ts` | 1 | 6 |
| `src/hooks/usePedidos.ts` | 2 | 9 |
| `src/hooks/usePedidosTienda.ts` | 1 | 8 |
| `src/hooks/useResenas.ts` | 1 | 7 |
| `src/hooks/useResponsive.ts` | 10 | 16 |
| `src/hooks/useSesion.tsx` | 4 | 13 |
| `src/hooks/useSuscripcion.ts` | 1 | 7 |
| `src/hooks/useTiendasAdmin.ts` | 3 | 10 |
| `src/hooks/useTiendasCount.ts` | 3 | 12 |
| `src/hooks/useTipos.ts` | 1 | 7 |
| `src/hooks/useVerificacionTienda.ts` | 4 | 11 |
| `src/lib/constants.ts` | 21 | 50 |
| `src/lib/format.ts` | 12 | 20 |
| `src/lib/geo.ts` | 10 | 27 |
| `src/lib/legal.ts` | 18 | 47 |
| `src/lib/queries.ts` | 68 | 226 |
| `src/lib/supabase.ts` | 8 | 29 |
| `src/store/carrito.ts` | 6 | 10 |
| `src/store/ubicacion.ts` | 5 | 13 |
| `src/theme/colors.ts` | 19 | 52 |
| `src/theme/index.ts` | 1 | 4 |
| `src/types/database.generated.ts` | 1 | 12 |
| `src/types/database.ts` | 50 | 99 |
| `supabase/functions/eliminar-cuenta/index.ts` | 13 | 64 |
