import { LegalDoc } from '@/components/LegalDoc';
import { NEGOCIO } from '@/lib/legal';

export default function PantallaTerminos() {
  return (
    <LegalDoc
      titulo="Términos y Condiciones"
      intro="Estos términos regulan el uso de RepuGo. Al crear una cuenta o usar la aplicación, los aceptás."
      secciones={[
        {
          titulo: '1. Quién presta el servicio',
          parrafos: [
            `RepuGo es operado por ${NEGOCIO.responsable}, con domicilio en ${NEGOCIO.ciudad}, ${NEGOCIO.pais}. Contacto: ${NEGOCIO.email}.`,
          ],
        },
        {
          titulo: '2. Qué es RepuGo',
          parrafos: [
            'RepuGo es una plataforma que conecta a compradores con tiendas de repuestos para motocicletas, carros y autobuses. No vendemos los repuestos ni somos dueños de ellos: el vendedor es la tienda.',
            'Un pedido es una solicitud de compra dirigida a una tienda. El pedido queda sujeto a la confirmación de la tienda, que puede verificar precio y disponibilidad.',
          ],
          aviso:
            'El total que muestra la aplicación corresponde únicamente a los repuestos. El costo del delivery se coordina y se paga aparte directamente con la tienda.',
        },
        {
          titulo: '3. Tu cuenta',
          vinetas: [
            'Debés tener al menos 18 años.',
            'Los datos que registrás deben ser veraces y estar actualizados.',
            'Sos responsable de mantener tu contraseña en secreto.',
            'Podemos suspender cuentas que incumplan estos términos.',
          ],
        },
        {
          titulo: '4. Compromisos de las tiendas',
          vinetas: [
            'Publicar precios reales, condiciones y disponibilidad de stock.',
            'Tener derecho a las imágenes y descripciones que suban, y autorizarnos a mostrarlas en la plataforma.',
            'Atender los pedidos recibidos y mantener el estado actualizado.',
            'No usar los datos de contacto obtenidos por la plataforma para fines ajenos al pedido.',
          ],
          aviso:
            'Cláusula anti-elusión: la tienda se compromete a tramitar a través de RepuGo los pedidos que recibe por la plataforma y a no desviar esas operaciones fuera de ella. El incumplimiento puede causar la suspensión o el cierre de la cuenta y la pérdida de la suscripción abonada.',
        },
        {
          titulo: '5. Planes y suscripción de tiendas',
          vinetas: [
            'La publicación de productos requiere una suscripción mensual. El precio vigente (RD$100/mes precio de fundador, o RD$500/mes precio normal) se informa antes de contratarla.',
            'Las primeras 25 tiendas pueden acceder a RD$100/mes por 12 meses desde su aprobación. Luego pasa a RD$500/mes, con aviso previo de 30 días.',
            'La suscripción se renueva cada mes y se paga por adelantado.',
            'Si no se renueva, la tienda deja de mostrarse públicamente de forma automática.',
            'Podés cancelar cuando quieras; el acceso continúa hasta el final del período ya pagado.',
            'Cualquier cambio en el precio de la suscripción se comunicará con al menos 30 días de anticipación a las tiendas afectadas.',
          ],
        },
        {
          titulo: '5.1 Formas de pago de los pedidos',
          parrafos: [
            'La aplicación no procesa pagos en línea por ahora. Las formas de pago disponibles (efectivo o transferencia) se acuerdan directamente con la tienda. La aplicación no retiene ni administra ese dinero.',
          ],
        },
        {
          titulo: '6. Reseñas, chat y contenido del usuario',
          vinetas: [
            'Solo puede calificar quien haya comprado el producto a través de la aplicación.',
            'No se permiten reseñas falsas, ofensivas, discriminatorias ni con datos personales de terceros.',
            'El chat de un pedido es entre el comprador y la tienda, y se usa únicamente para coordinar ese pedido.',
            'No se permite pedir ni compartir datos de contacto (teléfono, correo, redes sociales) para operar fuera de la aplicación; pedirlo es una falta grave.',
            `Podés reportar contenido o usuarios y bloquear a la otra parte desde el propio chat. Los reportes llegan a ${NEGOCIO.email} y los revisamos.`,
          ],
        },
        {
          titulo: '6.1 Contenido y conductas prohibidas',
          parrafos: [
            'Está prohibido publicar o enviar contenido que sea ilegal, fraudulento, engañoso, sexual, violento, de acoso, discriminatorio u ofensivo, que promueva productos prohibidos o ilegales, que infrinja derechos de terceros, o que suplante a otra persona o tienda.',
          ],
          vinetas: [
            'Amenazas, acoso o discriminación hacia otra persona.',
            'Estafas, pagos por fuera de la aplicación o información falsa.',
            'Contenido sexual, violento o que promueva productos prohibidos por la ley.',
          ],
          aviso:
            'Podemos retirar el contenido y suspender o cerrar la cuenta de quien incumpla. El contenido reportado se revisa y, si corresponde, se elimina.',
        },
        {
          titulo: '7. Usos prohibidos',
          vinetas: [
            'Publicar información falsa, ilegal o engañosa.',
            'Suplantar a otra persona o tienda.',
            'Intentar acceder a datos de otros usuarios.',
            'Usar la plataforma para fines distintos a la compra y venta de repuestos.',
            'Solicitar u ofrecer pagos por fuera de la plataforma para evitar sus mecanismos internos.',
            'Acosar, amenazar o discriminar a otros usuarios.',
          ],
        },
        {
          titulo: '8. Propiedad intelectual',
          parrafos: [
            'El nombre, el logo y el diseño de RepuGo nos pertenecen. Los repuestos, marcas y fotografías de cada producto pertenecen a la tienda o a sus titulares.',
          ],
        },
        {
          titulo: '9. Responsabilidad',
          parrafos: [
            'RepuGo facilita el contacto y la gestión de pedidos, pero no fabrica ni garantiza los repuestos: eso corresponde a la tienda y a los derechos que la ley reconoce al consumidor.',
            `Hacemos lo razonable para que el servicio funcione, sin garantizar que esté libre de interrupciones.`,
          ],
        },
        {
          titulo: '10. Terminación',
          parrafos: [
            'Podés cerrar tu cuenta cuando quieras. También podemos suspender o cancelar cuentas que incumplan estos términos.',
          ],
        },
        {
          titulo: '11. Ley aplicable',
          parrafos: [
            'Estos términos se rigen por las leyes de la República Dominicana. Los derechos del consumidor son los que reconoce la Ley No. 358-05.',
          ],
        },
        {
          titulo: '12. Contacto',
          parrafos: [`Para consultas sobre estos términos escribí a ${NEGOCIO.email}.`],
        },
      ]}
    />
  );
}
