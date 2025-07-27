/**
 * Elementos del DOM
 */
const productsContainer = document.getElementById('products-container');
const detailContainer = document.getElementById('detail-content');
const formContainer = document.getElementById('form-container');
const productForm = document.getElementById('product-form');
const loadButton = document.getElementById('load-btn');
const createButton = document.getElementById('create-btn');
const clearButton = document.getElementById('clear-btn');
const cancelButton = document.getElementById('cancel-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const loadSpinner = document.getElementById('load-spinner');
const loadText = document.getElementById('load-text');
const formTitle = document.getElementById('form-title');

// Variables globales
let products = [];
let editingProductId = null;

/**
 * Mostrar notificación
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isSuccess - Indica si es una notificación de éxito o error
 */
function showNotification(message, isSuccess = true) {
    notificationText.textContent = message;
    notification.className = isSuccess ? 
        'notification notification-success show' : 
        'notification notification-error show';
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Obtener productos de localStorage
 * @returns {Array} Lista de productos almacenados o null
 */
function getProductsFromStorage() {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : null;
}

/**
 * Guardar productos en localStorage
 * @param {Array} products - Lista de productos a guardar
 */
function saveProductsToStorage(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

/**
 * Mostrar u ocultar el spinner de carga
 * @param {boolean} show - Indica si se muestra el spinner
 */
function showLoader(show) {
    if (show) {
        loadSpinner.classList.remove('hidden');
        loadText.textContent = 'Cargando...';
        loadButton.disabled = true;
    } else {
        loadSpinner.classList.add('hidden');
        loadText.textContent = 'Cargar Productos';
        loadButton.disabled = false;
    }
}

/**
 * Obtener productos de la API o localStorage
 * @returns {Promise<Array>} Lista de productos
 */
async function fetchProducts() {
    // Mostrar spinner
    showLoader(true);
    
    try {
        // Verificar si hay datos en localStorage
        const storedProducts = getProductsFromStorage();
        
        if (storedProducts && storedProducts.length > 0) {
            showNotification('Productos cargados desde localStorage');
            return storedProducts;
        }
        
        // Si no hay datos en caché, hacer fetch a la API
        const response = await fetch('https://dummyjson.com/products');
        
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        
        const data = await response.json();
        const products = data.products;
        
        // Guardar en localStorage para futuras visitas
        saveProductsToStorage(products);
        showNotification('Productos cargados desde la API y guardados en localStorage');
        
        return products;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        showNotification('Error al cargar productos: ' + error.message, false);
        return [];
    } finally {
        // Ocultar spinner
        showLoader(false);
    }
}

/**
 * Renderizar productos en el grid
 * @param {Array} products - Lista de productos
 */
function renderProducts(products) {
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <p>No hay productos disponibles</p>
                <p>Haz clic en "Cargar Productos" para comenzar</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-rating">
                    <div class="rating-stars">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</div>
                    <div>${product.rating}/5</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary edit-btn" data-id="${product.id}">Editar</button>
                    <button class="btn btn-danger delete-btn" data-id="${product.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        // Agregar eventos a los botones
        productCard.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editProduct(product.id);
        });
        productCard.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProduct(product.id);
        });
        
        // Agregar evento para mostrar detalles
        productCard.addEventListener('click', () => {
            showProductDetail(product);
        });
        
        productsContainer.appendChild(productCard);
    });
}

/**
 * Mostrar detalles de un producto
 * @param {Object} product - Producto a mostrar
 */
