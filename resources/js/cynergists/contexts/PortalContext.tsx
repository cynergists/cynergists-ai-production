import { createContext, useContext } from "react";

export interface PortalContextValue {
  session: any;
  clientAccess: any[] | null;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortalContext must be used within PortalLayout");
  }
  return context;
};

export default PortalContext;
