import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const BASE_PUBLIC_URL = "https://josealbertosarmiento.github.io/qr-emergencia-biker";

document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qrcode");
  const qrIdText = document.getElementById("qrIdText");
  const qrUrlText = document.getElementById("qrUrlText");
  const qrMessage = document.getElementById("qrMessage");
  const downloadQrBtn = document.getElementById("downloadQrBtn");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        qrMessage.textContent = "No se encontró el perfil del usuario.";
        qrMessage.className = "message error";
        return;
      }

      const data = userSnap.data();

      if (!data.qrId) {
        qrMessage.textContent = "Primero debes completar tu perfil para generar el QR.";
        qrMessage.className = "message error";
        return;
      }

      const publicUrl = `${BASE_PUBLIC_URL}/emergencia.html?id=${encodeURIComponent(data.qrId)}`;

      qrIdText.textContent = data.qrId;
      qrUrlText.textContent = publicUrl;

      qrContainer.innerHTML = "";

      new QRCode(qrContainer, {
        text: publicUrl,
        width: 200,
        height: 200
      });

      qrMessage.textContent = "QR generado correctamente.";
      qrMessage.className = "message success";

      downloadQrBtn.addEventListener("click", () => {
        descargarQR(data.qrId);
      });
    } catch (error) {
      console.error(error);
      qrMessage.textContent = "Ocurrió un error al generar el QR.";
      qrMessage.className = "message error";
    }
  });
});

function descargarQR(qrId) {
  const qrContainer = document.getElementById("qrcode");
  const originalCanvas = qrContainer.querySelector("canvas");
  const qrMessage = document.getElementById("qrMessage");

  if (!originalCanvas) {
    qrMessage.textContent = "No se encontró el canvas del QR.";
    qrMessage.className = "message error";
    return;
  }

  const margin = 40; // espacio blanco real alrededor
  const finalSize = originalCanvas.width + margin * 2;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = finalSize;
  exportCanvas.height = finalSize;

  const ctx = exportCanvas.getContext("2d");

  // fondo blanco completo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalSize, finalSize);

  // dibujar QR centrado
  ctx.drawImage(originalCanvas, margin, margin);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  exportCanvas.toBlob((blob) => {
    if (!blob) {
      qrMessage.textContent = "No se pudo generar la imagen del QR.";
      qrMessage.className = "message error";
      return;
    }

    const blobUrl = URL.createObjectURL(blob);

    if (isMobile) {
      window.open(blobUrl, "_blank");
      qrMessage.textContent = "Se abrió la imagen del QR con borde blanco. Desde allí puedes guardar la imagen.";
      qrMessage.className = "message success";
    } else {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR-${qrId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      qrMessage.textContent = "QR descargado correctamente.";
      qrMessage.className = "message success";
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }, "image/png");
}