function showProductDetail(product) {
    detailContainer.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" class="detail-image">
        <div class="detail-price">$${product.price}</div>
        <div class="detail-description">${product.description}</div>
        <div class="detail-meta">
            <div class="detail-item">
                <div class="detail-label">Marca</div>
                <div class="detail-value">${product.brand}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Categoría</div>
                <div class="detail-value">${product.category}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Calificación</div>
                <div class="detail-value">${product.rating}/5</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Stock</div>
                <div class="detail-value">${product.stock} unidades</div>
            </div>
        </div>
        <button class="btn btn-primary edit-btn" data-id="${product.id}" style="width:100%">Editar este producto</button>
    `;
    
    // Agregar evento al botón de editar
    detailContainer.querySelector('.edit-btn').addEventListener('click', () => {
        editProduct(product.id);
    });
}

/**
 * Preparar formulario para crear un nuevo producto
 */
function createNewProduct() {
    editingProductId = null;
    formTitle.textContent = 'Crear Nuevo Producto';
    productForm.reset();
    formContainer.classList.remove('hidden');
    detailContainer.innerHTML = '<p>Completa el formulario para crear un nuevo producto</p>';
}

/**
 * Preparar formulario para editar un producto
 * @param {number} id - ID del producto a editar
 */
function editProduct(id) {
    const product = products.find(p => p.id == id);
    if (!product) return;
    
    editingProductId = id;
    formTitle.textContent = 'Editar Producto';
    
    // Rellenar formulario con los datos del producto
    document.getElementById('product-id').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('rating').value = product.rating;
    document.getElementById('brand').value = product.brand;
    document.getElementById('category').value = product.category;
    document.getElementById('thumbnail').value = product.thumbnail;
    
    formContainer.classList.remove('hidden');
    showProductDetail(product);
}

/**
 * Eliminar un producto
 * @param {number} id - ID del producto a eliminar
 */
function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    // Eliminar producto de la lista
    products = products.filter(product => product.id != id);
    
    // Actualizar localStorage
    saveProductsToStorage(products);
    
    // Volver a renderizar
    renderProducts(products);
    
    // Limpiar detalles si el producto eliminado estaba seleccionado
    if (editingProductId == id) {
        editingProductId = null;
        formContainer.classList.add('hidden');
        detailContainer.innerHTML = '<p>Selecciona un producto para ver los detalles</p>';
    }
    
    showNotification('Producto eliminado correctamente');
}

/**
 * Manejar envío del formulario (crear o actualizar)
 * @param {Event} e - Evento de envío del formulario
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const productData = {
        id: editingProductId || Date.now(), // Usar ID existente o generar uno nuevo
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        rating: parseFloat(document.getElementById('rating').value),
        brand: document.getElementById('brand').value,
        category: document.getElementById('category').value,
        thumbnail: document.getElementById('thumbnail').value,
        stock: Math.floor(Math.random() * 100) + 1 // Stock aleatorio
    };
    
    if (editingProductId) {
        // Actualizar producto existente
        const index = products.findIndex(p => p.id == editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showNotification('Producto actualizado correctamente');
        }
    } else {
        // Crear nuevo producto
        products.unshift(productData);
        showNotification('Producto creado correctamente');
    }
    
    // Actualizar localStorage
    saveProductsToStorage(products);
    
    // Volver a renderizar
    renderProducts(products);
    
    // Mostrar el producto creado/actualizado
    showProductDetail(productData);
    
    // Resetear formulario
    editingProductId = null;
    formContainer.classList.add('hidden');
}

/**
 * Limpiar todos los datos
 */
function clearData() {
    if (!confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) return;
    
    localStorage.removeItem('products');
    products = [];
    renderProducts(products);
    detailContainer.innerHTML = '<p>Selecciona un producto para ver los detalles</p>';
    formContainer.classList.add('hidden');
    showNotification('Todos los datos han sido eliminados');
}

/**
 * Inicializar la aplicación
 */
async function initApp() {
    // Cargar productos al hacer clic en el botón
    loadButton.addEventListener('click', async () => {
        products = await fetchProducts();
        renderProducts(products);
    });
    
    // Botón para crear nuevo producto
    createButton.addEventListener('click', createNewProduct);
    
    // Botón para limpiar datos
    clearButton.addEventListener('click', clearData);
    
    // Botón para cancelar formulario
    cancelButton.addEventListener('click', () => {
        formContainer.classList.add('hidden');
    });
    
    // Manejar envío del formulario
    productForm.addEventListener('submit', handleFormSubmit);
    
    // Verificar si hay datos en localStorage al cargar
    const storedProducts = getProductsFromStorage();
    if (storedProducts && storedProducts.length > 0) {
        products = storedProducts;
        renderProducts(products);
        showNotification('Productos cargados automáticamente desde localStorage');
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);