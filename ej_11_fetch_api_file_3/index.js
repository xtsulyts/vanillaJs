
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
 * Actualiza la información del archivo seleccionado en la interfaz de usuario.
 * Muestra detalles del archivo, habilita el botón de subida, muestra un mensaje de estado
 * y genera una vista previa para imágenes o un indicador especial para PDFs.
 * 
 * @param {File} archivo - Objeto File representando el archivo seleccionado por el usuario
 */
function actualizarInfoArchivo(archivo) {
    /* 
    SECCIÓN 1: MOSTRAR INFORMACIÓN BÁSICA DEL ARCHIVO
    Actualiza el elemento HTML que muestra la información del archivo con:
    - Nombre original del archivo
    - Tamaño convertido a KB (con 2 decimales)
    - Tipo MIME del archivo o 'Desconocido' si no está disponible
    */
    infoArchivo.innerHTML = `
        <p><strong>Nombre:</strong> ${archivo.name}</p>
        <p><strong>Tamaño:</strong> ${(archivo.size / 1024).toFixed(2)} KB</p>
        <p><strong>Tipo:</strong> ${archivo.type || 'Desconocido'}</p>
    `;
    
    /* 
    SECCIÓN 2: HABILITAR BOTÓN DE SUBIDA
    Desbloquea el botón para permitir que el usuario inicie la subida del archivo
    */
    botonSubir.disabled = false;
    
    /* 
    SECCIÓN 3: MOSTRAR MENSAJE DE ESTADO
    Muestra un mensaje de confirmación al usuario indicando que el archivo está listo para subir
    - 'exito' probablemente aplica un estilo visual específico (como color verde)
    */
    mostrarEstado('Archivo seleccionado. Haz clic en "Subir Archivo" para continuar.', 'exito');
    
    /* 
    SECCIÓN 4: MANEJO DE VISTAS PREVIAS SEGÚN TIPO DE ARCHIVO
    Diferentes tratamientos para imágenes, PDFs y otros tipos de archivos
    */
    // Caso 4.1: Es una imagen (detectado por el tipo MIME)
    if (archivo.type.startsWith('image/')) {
        // Crear un lector de archivos para convertir a Data URL
        const lector = new FileReader();
        
        // Definir qué hacer cuando la lectura se complete exitosamente
        lector.onload = (evento) => {
            // Asignar el resultado (base64) al src de la imagen de vista previa
            imagenPrevia.src = evento.target.result;
            // Hacer visible el contenedor de la vista previa
            imagenPrevia.style.display = 'block';
        };
        
        // Iniciar la lectura del archivo como URL de datos (base64)
        lector.readAsDataURL(archivo);
    } 
    // Caso 4.2: Es un archivo PDF (tipo MIME específico)
    else if (archivo.type === 'application/pdf') {
        // Ocultar contenedor de vista previa de imágenes
        imagenPrevia.style.display = 'none';
        
        // Añadir un elemento visual identificador para PDFs
        infoArchivo.innerHTML += '<div class="archivo-pdf">PDF</div>';
    } 
    // Caso 4.3: Otros tipos de archivo (documentos, audio, etc.)
    else {
        // Asegurarse de ocultar el contenedor de vista previa
        imagenPrevia.style.display = 'none';
    }
}

/**
 * Muestra un mensaje de estado en la interfaz de usuario con estilo visual acorde al tipo de mensaje.
 * Actualiza tanto el texto como los estilos CSS del elemento de mensaje para proporcionar feedback claro al usuario.
 * 
 * @param {string} mensaje - Texto descriptivo que se mostrará al usuario
 * @param {string} tipo - Clasificación del mensaje que determina su estilo visual ('exito' o 'error')
 */
function mostrarEstado(mensaje, tipo) {
    /*
    SECCIÓN 1: ACTUALIZACIÓN DEL CONTENIDO TEXTUAL
    Asigna el mensaje recibido como parámetro al contenido de texto del elemento.
    - textContent asegura que cualquier HTML sea tratado como texto plano (evita inyección de código)
    */
    mensajeEstado.textContent = mensaje;
    
    /*
    SECCIÓN 2: APLICACIÓN DE ESTILOS VISUALES
    Actualiza las clases CSS del elemento para reflejar el tipo de mensaje:
    1. Mantiene la clase base 'mensaje-estado' para estilos comunes
    2. Añade una clase específica según el tipo recibido (ej: 'exito' o 'error')
    3. Esto permite:
        - Cambios de color (ej: verde para éxito, rojo para error)
        - Iconos diferenciados
        - Efectos de animación
        - Otras propiedades CSS según el diseño
    */
    mensajeEstado.className = `mensaje-estado ${tipo}`;
    
    /*
    NOTAS ADICIONALES:
    - La variable 'mensajeEstado' debe ser un elemento HTML previamente obtenido (ej: mediante getElementById)
    - Los valores válidos para 'tipo' deberían estar definidos en el CSS (ej: .exito y .error)
    - Usar className reemplaza todas las clases anteriores (en lugar de classList.add que añadiría)
    - Plantillas de cadena (backticks ``) permiten interpolación de variables de forma limpia
    */
}

