/**
 * ===========================================================
 * REPASO DE EVENTOS EN JAVASCRIPT - EJEMPLO INTERACTIVO
 * ===========================================================
 * 
 * Código JavaScript para manejar los eventos 
 * 
 */

/* 
 * -----------------------------------------------------------
 * 1. OBTENER REFERENCIAS A ELEMENTOS DEL DOM
 * -----------------------------------------------------------
 * 
 * Primero, obtenemos referencias a los elementos HTML con los que 
 * vamos a interactuar. Usamos document.getElementById y
 * funciones para encontrar los elementos por su ID.
 */

// Salidas para mostrar información de eventos
const salidaRaton = document.getElementById('salida-raton');
const salidaTeclado = document.getElementById('salida-teclado');
const salidaFormulario = document.getElementById('salida-formulario');
const salidaOtros = document.getElementById('salida-otros');

// Elementos de formulario y entrada
const entradaTeclado = document.getElementById('entrada-teclado');
const cajaTeclado = document.getElementById('caja-teclado');
const formularioPrueba = document.getElementById('formulario-prueba');

// Elementos para desplazamiento y tamaño de ventana
const areaDesplazable = document.getElementById('area-desplazable');
const tamanoVentana = document.getElementById('tamano-ventana');
const posicionDesplazamiento = document.getElementById('posicion-desplazamiento');
const estadoCarga = document.getElementById('estado-carga');

/* 
 * -----------------------------------------------------------
 * 2. EVENTOS DE RATÓN
 * -----------------------------------------------------------
 * 
 * Configuramos los eventos relacionados con el ratón.
 * Cada botón tiene un evento asociado que se dispara cuando
 * interactuamos con él.
 */

// Evento para el botón de clic simple
document.getElementById('boton-clic').addEventListener('click', () => {
    registrarEvento(salidaRaton, 'Evento: click (clic simple)');
    resaltarElemento(salidaRaton);
});

// Evento para el botón de doble clic
document.getElementById('boton-doble-clic').addEventListener('dblclick', () => {
    registrarEvento(salidaRaton, 'Evento: doubleclick (doble clic)');
    resaltarElemento(salidaRaton);
});

// Evento para el botón de clic derecho (context menu)
document.getElementById('boton-clic-derecho').addEventListener('contextmenu', (evento) => {
    evento.preventDefault(); // Evita el menú contextual del navegador
    registrarEvento(salidaRaton, 'Evento: contextmenu (clic derecho)');
    resaltarElemento(salidaRaton);
});

// Eventos para el área flotante (mouseover y mouseout)
const areaFlotante = document.querySelector('.area-flotante');
areaFlotante.addEventListener('mouseover', () => {
    registrarEvento(salidaRaton, 'Evento: mouseover (ratón sobre el elemento)');
    areaFlotante.style.backgroundColor = '#bbdefb';
});

areaFlotante.addEventListener('mouseout', () => {
    registrarEvento(salidaRaton, 'Evento: mouseout (ratón fuera del elemento)');
    areaFlotante.style.backgroundColor = '#e3f2fd';
});

// Evento para el botón de mouseout (solo para demostración)
document.getElementById('boton-raton-fuera').addEventListener('click', () => {
    registrarEvento(salidaRaton, 'Botón Mouse Out clickeado');
    resaltarElemento(salidaRaton);
});

/* 
 * -----------------------------------------------------------
 * 3. EVENTOS DE TECLADO
 * -----------------------------------------------------------
 * 
 * Configurar eventos para capturar las pulsaciones del teclado
 * en el campo de entrada de texto.
 */

// Evento cuando se presiona una tecla
entradaTeclado.addEventListener('keydown', (evento) => {
    registrarEvento(salidaTeclado, `Evento: keydown - Tecla: ${evento.key} (Código: ${evento.code})`);
    cajaTeclado.textContent = `Tecla presionada: ${evento.key}`;
    cajaTeclado.style.backgroundColor = '#e74c3c';
});

// Evento cuando se suelta una tecla
entradaTeclado.addEventListener('keyup', (evento) => {
    registrarEvento(salidaTeclado, `Evento: keyup - Tecla: ${evento.key}`);
    cajaTeclado.style.backgroundColor = '#2ecc71';
    
    // Restaurar después de 500 milisegundos
    setTimeout(() => {
        cajaTeclado.style.backgroundColor = '#2c3e50';
        cajaTeclado.textContent = 'Presiona cualquier tecla';
    }, 500);
});

// Evento cuando se presiona una tecla que produce un carácter
entradaTeclado.addEventListener('keypress', (evento) => {
    registrarEvento(salidaTeclado, `Evento: keypress - Carácter: ${evento.key}`);
});

// Evento cuando cambia el valor del campo de entrada
entradaTeclado.addEventListener('input', (evento) => {
    registrarEvento(salidaTeclado, `Evento: input - Valor: ${evento.target.value}`);
});

/* 
 * -----------------------------------------------------------
 * 4. EVENTOS DE FORMULARIO
 * -----------------------------------------------------------
 * 
 * Configur eventos para manejar la interacción con el formulario,
 * incluyendo envío, reset, y cambios en campos individuales.
 */

