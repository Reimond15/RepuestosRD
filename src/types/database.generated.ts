/**
 * ============================================================================
 *  Tipos de la base de datos, en el formato que genera Supabase.
 *
 *  En la Etapa 2 se reemplaza ESTE ARCHIVO por el generado desde tu proyecto:
 *
 *    npx supabase gen types typescript --project-id <TU_ID> > src/types/database.generated.ts
 *
 *  Si lo regenerás, borrá el aviso de arriba y quedate solo con la salida.
 *  La estructura de la base sale de los 7 archivos SQL de `Desktop\repuesto`.
 * ============================================================================
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          telefono: string | null;
          email: string;
          rol: 'cliente' | 'tienda' | 'admin';
          creado_en: string;
        };
        Insert: {
          id: string;
          nombre: string;
          telefono?: string | null;
          email: string;
          rol?: 'cliente' | 'tienda' | 'admin';
          creado_en?: string;
        };
        Update: {
          nombre?: string;
          telefono?: string | null;
          email?: string;
          rol?: 'cliente' | 'tienda' | 'admin';
        };
        Relationships: [];
      };

      tiendas: {
        Row: {
          id: string;
          dueno_id: string;
          nombre: string;
          direccion: string | null;
          logo_url: string | null;
          ofrece_delivery: boolean;
          costo_delivery: number;
          zonas: string[];
          aprobada: boolean;
          verificada: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          dueno_id: string;
          nombre: string;
          direccion?: string | null;
          logo_url?: string | null;
          ofrece_delivery?: boolean;
          costo_delivery?: number;
          zonas?: string[];
          aprobada?: boolean;
          verificada?: boolean;
          created_at?: string;
        };
        Update: {
          nombre?: string;
          direccion?: string | null;
          logo_url?: string | null;
          ofrece_delivery?: boolean;
          costo_delivery?: number;
          zonas?: string[];
          aprobada?: boolean;
          verificada?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'tiendas_dueno_id_fkey';
            columns: ['dueno_id'];
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };

      tiendas_verificacion: {
        Row: {
          tienda_id: string;
          foto_fachada: string | null;
          foto_interior: string | null;
          estado: string;
          nota_rechazo: string | null;
          enviada_en: string | null;
          verificada_en: string | null;
          actualizado_en: string;
        };
        Insert: {
          tienda_id: string;
          foto_fachada?: string | null;
          foto_interior?: string | null;
          estado?: string;
          nota_rechazo?: string | null;
          enviada_en?: string | null;
          verificada_en?: string | null;
          actualizado_en?: string;
        };
        Update: {
          foto_fachada?: string | null;
          foto_interior?: string | null;
          estado?: string;
          nota_rechazo?: string | null;
          enviada_en?: string | null;
          verificada_en?: string | null;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tiendas_verificacion_tienda_id_fkey';
            columns: ['tienda_id'];
            referencedRelation: 'tiendas';
            referencedColumns: ['id'];
          },
        ];
      };

      categorias: {
        Row: { id: string; nombre: string; slug: string; created_at: string };
        Insert: { id?: string; nombre: string; slug: string; created_at?: string };
        Update: { nombre?: string; slug?: string };
        Relationships: [];
      };

      tipos_repuesto: {
        Row: { id: string; categoria_id: string; nombre: string; created_at: string };
        Insert: { id?: string; categoria_id: string; nombre: string; created_at?: string };
        Update: { nombre?: string };
        Relationships: [
          {
            foreignKeyName: 'tipos_repuesto_categoria_id_fkey';
            columns: ['categoria_id'];
            referencedRelation: 'categorias';
            referencedColumns: ['id'];
          },
        ];
      };

      productos: {
        Row: {
          id: string;
          tienda_id: string;
          categoria_id: string;
          tipo_id: string;
          nombre: string;
          descripcion: string | null;
          precio: number;
          stock: number;
          imagenes: string[];
          condicion: 'nuevo' | 'usado' | 'original' | 'generico';
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tienda_id: string;
          categoria_id: string;
          tipo_id: string;
          nombre: string;
          descripcion?: string | null;
          precio: number;
          stock?: number;
          imagenes?: string[];
          condicion?: 'nuevo' | 'usado' | 'original' | 'generico';
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tienda_id?: string;
          categoria_id?: string;
          tipo_id?: string;
          nombre?: string;
          descripcion?: string | null;
          precio?: number;
          stock?: number;
          imagenes?: string[];
          condicion?: 'nuevo' | 'usado' | 'original' | 'generico';
          activo?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'productos_tienda_id_fkey';
            columns: ['tienda_id'];
            referencedRelation: 'tiendas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'productos_categoria_id_fkey';
            columns: ['categoria_id'];
            referencedRelation: 'categorias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'productos_tipo_id_fkey';
            columns: ['tipo_id'];
            referencedRelation: 'tipos_repuesto';
            referencedColumns: ['id'];
          },
        ];
      };

      compatibilidad: {
        Row: {
          id: string;
          producto_id: string;
          marca: string;
          modelo: string;
          anio_desde: number;
          anio_hasta: number;
        };
        Insert: {
          id?: string;
          producto_id: string;
          marca: string;
          modelo: string;
          anio_desde: number;
          anio_hasta: number;
        };
        Update: { marca?: string; modelo?: string; anio_desde?: number; anio_hasta?: number };
        Relationships: [
          {
            foreignKeyName: 'compatibilidad_producto_id_fkey';
            columns: ['producto_id'];
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };

      pedidos: {
        Row: {
          id: string;
          cliente_id: string;
          tienda_id: string;
          entrega: 'delivery' | 'retiro';
          direccion: string | null;
          forma_pago: 'efectivo' | 'transferencia' | 'tarjeta';
          estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
          total: number;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          tienda_id: string;
          entrega?: 'delivery' | 'retiro';
          direccion?: string | null;
          forma_pago?: 'efectivo' | 'transferencia' | 'tarjeta';
          estado?: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
          total?: number;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          entrega?: 'delivery' | 'retiro';
          direccion?: string | null;
          forma_pago?: 'efectivo' | 'transferencia' | 'tarjeta';
          estado?: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
          total?: number;
          notas?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pedidos_cliente_id_fkey';
            columns: ['cliente_id'];
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pedidos_tienda_id_fkey';
            columns: ['tienda_id'];
            referencedRelation: 'tiendas';
            referencedColumns: ['id'];
          },
        ];
      };

      detalle_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario?: number;
        };
        Update: { cantidad?: number; precio_unitario?: number };
        Relationships: [
          {
            foreignKeyName: 'detalle_pedido_pedido_id_fkey';
            columns: ['pedido_id'];
            referencedRelation: 'pedidos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'detalle_pedido_producto_id_fkey';
            columns: ['producto_id'];
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };

      calificaciones: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          cliente_id: string;
          estrellas: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id: string;
          cliente_id: string;
          estrellas: number;
          comentario?: string | null;
          created_at?: string;
        };
        Update: { estrellas?: number; comentario?: string | null };
        Relationships: [
          {
            foreignKeyName: 'calificaciones_cliente_es_del_pedido_fkey';
            columns: ['pedido_id', 'cliente_id'];
            referencedRelation: 'pedidos';
            referencedColumns: ['id', 'cliente_id'];
          },
          {
            foreignKeyName: 'calificaciones_producto_id_fkey';
            columns: ['producto_id'];
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: {
      vista_calificaciones_producto: {
        Row: {
          producto_id: string;
          total_calificaciones: number;
          promedio_estrellas: number;
          estrellas_5: number;
          estrellas_4: number;
          estrellas_3: number;
          estrellas_2: number;
          estrellas_1: number;
        };
      };
      vista_calificaciones_tienda: {
        Row: {
          tienda_id: string;
          tienda: string;
          total_calificaciones: number;
          promedio_estrellas: number | null;
        };
      };
      productos_mas_vendidos: {
        Row: {
          producto_id: string;
          producto: string;
          tienda_id: string;
          tienda: string;
          tienda_verificada: boolean;
          categoria_id: string;
          categoria_nombre: string;
          precio_actual: number;
          stock: number;
          unidades_vendidas: number;
          pedidos: number;
          total_calificaciones: number;
          promedio_estrellas: number | null;
        };
      };
      productos_mejor_calificados: {
        Row: {
          producto_id: string;
          producto: string;
          tienda_id: string;
          tienda: string;
          tienda_verificada: boolean;
          categoria_id: string;
          categoria_nombre: string;
          precio_actual: number;
          total_calificaciones: number;
          promedio_estrellas: number;
          unidades_vendidas: number;
        };
      };
      catalogo_productos: {
        Row: {
          producto_id: string;
          nombre: string;
          descripcion: string | null;
          precio: number;
          stock: number;
          imagenes: string[];
          condicion: 'nuevo' | 'usado' | 'original' | 'generico';
          categoria: string;
          categoria_slug: string;
          tipo: string;
          tienda_id: string;
          tienda: string;
          tienda_logo: string | null;
          tienda_verificada: boolean;
          ofrece_delivery: boolean;
          costo_delivery: number;
          zonas: string[];
          created_at: string;
          total_calificaciones: number | null;
          promedio_estrellas: number | null;
          compatibilidad: Json | null;
        };
      };
    };

    Functions: {
      es_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      mi_tienda_id: { Args: Record<PropertyKey, never>; Returns: string | null };
      admin_aprobar_tienda: {
        Args: { p_tienda_id: string; p_aprobar?: boolean };
        Returns: undefined;
      };
      admin_marcar_fundadora: {
        Args: { p_tienda_id: string; p_marcar?: boolean };
        Returns: undefined;
      };
      admin_listar_tiendas: {
        Args: Record<PropertyKey, never>;
        Returns: {
          tienda_id: string;
          tienda: string;
          direccion: string | null;
          ofrece_delivery: boolean;
          costo_delivery: number;
          aprobada: boolean;
          dueno_id: string;
          dueno: string;
          correo_dueno: string;
          telefono_dueno: string | null;
          es_fundador: boolean;
          fundador_hasta: string | null;
          prueba_hasta: string | null;
          pago_hasta: string | null;
          vigente: boolean;
          verificada: boolean;
          estado_verificacion: string;
          created_at: string;
        }[];
      };
      admin_listar_verificaciones: {
        Args: Record<PropertyKey, never>;
        Returns: {
          tienda_id: string;
          tienda: string;
          correo_dueno: string;
          estado: string;
          foto_fachada: string | null;
          foto_interior: string | null;
          nota_rechazo: string | null;
          enviada_en: string | null;
          verificada_en: string | null;
        }[];
      };
      admin_verificar_tienda: {
        Args: { p_tienda_id: string; p_aprobar?: boolean; p_nota?: string | null };
        Returns: undefined;
      };
      enviar_verificacion_tienda: {
        Args: { p_fachada: string; p_interior: string };
        Returns: undefined;
      };
      mi_verificacion_tienda: {
        Args: Record<PropertyKey, never>;
        Returns: {
          estado: string;
          foto_fachada: string | null;
          foto_interior: string | null;
          nota_rechazo: string | null;
          enviada_en: string | null;
          verificada_en: string | null;
        }[];
      };
    };

    Enums: {
      usuarios_rol: 'cliente' | 'tienda' | 'admin';
      productos_condicion: 'nuevo' | 'usado' | 'original' | 'generico';
      pedidos_entrega: 'delivery' | 'retiro';
      pedidos_forma_pago: 'efectivo' | 'transferencia' | 'tarjeta';
      pedidos_estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
    };

    CompositeTypes: Record<string, never>;
  };
};

export type NombreTabla = keyof Database['public']['Tables'];
export type NombreVista = keyof Database['public']['Views'];
