const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  tg.setHeaderColor('#0B7F87');
  tg.setBackgroundColor('#F6F1E8');
}

const products = [
  {
    id: 1,
    title: 'Гиалуроновая кислота 120 капсул',
    category: 'Коллаген и БАДы',
    desc: 'Для упругой и увлажненной кожи. Поддерживает естественное сияние и водный баланс.',
    price: 1920,
    image: 'assets/product-hyaluronic.svg',
    badge: 'Хит'
  },
  {
    id: 2,
    title: 'MSM органическая сера 120 капсул',
    category: 'Суставы',
    desc: 'Для суставов, связок и подвижности. Подходит для активного образа жизни.',
    price: 1540,
    image: 'assets/product-msm.svg',
    badge: 'Новинка'
  },
  {
    id: 3,
    title: 'Магний + B6 120 капсул',
    category: 'Витамины',
    desc: 'Поддержка нервной системы, восстановления и спокойного сна.',
    price: 1390,
    image: 'assets/product-magnesium.svg',
    badge: 'Топ'
  },
  {
    id: 4,
    title: 'Коллаген Beauty 300 г',
    category: 'Коллаген и БАДы',
    desc: 'Пептиды коллагена для кожи, волос, ногтей и суставов.',
    price: 2450,
    image: 'assets/product-collagen.svg',
    badge: 'Beauty'
  },
  {
    id: 5,
    title: 'Витамин D3 2000 ME',
    category: 'Витамины',
    desc: 'Поддержка иммунитета, энергии и общего тонуса организма.',
    price: 890,
    image: 'assets/product-d3.svg',
    badge: 'Зима'
  },
  {
    id: 6,
    title: 'Подарочный сертификат NH&BE',
    category: 'Подарки',
    desc: 'Красивый подарок на массаж или покупку в мини-маркете студии.',
    price: 3000,
    image: 'assets/product-gift.svg',
    badge: 'Gift'
  }
];

const services = [
  {
    id: 's1',
    title: 'Классический массаж 60 мин',
    category: 'Массаж',
    icon: '💆',
    price: 2000,
    time: '60 мин',
    desc: 'Классический общий массаж тела. Снимает напряжение, улучшает самочувствие и помогает восстановиться после нагрузки.'
  },
  {
    id: 's2',
    title: 'Классический массаж 90 мин',
    category: 'Массаж',
    icon: '💆',
    price: 2490,
    time: '90 мин',
    desc: 'Расширенный классический массаж всего тела с более глубокой проработкой основных зон.'
  },
  {
    id: 's3',
    title: 'Расслабляющий массаж 60 мин',
    category: 'Массаж',
    icon: '🧘',
    price: 2000,
    time: '60 мин',
    desc: 'Мягкий расслабляющий массаж для восстановления, снятия усталости и эмоционального напряжения.'
  },
  {
    id: 's4',
    title: 'Антицеллюлитный массаж',
    category: 'Коррекция',
    icon: '🔥',
    price: 2300,
    time: '60 мин',
    desc: 'Интенсивная процедура для улучшения тонуса кожи, лимфотока и визуальной коррекции силуэта.'
  },
  {
    id: 's5',
    title: 'Массаж спины и шеи',
    category: 'Массаж',
    icon: '🌿',
    price: 1500,
    time: '40 мин',
    desc: 'Фокус на зоне спины, шеи и плеч. Хороший вариант при сидячей работе и мышечном напряжении.'
  },
  {
    id: 's6',
    title: 'Дегустация коллагена',
    category: 'Wellness',
    icon: '🥤',
    price: 0,
    time: '15 мин',
    desc: 'Мини-консультация и знакомство с wellness-продуктами студии.'
  }
];

let cart = JSON.parse(localStorage.getItem('nhbeCart') || '[]');
let selectedProductCategory = 'Все';
let selectedServiceCategory = 'Все';

const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-btn');
const productGrid = document.getElementById('product-grid');
const marketCategories = document.getElementById('market-categories');
const serviceCategories = document.getElementById('service-categories');
const serviceList = document.getElementById('service-list');
const cartContent = document.getElementById('cart-content');
const cartBadge = document.getElementById('cart-badge');
const cartHeadCount = document.getElementById('cart-head-count');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('details-modal');
const modalContent = document.getElementById('modal-content');
const toast = document.getElementById('toast');

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function saveCart() {
  localStorage.setItem('nhbeCart', JSON.stringify(cart));
  updateCartCounters();
}

