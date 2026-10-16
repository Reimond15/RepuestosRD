/**
 * ============================================================================
 *  DATOS DEL NEGOCIO Y TEXTOS LEGALES
 *
 *  ⭐ EDITAR SOLO ACÁ los datos del responsable. Las páginas de
 *  `src/app/legal/` leen de aquí, así que un cambio se refleja en todas.
 *
 *  RepuestosRD hoy es un proyecto individual (persona física) sin oficina:
 *  el domicilio legal se muestra como ciudad, nunca una dirección de casa.
 * ============================================================================
 */

export const NEGOCIO = {
  /** Nombre con el que se conoce la plataforma. */
  nombreComercial: 'RepuestosRD',
  /** Persona física responsable (aparece en Términos y Privacidad). */
  responsable: 'Reimond Peña',
  /** RNC pendiente. Actualizar aquí cuando esté emitido. */
  rnc: 'En trámite',
  /** Domicilio legal: solo ciudad, NUNCA la dirección de la casa. */
  ciudad: 'Santo Domingo Oeste',
  pais: 'República Dominicana',

  /** Canal de atención principal (queda público en los documentos). */
  email: 'penareimond1@gmail.com',
  /** Correo para ejercer derechos de privacidad. Hoy es el mismo. */
  emailPrivacidad: 'penareimond1@gmail.com',
  /** Sin teléfono público por ahora: la atención es por correo. */
  telefono: null as string | null,
  /** Sin horario fijo publicado; se responde por correo lo antes posible. */
  horario: null as string | null,
} as const;

/** Fecha de la última revisión de los documentos legales. */
export const LEGAL_ACTUALIZADO = '14 de octubre de 2026';

/** Texto de contacto listo para incrustar en los documentos. */
export const CONTACTO_TEXTO = `${NEGOCIO.email}`;

/**
 * Documentos legales, en el orden en que se muestran.
 * Se usa en el índice `/legal` y en la tarjeta de la pantalla Cuenta.
 */
export const PAGINAS_LEGALES = [
  { ruta: '/legal/privacidad', titulo: 'Política de Privacidad', icono: 'shield-account-outline' },
  { ruta: '/legal/terminos', titulo: 'Términos y Condiciones', icono: 'file-document-outline' },
  { ruta: '/legal/cookies', titulo: 'Política de Cookies', icono: 'cookie-outline' },
  { ruta: '/legal/reembolsos', titulo: 'Política de Reembolsos', icono: 'cash-refund' },
  { ruta: '/legal/aviso-legal', titulo: 'Aviso Legal', icono: 'information-outline' },
  { ruta: '/legal/eliminar-cuenta', titulo: 'Eliminar cuenta y datos', icono: 'account-remove-outline' },
] as const;

/**
 * ============================================================================
 *  ELIMINACIÓN DE CUENTA  (requisito de Google Play)
 *
 *  Google Play pide DOS vías:
 *    1. dentro de la app  → `/eliminar-cuenta`
 *    2. un enlace WEB     → `/legal/eliminar-cuenta` (esta constante)
 *
 *  ⚠️ Cuando el dominio esté activo, actualizá `dominioWeb` con el real y
 *  pegá `URL_ELIMINACION_WEB` en Play Console (Data safety → Data deletion).
 * ============================================================================
 */

export const ELIMINACION = {
  asunto: 'Solicitud de eliminación de cuenta — RepuestosRD',
  cuerpo:
    'Hola: quiero eliminar mi cuenta de RepuestosRD y los datos asociados.\n\n' +
    'Correo de la cuenta: \n' +
    'Nombre: \n\n' +
    'Entiendo que se eliminarán mi cuenta y mis datos personales.',
  /** Ruta pública (sirve en la web, sin instalar la app). */
  rutaWeb: '/legal/eliminar-cuenta',
  /** Dominio previsto para la web pública. Actualizar cuando esté activo. */
  dominioWeb: 'https://repuestosrd.app',
} as const;

/** Enlace `mailto:` que abre el correo con el pedido de eliminación listo. */
export const ENLACE_ELIMINACION_EMAIL = `mailto:${NEGOCIO.emailPrivacidad}?subject=${encodeURIComponent(
  ELIMINACION.asunto,
)}&body=${encodeURIComponent(ELIMINACION.cuerpo)}`;

/** URL pública del recurso de eliminación (la que se pega en Play Console). */
export const URL_ELIMINACION_WEB = `${ELIMINACION.dominioWeb}${ELIMINACION.rutaWeb}`;

