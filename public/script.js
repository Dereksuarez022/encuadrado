

const MIN_NOMBRE = 2;
const MIN_MENSAJE = 10;
const MAX_MENSAJE = 1000;

// ---------- Menú para celulares ----------
function iniciarMenu() {
  const boton = document.getElementById("btn-menu");
  const menu = document.getElementById("menu-enlaces");

  boton.addEventListener("click", () => {
    // classList.toggle pone la clase si no está y la quita si está.
    // Devuelve true si la clase quedó puesta.
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto);
  });

  // Al tocar un enlace, el menú se cierra
  menu.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      menu.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- Buscador y filtros ----------

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function iniciarFiltros() {
  const buscador = document.getElementById("buscador");
  const botones = document.querySelectorAll(".btn-filtro");
  const secciones = document.querySelectorAll(".cuadros");
  const sinResultados = document.getElementById("sin-resultados");

  let categoriaActual = "todas";
  let textoBuscado = "";

  function aplicarFiltros() {
    let totalVisibles = 0;

    secciones.forEach((seccion) => {
      const coincideCategoria =
        categoriaActual === "todas" || seccion.id === categoriaActual;
      let visiblesEnSeccion = 0;

      seccion.querySelectorAll("article").forEach((tarjeta) => {
        // Buscamos solo en el título y en la ficha (no en los botones)
        const titulo = tarjeta.querySelector(".titulo-cuadro").textContent;
        const ficha = tarjeta.querySelector("ul").textContent;
        const coincideTexto = normalizar(titulo + " " + ficha).includes(textoBuscado);

        const mostrar = coincideCategoria && coincideTexto;
        tarjeta.hidden = !mostrar;
        if (mostrar) visiblesEnSeccion++;
      });

      // Si una sección se quedó sin cuadros, se oculta completa
      seccion.hidden = visiblesEnSeccion === 0;
      totalVisibles += visiblesEnSeccion;
    });

    sinResultados.hidden = totalVisibles > 0;
  }

  buscador.addEventListener("input", () => {
    textoBuscado = normalizar(buscador.value.trim());
    aplicarFiltros();
  });

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      categoriaActual = boton.dataset.categoria; // lee data-categoria="..."
      botones.forEach((b) => b.classList.toggle("activo", b === boton));
      aplicarFiltros();
    });
  });
}

// ---------- Ventana para ver el cuadro en grande (lightbox) ----------
function iniciarLightbox() {
  const ventana = document.getElementById("lightbox");
  const imagen = document.getElementById("lightbox-img");
  const info = document.getElementById("lightbox-info");

  function abrirDetalle(tarjeta) {
    const foto = tarjeta.querySelector("img");
    imagen.src = foto.src;
    imagen.alt = foto.alt;

    const titulo = document.createElement("h2");
    titulo.textContent = tarjeta.querySelector(".titulo-cuadro").textContent;
    const ficha = tarjeta.querySelector("ul").cloneNode(true); 

    info.replaceChildren(titulo, ficha); 
    ventana.showModal();
  }

  
  document.addEventListener("click", (evento) => {
    const clicEnBotonVer = evento.target.closest(".btn-ver");
    const clicEnImagen = evento.target.closest(".galeria-grid img");

    if (clicEnBotonVer || clicEnImagen) {
      abrirDetalle(evento.target.closest("article"));
    }
  });
}

// ---------- Cierre de ventanas (lightbox y carrito) ----------
function iniciarCierreDeVentanas() {

  document.querySelectorAll("[data-cerrar]").forEach((boton) => {
    boton.addEventListener("click", () => boton.closest("dialog").close());
  });

  
  document.querySelectorAll("dialog").forEach((ventana) => {
    ventana.addEventListener("click", (evento) => {
      if (evento.target === ventana) ventana.close();
    });
  });
}

