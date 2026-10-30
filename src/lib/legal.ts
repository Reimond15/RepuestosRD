export const NEGOCIO = {
  nombreComercial: 'RepuGo',
  responsable: 'RAYTECH',
  rnc: 'En trámite',
  ciudad: 'Santo Domingo Oeste',
  pais: 'República Dominicana',

  email: 'soporte.repuestord@gmail.com',
  emailPrivacidad: 'soporte.repuestord@gmail.com',
  telefono: null as string | null,
  horario: null as string | null,
} as const;

export const LEGAL_ACTUALIZADO = '21 de octubre de 2026';

export const CONTACTO_TEXTO = `${NEGOCIO.email}`;

export const PAGINAS_LEGALES = [
  { ruta: '/legal/privacidad', titulo: 'Política de Privacidad', icono: 'shield-account-outline' },
  { ruta: '/legal/terminos', titulo: 'Términos y Condiciones', icono: 'file-document-outline' },
  { ruta: '/legal/cookies', titulo: 'Política de Cookies', icono: 'cookie-outline' },
  { ruta: '/legal/reembolsos', titulo: 'Política de Reembolsos', icono: 'cash-refund' },
  { ruta: '/legal/aviso-legal', titulo: 'Aviso Legal', icono: 'information-outline' },
  { ruta: '/legal/eliminar-cuenta', titulo: 'Eliminar cuenta y datos', icono: 'account-remove-outline' },
] as const;

export const ELIMINACION = {
  asunto: 'Solicitud de eliminación de cuenta — RepuGo',
  cuerpo:
    'Hola: quiero eliminar mi cuenta de RepuGo y los datos asociados.\n\n' +
    'Correo de la cuenta: \n' +
    'Nombre: \n\n' +
    'Entiendo que se eliminarán mi cuenta y mis datos personales.',
  rutaWeb: '/legal/eliminar-cuenta',
  dominioWeb: 'https://reimond15.github.io/RepuestosRD',
} as const;

export const ENLACE_ELIMINACION_EMAIL = `mailto:${NEGOCIO.emailPrivacidad}?subject=${encodeURIComponent(
  ELIMINACION.asunto,
)}&body=${encodeURIComponent(ELIMINACION.cuerpo)}`;

export const URL_ELIMINACION_WEB = `${ELIMINACION.dominioWeb}/eliminar-cuenta.html`;

export const URL_PRIVACIDAD_WEB = `${ELIMINACION.dominioWeb}/privacidad.html`;
