import { DELIVERY_METHODS, DeliveryMethodId } from "./delivery-methods";

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateArrivalDate(
  methodId: DeliveryMethodId,
  distanceKm: number,
): Date {
  // Modo prueba: llegada inmediata
  if (process.env.NEXT_PUBLIC_DELIVERY_TEST_MODE === "true") {
    return new Date();
  }

  const method = DELIVERY_METHODS.find((m) => m.id === methodId);
  if (!method) throw new Error("Método de envío no válido");

  if (methodId === "email") {
    return new Date(Date.now() + 30 * 1000);
  }

  const daysNeeded = Math.max(distanceKm / method.speedKmPerDay, 0.01);
  const ms = daysNeeded * 24 * 60 * 60 * 1000;
  // mínimo 2 minutos fuera de test (ajústalo luego)
  return new Date(Date.now() + Math.max(ms, 2 * 60 * 1000));
}
