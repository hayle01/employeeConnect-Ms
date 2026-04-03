import QRCode from "qrcode";

export async function generateQrDataUrl(verificationUrl: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
