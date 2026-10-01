const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PUERTO = process.env.PORT || 3000;
const ARCHIVO_MENSAJES = path.join(__dirname, "mensajes.json");

app.use(express.json());
app.use(express.static(__dirname));

function leerMensajes() {
  if (!fs.existsSync(ARCHIVO_MENSAJES)) return [];
  try {
    return JSON.parse(fs.readFileSync(ARCHIVO_MENSAJES, "utf-8"));
  } catch {
    return [];
  }
}

function guardarMensaje(mensaje) {
  const mensajes = leerMensajes();
  mensajes.push(mensaje);
  fs.writeFileSync(ARCHIVO_MENSAJES, JSON.stringify(mensajes, null, 2));
}

app.post("/api/contacto", (req, res) => {
  const { nombre, correo, mensaje } = req.body || {};

  if (!nombre || nombre.trim().length < 2) {
    return res.status(400).json({ mensaje: "El nombre es obligatorio." });
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo || "");
  if (!correoValido) {
    return res.status(400).json({ mensaje: "El correo no es válido." });
  }

  if (!mensaje || mensaje.trim().length < 10) {
    return res.status(400).json({ mensaje: "El mensaje es demasiado corto." });
  }

  guardarMensaje({
    nombre: nombre.trim(),
    correo: correo.trim(),
    mensaje: mensaje.trim(),
    fecha: new Date().toISOString(),
  });

  return res.status(200).json({ mensaje: "¡Gracias! Tu mensaje fue enviado con éxito." });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});