// ==============================================
// 4. EVENTOS PARA LA SELECCIÓN DE ARCHIVOS
// ==============================================
// Esta sección configura los diferentes métodos de interacción 
// para que los usuarios puedan seleccionar archivos:
// - Clic tradicional en el área designada
// - Selección mediante el cuadro de diálogo del sistema
// - Arrastrar y soltar (drag and drop)

/* 
 * Evento: Clic en el área de arrastre
 * Propósito: Activar el input de archivo oculto cuando el usuario hace clic en la zona visible.
 *   Esto mejora la usabilidad al hacer que toda el área sea clickeable en lugar de solo el pequeño input.
 */
zonaArrastre.addEventListener('click', () => {
    // Simular clic en el input de tipo file (oculto visualmente)
    entradaArchivo.click();
});

/* 
 * Evento: Cambio en el input de archivo
 * Propósito: Capturar el archivo seleccionado por el usuario a través del cuadro de diálogo del sistema.
 *   Se activa cuando el usuario selecciona uno o más archivos.
 */
entradaArchivo.addEventListener('change', (evento) => {
    // Verificar que se haya seleccionado al menos un archivo
    if (evento.target.files.length > 0) {
        // Obtener el primer archivo del array de archivos seleccionados
        const archivoSeleccionado = evento.target.files[0];
        // Actualizar la interfaz con la información del archivo
        actualizarInfoArchivo(archivoSeleccionado);
    }
});

// ==============================================
// Eventos para arrastrar y soltar (Drag and Drop)
// ==============================================
// Estos eventos permiten una experiencia moderna donde los usuarios pueden 
// arrastrar archivos directamente desde su explorador de archivos al área designada.

/* 
 * Evento: 'dragover' (arrastrar sobre la zona)
 * Propósito: Preparar el área para recibir archivos y dar feedback visual.
 *   Se activa cuando un archivo se arrastra sobre el área designada.
 */
zonaArrastre.addEventListener('dragover', (evento) => {
    // Prevenir el comportamiento predeterminado (que sería abrir el archivo)
    evento.preventDefault();
    // Cambiar el color de fondo para indicar que es un área válida para soltar
    zonaArrastre.style.backgroundColor = '#e0e8ff';  // Color azul claro de feedback
});

/* 
 * Evento: 'dragleave' (salir de la zona de arrastre)
 * Propósito: Restaurar el estilo original cuando el archivo arrastrado sale del área.
 */
zonaArrastre.addEventListener('dragleave', () => {
    // Restaurar el color de fondo original
    zonaArrastre.style.backgroundColor = '#f8f9fe';  // Color original del área
});

/* 
 * Evento: 'drop' (soltar en la zona)
 * Propósito: Manejar los archivos cuando el usuario los suelta en el área designada.
 *   Esta es la acción final del proceso de arrastrar y soltar.
 */
zonaArrastre.addEventListener('drop', (evento) => {
    // Prevenir el comportamiento predeterminado (evitar que el navegador abra el archivo)
    evento.preventDefault();
    // Restaurar el color de fondo al estado original
    zonaArrastre.style.backgroundColor = '#f8f9fe';
    
    // Verificar que se hayan soltado uno o más archivos
    if (evento.dataTransfer.files.length > 0) {
        // Opción 1: Asignar los archivos al input (solución moderna)
        // entradaArchivo.files = evento.dataTransfer.files;
        
        // Opción 2: Solución compatible con todos los navegadores
        // Obtener el primer archivo del objeto dataTransfer
        const archivoSoltado = evento.dataTransfer.files[0];
        
        // Actualizar la interfaz con el archivo soltado
        actualizarInfoArchivo(archivoSoltado);
        
        // Actualizar el input de archivo (si es necesario para el envío del formulario)
        // Esto requiere crear un nuevo DataTransfer object
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(archivoSoltado);
        entradaArchivo.files = dataTransfer.files;
    }
});

