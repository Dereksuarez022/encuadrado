require('dotenv').config();
const express = require("express");
const path = require("path");
const {MongoClient} = require('mongodb');

const app = express();

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri);
let db;

async function conectarDB() {
  try {
    await client.connect();
    db = client.db(process.env.encuadrado_db);
    console.log(" se confirma la conexion con MongoDB Atlas");
  } catch (error) {
    console.error(" ¡Error! No se ha podido conectar con MongoDB Atlas", error);
    process.exit(1);
  }
}

conectarDB();

const PUERTO = process.env.PORT || 3000;
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



app.post("/api/contacto", async (req, res) => {
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
   const resultado = await db.collection('mensajes').insertOne(registro);
   console.log("Nuevo mensaje guardado en MongoDB con ID:", resultado.insertedId); 
  } catch (error) {
    console.error("No se pudo guardar el mensaje en MongoDB:", error);
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
