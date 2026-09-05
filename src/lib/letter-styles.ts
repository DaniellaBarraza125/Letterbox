export const LETTER_OPENING_STYLES = [
  {
    id: "classic",
    name: "Clásica",
    description: "Formal y atemporal",
    preview: "Septiembre 5 de 2026\nValencia, España",
  },
  {
    id: "executive",
    name: "Ejecutiva",
    description: "Limpia y profesional",
    preview: "Valencia, 5 de septiembre de 2026",
  },
  {
    id: "victorian",
    name: "Victoriana",
    description: "Romántica y de época",
    preview: "En Valencia, a 5 de septiembre del año 2026",
  },
] as const;

export const LETTER_CLOSINGS = [
  { id: "cordially", label: "Cordialmente" },
  { id: "always_yours", label: "Siempre tuya" },
  { id: "with_illusion", label: "Con ilusión" },
  { id: "with_love", label: "Con cariño" },
  { id: "yours", label: "Tuya" },
  { id: "see_you", label: "Hasta pronto" },
] as const;

export function formatLetterHeader(
  styleId: string,
  date: Date,
  location: string,
) {
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const place = location || "Sin ubicación";

  if (styleId === "executive") {
    return `${place}, ${day} de ${month} de ${year}`;
  }
  if (styleId === "victorian") {
    return `En ${place}, a ${day} de ${month} del año ${year}`;
  }
  // classic
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day} de ${year}\n${place}`;
}
