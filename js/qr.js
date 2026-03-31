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
        width: 220,
        height: 220
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
  const qrImage = qrContainer.querySelector("img");
  const qrCanvas = qrContainer.querySelector("canvas");

  let imageSource = "";

  if (qrImage) {
    imageSource = qrImage.src;
  } else if (qrCanvas) {
    imageSource = qrCanvas.toDataURL("image/png");
  } else {
    alert("No se pudo encontrar la imagen del QR.");
    return;
  }

  const link = document.createElement("a");
  link.href = imageSource;
  link.download = `QR-${qrId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}