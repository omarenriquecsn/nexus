import html2canvas from "html2canvas";
import { supabase } from "./supabase";

export async function uploadReportSnapshot(
  containerId: string,
  diagnosticId: string,
): Promise<string> {
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`No se encontró el contenedor con id ${containerId}`);
  }

  const canvas = await html2canvas(element, {
    scale: 1,
    backgroundColor: "#ffffff",
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.5),
  );

  if (!blob) {
    throw new Error("No se pudo generar la imagen del reporte.");
  }

  const fileName = `diagnostic-${diagnosticId}-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("diagnostic-reports")
    .upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicData } = await supabase.storage
    .from("diagnostic-reports")
    .getPublicUrl(fileName);

  if (!publicData?.publicUrl) {
    throw new Error("No se pudo obtener la URL pública del reporte.");
  }

  return publicData.publicUrl;
}
