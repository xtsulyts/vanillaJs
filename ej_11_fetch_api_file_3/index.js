
// ==============================================
// 1. REFERENCIAS A ELEMENTOS DEL DOM
// ==============================================
const entradaArchivo = document.getElementById('entradaArchivo');
const zonaArrastre = document.getElementById('zonaArrastre');
const infoArchivo = document.getElementById('infoArchivo');
const botonSubir = document.getElementById('botonSubir');
const respuestaServidor = document.getElementById('respuestaServidor');
const imagenPrevia = document.getElementById('imagenPrevia');
const mensajeEstado = document.getElementById('mensajeEstado');
const galeriaImagenes = document.getElementById('galeriaImagenes');

// ==============================================
// 2. CONSTANTES PARA INDEXEDDB
// ==============================================
const NOMBRE_BD = 'archivosDB';
const NOMBRE_ALMACEN = 'archivos';
let bd = null; // Variable para la base de datos

// ==============================================
// 3. FUNCIONES PARA MANEJAR ARCHIVOS
// ==============================================

/**
 * Actualiza la información del archivo seleccionado en la interfaz
 * @param {File} archivo - Archivo seleccionado por el usuario
 */
function actualizarInfoArchivo(archivo) {
    // Mostrar información básica del archivo
    infoArchivo.innerHTML = `
        <p><strong>Nombre:</strong> ${archivo.name}</p>
        <p><strong>Tamaño:</strong> ${(archivo.size / 1024).toFixed(2)} KB</p>
        <p><strong>Tipo:</strong> ${archivo.type || 'Desconocido'}</p>
    `;
    
    // Habilitar el botón de subir
    botonSubir.disabled = false;
    
    // Mostrar mensaje de estado
    mostrarEstado('Archivo seleccionado. Haz clic en "Subir Archivo" para continuar.', 'exito');
    
    // Si es una imagen, mostrar vista previa
    if (archivo.type.startsWith('image/')) {
        const lector = new FileReader();
        lector.onload = (evento) => {
            imagenPrevia.src = evento.target.result;
            imagenPrevia.style.display = 'block';
        };
        lector.readAsDataURL(archivo);
    } 
    // Si es un PDF, mostrar un indicador especial
    else if (archivo.type === 'application/pdf') {
        imagenPrevia.style.display = 'none';
        infoArchivo.innerHTML += '<div class="archivo-pdf">PDF</div>';
    } 
    // Para otros tipos de archivo, ocultar vista previa
    else {
        imagenPrevia.style.display = 'none';
    }
}

/**
 * Muestra un mensaje de estado en la interfaz
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo de mensaje ('exito' o 'error')
 */
function mostrarEstado(mensaje, tipo) {
    mensajeEstado.textContent = mensaje;
    mensajeEstado.className = `mensaje-estado ${tipo}`;
}

// ==============================================
// 4. EVENTOS PARA LA SELECCIÓN DE ARCHIVOS
// ==============================================

// Click en el área de subida
zonaArrastre.addEventListener('click', () => {
    entradaArchivo.click();
});

// Cambio en el input de archivo
entradaArchivo.addEventListener('change', (evento) => {
    if (evento.target.files.length > 0) {
        actualizarInfoArchivo(evento.target.files[0]);
    }
});

// Eventos para arrastrar y soltar
zonaArrastre.addEventListener('dragover', (evento) => {
    evento.preventDefault();
    zonaArrastre.style.backgroundColor = '#e0e8ff';
});

zonaArrastre.addEventListener('dragleave', () => {
    zonaArrastre.style.backgroundColor = '#f8f9fe';
});

zonaArrastre.addEventListener('drop', (evento) => {
    evento.preventDefault();
    zonaArrastre.style.backgroundColor = '#f8f9fe';
    
    if (evento.dataTransfer.files.length > 0) {
        entradaArchivo.files = evento.dataTransfer.files;
        actualizarInfoArchivo(evento.dataTransfer.files[0]);
    }
});

// ==============================================
// 5. FUNCIONES PARA INDEXEDDB
// ==============================================

/**
 * Inicializa la base de datos IndexedDB
 * @returns {Promise} - Promesa que se resuelve cuando la BD está lista
 */
