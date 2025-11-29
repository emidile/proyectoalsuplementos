// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELECTORES DEL DOM ---
    const productsGrid = document.getElementById('products-grid');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.querySelector('.cart-btn');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartCounter = document.getElementById('cart-counter');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    // (NUEVO) Selectores para búsqueda y comentarios
    const searchForm = document.getElementById('search-form');
    const commentForm = document.getElementById('comment-form');

    // --- ESTADO DE LA APLICACIÓN ---
    let cart = []; 
    let allProducts = []; 

    // --- CARGA INICIAL ---
    loadCartFromLocalStorage(); 
    fetchProducts(); 

    // --- 1. CARGA DE PRODUCTOS (FETCH API) ---
    async function fetchProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const products = await response.json();
            allProducts = products; 
            renderProducts(products); 
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productsGrid.innerHTML = '<p>Error al cargar productos. Intente más tarde.</p>';
        }
    }

    // --- 2. RENDERIZADO DE PRODUCTOS ---
    function renderProducts(products) {
        productsGrid.innerHTML = ''; 
        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.tabIndex = 0; 
            
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.alt}">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${formatPrice(product.price)}</p>
                <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
            `;
            
            productCard.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que se active el 'focus' del card
                addToCart(product.id);
            });

            productCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addToCart(product.id);
                }
            });

            productsGrid.appendChild(productCard);
        });
    }

    // --- 3. LÓGICA DEL CARRITO ---
    function addToCart(productId) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            const productToAdd = allProducts.find(p => p.id === productId);
            if (productToAdd) {
                cart.push({
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    imageUrl: productToAdd.imageUrl,
                    alt: productToAdd.alt,
                    quantity: 1
                });
            }
        }
        updateCart();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; 
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
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
                    <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }

    function calculateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = formatPrice(total);
    }

    function updateCart() {
        renderCartItems();
        calculateCartTotal();
        updateCartCounter();
        saveCartToLocalStorage();
    }

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

    function handleCartActions(event) {
        const target = event.target;

        if (target.classList.contains('cart-item-remove')) {
            const id = parseInt(target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCart();
        }

        if (target.classList.contains('cart-item-quantity')) {
            const id = parseInt(target.dataset.id);
            const newQuantity = parseInt(target.value);
            const itemInCart = cart.find(item => item.id === id);

            if (itemInCart) {
                if (newQuantity > 0) {
                    itemInCart.quantity = newQuantity;
                } else {
                    // Si la cantidad es 0 o inválida, eliminamos el item
                    cart = cart.filter(item => item.id !== id);
                }
                updateCart();
            }
        }
    }

    // --- 4. MANEJO DE EVENTOS ---
    
    // Modal del Carrito
    cartBtn.addEventListener('click', () => cartModal.classList.add('show'));
    cartCloseBtn.addEventListener('click', () => cartModal.classList.remove('show'));
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('show');
    });

    // Acciones dentro del carrito (Delegación)
    cartItemsContainer.addEventListener('click', handleCartActions);
    cartItemsContainer.addEventListener('change', handleCartActions);

    // (NUEVO) Formulario de Búsqueda
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchTerm = searchForm.querySelector('input[name="search_query"]').value.toLowerCase();
        
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
        
        renderProducts(filteredProducts);
    });

    // (ACTUALIZADO) Formulario de Login
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        const email = loginForm.querySelector('input[name="email_login"]').value;
        
        if (!email.includes('@') || !email.includes('.')) {
            loginError.textContent = 'Por favor, introduce un correo válido.';
            loginError.style.display = 'block';
        } else {
            loginError.textContent = '';
            loginError.style.display = 'none';
            console.log('Login intentado con:', email);
            alert('¡Login exitoso (simulado)!');
            loginForm.reset();
        }
    });

    // (NUEVO) Formulario de Comentarios
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = commentForm.querySelector('input[name="comment_name"]').value;
        // Simulación de envío
        console.log(`Comentario de ${name} enviado.`);
        alert('¡Gracias por tu comentario!');
        commentForm.reset();
    });

    // --- 5. FUNCIONES UTILITARIAS ---
    function formatPrice(price) {
        return price.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        });
    }
});
