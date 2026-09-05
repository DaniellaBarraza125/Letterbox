export const DELIVERY_METHODS = [
  {
    id: "walking",
    name: "Caminando",
    description: "El camino más lento y romántico",
    speedKmPerDay: 25, // ~25 km al día
    icon: "🚶",
  },
  {
    id: "crow",
    name: "Por cuervo",
    description: "Un cuervo mensajero leal",
    speedKmPerDay: 80,
    icon: "🐦‍⬛",
  },
  {
    id: "letter",
    name: "Carta tradicional",
    description: "Correo postal clásico",
    speedKmPerDay: 150,
    icon: "✉️",
  },
  {
    id: "motorcycle",
    name: "Motocicleta",
    description: "Rápido y con viento en la cara",
    speedKmPerDay: 600,
    icon: "🏍️",
  },
  {
    id: "ship",
    name: "Por barco",
    description: "Viaje por el mar",
    speedKmPerDay: 400,
    icon: "🚢",
  },
  {
    id: "plane",
    name: "Por avión",
    description: "Casi vuela hasta ti",
    speedKmPerDay: 2000,
    icon: "✈️",
  },
  {
    id: "email",
    name: "Email",
    description: "Llegada casi instantánea",
    speedKmPerDay: 999999,
    icon: "📧",
  },
] as const;

export type DeliveryMethodId = (typeof DELIVERY_METHODS)[number]["id"];
