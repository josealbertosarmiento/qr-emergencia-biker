import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("userEmail");

  // REGISTRO
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();
      const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
      const message = document.getElementById("registerMessage");

      message.textContent = "";

      if (password !== confirmPassword) {
        message.textContent = "Las contraseñas no coinciden.";
        message.className = "message error";
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "usuarios", user.uid), {
          email: user.email,
          creadoEn: serverTimestamp(),
          perfilCompleto: false
        });

        message.textContent = "Cuenta creada correctamente. Redirigiendo...";
        message.className = "message success";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1200);

      } catch (error) {
        message.textContent = traducirErrorFirebase(error.code);
        message.className = "message error";
      }
    });
  }

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const message = document.getElementById("loginMessage");

      message.textContent = "";

      try {
        await signInWithEmailAndPassword(auth, email, password);

        message.textContent = "Ingreso correcto. Redirigiendo...";
        message.className = "message success";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);

      } catch (error) {
        message.textContent = traducirErrorFirebase(error.code);
        message.className = "message error";
      }
    });
  }

  // LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        alert("No se pudo cerrar sesión.");
      }
    });
  }

  // ESTADO DE SESIÓN
  onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop();

    const publicPages = ["", "index.html", "login.html", "registro.html"];

    if (user) {
      if (userEmail) {
        userEmail.textContent = `Sesión activa: ${user.email}`;
      }

      if (currentPage === "login.html" || currentPage === "registro.html") {
        window.location.href = "dashboard.html";
      }
    } else {
      const isPublic = publicPages.includes(currentPage);
      if (!isPublic) {
        window.location.href = "login.html";
      }
    }
  });
});

function traducirErrorFirebase(code) {
  const errores = {
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde."
  };

  return errores[code] || `Error: ${code}`;
}