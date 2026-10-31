
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PUERTO = process.env.PORT || 3000;
const ARCHIVO_MENSAJES = path.join(__dirname, "mensajes.json");
const CARPETA_PUBLICA = path.join(__dirname, "public");


const MIN_NOMBRE = 2;
const MAX_NOMBRE = 80;
const MAX_CORREO = 120;
const MIN_MENSAJE = 10;
const MAX_MENSAJE = 1000;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


app.use(express.json());


app.use(express.static(CARPETA_PUBLICA));


const SECCIONES = ["catalogo", "estilos-que-manejamos", "proceso-de-compra", "contactos"];
SECCIONES.forEach((id) => {
  app.get(`/${id}`, (req, res) => res.redirect(`/#${id}`));
});

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

  if (
    typeof nombre !== "string" ||
    nombre.trim().length < MIN_NOMBRE ||
    nombre.trim().length > MAX_NOMBRE
  ) {
    return res
      .status(400)
      .json({ mensaje: `El nombre debe tener entre ${MIN_NOMBRE} y ${MAX_NOMBRE} caracteres.` });
  }

  if (
    typeof correo !== "string" ||
    correo.trim().length > MAX_CORREO ||
    !REGEX_CORREO.test(correo.trim())
  ) {
    return res.status(400).json({ mensaje: "El correo no es válido." });
  }

  if (
    typeof mensaje !== "string" ||
    mensaje.trim().length < MIN_MENSAJE ||
    mensaje.trim().length > MAX_MENSAJE
  ) {
    return res
      .status(400)
      .json({ mensaje: `El mensaje debe tener entre ${MIN_MENSAJE} y ${MAX_MENSAJE} caracteres.` });
  }

  const registro = {
    nombre: nombre.trim(),
    correo: correo.trim(),
    mensaje: mensaje.trim(),
    fecha: new Date().toISOString(),
  };

  try {
    guardarMensaje(registro);
    console.log("Nuevo mensaje de contacto guardado en mensajes.json:");
    console.log(registro);
  } catch (error) {
    console.error("No se pudo guardar el mensaje:", error);
    return res.status(500).json({ mensaje: "No pudimos guardar tu mensaje. Intenta más tarde." });
  }

  return res.status(200).json({ mensaje: "¡Gracias! Tu mensaje fue enviado con éxito." });
});


app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "Los datos enviados no son válidos." });
  }
  next(error);
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
