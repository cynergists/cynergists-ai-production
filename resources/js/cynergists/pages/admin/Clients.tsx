import { useEffect } from "react";
import { router } from "@inertiajs/react";

// Clients management has been moved to the Client Portal
// This component redirects users to the new location
export default function Clients() {
  useEffect(() => {
    router.visit("/admin/client-portal");
  }, []);

  return null;
}