// Evento cuando se envía el formulario
formularioPrueba.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Evita que el formulario se envíe normalmente
    registrarEvento(salidaFormulario, 'Evento: submit - Formulario enviado');
    resaltarElemento(salidaFormulario);
    
    // Recopilar datos del formulario
    const datosFormulario = new FormData(formularioPrueba);
    let informacionFormulario = "Datos del formulario:\n";
    
    // Recorrer todos los campos del formulario
    for (let [clave, valor] of datosFormulario.entries()) {
        informacionFormulario += `${clave}: ${valor}\n`;
    }
    
    // Mostrar los datos del formulario
    registrarEvento(salidaFormulario, informacionFormulario);
});

// Evento cuando se resetea el formulario
formularioPrueba.addEventListener('reset', () => {
    registrarEvento(salidaFormulario, 'Evento: reset - Formulario restablecido');
    resaltarElemento(salidaFormulario);
});

// Eventos para el campo de nombre
document.getElementById('nombre').addEventListener('focus', () => {
    registrarEvento(salidaFormulario, 'Evento: focus - Campo Nombre (recibe foco)');
});

document.getElementById('nombre').addEventListener('blur', () => {
    registrarEvento(salidaFormulario, 'Evento: blur - Campo Nombre (pierde foco)');
});

// Evento cuando cambia el campo de email
document.getElementById('email').addEventListener('change', (evento) => {
    registrarEvento(salidaFormulario, `Evento: change - Email: ${evento.target.value}`);
});

// Evento cuando cambia la selección de país
document.getElementById('pais').addEventListener('change', (evento) => {
    const textoSeleccionado = evento.target.options[evento.target.selectedIndex].text;
    registrarEvento(salidaFormulario, `Evento: change - País seleccionado: ${textoSeleccionado}`);
});

// Evento cuando cambia el estado de la suscripción
document.getElementById('suscripcion').addEventListener('change', (evento) => {
    const estado = evento.target.checked ? 'suscrito' : 'no suscrito';
    registrarEvento(salidaFormulario, `Evento: change - Newsletter: ${estado}`);
});

/* 
 * -----------------------------------------------------------
 * 5. OTROS EVENTOS
 * -----------------------------------------------------------
 * 
 * Configurar eventos varios como carga, redimensionamiento y scroll.
 */

// Evento para simular carga
document.getElementById('boton-carga').addEventListener('click', () => {
    registrarEvento(salidaOtros, 'Simulando evento de carga...');
    estadoCarga.textContent = 'Cargado!';
    estadoCarga.style.color = '#2ecc71';
    resaltarElemento(salidaOtros);
});

// Evento cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    actualizarTamanoVentana();
});

// Evento de desplazamiento en el área desplazable
areaDesplazable.addEventListener('scroll', () => {
    posicionDesplazamiento.textContent = `${areaDesplazable.scrollTop}px`;
});

// Evento para simular redimensión
document.getElementById('boton-redimensionar').addEventListener('click', () => {
    registrarEvento(salidaOtros, 'Simulando redimensión...');
    window.dispatchEvent(new Event('resize'));
});

// Evento para desplazarse en el área
document.getElementById('boton-desplazar').addEventListener('click', () => {
    areaDesplazable.scrollTo({
        top: 300,
        behavior: 'smooth' // Desplazamiento suave
    });
});

/* 
 * -----------------------------------------------------------
 * 6. FUNCIONES DE UTILIDAD
 * -----------------------------------------------------------
 * 
 * Funciones auxiliares que usamos en varios lugares del código.
 */

/**
 * Registra un evento en un elemento de salida
 * @param {HTMLElement} elementoSalida - Elemento donde se mostrará el evento
 * @param {string} mensaje - Mensaje descriptivo del evento
 */
function registrarEvento(elementoSalida, mensaje) {
    // Crear una marca de tiempo legible
    const marcaTiempo = new Date().toLocaleTimeString();
    
    // Crear un nuevo elemento para el registro del evento
    const registroEvento = document.createElement('div');
    registroEvento.className = 'registro-evento';
    registroEvento.textContent = `[${marcaTiempo}] ${mensaje}`;
    
    // Añadir el registro al principio del elemento de salida
    elementoSalida.prepend(registroEvento);
    
    // Mantener solo los últimos 5 eventos
    if (elementoSalida.children.length > 5) {
        elementoSalida.removeChild(elementoSalida.lastChild);
    }
}

/**
 * Resalta un elemento temporalmente
 * @param {HTMLElement} elemento - Elemento a resaltar
 */
function resaltarElemento(elemento) {
    // Añadir la clase de resaltado
    elemento.classList.add('resaltar');
    
    // Quitar la clase después de 1 segundo
    setTimeout(() => {
        elemento.classList.remove('resaltar');
    }, 1000);
}

/**
 * Actualiza la información del tamaño de la ventana
 */
function actualizarTamanoVentana() {
    tamanoVentana.textContent = `${window.innerWidth} × ${window.innerHeight}`;
}

/* 
 * -----------------------------------------------------------
 * 7. INICIALIZACIÓN
 * -----------------------------------------------------------
 * 
 * Configuración inicial cuando la página se carga.
 */

// Actualizar el tamaño de la ventana al cargar
actualizarTamanoVentana();

// Mensajes iniciales en cada panel
registrarEvento(salidaRaton, 'Sistema listo. Prueba los eventos de ratón.');
registrarEvento(salidaTeclado, 'Sistema listo. Escribe en el campo de texto.');
registrarEvento(salidaFormulario, 'Sistema listo. Interactúa con el formulario.');
registrarEvento(salidaOtros, 'Sistema listo. Prueba los otros eventos.');