function updateCartCounters() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = count;
  cartHeadCount.textContent = count;
  cartBadge.classList.toggle('show', count > 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
}

function openPage(pageId) {
  pages.forEach(page => page.classList.toggle('active', page.id === pageId));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageId));
  if (pageId === 'cart-page') renderCart();
}

function renderProductCategories() {
  const categories = ['Все', ...new Set(products.map(item => item.category))];
  marketCategories.innerHTML = categories.map(category => `
    <button class="chip ${category === selectedProductCategory ? 'active' : ''}" data-product-category="${category}">${category}</button>
  `).join('');
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter(product => {
    const byCategory = selectedProductCategory === 'Все' || product.category === selectedProductCategory;
    const bySearch = !query || [product.title, product.desc, product.category].join(' ').toLowerCase().includes(query);
    return byCategory && bySearch;
  });

  productGrid.innerHTML = filtered.length ? filtered.map(product => {
    const inCart = cart.some(item => item.id === product.id);
    return `
      <article class="product-card">
        <div class="product-image" data-product-details="${product.id}">
          <span class="product-hit">${product.badge}</span>
          <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-info">
          <h3 data-product-details="${product.id}">${product.title}</h3>
          <p>${product.desc}</p>
          <div class="product-price">${formatPrice(product.price)}</div>
          <div class="stock">В наличии</div>
          <button class="${inCart ? 'added' : ''}" data-add-product="${product.id}">${inCart ? 'Добавить ещё' : 'В корзину'}</button>
        </div>
      </article>
    `;
  }).join('') : `
    <div class="cart-empty card" style="grid-column: 1 / -1; margin-top: 8px;">
      <div class="round-icon">🔎</div>
      <h2>Ничего не найдено</h2>
      <p>Попробуйте изменить поиск или категорию</p>
    </div>
  `;
}

function renderServiceCategories() {
  const categories = ['Все', ...new Set(services.map(item => item.category))];
  serviceCategories.innerHTML = categories.map(category => `
    <button class="chip ${category === selectedServiceCategory ? 'active' : ''}" data-service-category="${category}">${category}</button>
  `).join('');
}

function renderServices() {
  const filtered = services.filter(service => selectedServiceCategory === 'Все' || service.category === selectedServiceCategory);
  serviceList.innerHTML = filtered.map(service => `
    <article class="service-card">
      <div class="service-top">
        <div class="service-icon">${service.icon}</div>
        <div>
          <small>${service.category}</small>
          <h3>${service.title}</h3>
          <div class="service-meta"><b>${service.price ? formatPrice(service.price) : 'Бесплатно'}</b> · ⏱ ${service.time}</div>
          <p>${service.desc}</p>
        </div>
        <i class="arrow">›</i>
      </div>
      <div class="service-actions">
        <button class="secondary" data-service-details="${service.id}">Подробнее</button>
        <button class="primary" data-book-service="${service.id}">Записаться</button>
      </div>
    </article>
  `).join('');
}

function addProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }

  saveCart();
  renderProducts();
  showToast(`«${product.title}» добавлен в корзину`);
}

function changeQty(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(cartItem => cartItem.id !== productId);
  saveCart();
  renderProducts();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderProducts();
  renderCart();
}