// ---------- Carrito de compras ----------
function iniciarCarrito() {
  const CLAVE = "encuadrado-carrito";
  const ventana = document.getElementById("carrito");
  const contador = document.getElementById("carrito-contador");
  const lista = document.getElementById("carrito-lista");
  const textoVacio = document.getElementById("carrito-vacio");
  const acciones = document.getElementById("carrito-acciones");
  const mensaje = document.getElementById("mensaje");

  
  let carrito = cargarCarrito();

  function cargarCarrito() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch {
      return [];
    }
  }

  function guardarCarrito() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(carrito));
    } catch {
      
    }
  }

  function dibujarCarrito() {
    const totalUnidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.textContent = totalUnidades;

    lista.replaceChildren(); 
    carrito.forEach((item) => {
      const fila = document.createElement("li");

      const nombre = document.createElement("span");
      nombre.textContent = `${item.titulo} (x${item.cantidad})`;

      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.className = "btn";
      quitar.textContent = "Quitar";
      quitar.addEventListener("click", () => {
        carrito = carrito.filter((otro) => otro.titulo !== item.titulo);
        guardarCarrito();
        dibujarCarrito();
      });

      fila.append(nombre, quitar);
      lista.append(fila);
    });

    const hayProductos = carrito.length > 0;
    textoVacio.hidden = hayProductos;
    acciones.hidden = !hayProductos;
  }

  function agregar(titulo) {
    const existente = carrito.find((item) => item.titulo === titulo);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ titulo, cantidad: 1 });
    }
    guardarCarrito();
    dibujarCarrito();
  }

  // Botones "Agregar al carrito" de las tarjetas
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-agregar");
    if (!boton) return;

    const titulo = boton.closest("article").querySelector(".titulo-cuadro").textContent;
    agregar(titulo);

    // Aviso corto en el mismo botón
    boton.textContent = "¡Agregado!";
    setTimeout(() => (boton.textContent = "Agregar al carrito"), 1000);
  });

  document.getElementById("btn-carrito").addEventListener("click", () => ventana.showModal());

  document.getElementById("btn-vaciar").addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    dibujarCarrito();
  });

  // Copia el pedido al formulario de contacto
  document.getElementById("btn-pedido").addEventListener("click", () => {
    const lineas = carrito.map((item) => `- ${item.titulo} (x${item.cantidad})`);
    const texto = "Hola, quiero pedir estos cuadros:\n" + lineas.join("\n");

    mensaje.value = texto.slice(0, MAX_MENSAJE);
    mensaje.dispatchEvent(new Event("input")); // avisa al contador de caracteres

    ventana.close();
    document.getElementById("contactos").scrollIntoView();
    mensaje.focus();
  });

  dibujarCarrito(); // dibuja el carrito guardado al cargar la página
}

// ---------- Botón "volver arriba" ----------
function iniciarBotonArriba() {
  const boton = document.getElementById("btn-arriba");

  window.addEventListener("scroll", () => {
    boton.hidden = window.scrollY < 300; // solo aparece si bajaste un poco
  });

  boton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------- Formulario de contacto ----------
function iniciarFormulario() {
  const formulario = document.getElementById("formulario-contactanos");
  if (!formulario) return;

  const estado = document.getElementById("form-status");
  const boton = document.getElementById("btn-enviar");
  const contador = document.getElementById("contador-mensaje");

  const campos = {
    nombre: document.getElementById("nombre-formulario"),
    correo: document.getElementById("correo-electronico"),
    mensaje: document.getElementById("mensaje"),
  };

  function marcarInvalido(campo, invalido) {
    campo.classList.toggle("campo-invalido", invalido);
  }

  function validarFormulario() {
    const nombreValido = campos.nombre.value.trim().length >= MIN_NOMBRE;
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.correo.value.trim());
    const mensajeValido = campos.mensaje.value.trim().length >= MIN_MENSAJE;

    marcarInvalido(campos.nombre, !nombreValido);
    marcarInvalido(campos.correo, !correoValido);
    marcarInvalido(campos.mensaje, !mensajeValido);

    return nombreValido && correoValido && mensajeValido;
  }

  // Contador "0 / 1000"
  campos.mensaje.addEventListener("input", () => {
    contador.textContent = `${campos.mensaje.value.length} / ${MAX_MENSAJE}`;
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // evita que la página se recargue
    estado.textContent = "";
    estado.className = "";

    if (!validarFormulario()) {
      estado.textContent = "Por favor, revisa los campos marcados.";
      estado.className = "error";
      return;
    }

    const datos = {
      nombre: campos.nombre.value.trim(),
      correo: campos.correo.value.trim(),
      mensaje: campos.mensaje.value.trim(),
    };

    boton.disabled = true;
    boton.textContent = "Enviando...";

    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        estado.textContent = resultado.mensaje || "¡Mensaje enviado con éxito!";
        estado.className = "exito";
        formulario.reset();
        contador.textContent = `0 / ${MAX_MENSAJE}`;
      } else {
        estado.textContent = resultado.mensaje || "Ocurrió un error al enviar el mensaje.";
        estado.className = "error";
      }
    } catch (error) {
      estado.textContent = "No se pudo conectar con el servidor. Intenta más tarde.";
      estado.className = "error";
    } finally {
    
      boton.disabled = false;
      boton.textContent = "Enviar mensaje";
    }
  });
}

// ---------- Arranque ----------
document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();
  iniciarFiltros();
  iniciarLightbox();
  iniciarCierreDeVentanas();
  iniciarCarrito();
  iniciarBotonArriba();
  iniciarFormulario();
});
