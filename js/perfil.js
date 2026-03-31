import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const perfilForm = document.getElementById("perfilForm");
  const perfilMessage = document.getElementById("perfilMessage");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "usuarios", user.uid);

    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        document.getElementById("nombre").value = data.nombre || "";
        document.getElementById("apellido").value = data.apellido || "";
        document.getElementById("cedula").value = data.cedula || "";
        document.getElementById("telefono").value = data.telefono || "";
        document.getElementById("contactoEmergencia").value = data.contactoEmergencia || "";
        document.getElementById("telefonoEmergencia").value = data.telefonoEmergencia || "";
        document.getElementById("agrupacionBiker").value = data.agrupacionBiker || "";
        document.getElementById("direccion").value = data.direccion || "";
        document.getElementById("tipoSangre").value = data.tipoSangre || "";
        document.getElementById("alergias").value = data.alergias || "";
        document.getElementById("observacionesMedicas").value = data.observacionesMedicas || "";
      }
    } catch (error) {
      perfilMessage.textContent = "No se pudieron cargar los datos del perfil.";
      perfilMessage.className = "message error";
      console.error(error);
    }

    perfilForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const apellido = document.getElementById("apellido").value.trim();
      const cedula = document.getElementById("cedula").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const contactoEmergencia = document.getElementById("contactoEmergencia").value.trim();
      const telefonoEmergencia = document.getElementById("telefonoEmergencia").value.trim();
      const agrupacionBiker = document.getElementById("agrupacionBiker").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const tipoSangre = document.getElementById("tipoSangre").value.trim();
      const alergias = document.getElementById("alergias").value.trim();
      const observacionesMedicas = document.getElementById("observacionesMedicas").value.trim();

      let qrId = generarQrId(user.uid);

      try {
        const currentSnap = await getDoc(userRef);
        const currentData = currentSnap.exists() ? currentSnap.data() : {};

        if (currentData.qrId) {
          qrId = currentData.qrId;
        }

        await updateDoc(userRef, {
          nombre,
          apellido,
          cedula,
          telefono,
          contactoEmergencia,
          telefonoEmergencia,
          agrupacionBiker,
          direccion,
          tipoSangre,
          alergias,
          observacionesMedicas,
          qrId,
          perfilCompleto: true,
          actualizadoEn: serverTimestamp()
        });

        await setDoc(doc(db, "publicProfiles", qrId), {
          nombre,
          apellido,
          cedula,
          telefono,
          contactoEmergencia,
          telefonoEmergencia,
          agrupacionBiker,
          direccion,
          tipoSangre,
          alergias,
          observacionesMedicas,
          qrId,
          visible: true,
          actualizadoEn: serverTimestamp()
        });

        perfilMessage.textContent = "Perfil guardado correctamente.";
        perfilMessage.className = "message success";
      } catch (error) {
        perfilMessage.textContent = "Error al guardar el perfil.";
        perfilMessage.className = "message error";
        console.error(error);
      }
    });
  });
});

function generarQrId(uid) {
  const base = uid.substring(0, 8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${base}-${random}`;
}