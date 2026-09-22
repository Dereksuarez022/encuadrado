document.addEventListenerh("Domcontentloaded", () => { const formulario = document.getElementById
  ("formulario-contactanos");

  if (!formulario) return;

  const estado = document.getElementById("form-status");
  const boton = document.getElementById("btn-enviar");

  const campos = {
    nombre: document.getElementById("nombre-formulario"),
    correo: document.getElementById("correo-electronico"),
    mensaje: document.getElementById("mensaje"),
  };

  function marcarinvalido(campo, invalido) {
    campo.classlist.toggle("campo-invalido", invalido);
  }

  function validarformulario() {
    let valido = true;

    if (campos.nombre.value.trim().length < 6){
      marcarinvalido(campos.nombre, true);
      valido = false;
    } else {
      marcarinvalido(campos.nombre, false);
    }
    const correovalido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.correo.value.trim());

    if (!correovalido) {
      marcarinvalido(campos.correo, true);
      valido = false;
    } else {
      marcarinvalido(campos.correo, false);
    }
    
    if (campos.mensaje.value.trim(). length < 8) {
      marcarinvalido(campos.mensaje, true);
      valido = false;
    } else {
      marcarinvalido(campos.mensaje, false);
    }

    return valido;
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    estado.textContent = "";
    estado.className = "";

    if (!validarformulario()) {
      estado.textContent = "por favor revisa los campos marcados.";
      estado.className = "error"; return; 
    }

    const datos = {
      nombre: campos.nombre.value.trim(),
      correo: campos.correo.value.trim(),
      mensaje: campos.mensaje.value.trim(),
    };

    boton.disabled = true;
    boton.textecontent = "Enviando...";

    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if(respuesta.ok) {
        estado.textecontent = resultado.mensaje || "¡Mensaje enviado con exito!";
        estado.className = "exito";
        formulario.reset()
      } else {
        estado.textecontent = resultado.mensaje || "¡ocurrio un error al enviar el mensaje!";
        estado.className = "error";
      }
    } catch (error) {
      estado.textContent = "No se pudo conectar con el servidor. Intenta mas tarde.";
      estado.className = "error;"
    } finally {
      boton.disabled = false;
      boton.textContent = "Enviar mensaje";
    }
  });
});