/**
 * Obtiene referencias a los elementos del DOM
 * @type {HTMLInputElement} fileInput - Input para seleccionar archivos
 * @type {HTMLDivElement} dropZone - Zona para arrastrar y soltar
 * @type {HTMLDivElement} fileInfo - Elemento para mostrar info del archivo
 * @type {HTMLButtonElement} uploadBtn - Botón de subida
 * @type {HTMLPreElement} serverResponse - Área para mostrar respuesta
 */
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const uploadBtn = document.getElementById('uploadBtn');
const serverResponse = document.getElementById('serverResponse');

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
}

// Evento al seleccionar archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        updateFileInfo(e.target.files[0]);
    }
});

// Evento para arrastrar y soltar (drag and drop)
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#e0ffe0';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';

    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        updateFileInfo(e.dataTransfer.files[0]);
    }
});

/**
 * Función principal para subir el archivo usando Fetch
 * @async
 */
async function uploadFile() {
    if (!fileInput.files[0]) {
        serverResponse.textContent = '⚠️ Error: No has seleccionado ningún archivo';
        return;
    }

    const file = fileInput.files[0];
    serverResponse.textContent = 'Subiendo archivo...';

    try {
        // 1. Creamos un FormData para empaquetar el archivo
        const formData = new FormData();
        formData.append('archivo', file); // 'archivo' es el nombre que espera el servidor

        // 2. Usamos Fetch para enviar a httpbin.org
        const response = await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData
            // ¡IMPORTANTE! No establecemos 'Content-Type' header (Fetch lo hace automáticamente)
        });

        // 3. Procesamos la respuesta
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);



        // 4. Procesamos la respuesta
        const data = await response.json();

        // Mostrar respuesta JSON
        serverResponse.textContent = JSON.stringify(data, null, 2);

        // 5. Recuperar y mostrar la imagen desde la respuesta
        if (file.type.startsWith('image/')) {
            // Extraemos la imagen en base64 de la respuesta
            const base64Image = data.files.archivo;

            // Creamos una URL de datos
            const imageUrl = `data:${file.type};base64,${base64Image}`;

            // Mostramos la imagen recuperada
            previewImg.src = imageUrl;
            imagePreview.style.display = 'block';

            // Guardar URL en localStorage
            localStorage.setItem('ultimaImagen', imageUrl);
        }

        // 5. (Opcional) Guardar en localStorage
        localStorage.setItem('ultimoArchivoSubido', file.name);

    } catch (error) {
        serverResponse.textContent = `❌ Error: ${error.message}`;
    }
}

// Evento para el botón de subida
uploadBtn.addEventListener('click', uploadFile);

// ... código anterior ...

// Nueva referencia
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Modificar la función updateFileInfo
function updateFileInfo(file) {
    fileInfo.innerHTML = `
        <p>📄 <strong>Nombre:</strong> ${file.name}</p>
        <p>📦 <strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p>📝 <strong>Tipo:</strong> ${file.type || 'Desconocido'}</p>
    `;

    // Mostrar previsualización si es imagen
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
}

// Cargar última imagen al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedImage = localStorage.getItem('ultimaImagen');
    if (savedImage) {
        previewImg.src = savedImage;
        imagePreview.style.display = 'block';
    }
});