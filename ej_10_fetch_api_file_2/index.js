// ==============================================
// 1. REFERENCIAS A ELEMENTOS DEL DOM
// ==============================================
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const uploadBtn = document.getElementById('uploadBtn');
const serverResponse = document.getElementById('serverResponse');
const imagePreview = document.getElementById('previewImg');
const statusMessage = document.getElementById('statusMessage');
const imageGallery = document.getElementById('imageGallery');

// ==============================================
// 2. CONSTANTES PARA INDEXEDDB
// ==============================================
const DB_NAME = 'imageDB';
const STORE_NAME = 'images';
let db = null;

// ==============================================
// 3. FUNCIONES DE MANIPULACIÓN DE ARCHIVOS Y DOM
// ==============================================

/**
 * Actualiza la información del archivo seleccionado en el DOM
 * @param {File} file - Archivo seleccionado por el usuario
 */
function updateFileInfo(file) {
    fileInfo.innerHTML = `
        <p>📄 <strong>Nombre:</strong> ${file.name}</p>
        <p>📦 <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p>📝 <strong>Tipo:</strong> ${file.type || 'Desconocido'}</p>
    `;
    
    // Habilitar botón de subida
    uploadBtn.disabled = false;
    
    // Mostrar mensaje de estado
    showStatus('Archivo seleccionado. Haz clic en "Subir Archivo" para continuar.', 'success');
    
    // Si es una imagen, mostrar vista previa
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
}

/**
 * Muestra un mensaje de estado en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error)
 */
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

// ==============================================
// 4. EVENTOS PARA LA SELECCIÓN DE ARCHIVOS
// ==============================================

// Click en el área de subida
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Cambio en el input de archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        updateFileInfo(e.target.files[0]);
    }
});

// Eventos para drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#e0e8ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '#f8f9fe';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f8f9fe';
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        updateFileInfo(e.dataTransfer.files[0]);
    }
});

// ==============================================
// 5. FUNCIONES PARA INDEXEDDB
// ==============================================

/**
 * Inicializa la base de datos IndexedDB
 * @returns {Promise} - Promesa que se resuelve cuando la base de datos está lista
 */
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            reject(`Error al abrir la base de datos: ${event.target.error}`);
        };
    });
}

/**
 * Guarda una imagen en IndexedDB
 * @param {File} file - Archivo de imagen
 * @param {string} base64 - Datos de la imagen en base64
 * @returns {Promise<number>} - ID del registro guardado
 */
function saveImageToDB(file, base64) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.add({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
            timestamp: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Recupera todas las imágenes de IndexedDB
 * @returns {Promise<Array>} - Lista de imágenes guardadas
 */
function getImagesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Elimina una imagen de IndexedDB
 * @param {number} id - ID de la imagen a eliminar
 * @returns {Promise} - Promesa que se resuelve cuando la imagen se elimina
 */
function deleteImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==============================================
// 6. FUNCIONES PARA LA GALERÍA
// ==============================================

/**
 * Carga la galería de imágenes desde IndexedDB
 */
async function loadImageGallery() {
    try {
        const images = await getImagesFromDB();
        imageGallery.innerHTML = '';
        
        if (images.length === 0) {
            imageGallery.innerHTML = '<p>No hay imágenes guardadas aún. Sube tu primera imagen.</p>';
            return;
        }
        
        images.forEach(img => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="data:${img.type};base64,${img.data}" alt="${img.name}">
                <p>${img.name}</p>
                <p>${new Date(img.timestamp).toLocaleString()}</p>
                <button class="delete-btn" data-id="${img.id}">Eliminar</button>
            `;
            imageGallery.appendChild(galleryItem);
        });
        
        // Añadir eventos de eliminación
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                await deleteImageFromDB(id);
                await loadImageGallery();
                showStatus('Imagen eliminada correctamente', 'success');
            });
        });
    } catch (error) {
        console.error('Error al cargar la galería:', error);
        showStatus('Error al cargar la galería de imágenes', 'error');
    }
}

// ==============================================
// 7. FUNCIÓN DE SUBIDA DE ARCHIVOS
// ==============================================

/**
 * Sube el archivo a httpbin.org y guarda la respuesta en IndexedDB
 */
async function uploadFile() {
    if (!fileInput.files[0]) {
        showStatus('⚠️ Error: No has seleccionado ningún archivo', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    showStatus('Subiendo archivo...', 'success');
    serverResponse.textContent = 'Subiendo archivo...';
    uploadBtn.disabled = true;
    
    try {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            throw new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF)');
        }
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('El archivo es demasiado grande (máximo 5MB)');
        }
        
        // 1. Creamos FormData para enviar el archivo
        const formData = new FormData();
        formData.append('archivo', file);
        
        // 2. Enviamos el archivo a httpbin.org
        const response = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 3. Mostramos la respuesta del servidor
        serverResponse.textContent = JSON.stringify(data, null, 2);
        
        // 4. Extraemos la imagen en base64 de la respuesta
        const base64Image = data.files.archivo;
        
        // 5. Guardamos la imagen en IndexedDB
        const imageId = await saveImageToDB(file, base64Image);
        
        // 6. Mostramos mensaje de éxito
        showStatus(`✅ Archivo subido correctamente (ID: ${imageId})`, 'success');
        
        // 7. Recargamos la galería
        await loadImageGallery();
        
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        serverResponse.textContent = `❌ Error: ${error.message}`;
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        uploadBtn.disabled = false;
    }
}

// Evento para el botón de subir
uploadBtn.addEventListener('click', uploadFile);

// ==============================================
// 8. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar la base de datos
        await initDB();
        
        // Cargar la galería de imágenes
        await loadImageGallery();
        
        // Mostrar mensaje de bienvenida
        showStatus('Selecciona una imagen para subir', 'success');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showStatus(`Error inicial: ${error.message}`, 'error');
    }
});