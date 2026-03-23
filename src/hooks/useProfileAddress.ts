import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ProfileAddress {
  delivery_address: string;
  delivery_city: string;
  delivery_phone: string;
}

export function useProfileAddress() {
  const { user } = useAuth();
  const [profileAddress, setProfileAddress] = useState<ProfileAddress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("profiles")
      .select("delivery_address, delivery_city, delivery_phone")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && (data.delivery_address || data.delivery_city || data.delivery_phone)) {
          setProfileAddress({
            delivery_address: (data as any).delivery_address || "",
            delivery_city: (data as any).delivery_city || "",
            delivery_phone: (data as any).delivery_phone || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const saveAddress = async (address: ProfileAddress) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        delivery_address: address.delivery_address,
        delivery_city: address.delivery_city,
        delivery_phone: address.delivery_phone,
      } as any)
      .eq("user_id", user.id);
    setProfileAddress(address);
  };

  return { profileAddress, loading, saveAddress };
}
