import { createContext, useContext } from "react";

export interface PartnerContextValue {
  partner: any;
  status: "pending" | "active" | "suspended" | null;
  refetch?: () => void;
}

const PartnerContext = createContext<PartnerContextValue | null>(null);

export const usePartnerContext = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error("usePartnerContext must be used within PartnerPortalLayout");
  }
  return context;
};

export default PartnerContext;
