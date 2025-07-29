/**
 * APLICACIÓN DE GESTIÓN DE TAREAS
 * 
 * Esta aplicación permite al usuario:
 * 1. Agregar nuevas tareas con texto y fecha
 * 2. Editar tareas existentes
 * 3. Marcar tareas como completadas
 * 4. Eliminar tareas
 * 5. Almacenar tareas en el navegador (localStorage)
 * 6. Visualizar tareas pendientes y completadas en secciones separadas
 * 
 * IMPORTANTE: El HTML debe tener dos contenedores:
 *   - tareas-pendientes: Para tareas no completadas
 *   - tareas-realizadas: Para tareas completadas
 * 
 * El flujo principal de la aplicación:
 * - Al cargar la página, se leen las tareas almacenadas
 * - El usuario puede agregar nuevas tareas o editar existentes
 * - Las acciones (completar, eliminar) se gestionan con eventos
 * - El estado se guarda automáticamente en localStorage
 */

// Espera a que todo el HTML esté completamente cargado antes de ejecutar JavaScript
document.addEventListener("DOMContentLoaded", function () {
  mostrarTareas(); // Muestra las tareas almacenadas al cargar la página
});

// ======================
// SELECTORES DEL DOM - Obtenemos referencias a elementos HTML
// ======================
const formTarea = document.getElementById("form-tarea"); // Formulario para agregar/editar tareas
const inputTarea = document.getElementById("input-tarea"); // Campo de texto para la tarea
const inputFecha = document.getElementById("input-fecha"); // Campo para fecha de la tarea

// Contenedores de tareas 
const tareasPendientes = document.getElementById("tareas-pendientes"); // Contenedor de tareas no completadas
const tareasRealizadas = document.getElementById("tareas-realizadas"); // Contenedor de tareas completadas

// ======================
// VARIABLES GLOBALES - Estado de la aplicación
// ======================
let tareas = JSON.parse(localStorage.getItem("tareas")) || []; // Carga tareas desde localStorage o usa array vacío
let editando = false; // Indica si estamos en modo edición
let idEdicion = null; // Almacena el ID de la tarea que se está editando

// ======================
// MANEJO DE EVENTOS - Cómo responde la aplicación a las acciones del usuario
// ======================

// Evento al enviar el formulario (agregar o editar tarea)
formTarea.addEventListener("submit", function (e) {
  e.preventDefault(); // Previene el comportamiento por defecto (recargar página)

  // Elemento para mostrar mensajes de error
  const errorElement = document.getElementById("error-message");
  errorElement.classList.add("hidden"); // Oculta mensajes de error anteriores
  
  // Obtenemos y limpiamos los valores de los campos
  const texto = inputTarea.value.trim(); // Elimina espacios en blanco al inicio/final
  const fecha = inputFecha.value; // Valor del campo fecha

  // Validación: ambos campos son obligatorios
  if (!texto || !fecha) {
    errorElement.classList.remove("hidden"); // Muestra mensaje de error
    return; // Detiene la ejecución
  }
  
  // MODO EDICIÓN: Actualizar tarea existente
  if (editando) {  
    // Creamos objeto con datos actualizados
    const tareaActualizada = {
      texto: texto,
      fecha: fecha,
      completada: false // Mantiene el estado original
    };
    
    actualizarTarea(tareaActualizada, idEdicion); // Actualiza la tarea
    editando = false; // Desactiva modo edición
    idEdicion = null; // Resetea ID de edición
    // Cambia el texto del botón a "Agregar tarea"
    document.querySelector('button[type="submit"]').textContent = "Agregar tarea";
  } else {
    // MODO AGREGAR: Crear nueva tarea
    // Objeto con datos de la nueva tarea
    const nuevaTarea = {
      id: Date.now(), // ID único basado en la hora actual
      texto: texto,
      fecha: fecha,
      completada: false, // Por defecto no completada
    };
    
    agregarTarea(nuevaTarea); // Agrega la tarea
  }

  // Limpia los campos del formulario
  inputTarea.value = "";
  inputFecha.value = "";
  
  mostrarTareas(); // Actualiza la visualización de tareas
});

// Evento para botones en tareas pendientes (usando delegación de eventos)
tareasPendientes.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id); // Obtiene ID de la tarea desde atributo data-id

  // Determina qué botón se presionó
  if (e.target.classList.contains("eliminar")) {
    eliminarTarea(id);
  } else if (e.target.classList.contains("editar")) {
    editarTarea(id);
  } else if (e.target.classList.contains("completar")) {
    completarTarea(id);
  }
});

// Evento para botones en tareas completadas
tareasRealizadas.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (e.target.classList.contains("eliminar")) {
    eliminarTarea(id); // Solo eliminar está disponible en tareas completadas
  }
});

// ======================
// FUNCIONES PRINCIPALES - Lógica central de la aplicación
// ======================

/**
 * Agrega una nueva tarea al listado
 * @param {Object} tarea - Objeto con datos de la tarea {id, texto, fecha, completada}
 */
function agregarTarea(tarea) {
  tareas.push(tarea); // Añade la tarea al array
  localStorage.setItem("tareas", JSON.stringify(tareas)); // Guarda en localStorage
}

/**
 * Actualiza una tarea existente
 * @param {Object} tareaActualizada - Nuevos datos para la tarea
 * @param {number} id - ID de la tarea a actualizar
 */
