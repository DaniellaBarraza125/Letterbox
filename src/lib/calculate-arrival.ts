import { DELIVERY_METHODS, DeliveryMethodId } from "./delivery-methods";

// Distancia aproximada en km entre dos puntos (fórmula de Haversine simplificada)
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateArrivalDate(
  methodId: DeliveryMethodId,
  distanceKm: number,
): Date {
  const method = DELIVERY_METHODS.find((m) => m.id === methodId);
  if (!method) throw new Error("Método de envío no válido");

  // Mínimo 10 minutos para que siempre haya un poco de espera (excepto email)
  if (methodId === "email") {
    return new Date(Date.now() + 30 * 1000); // 30 segundos
  }

  const daysNeeded = Math.max(distanceKm / method.speedKmPerDay, 0.01);
  const milliseconds = daysNeeded * 24 * 60 * 60 * 1000;

  // Mínimo 2 minutos para pruebas
  const finalMs = Math.max(milliseconds, 2 * 60 * 1000);

  return new Date(Date.now() + finalMs);
}