function renderCart() {
  if (!cart.length) {
    cartContent.innerHTML = `
      <div class="cart-empty card">
        <div class="round-icon">🛒</div>
        <h2>Корзина пустая</h2>
        <p>Добавьте товары из мини-маркета</p>
        <button class="pill-btn" data-open-market>Перейти в маркет</button>
      </div>
    `;
    return;
  }

  const rows = cart.map(cartItem => {
    const product = products.find(item => item.id === cartItem.id);
    if (!product) return '';
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.title}">
        <div>
          <h3>${product.title}</h3>
          <div class="price">${formatPrice(product.price * cartItem.qty)}</div>
          <div class="qty-row">
            <div class="qty-controls">
              <button data-change-qty="${product.id}" data-delta="-1">−</button>
              <span>${cartItem.qty}</span>
              <button data-change-qty="${product.id}" data-delta="1">+</button>
            </div>
            <button class="remove-btn" data-remove-product="${product.id}">×</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const total = cart.reduce((sum, cartItem) => {
    const product = products.find(item => item.id === cartItem.id);
    return sum + (product ? product.price * cartItem.qty : 0);
  }, 0);

  cartContent.innerHTML = `
    <div class="cart-list">${rows}</div>
    <section class="checkout-card card">
      <h2>Оформление заказа</h2>
      <div class="total-row"><span>Итого</span><b>${formatPrice(total)}</b></div>
      <form class="form-grid" id="checkout-form">
        <input type="text" placeholder="Ваше имя" required>
        <input type="tel" placeholder="Телефон" required>
        <input type="text" placeholder="Адрес доставки или самовывоз">
        <button class="big-gradient-btn" type="submit">Оформить заказ</button>
      </form>
    </section>
  `;
}

function openProductDetails(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  modalContent.innerHTML = `
    <img class="modal-product-img" src="${product.image}" alt="${product.title}">
    <h2>${product.title}</h2>
    <p>${product.desc}</p>
    <div class="modal-price">${formatPrice(product.price)}</div>
    <div class="modal-actions">
      <button class="secondary" data-close-modal>Закрыть</button>
      <button class="primary" data-add-product="${product.id}">В корзину</button>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function openServiceDetails(serviceId) {
  const service = services.find(item => item.id === serviceId);
  if (!service) return;
  modalContent.innerHTML = `
    <div class="service-icon" style="width: 82px; height: 82px; font-size: 44px; margin-bottom: 16px;">${service.icon}</div>
    <h2>${service.title}</h2>
    <p>${service.desc}</p>
    <div class="modal-price">${service.price ? formatPrice(service.price) : 'Бесплатно'} · ${service.time}</div>
    <div class="modal-actions">
      <button class="secondary" data-close-modal>Закрыть</button>
      <button class="primary" data-book-service="${service.id}">Записаться</button>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function bookService(serviceId) {
  const service = services.find(item => item.id === serviceId);
  if (!service) return;
  closeModal();
  showToast(`Заявка на «${service.title}» создана`);
}

navButtons.forEach(button => {
  button.addEventListener('click', () => openPage(button.dataset.page));
});

document.body.addEventListener('click', (event) => {
  const productCategoryBtn = event.target.closest('[data-product-category]');
  if (productCategoryBtn) {
    selectedProductCategory = productCategoryBtn.dataset.productCategory;
    renderProductCategories();
    renderProducts();
    return;
  }

  const serviceCategoryBtn = event.target.closest('[data-service-category]');
  if (serviceCategoryBtn) {
    selectedServiceCategory = serviceCategoryBtn.dataset.serviceCategory;
    renderServiceCategories();
    renderServices();
    return;
  }

  const addProductBtn = event.target.closest('[data-add-product]');
  if (addProductBtn) {
    addProduct(Number(addProductBtn.dataset.addProduct));
    return;
  }

  const productDetails = event.target.closest('[data-product-details]');
  if (productDetails) {
    openProductDetails(Number(productDetails.dataset.productDetails));
    return;
  }

  const serviceDetails = event.target.closest('[data-service-details]');
  if (serviceDetails) {
    openServiceDetails(serviceDetails.dataset.serviceDetails);
    return;
  }

  const bookBtn = event.target.closest('[data-book-service]');
  if (bookBtn) {
    bookService(bookBtn.dataset.bookService);
    return;
  }

  const changeQtyBtn = event.target.closest('[data-change-qty]');
  if (changeQtyBtn) {
    changeQty(Number(changeQtyBtn.dataset.changeQty), Number(changeQtyBtn.dataset.delta));
    return;
  }

  const removeBtn = event.target.closest('[data-remove-product]');
  if (removeBtn) {
    removeFromCart(Number(removeBtn.dataset.removeProduct));
    return;
  }

  if (event.target.closest('[data-open-market]')) {
    openPage('market-page');
    return;
  }

  if (event.target.closest('[data-open-cart]')) {
    openPage('cart-page');
    return;
  }

  if (event.target.closest('[data-open-services]')) {
    openPage('services-page');
    return;
  }

  if (event.target.closest('[data-close-modal]')) {
    closeModal();
  }
});

searchInput.addEventListener('input', renderProducts);

document.getElementById('clear-cart').addEventListener('click', () => {
  if (!cart.length) return;
  cart = [];
  saveCart();
  renderProducts();
  renderCart();
  showToast('Корзина очищена');
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'checkout-form') {
    event.preventDefault();
    cart = [];
    saveCart();
    renderProducts();
    renderCart();
    showToast('Заказ успешно оформлен');
  }
});

renderProductCategories();
renderProducts();
renderServiceCategories();
renderServices();
renderCart();
updateCartCounters();
