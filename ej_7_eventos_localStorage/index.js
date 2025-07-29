/**
 * ===========================================================
 * GESTOR DE TAREAS CON LOCALSTORAGE
 * ===========================================================
 * 
 * Esta aplicación demuestra cómo implementar operaciones CRUD
 * (Crear, Leer, Actualizar, Eliminar) usando:
 * - localStorage para persistencia de datos
 * - DOM para mostrar y manipular la interfaz
 * - CSS Grid para diseño responsivo
 */

/* 
 * -----------------------------------------------------------
 * 1. CONSTANTES Y REFERENCIAS A ELEMENTOS DEL DOM
 * -----------------------------------------------------------
 * 
 * Primero, obtenemos referencias a todos los elementos HTML
 * con los que necesitamos interactuar.
 */

// Elementos del formulario para crear tareas
const formularioTarea = document.getElementById('formulario-tarea');
const inputTitulo = document.getElementById('titulo-tarea');
const inputDescripcion = document.getElementById('descripcion-tarea');
const selectPrioridad = document.getElementById('prioridad-tarea');

// Elementos del formulario para editar tareas
const formularioEditar = document.getElementById('formulario-editar');
const panelEditar = document.getElementById('panel-editar');
const inputIdEditar = document.getElementById('id-editar');
const inputTituloEditar = document.getElementById('titulo-editar');
const inputDescripcionEditar = document.getElementById('descripcion-editar');
const selectPrioridadEditar = document.getElementById('prioridad-editar');
const botonCancelarEdicion = document.getElementById('boton-cancelar-edicion');

// Elementos de la lista de tareas
const listaTareas = document.getElementById('lista-tareas');
const filtroPrioridad = document.getElementById('filtro-prioridad');

// Contadores
const contadorTotal = document.getElementById('contador-total');
const contadorAlta = document.getElementById('contador-alta');
const contadorMedia = document.getElementById('contador-media');
const contadorBaja = document.getElementById('contador-baja');

// Clave para almacenar las tareas en localStorage
const CLAVE_TAREAS = 'tareasApp';

/* 
 * -----------------------------------------------------------
 * 2. FUNCIONES PRINCIPALES DE CRUD
 * -----------------------------------------------------------
 * 
 * Implementamos las operaciones básicas para gestionar tareas:
 * - Crear (Create)
 * - Leer (Read)
 * - Actualizar (Update)
 * - Eliminar (Delete)
 */

/**
 * Obtiene todas las tareas desde localStorage
 * @returns {Array} Lista de tareas
 */
function obtenerTareas() {
    // Obtener datos de localStorage
    const tareasString = localStorage.getItem(CLAVE_TAREAS);
    
    // Convertir de JSON a array de JavaScript
    // Si no hay datos, retornar un array vacío
    return tareasString ? JSON.parse(tareasString) : [];
}

/**
 * Guarda todas las tareas en localStorage
 * @param {Array} tareas - Lista de tareas a guardar
 */
function guardarTareas(tareas) {
    // Convertir el array a formato JSON
    const tareasString = JSON.stringify(tareas);
    
    // Guardar en localStorage
    localStorage.setItem(CLAVE_TAREAS, tareasString);
    
    // Actualizar los contadores
    actualizarContadores(tareas);
}

/**
 * Agrega una nueva tarea
 * @param {Object} tarea - Objeto con los datos de la tarea
 */
function agregarTarea(tarea) {
    // Obtener tareas existentes
    const tareas = obtenerTareas();
    
    // Generar un ID único basado en la fecha actual
    tarea.id = Date.now().toString();
    
    // Agregar la nueva tarea al inicio del array
    tareas.unshift(tarea);
    
    // Guardar las tareas actualizadas
    guardarTareas(tareas);
    
    // Volver a renderizar las tareas
    renderizarTareas();
}

/**
 * Actualiza una tarea existente
 * @param {string} id - ID de la tarea a actualizar
 * @param {Object} datosActualizados - Nuevos datos para la tarea
 */
function actualizarTarea(id, datosActualizados) {
    // Obtener tareas existentes
    const tareas = obtenerTareas();
    
    // Encontrar el índice de la tarea con el ID especificado
    const indice = tareas.findIndex(tarea => tarea.id === id);
    
    // Si se encontró la tarea, actualizarla
    if (indice !== -1) {
        // Combinar los datos existentes con las actualizaciones
        tareas[indice] = { ...tareas[indice], ...datosActualizados };
        
        // Guardar las tareas actualizadas
        guardarTareas(tareas);
        
        // Volver a renderizar las tareas
        renderizarTareas();
    }
}

/**
 * Elimina una tarea
 * @param {string} id - ID de la tarea a eliminar
 */
function eliminarTarea(id) {
    // Obtener tareas existentes
    const tareas = obtenerTareas();
    
    // Filtrar las tareas, excluyendo la que tiene el ID especificado
    const tareasActualizadas = tareas.filter(tarea => tarea.id !== id);
    
    // Guardar las tareas actualizadas
    guardarTareas(tareasActualizadas);
    
    // Volver a renderizar las tareas
    renderizarTareas();
}

/* 
 * -----------------------------------------------------------
 * 3. FUNCIONES DE INTERFAZ DE USUARIO
 * -----------------------------------------------------------
 * 
 * Funciones para manejar la visualización y la interacción
 * con el usuario.
 */