// ==============================================
// 5. FUNCIONES PARA INDEXEDDB
// ==============================================
// Este grupo de funciones maneja todas las operaciones con IndexedDB:
// - Creación e inicialización de la base de datos
// - Almacenamiento de archivos como datos base64
// - Recuperación de archivos almacenados
// - Eliminación de registros

/* CONSTANTES IMPORTANTES (asumidas como definidas previamente):
   NOMBRE_BD: Nombre de la base de datos (ej: 'almacenArchivosDB')
   NOMBRE_ALMACEN: Nombre del almacén de objetos (ej: 'archivos')
   bd: Variable global que almacena la referencia a la base de datos abierta
*/

/**
 * Inicializa la base de datos IndexedDB y prepara la estructura necesaria
 * @returns {Promise} - Promesa que se resuelve con la instancia de BD cuando está lista
 */
function inicializarBD() {
    return new Promise((resolver, rechazar) => {
        // Solicitar apertura de la base de datos con versión 1
        const solicitud = indexedDB.open(NOMBRE_BD, 1);
        
        /* 
        EVENTO: onupgradeneeded
        Propósito: Ejecuta la lógica de inicialización cuando:
        1. La BD no existe y se crea por primera vez
        2. Se incrementa el número de versión
        */
        solicitud.onupgradeneeded = (evento) => {
            // Obtener referencia a la nueva base de datos
            bd = evento.target.result;
            
            /*
            Crear almacén de objetos (equivalente a una tabla en SQL)
            Solo se ejecuta si el almacén no existe previamente
            */
            if (!bd.objectStoreNames.contains(NOMBRE_ALMACEN)) {
                // Crear nuevo almacén con configuración específica
                bd.createObjectStore(NOMBRE_ALMACEN, { 
                    keyPath: 'id',              // Campo clave único
                    autoIncrement: true          // Generar IDs automáticamente
                });
                /*
                Nota: Podrían añadirse índices aquí para búsquedas:
                almacen.createIndex('nombre_idx', 'nombre', { unique: false });
                */
            }
        };
        
        /* 
        EVENTO: onsuccess
        Propósito: Manejar apertura exitosa de la base de datos
        */
        solicitud.onsuccess = (evento) => {
            // Almacenar referencia a la BD en variable global
            bd = evento.target.result;
            // Resolver la promesa con la instancia de BD
            resolver(bd);
        };
        
        /* 
        EVENTO: onerror
        Propósito: Manejar errores durante la apertura de la BD
        */
        solicitud.onerror = (evento) => {
            // Rechazar la promesa con el mensaje de error
            rechazar(`Error al abrir la base de datos: ${evento.target.error}`);
        };
    });
}

/**
 * Guarda un archivo en IndexedDB convirtiéndolo a base64
 * @param {File} archivo - Objeto File del archivo a guardar
 * @param {string} base64 - Representación en base64 del archivo
 * @returns {Promise<number>} - Promesa que resuelve con el ID asignado al registro
 */
function guardarArchivoEnBD(archivo, base64) {
    return new Promise((resolver, rechazar) => {
        /*
        Crear transacción de escritura:
        - Especificar el almacén afectado
        - 'readwrite' permite operaciones de escritura
        */
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readwrite');
        // Obtener referencia al almacén de objetos
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        /*
        Preparar objeto con metadatos y datos del archivo:
        - Incluye información descriptiva y los datos binarios en base64
        - La fecha se almacena en formato ISO para ordenamiento consistente
        */
        const datosArchivo = {
            nombre: archivo.name,            // Nombre original
            tipo: archivo.type,              // MIME type (ej: 'image/jpeg')
            tamaño: archivo.size,            // Tamaño en bytes
            datos: base64,                  // Datos codificados en base64
            fecha: new Date().toISOString()  // Fecha/hora en formato estándar
        };
        
        // Iniciar operación de almacenamiento
        const solicitud = almacen.add(datosArchivo);
        
        // Manejar resultado exitoso
        solicitud.onsuccess = () => {
            // Resolver con el ID autogenerado (clave primaria)
            resolver(solicitud.result);
        };
        
        // Manejar errores
        solicitud.onerror = () => {
            rechazar(solicitud.error);
        };
    });
}

/**
 * Recupera todos los archivos almacenados en IndexedDB
 * @returns {Promise<Array>} - Promesa que resuelve con array de registros
 */
