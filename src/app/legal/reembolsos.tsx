import { LegalDoc } from '@/components/LegalDoc';
import { NEGOCIO } from '@/lib/legal';

export default function PantallaReembolsos() {
  return (
    <LegalDoc
      titulo="Política de Reembolsos"
      intro="Acá explicamos cómo funcionan las devoluciones de pedidos y la cancelación de la suscripción de las tiendas."
      secciones={[
        {
          titulo: '1. Compras de repuestos',
          parrafos: [
            'Cada tienda es responsable de la venta. Como comprador, la ley dominicana (Ley No. 358-05) te reconoce derechos frente a productos defectuosos, y RepuestosRD te ayuda a canalizar el reclamo con la tienda.',
          ],
          vinetas: [
            'Si el repuesto no corresponde a lo publicado o llega con defectos, escribinos y gestionamos el reclamo con la tienda.',
            'La devolución del dinero corresponde a la tienda, en la forma de pago acordada (efectivo o transferencia).',
            'El costo del delivery no forma parte del valor de los repuestos y se coordina aparte.',
          ],
          aviso:
            'Como RepuestosRD no procesa el pago de los repuestos, el reembolso lo hace directamente la tienda. Nuestro papel es facilitar y dar seguimiento al reclamo.',
        },
        {
          titulo: '2. Suscripción de las tiendas',
          vinetas: [
            'La suscripción se paga por mes y da acceso a publicar durante ese período.',
            'No se reembolsan los períodos ya transcurridos.',
            'Podés cancelar cuando quieras; el acceso se mantiene hasta el final del período ya pagado y no se renueva.',
          ],
        },
        {
          titulo: '3. Cómo reclamar',
          parrafos: [
            `Escribinos a ${NEGOCIO.email} indicando tu nombre, el número o fecha del pedido y el motivo. Te responderemos lo antes posible y dejaremos constancia de los acuerdos con la tienda.`,
          ],
        },
        {
          titulo: '4. Autoridad de protección al consumidor',
          parrafos: [
            'También podés acudir a Pro Consumidor, la autoridad dominicana de protección de los derechos del consumidor.',
          ],
        },
      ]}
    />
  );
}
