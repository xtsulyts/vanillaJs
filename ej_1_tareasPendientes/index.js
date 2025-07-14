/**
 * Aplicación de Gestión de Tareas
 * 
 * Funcionalidades principales:
 * - Agregar nuevas tareas con texto y fecha
 * - Editar tareas existentes
 * - Marcar tareas como completadas (nueva funcionalidad)
 * - Eliminar tareas
 * - Persistencia en localStorage
 * - Visualización separada de tareas pendientes y completadas
 */

// Inicialización cuando el DOM está cargado
document.addEventListener("DOMContentLoaded", function () {
  mostrarTareas();
});

// ======================
// SELECTORES DEL DOM
// ======================
const formTarea = document.getElementById("form-tarea");
const inputTarea = document.getElementById("input-tarea");
const inputFecha = document.getElementById("input-fecha");
const tareasPendientes = document.getElementById("tareas-pendientes");
const tareasRealizadas = document.getElementById("tareas-realizadas");

// ======================
// VARIABLES GLOBALES
// ======================
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let editando = false;
let idEdicion = null;

// ======================
// MANEJO DE EVENTOS
// ======================

// Evento para enviar el formulario
formTarea.addEventListener("submit", function (e) {
  e.preventDefault();

  const texto = inputTarea.value.trim();
  const fecha = inputFecha.value;

  // Validación básica de campos
  if (!texto || !fecha) {
    alert("Por favor complete todos los campos");
    return;
  }

  if (editando) {
    // Modo edición: Actualizar tarea existente
    const tareaActualizada = {
      texto: texto,
      fecha: fecha,
      completada: false // Mantener el estado original al editar
    };
    actualizarTarea(tareaActualizada, idEdicion);
    editando = false;
    idEdicion = null;
    document.querySelector('button[type="submit"]').textContent = "Agregar tarea";
  } else {
    // Modo creación: Agregar nueva tarea
    const nuevaTarea = {
      id: Date.now(),
      texto: texto,
      fecha: fecha,
      completada: false,
    };
    agregarTarea(nuevaTarea);
  }

  // Limpiar formulario y actualizar vista
  inputTarea.value = "";
  inputFecha.value = "";
  mostrarTareas();
});

// Event delegation para manejar botones en tareas pendientes
tareasPendientes.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  
  if (e.target.classList.contains("eliminar")) {
    eliminarTarea(id);
  } else if (e.target.classList.contains("editar")) {
    editarTarea(id);
  } else if (e.target.classList.contains("completar")) {
    completarTarea(id);
  }
});

// Event delegation para manejar botones en tareas realizadas
tareasRealizadas.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (e.target.classList.contains("eliminar")) {
    eliminarTarea(id);
  }
});

// ======================
// FUNCIONES PRINCIPALES
// ======================

/**
 * Agrega una nueva tarea al listado
 * @param {Object} tarea - Objeto con los datos de la tarea (id, texto, fecha, completada)
 */
function agregarTarea(tarea) {
  tareas.push(tarea);
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

/**
 * Actualiza una tarea existente
 * @param {Object} tareaActualizada - Objeto con los nuevos datos de la tarea
 * @param {number} id - ID de la tarea a actualizar
 */
function actualizarTarea(tareaActualizada, id) {
  tareas = tareas.map(tarea => 
    tarea.id === id ? { ...tarea, ...tareaActualizada } : tarea
  );
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

/**
 * Muestra todas las tareas en la interfaz, separando pendientes y completadas
 */
function mostrarTareas() {
  // Limpiar contenedores antes de renderizar
  tareasPendientes.innerHTML = "<h2>Tareas Pendientes</h2>";
  tareasRealizadas.innerHTML = "<h2>Tareas Completadas</h2>";

  // Filtrar tareas
  const pendientes = tareas.filter(tarea => !tarea.completada);
  const completadas = tareas.filter(tarea => tarea.completada);

  // Mostrar tareas pendientes
  pendientes.forEach(tarea => {
    tareasPendientes.appendChild(crearElementoTarea(tarea, false));
  });

  // Mostrar tareas completadas
  completadas.forEach(tarea => {
    tareasRealizadas.appendChild(crearElementoTarea(tarea, true));
  });
}

/**
 * Crea un elemento HTML para representar una tarea
 * @param {Object} tarea - Objeto con los datos de la tarea
 * @param {boolean} completada - Indica si la tarea está completada
 * @returns {HTMLElement} Elemento DOM que representa la tarea
 */
function crearElementoTarea(tarea, completada) {
  const tareaElement = document.createElement("div");
  tareaElement.className = `tarea-item ${completada ? 'completada' : ''}`;
  
  const botones = completada ? 
    `<button class="eliminar" data-id="${tarea.id}">Eliminar</button>` :
    `<div>
      <button class="editar" data-id="${tarea.id}">Editar</button>
      <button class="eliminar" data-id="${tarea.id}">Eliminar</button>
      <button class="completar" data-id="${tarea.id}">Completar</button>
    </div>`;
  
  tareaElement.innerHTML = `
    <span>${tarea.texto} - ${tarea.fecha}</span>
    ${botones}
  `;
  
  return tareaElement;
}

// ======================
// FUNCIONES AUXILIARES
// ======================

/**
 * Elimina una tarea del listado
 * @param {number} id - ID de la tarea a eliminar
 */
function eliminarTarea(id) {
  tareas = tareas.filter(tarea => tarea.id !== id);
  localStorage.setItem("tareas", JSON.stringify(tareas));
  mostrarTareas();
}

/**
 * Prepara el formulario para editar una tarea existente
 * @param {number} id - ID de la tarea a editar
 */
function editarTarea(id) {
  const tareaAEditar = tareas.find(tarea => tarea.id === id);

  if (tareaAEditar) {
    editando = true;
    idEdicion = id;
    inputTarea.value = tareaAEditar.texto;
    inputFecha.value = tareaAEditar.fecha;
    document.querySelector('button[type="submit"]').textContent = "Guardar Cambios";
  }
}

/**
 * Marca una tarea como completada
 * @param {number} id - ID de la tarea a marcar como completada
 */
function completarTarea(id) {
  tareas = tareas.map(tarea => 
    tarea.id === id ? { ...tarea, completada: true } : tarea
  );
  localStorage.setItem("tareas", JSON.stringify(tareas));
  mostrarTareas();
}