function obtenerArchivosDeBD() {
    return new Promise((resolver, rechazar) => {
        // Crear transacción de solo lectura (mejor rendimiento)
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readonly');
        // Obtener referencia al almacén
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        /*
        Obtener todos los registros:
        - getAll() recupera todos los objetos del almacén
        - Alternativa: openCursor() para grandes volúmenes de datos
        */
        const solicitud = almacen.getAll();
        
        // Manejar resultado exitoso
        solicitud.onsuccess = () => {
            // Resolver con array de resultados (o array vacío si no hay datos)
            resolver(solicitud.result || []);
        };
        
        // Manejar errores
        solicitud.onerror = () => {
            rechazar(solicitud.error);
        };
    });
}

/**
 * Elimina un archivo específico de IndexedDB usando su ID
 * @param {number} id - ID del registro a eliminar
 * @returns {Promise} - Promesa que se resuelve al completar la eliminación
 */
function eliminarArchivoDeBD(id) {
    return new Promise((resolver, rechazar) => {
        // Crear transacción de escritura
        const transaccion = bd.transaction([NOMBRE_ALMACEN], 'readwrite');
        // Obtener referencia al almacén
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        
        // Ejecutar operación de eliminación
        const solicitud = almacen.delete(id);
        
        // Manejar eliminación exitosa
        solicitud.onsuccess = () => {
            resolver();
        };
        
        // Manejar errores
        solicitud.onerror = () => {
            rechazar(solicitud.error);
        };
    });
}

// ==============================================
// 6. FUNCIONES PARA LA GALERÍA
// ==============================================
// Esta sección maneja la visualización de archivos almacenados en IndexedDB
// y proporciona funcionalidad para eliminarlos. Crea una interfaz de galería
// con representación visual adecuada para cada tipo de archivo.

/**
 * Carga y muestra todos los archivos almacenados en IndexedDB en la galería
 * Actualiza dinámicamente la interfaz y maneja tanto imágenes como PDFs
 * 
 * Flujo:
 * 1. Obtiene archivos de IndexedDB
 * 2. Limpia la galería existente
 * 3. Muestra mensaje si no hay archivos
 * 4. Crea elementos visuales para cada archivo
 * 5. Añade funcionalidad de eliminación
 * 6. Maneja errores con mensajes al usuario
 */
async function cargarGaleria() {
    try {
        /* 
        PASO 1: OBTENER ARCHIVOS DESDE INDEXEDDB
        Usa la función definida previamente que devuelve una promesa con los archivos
        */
        const archivos = await obtenerArchivosDeBD();
        
        /* 
        PASO 2: LIMPIAR CONTENEDOR DE GALERÍA
        Elimina cualquier contenido previo para evitar duplicados
        */
        galeriaImagenes.innerHTML = '';
        
        /* 
        PASO 3: MANEJAR CASO SIN ARCHIVOS
        Muestra un mensaje amigable si no hay archivos almacenados
        */
        if (archivos.length === 0) {
            galeriaImagenes.innerHTML = '<p>No hay archivos guardados aún. Sube tu primer archivo.</p>';
            return; // Termina la ejecución tempranamente
        }
        
        /* 
        PASO 4: CREAR ELEMENTOS VISUALES PARA CADA ARCHIVO
        Itera sobre cada archivo recuperado y crea su representación visual
        */
        archivos.forEach(archivo => {
            // Crear contenedor principal para el elemento de galería
            const elemento = document.createElement('div');
            elemento.className = 'elemento-galeria'; // Clase para estilos CSS
            
            /* 
            SUBCASO 4.1: ARCHIVO DE IMAGEN
            - Muestra una vista previa usando data URI en base64
            - Mantiene el tipo MIME original para correcta visualización
            */
            if (archivo.tipo && archivo.tipo.startsWith('image/')) {
                elemento.innerHTML = `
                    <img src="data:${archivo.tipo};base64,${archivo.datos}" 
                         alt="${archivo.nombre}" 
                         class="vista-previa">
                    <p>${archivo.nombre}</p>
                    <p>${new Date(archivo.fecha).toLocaleString()}</p>
                    <button class="boton-eliminar" data-id="${archivo.id}">
                        Eliminar
                    </button>
                `;
            } 
            /* 
            SUBCASO 4.2: ARCHIVO PDF U OTROS TIPOS
            - Muestra un marcador genérico para PDFs
            - Podría extenderse para otros tipos (audio, video, documentos)
            */
            else {
                elemento.innerHTML = `
                    <div class="archivo-pdf">PDF</div>
                    <p>${archivo.nombre}</p>
                    <p>${new Date(archivo.fecha).toLocaleString()}</p>
                    <button class="boton-eliminar" data-id="${archivo.id}">
                        Eliminar
                    </button>
                `;
            }
            
            // Añadir el elemento completo al contenedor de la galería
            galeriaImagenes.appendChild(elemento);
        });
        
        /* 
        PASO 5: CONFIGURAR EVENTOS DE ELIMINACIÓN
        Añade listeners a todos los botones de eliminar creados dinámicamente
        */
        document.querySelectorAll('.boton-eliminar').forEach(boton => {
            boton.addEventListener('click', async () => {
                // Obtener el ID del archivo desde el atributo data-id
                const id = parseInt(boton.getAttribute('data-id'));
                
                try {
                    /* 
                    SUBPASO 5.1: ELIMINAR DE INDEXEDDB
                    Usa la función de eliminación definida previamente
                    */
                    await eliminarArchivoDeBD(id);
                    
                    /* 
                    SUBPASO 5.2: RECARGAR LA GALERÍA
                    Actualiza la vista para reflejar los cambios
                    */
                    await cargarGaleria();
                    
                    /* 
                    SUBPASO 5.3: MOSTRAR FEEDBACK AL USUARIO
                    Confirma que la eliminación fue exitosa
                    */
                    mostrarEstado('Archivo eliminado correctamente', 'exito');
                } catch (error) {
                    // Manejo de errores implícito en el catch general
                }
            });
        });
        
    } catch (error) {
        /* 
        PASO 6: MANEJO DE ERRORES
        Captura cualquier error ocurrido durante el proceso y:
        - Registra detalles en consola para depuración
        - Informa al usuario con un mensaje claro
        */
        console.error('Error al cargar la galería:', error);
        mostrarEstado('Error al cargar la galería de archivos', 'error');
    }
}

