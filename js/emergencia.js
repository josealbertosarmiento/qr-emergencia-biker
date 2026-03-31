import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const emergencyContent = document.getElementById("emergencyContent");
  const emergencyMessage = document.getElementById("emergencyMessage");

  const params = new URLSearchParams(window.location.search);
  const qrId = params.get("id");

  if (!qrId) {
    emergencyMessage.textContent = "No se recibió un identificador válido.";
    emergencyMessage.className = "message error";
    return;
  }

  try {
    const publicRef = doc(db, "publicProfiles", qrId);
    const publicSnap = await getDoc(publicRef);

    if (!publicSnap.exists()) {
      emergencyMessage.textContent = "No se encontró la ficha de emergencia.";
      emergencyMessage.className = "message error";
      return;
    }

    const data = publicSnap.data();

    if (!data.visible) {
      emergencyMessage.textContent = "Esta ficha no está disponible públicamente.";
      emergencyMessage.className = "message error";
      return;
    }

    emergencyContent.innerHTML = `
      <div class="emergency-section">
        <h2>${escapeHtml(data.nombre || "")} ${escapeHtml(data.apellido || "")}</h2>
        <p><strong>Cédula:</strong> ${escapeHtml(data.cedula || "No disponible")}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(data.telefono || "No disponible")}</p>
      </div>

      <div class="emergency-section">
        <h3>Contacto de emergencia</h3>
        <p><strong>Nombre:</strong> ${escapeHtml(data.contactoEmergencia || "No disponible")}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(data.telefonoEmergencia || "No disponible")}</p>
        ${
          data.telefonoEmergencia
            ? `<a class="btn" href="tel:${data.telefonoEmergencia}">Llamar al contacto</a>`
            : ""
        }
      </div>

      <div class="emergency-section">
        <h3>Información útil</h3>
        <p><strong>Agrupación Biker:</strong> ${escapeHtml(data.agrupacionBiker || "No disponible")}</p>
        <p><strong>Dirección:</strong> ${escapeHtml(data.direccion || "No disponible")}</p>
        <p><strong>Tipo de sangre:</strong> ${escapeHtml(data.tipoSangre || "No disponible")}</p>
        <p><strong>Alergias:</strong> ${escapeHtml(data.alergias || "No disponible")}</p>
        <p><strong>Observaciones médicas:</strong> ${escapeHtml(data.observacionesMedicas || "No disponible")}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    emergencyMessage.textContent = "Ocurrió un error al consultar la ficha.";
    emergencyMessage.className = "message error";
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}