function actualizarTarea(tareaActualizada, id) {
  // Busca la tarea por ID y actualiza sus propiedades
  tareas = tareas.map(tarea => 
    tarea.id === id 
      ? { ...tarea, ...tareaActualizada } // Fusiona propiedades antiguas y nuevas
      : tarea // Mantiene las demás tareas sin cambios
  );
  localStorage.setItem("tareas", JSON.stringify(tareas)); // Guarda cambios
}

/**
 * Muestra todas las tareas en la interfaz
 * Separa tareas pendientes y completadas en contenedores diferentes
 */
function mostrarTareas() {
  // Función interna para vaciar un contenedor
  function limpiarContenedor(contenedor) {
    // Elimina todos los hijos del contenedor
    while (contenedor.firstChild) {
      contenedor.removeChild(contenedor.firstChild);
    }
  }

  // Limpia los contenedores de tareas (¡IMPORTANTE!)
  limpiarContenedor(tareasPendientes);
  limpiarContenedor(tareasRealizadas);

  // Crea y añade títulos a las secciones
  const tituloPendientes = document.createElement("h2");
  tituloPendientes.textContent = "Tareas Pendientes";
  tareasPendientes.appendChild(tituloPendientes);

  const tituloCompletadas = document.createElement("h2");
  tituloCompletadas.textContent = "Tareas Completadas";
  tareasRealizadas.appendChild(tituloCompletadas);

  // Filtra tareas no completadas
  const pendientes = tareas.filter(tarea => !tarea.completada);
  // Filtra tareas completadas
  const completadas = tareas.filter(tarea => tarea.completada);

  // Agrega tareas pendientes a su contenedor
  pendientes.forEach(tarea => {
    tareasPendientes.appendChild(crearElementoTarea(tarea, false));
  });

  // Agrega tareas completadas a su contenedor
  completadas.forEach(tarea => {
    tareasRealizadas.appendChild(crearElementoTarea(tarea, true));
  });
}

/**
 * Crea un elemento HTML para representar una tarea
 * @param {Object} tarea - Datos de la tarea
 * @param {boolean} completada - Indica si la tarea está completada
 * @returns {HTMLElement} Elemento DOM que representa la tarea
 */
function crearElementoTarea(tarea, completada) {
  // Crea contenedor principal para la tarea
  const tareaElement = document.createElement("div");
  // Asigna clases CSS: 'tarea-item' siempre y 'completada' si está completada
  tareaElement.className = `tarea-item ${completada ? 'completada' : ''}`;

  // Crea elemento para mostrar texto y fecha
  const textoElement = document.createElement("span");
  textoElement.textContent = `${tarea.texto} - ${tarea.fecha}`; // Formato: "Texto - Fecha"
  tareaElement.appendChild(textoElement); // Añade al contenedor

  // Tareas pendientes muestran más opciones
  if (!completada) {
    // Contenedor para agrupar botones
    const botonesContainer = document.createElement("div");

    // Botón Editar
    const editarBtn = document.createElement("button");
    editarBtn.textContent = "Editar";
    editarBtn.className = "editar";
    editarBtn.dataset.id = tarea.id; // Almacena ID en atributo data-id
    botonesContainer.appendChild(editarBtn);

    // Botón Eliminar
    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.className = "eliminar";
    eliminarBtn.dataset.id = tarea.id;
    botonesContainer.appendChild(eliminarBtn);

    // Botón Completar
    const completarBtn = document.createElement("button");
    completarBtn.textContent = "Completar";
    completarBtn.className = "completar";
    completarBtn.dataset.id = tarea.id;
    botonesContainer.appendChild(completarBtn);

    tareaElement.appendChild(botonesContainer); // Añade grupo de botones
  } else {
    // Tareas completadas solo muestran botón Eliminar
    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.className = "eliminar";
    eliminarBtn.dataset.id = tarea.id;
    tareaElement.appendChild(eliminarBtn); // Añade directamente
  }

  return tareaElement; // Retorna el elemento completo
}

// ======================
// FUNCIONES AUXILIARES - Operaciones específicas
// ======================

/**
 * Elimina una tarea por su ID
 * @param {number} id - ID de la tarea a eliminar
 */
function eliminarTarea(id) {
  // Filtra el array manteniendo solo tareas con ID diferente
  tareas = tareas.filter(tarea => tarea.id !== id);
  localStorage.setItem("tareas", JSON.stringify(tareas)); // Guarda cambios
  mostrarTareas(); // Actualiza interfaz
}

/**
 * Prepara el formulario para editar una tarea
 * @param {number} id - ID de la tarea a editar
 */
function editarTarea(id) {
  // Busca la tarea en el array por ID
  const tareaAEditar = tareas.find(tarea => tarea.id === id);

  if (tareaAEditar) {
    editando = true; // Activa modo edición
    idEdicion = id; // Almacena ID de tarea
    
    // Rellena formulario con datos existentes
    inputTarea.value = tareaAEditar.texto;
    inputFecha.value = tareaAEditar.fecha;
    
    // Cambia texto del botón de submit
    document.querySelector('button[type="submit"]').textContent = "Guardar Cambios";
  }
}

/**
 * Marca una tarea como completada
 * @param {number} id - ID de la tarea a completar
 */
function completarTarea(id) {
  // Actualiza solo la tarea específica
  tareas = tareas.map(tarea =>
    tarea.id === id 
      ? { ...tarea, completada: true } // Copia propiedades y cambia 'completada'
      : tarea // Mantiene otras tareas igual
  );
  localStorage.setItem("tareas", JSON.stringify(tareas)); // Guarda cambios
  mostrarTareas(); // Actualiza interfaz
}