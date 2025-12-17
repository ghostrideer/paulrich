document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productsGrid')) {
        displayProducts();
    }
    if (document.getElementById('featuredGrid')) {
        displayFeaturedProducts();
    }
});

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22350%22%3E%3Crect fill=%22%23333%22 width=%22280%22 height=%22350%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${formatPrice(product.price)} Ft</p>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">Kosárba</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

function displayFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredGrid');
    featuredGrid.innerHTML = '';

    const featuredProducts = products.slice(0, 3);

    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22350%22%3E%3Crect fill=%22%23333%22 width=%22280%22 height=%22350%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${formatPrice(product.price)} Ft</p>
                <a href="products.html" class="btn btn-primary">Részletek</a>
            </div>
        `;
        
        featuredGrid.appendChild(productCard);
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

