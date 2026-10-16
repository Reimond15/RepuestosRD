import { LegalDoc } from '@/components/LegalDoc';
import { NEGOCIO } from '@/lib/legal';

export default function PantallaAvisoLegal() {
  return (
    <LegalDoc
      titulo="Aviso Legal y Datos del Negocio"
      intro="Datos de identificación y contacto del responsable de RepuestosRD."
      secciones={[
        {
          titulo: 'Titular',
          vinetas: [
            `Responsable: ${NEGOCIO.responsable}`,
            `Nombre comercial: ${NEGOCIO.nombreComercial}`,
            `RNC: ${NEGOCIO.rnc}`,
            `Domicilio: ${NEGOCIO.ciudad}, ${NEGOCIO.pais}`,
            `Correo de contacto: ${NEGOCIO.email}`,
            `Correo de privacidad: ${NEGOCIO.emailPrivacidad}`,
          ],
        },
        {
          titulo: 'Naturaleza del proyecto',
          parrafos: [
            'RepuestosRD es un proyecto operado de forma digital por su titular. No cuenta con oficina física ni punto de atención presencial. La atención se brinda por correo electrónico.',
          ],
        },
        {
          titulo: 'Canales de atención',
          parrafos: [
            'Las consultas, reclamos y solicitudes de privacidad se atienden por correo electrónico. Se responden lo antes posible.',
          ],
        },
        {
          titulo: 'Propiedad intelectual',
          parrafos: [
            'El nombre, el logotipo y el diseño de RepuestosRD pertenecen a su titular. Las marcas, fotografías y descripciones de los repuestos pertenecen a sus respectivos titulares o a las tiendas que las publican.',
          ],
        },
      ]}
    />
  );
}
