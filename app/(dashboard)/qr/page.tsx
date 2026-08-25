"use client";
import { useEffect, useRef, useState } from "react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function QRPage() {
  const session = getSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const deepLink = session
    ? `https://onstage.app/venues/${session.venueId}/follow`
    : "";

  useEffect(() => {
    if (!deepLink || !canvasRef.current) return;
    import("qrcode").then(QRCode => {
      QRCode.toCanvas(canvasRef.current!, deepLink, {
        width: 280,
        color: { dark: "#F0EDFF", light: "#0F0F1A" },
        errorCorrectionLevel: "H",
      });
      setGenerated(true);
    });
  }, [deepLink]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `onstage-qr-${session?.venueName?.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#F0EDFF]">Venue QR Code</h1>
        <p className="text-sm text-[#9B93C8] mt-1">Fans scan this to follow your venue and get show-night notifications</p>
      </div>

      <div className="max-w-sm">
        <div className="bg-[#0F0F1A] border border-[#1E1E35] rounded-xl p-8 flex flex-col items-center gap-6">
          <canvas ref={canvasRef} className="rounded-lg" />

          {generated && (
            <>
              <div className="text-center">
                <p className="text-xs text-[#5A5380]">Links to</p>
                <p className="text-xs text-[#9B93C8] font-mono mt-0.5 break-all">{deepLink}</p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button onClick={handleDownload} className="w-full">
                  Download PNG
                </Button>
                <p className="text-xs text-[#5A5380] text-center">
                  Print and display at your bar, door, or tables. Fans who scan get push notifications for future shows.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
