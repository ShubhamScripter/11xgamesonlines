import React, { useEffect, useState } from "react";
import { RiWhatsappFill } from "react-icons/ri";
import api from "../../utils/axiosConfig";

function toWhatsAppHref(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return `https://wa.me/${digits}`;
}

/**
 * Fixed WhatsApp — always visible above bottom nav (Footer h-20), does not scroll with page.
 * Number from GET /public/app-settings.
 */
function SupportWhatsAppFab() {
  const [href, setHref] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/public/app-settings");
        const w = toWhatsAppHref(data?.data?.supportWhatsApp);
        if (!cancelled && w) setHref(w);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!href) return null;

  /* bottom-20 = same height as Footer inner bar (h-20) so icon sits just above My Bets nav */
  return (
    <div className="fixed bottom-20 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div className="w-full max-w-[480px] flex justify-end px-4 pointer-events-auto">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title="Customer support — WhatsApp"
          aria-label="Open WhatsApp customer support"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/40 active:scale-95 transition-transform"
        >
          <RiWhatsappFill className="text-[1.75rem]" />
        </a>
      </div>
    </div>
  );
}

export default SupportWhatsAppFab;