// ==============================================
// 7. FUNCIÓN DE SUBIDA DE ARCHIVOS
// ==============================================
// Esta función maneja todo el proceso de subida de archivos:
// 1. Validaciones previas
// 2. Comunicación con el servidor
// 3. Procesamiento de respuestas
// 4. Almacenamiento local
// 5. Actualización de la interfaz

/**
 * Maneja la subida del archivo a un servidor de prueba y guarda los datos en IndexedDB
 * 
 * Flujo principal:
 * - Verifica selección de archivo
 * - Muestra estados de progreso
 * - Valida tamaño máximo
 * - Sube el archivo usando FormData y Fetch API
 * - Procesa la respuesta
 * - Guarda en IndexedDB
 * - Actualiza la galería
 * - Maneja errores
 */
async function subirArchivo() {
    /* 
    PASO 1: VERIFICACIÓN DE ARCHIVO SELECCIONADO
    Comprueba si el usuario ha seleccionado un archivo antes de intentar subirlo
    */
    if (!entradaArchivo.files[0]) {
        mostrarEstado('Error: No has seleccionado ningún archivo', 'error');
        return; // Termina la ejecución si no hay archivo
    }
    
    // Obtener el primer archivo seleccionado
    const archivo = entradaArchivo.files[0];
    
    /* 
    PASO 2: ACTUALIZACIÓN DE INTERFAZ DURANTE LA SUBIDA
    - Muestra mensaje de estado
    - Prepara área para mostrar respuesta del servidor
    - Deshabilita el botón para evitar múltiples clics
    */
    mostrarEstado('Subiendo archivo...', 'exito');
    respuestaServidor.textContent = 'Subiendo archivo...';
    botonSubir.disabled = true;
    
    try {
        /* 
        PASO 3: VALIDACIÓN DE TAMAÑO
        Verifica que el archivo no exceda el límite de 5MB
        */
        const MAX_TAM = 5 * 1024 * 1024; // 5MB en bytes
        if (archivo.size > MAX_TAM) {
            throw new Error('El archivo es demasiado grande (máximo 5MB)');
        }
        
        /* 
        PASO 4: PREPARACIÓN DE DATOS PARA ENVÍO
        Crea un objeto FormData para enviar el archivo como parte de un formulario multipart
        */
        const datosFormulario = new FormData();
        datosFormulario.append('archivo', archivo); // 'archivo' es el nombre del campo
        
        /* 
        PASO 5: ENVÍO AL SERVIDOR (httpbin como servicio de prueba)
        Usa Fetch API para enviar el archivo mediante POST
        */
        const respuesta = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: datosFormulario
            // Nota: No se necesita Content-Type header, FormData lo establece automáticamente
        });
        
        /* 
        PASO 6: MANEJO DE RESPUESTA HTTP
        Verifica si la respuesta del servidor fue exitosa (código 200-299)
        */
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        /* 
        PASO 7: PROCESAMIENTO DE RESPUESTA JSON
        Convierte la respuesta a objeto JSON
        httpbin devuelve una estructura con detalles de la solicitud
        */
        const datos = await respuesta.json();
        
        /* 
        PASO 8: VISUALIZACIÓN DE RESPUESTA EN INTERFAZ
        Muestra la respuesta del servidor formateada para depuración
        */
        respuestaServidor.textContent = JSON.stringify(datos, null, 2); // Formato bonito con 2 espacios
        
        /* 
        PASO 9: EXTRAER DATOS BASE64
        httpbin devuelve el archivo como cadena base64 en la propiedad files.archivo
        */
        const datosBase64 = datos.files.archivo;
        
        /* 
        PASO 10: GUARDADO EN INDEXEDDB
        Almacena el archivo en la base de datos local con sus metadatos
        */
        const idArchivo = await guardarArchivoEnBD(archivo, datosBase64);
        
        /* 
        PASO 11: MENSAJE DE ÉXITO
        Muestra confirmación al usuario con el ID asignado
        */
        mostrarEstado(`✅ Archivo subido correctamente (ID: ${idArchivo})`, 'exito');
        
        /* 
        PASO 12: ACTUALIZAR GALERÍA
        Refleja el nuevo archivo en la galería visual
        */
        await cargarGaleria();
        
    } catch (error) {
        /* 
        PASO 13: MANEJO DE ERRORES
        Captura y muestra cualquier error ocurrido durante el proceso
        */
        console.error('Error al subir el archivo:', error);
        respuestaServidor.textContent = `❌ Error: ${error.message}`;
        mostrarEstado(`❌ Error: ${error.message}`, 'error');
    } finally {
        /* 
        PASO 14: LIMPIEZA FINAL
        Reactiva el botón de subir independientemente del resultado
        */
        botonSubir.disabled = false;
    }
}

