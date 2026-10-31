import { LegalDoc, type Seccion } from '@/components/LegalDoc';
import { NEGOCIO } from '@/lib/legal';

const SECCIONES: Seccion[] = [
  {
    titulo: '1. Quién trata tus datos',
    parrafos: [
      `El responsable del tratamiento es ${NEGOCIO.responsable}, que opera ${NEGOCIO.nombreComercial} desde ${NEGOCIO.ciudad}, ${NEGOCIO.pais}. Para cualquier asunto de privacidad escribí a ${NEGOCIO.emailPrivacidad}.`,
      'Tratamos tus datos personales conforme a la Ley No. 172-13 sobre Protección de Datos de Carácter Personal de la República Dominicana.',
    ],
  },
  {
    titulo: '2. Qué datos recogemos',
    vinetas: [
      'Cuenta: nombre, correo electrónico y teléfono.',
      'Si abrís una tienda: nombre de la tienda, nombre del representante y dirección.',
      'Pedidos: los repuestos solicitados, la dirección de entrega (si pedís delivery) y las notas que escribas.',
      'Mensajes: el contenido de los mensajes que envíes por el chat de la aplicación.',
      'Fotos: las imágenes de los repuestos que publique una tienda.',
      'Datos técnicos mínimos necesarios para que el servicio funcione y para prevenir el fraude.',
    ],
  },
  {
    titulo: '3. Tu ubicación',
    parrafos: [
      'Si aceptás el permiso de ubicación, tu posición se usa únicamente dentro de tu dispositivo para ordenar las tiendas por cercanía. No la guardamos ni la enviamos a nuestros servidores.',
      'Podés rechazar el permiso y usar la aplicación con normalidad: simplemente no se ordenará por cercanía.',
    ],
  },
  {
    titulo: '4. Para qué usamos los datos',
    vinetas: [
      'Crear y administrar tu cuenta.',
      'Tramitar los pedidos y permitir que la tienda los atienda.',
      'Facilitar la comunicación entre comprador y tienda dentro de la aplicación.',
      'Prevenir el fraude y el uso indebido del servicio.',
      'Brindarte soporte cuando nos escribís.',
    ],
    aviso:
      'No usamos tus datos para publicidad de terceros y no los vendemos. No hacemos perfilado con fines publicitarios.',
  },
  {
    titulo: '5. Con quién se comparten',
    vinetas: [
      'Con la tienda: recibe los datos necesarios para atender tu pedido, incluido un medio de contacto cuando haga falta coordinar la entrega.',
      'Con Supabase, nuestro proveedor de base de datos y almacenamiento, que actúa como encargado del tratamiento por cuenta nuestra.',
      'Con Expo, el proveedor que distribuye y ejecuta la aplicación.',
      'Cuando una ley o una autoridad competente lo exija.',
    ],
  },
  {
    titulo: '6. Cuánto tiempo los guardamos',
    parrafos: [
      'Conservamos los datos mientras tu cuenta esté activa. Si pedís la eliminación de tu cuenta, borramos o anonimizamos tus datos personales, salvo aquello que debamos conservar por obligación legal.',
      'Los pedidos ya realizados se conservan de forma anonimizada (sin tus datos personales) para comprobantes y trazabilidad. El resto se elimina.',
    ],
  },
  {
    titulo: '7. Cómo eliminar tu cuenta',
    parrafos: [
      'Podés pedir la eliminación de tu cuenta y de tus datos desde la propia aplicación (Cuenta → Eliminar mi cuenta) o desde la página "Eliminar cuenta y datos".',
      'La eliminación es permanente. Procesamos la solicitud lo antes posible y te confirmamos por correo cuando esté completa.',
    ],
  },
  {
    titulo: '8. Tus derechos',
    parrafos: [
      'Podés solicitar el acceso, la rectificación, la cancelación o la oposición al tratamiento de tus datos. Para ejercerlos escribí a ' +
        NEGOCIO.emailPrivacidad +
        ' indicando tu solicitud. Te responderemos en un plazo razonable.',
    ],
  },
  {
    titulo: '9. Seguridad',
    parrafos: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, incluido el control de acceso por fila en la base de datos, de modo que cada usuario vea solo lo que le corresponde.',
    ],
  },
  {
    titulo: '10. Menores de edad',
    parrafos: [
      'El servicio está dirigido a personas mayores de 18 años. Si sos menor, no debés registrarte ni usar la aplicación.',
    ],
  },
  {
    titulo: '11. Cookies y almacenamiento local',
    parrafos: [
      'La aplicación no usa cookies de seguimiento ni de publicidad. Solo emplea almacenamiento local necesario para recordar tu sesión y tu carrito. Podés ver el detalle en la Política de Cookies.',
    ],
  },
  {
    titulo: '12. Cambios a esta política',
    parrafos: [
      'Podemos actualizar esta política cuando cambie el servicio o la normativa. Publicaremos la versión vigente en esta misma página con su fecha de actualización.',
    ],
  },
  {
    titulo: '13. Contacto',
    parrafos: [
      `Si tenés dudas sobre esta política, escribinos a ${NEGOCIO.email}.`,
    ],
  },
];

export default function PantallaPrivacidad() {
  return (
    <LegalDoc
      titulo="Política de Privacidad"
      intro="Acá te explicamos, en lenguaje claro, qué datos personales tratamos, para qué los usamos y cómo podés ejercer tus derechos."
      secciones={SECCIONES}
    />
  );
}
