import { useMemo } from "react";

// Zone-based delivery fee structure
const DELIVERY_ZONES = [
  { name: "Downtown", cities: ["manila", "makati", "bgc", "taguig", "pasay"], fee: 0, label: "Free Delivery" },
  { name: "Metro", cities: ["quezon city", "pasig", "mandaluyong", "san juan", "marikina", "caloocan", "valenzuela", "malabon", "navotas", "paranaque", "muntinlupa", "las pinas"], fee: 3.99, label: "$3.99" },
  { name: "Suburban", cities: ["antipolo", "cainta", "taytay", "rizal", "cavite", "bacoor", "imus", "dasmarinas", "laguna", "san pedro", "binan"], fee: 6.99, label: "$6.99" },
] as const;

const DEFAULT_FEE = 9.99;
const FREE_DELIVERY_THRESHOLD = 50; // Free delivery for orders above this amount

export interface DeliveryFeeResult {
  fee: number;
  zoneName: string;
  label: string;
  isFreeEligible: boolean;
}

export function useDeliveryFee(city: string, subtotal: number): DeliveryFeeResult {
  return useMemo(() => {
    const normalizedCity = city.trim().toLowerCase();

    if (!normalizedCity) {
      return { fee: 0, zoneName: "—", label: "Enter city", isFreeEligible: false };
    }

    // Check if subtotal qualifies for free delivery
    if (subtotal >= FREE_DELIVERY_THRESHOLD) {
      return { fee: 0, zoneName: "All Zones", label: "Free (order $50+)", isFreeEligible: true };
    }

    const zone = DELIVERY_ZONES.find(z =>
      z.cities.some(c => normalizedCity.includes(c) || c.includes(normalizedCity))
    );

    if (zone) {
      return { fee: zone.fee, zoneName: zone.name, label: zone.label, isFreeEligible: false };
    }

    return { fee: DEFAULT_FEE, zoneName: "Extended", label: `$${DEFAULT_FEE}`, isFreeEligible: false };
  }, [city, subtotal]);
}

export { DELIVERY_ZONES, DEFAULT_FEE, FREE_DELIVERY_THRESHOLD };