// ==============================================
// EVENTO PARA EL BOTÓN DE SUBIR
// ==============================================
// Asigna la función de subida al evento click del botón
botonSubir.addEventListener('click', subirArchivo);

// ==============================================
// 8. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==============================================
// Este bloque de código se ejecuta cuando el DOM está completamente cargado
// y maneja la inicialización de la aplicación:
// 1. Configuración inicial de la base de datos
// 2. Carga de la galería de archivos
// 3. Mostrar mensaje de bienvenida
// 4. Manejo de errores durante el arranque

/**
 * Evento: DOMContentLoaded
 * Propósito: Ejecutar la secuencia de inicio de la aplicación una vez que 
 *   la estructura HTML está completamente cargada y parseada.
 * 
 * Flujo de inicialización:
 * 1. Inicializar IndexedDB
 * 2. Cargar archivos almacenados
 * 3. Mostrar estado inicial
 * 4. Manejar posibles errores
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        /* 
        PASO 1: INICIALIZAR BASE DE DATOS
        - Crea o abre la base de datos IndexedDB
        - Configura la estructura de almacenamiento si es necesario
        */
        await inicializarBD();
        
        /* 
        PASO 2: CARGAR GALERÍA DE ARCHIVOS
        - Recupera los archivos almacenados en IndexedDB
        - Genera la vista de galería con todos los archivos disponibles
        */
        await cargarGaleria();
        
        /* 
        PASO 3: MOSTRAR MENSAJE DE BIENVENIDA
        - Proporciona instrucciones iniciales al usuario
        - Usa estilo 'éxito' para un tono positivo (generalmente verde)
        */
        mostrarEstado('Selecciona un archivo para subir', 'exito');
        
    } catch (error) {
        /* 
        PASO 4: MANEJO DE ERRORES DURANTE LA INICIALIZACIÓN
        - Captura cualquier error ocurrido en los pasos anteriores
        - Registra detalles técnicos en consola para depuración
        - Informa al usuario con un mensaje claro
        */
        console.error('Error al inicializar la aplicación:', error);
        mostrarEstado(`Error inicial: ${error.message}`, 'error');
    }
});