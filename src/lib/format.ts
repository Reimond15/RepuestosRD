/** Formateadores para República Dominicana. */

// ============================================================================
//  DINERO
// ============================================================================

const formattersRD = new Map<string, Intl.NumberFormat>();

function getFormatter(decimales: number): Intl.NumberFormat {
  const clave = String(decimales);
  let f = formattersRD.get(clave);
  if (!f) {
    f = new Intl.NumberFormat('es-DO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
    formattersRD.set(clave, f);
  }
  return f;
}

/** 1500 → "RD$1,500.00" */
export function money(monto: number | string | null | undefined): string {
  const n = typeof monto === 'string' ? Number(monto) : (monto ?? 0);
  if (Number.isNaN(n)) return 'RD$0.00';
  return `RD$${getFormatter(2).format(n)}`;
}

/** 1500 → "1,500" (sin RD$, para cuando el símbolo ya está a la vista) */
export function numero(valor: number | string | null | undefined, decimales = 0): string {
  const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0);
  if (Number.isNaN(n)) return '0';
  return getFormatter(decimales).format(n);
}

// ============================================================================
//  TEXTO
// ============================================================================

/** "Pastilla de freno Deluxe" → "Pastilla de brake..." con la largo que le pidas */
export function recortar(texto: string, largo: number): string {
  if (texto.length <= largo) return texto;
  return `${texto.slice(0, largo - 1).trimEnd()}…`;
}

/** iniciales para el avatar: "Repuestos El Che" → "RC" */
export function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '?';
  if (palabras.length === 1) return palabras[0]!.slice(0, 2).toUpperCase();
  return (palabras[0]![0]! + palabras[palabras.length - 1]![0]!).toUpperCase();
}

// ============================================================================
//  FECHA
// ============================================================================

/** "hace 3 días", "hace 2 meses" */
export function tiempoRelativo(fecha: string | Date): string {
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const segundos = Math.floor((Date.now() - f.getTime()) / 1000);

  if (segundos < 60) return 'hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

  const meses = Math.floor(dias / 30);
  if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

  const anios = Math.floor(meses / 12);
  return `hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
}

/** "12 oct 2026" */
export function fechaCorta(fecha: string | Date): string {
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return f.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================================
//  TELÉFONO
// ============================================================================

/** "8091234567" → "(809) 123-4567" */
export function telefono(valor: string | null | undefined): string {
  if (!valor) return '';
  const d = valor.replace(/\D/g, '').slice(0, 10);
  if (d.length !== 10) return valor;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
