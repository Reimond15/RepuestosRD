import { LegalDoc } from '@/components/LegalDoc';
import { NEGOCIO } from '@/lib/legal';

export default function PantallaCookies() {
  return (
    <LegalDoc
      titulo="Política de Cookies"
      intro="Acá explicamos qué son las cookies y el almacenamiento local, y qué usa RepuGo hoy."
      secciones={[
        {
          titulo: '1. Qué son',
          parrafos: [
            'Las cookies y el almacenamiento local son pequeños archivos que un sitio o aplicación guarda en tu dispositivo para recordar información entre visitas.',
          ],
        },
        {
          titulo: '2. Qué usamos hoy',
          parrafos: [
            'RepuGo no usa cookies de publicidad ni de análisis. En la versión web, la aplicación guarda almacenamiento local estrictamente necesario para que el servicio funcione.',
          ],
          vinetas: [
            'Almacenamiento necesario: mantiene tu sesión iniciada y conserva tu carrito mientras navegás.',
            'No usamos cookies de terceros para rastrearte ni para mostrarte anuncios.',
          ],
        },
        {
          titulo: '3. ¿Necesito dar mi consentimiento?',
          parrafos: [
            'El almacenamiento estrictamente necesario para prestar el servicio no requiere consentimiento. Si en el futuro incorporamos análisis o publicidad, te lo pediremos antes de activarlos, mediante un aviso de cookies con opción de aceptar o rechazar.',
          ],
          aviso:
            'Si accedés desde la Unión Europea o el Reino Unido, se aplican además las reglas del RGPD y, si accedés desde California, la normativa CCPA/CPRA.',
        },
        {
          titulo: '4. Cómo gestionarlas',
          parrafos: [
            'Podés borrar o bloquear las cookies y el almacenamiento local desde la configuración de tu navegador. Si bloqueás el almacenamiento necesario, algunas funciones (como mantener la sesión) pueden no funcionar.',
          ],
        },
        {
          titulo: '5. Contacto',
          parrafos: [`Si tenés dudas, escribí a ${NEGOCIO.email}.`],
        },
      ]}
    />
  );
}
