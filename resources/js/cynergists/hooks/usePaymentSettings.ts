import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentSettings {
  paymentMode: "sandbox" | "production";
  creditCardFeeRate: number;
}

const DEFAULT_FEE_RATE = 0.033;

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({
    paymentMode: "sandbox",
    creditCardFeeRate: DEFAULT_FEE_RATE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch both payment mode and fee rate in parallel
        const [modeResult, feeResult] = await Promise.all([
          supabase.rpc("get_payment_mode"),
          supabase.rpc("get_credit_card_fee_rate"),
        ]);

        if (modeResult.error) {
          console.error("Error fetching payment mode:", modeResult.error);
        }
        if (feeResult.error) {
          console.error("Error fetching fee rate:", feeResult.error);
        }

        setSettings({
          paymentMode: (modeResult.data as "sandbox" | "production") || "sandbox",
          creditCardFeeRate: Number(feeResult.data) || DEFAULT_FEE_RATE,
        });
      } catch (err) {
        console.error("Error fetching payment settings:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch settings"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}

export function useAdminPaymentSettings() {
  const [settings, setSettings] = useState<{
    id: string | null;
    paymentMode: "sandbox" | "production";
    creditCardFeeRate: number;
    updatedAt: string | null;
  }>({
    id: null,
    paymentMode: "sandbox",
    creditCardFeeRate: DEFAULT_FEE_RATE,
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading payment settings:", error);
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          paymentMode: data.payment_mode as "sandbox" | "production",
          creditCardFeeRate: Number(data.credit_card_fee_rate) || DEFAULT_FEE_RATE,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (updates: { paymentMode?: "sandbox" | "production"; creditCardFeeRate?: number }) => {
    const { data: userData } = await supabase.auth.getUser();
    
    if (settings.id) {
      const { error } = await supabase
        .from("payment_settings")
        .update({
          payment_mode: updates.paymentMode ?? settings.paymentMode,
          credit_card_fee_rate: updates.creditCardFeeRate ?? settings.creditCardFeeRate,
          updated_at: new Date().toISOString(),
          updated_by: userData?.user?.id,
        })
        .eq("id", settings.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("payment_settings")
        .insert({
          payment_mode: updates.paymentMode ?? settings.paymentMode,
          credit_card_fee_rate: updates.creditCardFeeRate ?? settings.creditCardFeeRate,
          updated_by: userData?.user?.id,
        });

      if (error) throw error;
    }

    await loadSettings();
  };

  return { settings, loading, updateSettings, reload: loadSettings };
}