/**
 * Renderiza todas las tareas en el DOM
 */
function renderizarTareas() {
    // Obtener tareas y filtro actual
    const tareas = obtenerTareas();
    const filtro = filtroPrioridad.value;
    
    // Filtrar tareas según la prioridad seleccionada
    const tareasFiltradas = filtro === 'todas' 
        ? tareas 
        : tareas.filter(tarea => tarea.prioridad === filtro);
    
    // Limpiar el contenedor de tareas
    listaTareas.innerHTML = '';
    
    // Si no hay tareas, mostrar un mensaje
    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = '<p class="sin-tareas">No hay tareas para mostrar.</p>';
        return;
    }
    
    // Crear elementos para cada tarea y agregarlos al DOM
    tareasFiltradas.forEach(tarea => {
        const elemento = crearElementoTarea(tarea);
        listaTareas.appendChild(elemento);
    });
}

/**
 * Crea un elemento DOM para representar una tarea
 * @param {Object} tarea - Datos de la tarea
 * @returns {HTMLElement} Elemento DOM de la tarea
 */
function crearElementoTarea(tarea) {
    // Crear el contenedor principal
    const tarjeta = document.createElement('div');
    tarjeta.className = `tarjeta-tarea ${tarea.prioridad}`;
    tarjeta.dataset.id = tarea.id;
    
    // Crear el contenido HTML de la tarjeta
    tarjeta.innerHTML = `
        <h3>${tarea.titulo}</h3>
        <p>${tarea.descripcion || 'Sin descripción'}</p>
        <div class="info-tarea">
            <span class="etiqueta-prioridad ${tarea.prioridad}">${tarea.prioridad.toUpperCase()}</span>
        </div>
        <div class="acciones-tarea">
            <button class="boton-accion boton-editar">Editar</button>
            <button class="boton-accion boton-eliminar">Eliminar</button>
        </div>
    `;
    
    // Agregar eventos a los botones
    const botonEditar = tarjeta.querySelector('.boton-editar');
    const botonEliminar = tarjeta.querySelector('.boton-eliminar');
    
    botonEditar.addEventListener('click', () => prepararEdicion(tarea));
    botonEliminar.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            eliminarTarea(tarea.id);
        }
    });
    
    return tarjeta;
}

/**
 * Prepara el formulario de edición con los datos de una tarea
 * @param {Object} tarea - Tarea a editar
 */
function prepararEdicion(tarea) {
    // Llenar el formulario de edición con los datos de la tarea
    inputIdEditar.value = tarea.id;
    inputTituloEditar.value = tarea.titulo;
    inputDescripcionEditar.value = tarea.descripcion || '';
    selectPrioridadEditar.value = tarea.prioridad;
    
    // Mostrar el panel de edición
    panelEditar.style.display = 'block';
    
    // Desplazarse al panel de edición
    panelEditar.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Actualiza los contadores de tareas
 * @param {Array} tareas - Lista de tareas
 */
function actualizarContadores(tareas) {
    contadorTotal.textContent = tareas.length;
    contadorAlta.textContent = tareas.filter(t => t.prioridad === 'alta').length;
    contadorMedia.textContent = tareas.filter(t => t.prioridad === 'media').length;
    contadorBaja.textContent = tareas.filter(t => t.prioridad === 'baja').length;
}

/* 
 * -----------------------------------------------------------
 * 4. MANEJADORES DE EVENTOS
 * -----------------------------------------------------------
 * 
 * Configuramos los eventos para los formularios y elementos
 */

// Evento para crear una nueva tarea
formularioTarea.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    // Crear objeto con datos de la tarea
    const nuevaTarea = {
        titulo: inputTitulo.value,
        descripcion: inputDescripcion.value,
        prioridad: selectPrioridad.value
    };
    
    // Agregar la tarea
    agregarTarea(nuevaTarea);
    
    // Resetear el formulario
    this.reset();
    
    // Enfocar el campo de título
    inputTitulo.focus();
});

// Evento para guardar cambios al editar una tarea
formularioEditar.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    // Crear objeto con datos actualizados
    const datosActualizados = {
        titulo: inputTituloEditar.value,
        descripcion: inputDescripcionEditar.value,
        prioridad: selectPrioridadEditar.value
    };
    
    // Actualizar la tarea
    actualizarTarea(inputIdEditar.value, datosActualizados);
    
    // Ocultar el panel de edición
    panelEditar.style.display = 'none';
    
    // Resetear el formulario
    this.reset();
});

// Evento para cancelar la edición
botonCancelarEdicion.addEventListener('click', function() {
    // Ocultar el panel de edición
    panelEditar.style.display = 'none';
    
    // Resetear el formulario
    formularioEditar.reset();
});

// Evento para filtrar tareas por prioridad
filtroPrioridad.addEventListener('change', renderizarTareas);

/* 
 * -----------------------------------------------------------
 * 5. INICIALIZACIÓN
 * -----------------------------------------------------------
 * 
 * Configuración inicial cuando la página se carga.
 */

// Al cargar la página, renderizar las tareas y actualizar contadores
document.addEventListener('DOMContentLoaded', function() {
    const tareas = obtenerTareas();
    renderizarTareas();
    actualizarContadores(tareas);
});