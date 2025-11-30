// --- INICIALIZACIÓN ---
// Esperamos a que todo el HTML se cargue antes de ejecutar el código para evitar errores
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. BASE DE DATOS DE PRODUCTOS (Simulada) ---
    // Estos datos se usarán para generar las tarjetas en el HTML
    const allProducts = [
        {
            id: 1,
            name: "Whey Protein",
            description: "Recuperación y crecimiento muscular superior.",
            price: 49999,
            imageUrl: "https://starnutrition.com.ar/cdn/shop/files/PWP-2Lb-Cookies.png?v=1718218508&width=1100",
            alt: "Bote de proteína Whey Protein"
        },
        {
            id: 2,
            name: "Creatina Star Nutrition",
            description: "Aumenta tu fuerza y rendimiento explosivo.",
            price: 35999,
            imageUrl: "https://starnutrition.com.ar/cdn/shop/files/CreatineM-1Kg_3095f1e3-5758-4f7e-8b63-d49c583050e0.png?v=1718222643&width=1100",
            alt: "Bote de Creatina Monohidratada"
        },
        {
            id: 3,
            name: "Pre-Entreno 'DYNAMITE'",
            description: "Enfoque y energía para tus sesiones más intensas.",
            price: 26999,
            imageUrl: "https://starnutrition.com.ar/cdn/shop/files/TNTDynamite-acai.png?v=1718218518&width=1100",
            alt: "Bote de Pre-entreno Dynamite"
        },
        {
            id: 4,
            name: "BCAA MTOR",
            description: "Protege tu masa muscular durante el ejercicio.",
            price: 29999,
            imageUrl: "https://starnutrition.com.ar/cdn/shop/files/MtorBCAA-270g-_2.png?v=1718218499&width=1100",
            alt: "Bote de BCAA MTOR"
        }
    ];

    // --- 2. REFERENCIAS AL HTML (DOM) ---
    // Capturamos los elementos del HTML por su ID o Clase
    const productsGrid = document.getElementById('products-grid');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.querySelector('.cart-btn'); // Botón del header
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartCounter = document.getElementById('cart-counter'); // El numerito rojo
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price'); // Donde va el total $$$
    const checkoutBtn = document.getElementById('checkout-btn'); // Botón Finalizar Compra
    const searchForm = document.getElementById('search-form');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Estado del carrito (aquí guardamos lo que compra el usuario)
    let cart = []; 

    // --- 3. FUNCIONES DE INICIO ---
    loadCartFromLocalStorage(); // 1. Recuperar carrito guardado si existe
    renderProducts(allProducts); // 2. Dibujar los productos en la pantalla

    // --- 4. RENDERIZADO (DIBUJAR EN PANTALLA) ---
    
    // Función para mostrar las tarjetas de productos
    function renderProducts(products) {
        productsGrid.innerHTML = ''; // Limpiamos la zona
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.tabIndex = 0; // Para accesibilidad
            
            // HTML de cada tarjeta (Igual que en tu CSS)
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.alt}">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
                <!-- Botón clave para añadir -->
                <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
            `;
            
            // Agregar evento al botón de esta tarjeta específica
            const addButton = productCard.querySelector('.add-to-cart-btn');
            addButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita clics fantasma
                addToCart(product.id); // ¡Acción de agregar!
                
                // Efecto visual temporal en el botón
                const originalText = addButton.textContent;
                addButton.textContent = "¡Agregado!";
                addButton.style.background = "var(--color-primary)";
                setTimeout(() => {
                    addButton.textContent = originalText;
                    addButton.style.background = ""; 
                }, 1000);
            });

            productsGrid.appendChild(productCard);
        });
    }

    // --- 5. LÓGICA DEL CARRITO (EL CORAZÓN DEL PROGRAMA) ---

    // AGREGAR: Suma productos al array del carrito
    function addToCart(productId) {
        // ¿Ya existe este producto en el carrito?
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Si existe, sumamos +1 a la cantidad
            existingItem.quantity++;
        } else {
            // Si es nuevo, buscamos sus datos en la lista general y lo agregamos
            const productToAdd = allProducts.find(p => p.id === productId);
            if (productToAdd) {
                cart.push({
                    ...productToAdd, // Copiamos nombre, precio, img
                    quantity: 1
                });
            }
        }
        updateCart(); // Actualizamos toda la interfaz
    }

    // ACTUALIZAR: Refresca vista, totales y memoria
    function updateCart() {
        renderCartItems();      // Dibuja los productos en el modal
        calculateCartTotal();   // Calcula $$ total
        updateCartCounter();    // Actualiza el número rojo
        saveCartToLocalStorage(); // Guarda en el navegador
    }

    // VISUALIZAR: Dibuja la lista dentro del modal
    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; 
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888;">Tu carrito está vacío.</p>';
            return;
        }

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.alt}">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 0.8rem; color: #aaa;">Cant:</span>
                        <!-- Input para cambiar cantidad manualmente -->
                        <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    // SUMAR: Calcula el precio total matemático
    function calculateCartTotal() {
        // Multiplica (precio * cantidad) de cada item y suma todo
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = formatPrice(total);
    }

    // CONTADOR: Actualiza la burbuja roja
    function updateCartCounter() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        
        // Animación pequeña al cambiar número
        if (totalItems > 0) {
            cartCounter.style.transform = "scale(1.2)";
            setTimeout(() => cartCounter.style.transform = "scale(1)", 200);
        }
    }

    // --- 6. EVENTOS (INTERACCIÓN USUARIO) ---

    // ABRIR CARRITO
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('show');
        cartModal.style.display = 'flex'; 
    });

    // CERRAR CARRITO (Botón X)
    cartCloseBtn.addEventListener('click', () => {
        closeModal();
    });

    // CERRAR CARRITO (Clic afuera)
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeModal();
    });

    function closeModal() {
        cartModal.classList.remove('show');
        setTimeout(() => cartModal.style.display = 'none', 300); 
    }

    // FINALIZAR COMPRA (Lógica solicitada)
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío. ¡Agrega productos para comprar!");
            } else {
                // Aquí simulamos la compra
                const total = cartTotalPrice.textContent;
                alert(`¡Gracias por tu compra!\nTotal a pagar: ${total}\n\nTu pedido está siendo procesado.`);
                
                cart = []; // Vaciamos el carrito
                updateCart(); // Actualizamos la vista (se pondrá en 0)
                closeModal(); // Cerramos el modal
            }
        });
    }

    // ELIMINAR O CAMBIAR CANTIDAD (Eventos dentro del modal)
    cartItemsContainer.addEventListener('click', (e) => {
        // Botón Eliminar (X)
        if (e.target.classList.contains('cart-item-remove')) {
            const id = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCart();
        }
    });

    cartItemsContainer.addEventListener('change', (e) => {
        // Cambiar número en input
        if (e.target.classList.contains('cart-item-quantity')) {
            const id = parseInt(e.target.dataset.id);
            const newQuantity = parseInt(e.target.value);
            const itemInCart = cart.find(item => item.id === id);

            if (itemInCart) {
                if (newQuantity > 0) {
                    itemInCart.quantity = newQuantity;
                } else {
                    // Si pone 0, eliminamos
                    cart = cart.filter(item => item.id !== id);
                }
                updateCart();
            }
        }
    });

    // BUSCADOR DE PRODUCTOS (Funcionalidad extra)
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const searchTerm = searchForm.querySelector('input[name="search_query"]').value.toLowerCase();
            
            const filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
            
            renderProducts(filteredProducts);
        });
    }

    // --- 7. PERSISTENCIA (LOCALSTORAGE) ---
    function saveCartToLocalStorage() {
        localStorage.setItem('appCart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('appCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
        }
    }

    // --- UTILIDAD: Formato de Moneda ($) ---
    function formatPrice(price) {
        return price.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        });
    }
});