function inicializarBD() {
    return new Promise((resolver, rechazar) => {
        // Solicitar apertura de la base de datos
        const solicitud = indexedDB.open(NOMBRE_BD, 1);
        
        // Configuración inicial si la BD no existe
        solicitud.onupgradeneeded = (evento) => {
            bd = evento.target.result;
            // Crear almacén de objetos si no existe
            if (!bd.objectStoreNames.contains(NOMBRE_ALMACEN)) {
                bd.createObjectStore(NOMBRE_ALMACEN, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
            }
        };
        
        // Éxito al abrir la BD
        solicitud.onsuccess = (evento) => {
            bd = evento.target.result;
            resolver(bd);
        };
        
        // Error al abrir la BD
        solicitud.onerror = (evento) => {
            rechazar(`Error al abrir la base de datos: ${evento.target.error}`);
        };
    });
}

/**
 * Guarda un archivo en IndexedDB
 * @param {File} archivo - Archivo a guardar
 * @param {string} base64 - Datos en base64
 * @returns {Promise<number>} - ID del registro guardado
 */
function guardarArchivoEnBD(archivo, base64) {
    return new Promise((resolver, rechazar) => {
        // Iniciar transacción de escritura
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readwrite');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        // Crear objeto con datos del archivo
        const datosArchivo = {
            nombre: archivo.name,
            tipo: archivo.type,
            tamaño: archivo.size,
            datos: base64,
            fecha: new Date().toISOString()
        };
        
        // Solicitar guardado
        const solicitud = almacen.add(datosArchivo);
        
        solicitud.onsuccess = () => resolver(solicitud.result);
        solicitud.onerror = () => rechazar(solicitud.error);
    });
}

/**
 * Recupera todos los archivos de IndexedDB
 * @returns {Promise<Array>} - Lista de archivos guardados
 */
function obtenerArchivosDeBD() {
    return new Promise((resolver, rechazar) => {
        // Iniciar transacción de lectura
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readonly');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        // Obtener todos los registros
        const solicitud = almacen.getAll();
        
        solicitud.onsuccess = () => resolver(solicitud.result || []);
        solicitud.onerror = () => rechazar(solicitud.error);
    });
}

/**
 * Elimina un archivo de IndexedDB
 * @param {number} id - ID del archivo a eliminar
 * @returns {Promise} - Promesa que se resuelve al eliminar
 */
function eliminarArchivoDeBD(id) {
    return new Promise((resolver, rechazar) => {
        // Iniciar transacción de escritura
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readwrite');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        // Solicitar eliminación
        const solicitud = almacen.delete(id);
        
        solicitud.onsuccess = () => resolver();
        solicitud.onerror = () => rechazar(solicitud.error);
    });
}

// ==============================================
// 6. FUNCIONES PARA LA GALERÍA
// ==============================================

/**
 * Carga la galería de archivos desde IndexedDB
 */
async function cargarGaleria() {
    try {
        // Obtener archivos de la BD
        const archivos = await obtenerArchivosDeBD();
        galeriaImagenes.innerHTML = '';
        
        // Mensaje si no hay archivos
        if (archivos.length === 0) {
            galeriaImagenes.innerHTML = '<p>No hay archivos guardados aún. Sube tu primer archivo.</p>';
            return;
        }
        
        // Crear elementos para cada archivo
        archivos.forEach(archivo => {
            const elemento = document.createElement('div');
            elemento.className = 'elemento-galeria';
            
            // Mostrar imagen o indicador de PDF
            if (archivo.tipo.startsWith('image/')) {
                elemento.innerHTML = `
                    <img src="data:${archivo.tipo};base64,${archivo.datos}" alt="${archivo.nombre}">
                    <p>${archivo.nombre}</p>
                    <p>${new Date(archivo.fecha).toLocaleString()}</p>
                    <button class="boton-eliminar" data-id="${archivo.id}">Eliminar</button>
                `;
            } else {
                elemento.innerHTML = `
                    <div class="archivo-pdf">PDF</div>
                    <p>${archivo.nombre}</p>
                    <p>${new Date(archivo.fecha).toLocaleString()}</p>
                    <button class="boton-eliminar" data-id="${archivo.id}">Eliminar</button>
                `;
            }
            
            galeriaImagenes.appendChild(elemento);
        });
        
        // Añadir eventos de eliminación
        document.querySelectorAll('.boton-eliminar').forEach(boton => {
            boton.addEventListener('click', async () => {
                const id = parseInt(boton.getAttribute('data-id'));
                await eliminarArchivoDeBD(id);
                await cargarGaleria();
                mostrarEstado('Archivo eliminado correctamente', 'exito');
            });
        });
    } catch (error) {
        console.error('Error al cargar la galería:', error);
        mostrarEstado('Error al cargar la galería de archivos', 'error');
    }
}

// ==============================================
// 7. FUNCIÓN DE SUBIDA DE ARCHIVOS
// ==============================================

/**
 * Sube el archivo a httpbin.org y guarda la respuesta en IndexedDB
 */
async function subirArchivo() {
    // Verificar si se seleccionó un archivo
    if (!entradaArchivo.files[0]) {
        mostrarEstado('Error: No has seleccionado ningún archivo', 'error');
        return;
    }
    
    const archivo = entradaArchivo.files[0];
    mostrarEstado('Subiendo archivo...', 'exito');
    respuestaServidor.textContent = 'Subiendo archivo...';
    botonSubir.disabled = true;
    
    try {
        // Validar tamaño (máximo 5MB)
        if (archivo.size > 5 * 1024 * 1024) {
            throw new Error('El archivo es demasiado grande (máximo 5MB)');
        }
        
        // Crear FormData para enviar el archivo
        const datosFormulario = new FormData();
        datosFormulario.append('archivo', archivo);
        
        // Enviar el archivo al servidor de prueba
        const respuesta = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: datosFormulario
        });
        
        // Verificar si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        // Procesar la respuesta del servidor
        const datos = await respuesta.json();
        
        // Mostrar la respuesta del servidor
        respuestaServidor.textContent = JSON.stringify(datos, null, 2);
        
        // Extraer los datos en base64 de la respuesta
        const datosBase64 = datos.files.archivo;
        
        // Guardar el archivo en IndexedDB
        const idArchivo = await guardarArchivoEnBD(archivo, datosBase64);
        
        // Mostrar mensaje de éxito
        mostrarEstado(`✅ Archivo subido correctamente (ID: ${idArchivo})`, 'exito');
        
        // Recargar la galería
        await cargarGaleria();
        
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        respuestaServidor.textContent = `❌ Error: ${error.message}`;
        mostrarEstado(`❌ Error: ${error.message}`, 'error');
    } finally {
        botonSubir.disabled = false;
    }
}

// Evento para el botón de subir
botonSubir.addEventListener('click', subirArchivo);

// ==============================================
// 8. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar la base de datos
        await inicializarBD();
        
        // Cargar la galería de archivos
        await cargarGaleria();
        
        // Mostrar mensaje de bienvenida
        mostrarEstado('Selecciona un archivo para subir', 'exito');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        mostrarEstado(`Error inicial: ${error.message}`, 'error');
    }
});
