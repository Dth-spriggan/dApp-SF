const ss = sessionStorage;
/* ─── AUTH STATE ─── */
let currentUser = null; /* null = not logged in */

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Yeu cau toi may chu that bai.');
  }

  return payload;
}

/* Demo accounts for testing */
const DEMO_ACCOUNTS = {};

const DEMO_ACCOUNT_DETAILS = {};

const STORAGE_KEY = 'silverflag-demo-state-v3';
const UI_STORAGE_KEY = 'silverflag-demo-ui-v1';
const USER_STORAGE_KEY = 'silverflag-user-session-v1';
const DEFAULT_CART = [];
const DEFAULT_CATALOG_STATE = {
  query: '',
  category: 'Tất cả',
  onlyNft: false,
  onlySale: false,
  sort: 'featured',
  showAll: false,
};
const FEATURED_CATALOG_LIMIT = 8;

let productCatalog = [];
let favoriteProductIds = [];
let currentQuickViewId = null;
let catalogState = { ...DEFAULT_CATALOG_STATE };
const INLINE_PRODUCT_ART = {
  'product-p1': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient><linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f2937"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#bg)"/><circle cx="940" cy="260" r="180" fill="#22c55e" opacity="0.18"/><circle cx="250" cy="980" r="240" fill="#93c5fd" opacity="0.12"/><rect x="160" y="280" width="880" height="460" rx="44" fill="url(#card)" stroke="#4b5563" stroke-width="10"/><rect x="225" y="350" width="750" height="320" rx="28" fill="#0b1220" stroke="#6b7280" stroke-width="8"/><circle cx="330" cy="510" r="95" fill="#111827" stroke="#22c55e" stroke-width="18"/><circle cx="870" cy="510" r="95" fill="#111827" stroke="#22c55e" stroke-width="18"/><circle cx="330" cy="510" r="42" fill="#374151"/><circle cx="870" cy="510" r="42" fill="#374151"/><rect x="470" y="430" width="140" height="160" rx="18" fill="#22c55e"/></svg>`,
  'product-p2': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#bg)"/><rect x="310" y="250" width="580" height="580" rx="40" fill="#f8fafc" opacity="0.94"/><rect x="395" y="335" width="410" height="410" rx="28" fill="#1f2937"/><rect x="445" y="385" width="310" height="310" rx="22" fill="#374151"/><circle cx="600" cy="540" r="98" fill="#ea580c"/><circle cx="600" cy="540" r="56" fill="#fed7aa"/><g fill="#cbd5e1"><rect x="260" y="360" width="40" height="90" rx="10"/><rect x="260" y="500" width="40" height="90" rx="10"/><rect x="260" y="640" width="40" height="90" rx="10"/><rect x="900" y="360" width="40" height="90" rx="10"/><rect x="900" y="500" width="40" height="90" rx="10"/><rect x="900" y="640" width="40" height="90" rx="10"/><rect x="360" y="200" width="90" height="40" rx="10"/><rect x="500" y="200" width="90" height="40" rx="10"/><rect x="640" y="200" width="90" height="40" rx="10"/><rect x="360" y="840" width="90" height="40" rx="10"/><rect x="500" y="840" width="90" height="40" rx="10"/><rect x="640" y="840" width="90" height="40" rx="10"/></g></svg>`,
  'product-p3': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#111827"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#bg)"/><rect x="220" y="180" width="760" height="760" rx="34" fill="#e5e7eb"/><rect x="290" y="250" width="620" height="620" rx="24" fill="#111827"/><rect x="360" y="320" width="180" height="180" rx="16" fill="#dc2626"/><rect x="595" y="320" width="210" height="100" rx="16" fill="#374151"/><rect x="595" y="455" width="210" height="270" rx="16" fill="#1f2937"/><rect x="360" y="555" width="170" height="220" rx="16" fill="#374151"/><rect x="320" y="820" width="560" height="28" rx="14" fill="#dc2626"/><rect x="845" y="320" width="34" height="420" rx="12" fill="#ef4444"/></svg>`,
  'product-p4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient><linearGradient id="rgb" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#22c55e"/><stop offset="50%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#bg)"/><g transform="translate(180 340)"><rect x="0" y="0" width="840" height="150" rx="28" fill="#0f172a"/><rect x="40" y="18" width="760" height="26" rx="13" fill="url(#rgb)"/><g fill="#1e293b"><rect x="70" y="60" width="90" height="54" rx="8"/><rect x="185" y="60" width="90" height="54" rx="8"/><rect x="300" y="60" width="90" height="54" rx="8"/><rect x="415" y="60" width="90" height="54" rx="8"/><rect x="530" y="60" width="90" height="54" rx="8"/><rect x="645" y="60" width="90" height="54" rx="8"/></g><rect x="70" y="150" width="700" height="24" rx="12" fill="#94a3b8"/></g><g transform="translate(240 600)"><rect x="0" y="0" width="720" height="130" rx="26" fill="#111827" opacity="0.88"/><rect x="34" y="16" width="652" height="22" rx="11" fill="url(#rgb)"/><g fill="#334155"><rect x="60" y="52" width="76" height="46" rx="7"/><rect x="156" y="52" width="76" height="46" rx="7"/><rect x="252" y="52" width="76" height="46" rx="7"/><rect x="348" y="52" width="76" height="46" rx="7"/><rect x="444" y="52" width="76" height="46" rx="7"/><rect x="540" y="52" width="76" height="46" rx="7"/></g></g></svg>`,
  'product-p5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#134e4a"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#bg)"/><rect x="170" y="430" width="860" height="230" rx="46" fill="#111827" stroke="#334155" stroke-width="10"/><rect x="230" y="490" width="150" height="110" rx="18" fill="#22c55e"/><rect x="430" y="488" width="320" height="118" rx="20" fill="#1f2937"/><rect x="780" y="488" width="170" height="118" rx="20" fill="#374151"/><g fill="#94a3b8"><rect x="1020" y="490" width="24" height="20" rx="6"/><rect x="1020" y="520" width="24" height="20" rx="6"/><rect x="1020" y="550" width="24" height="20" rx="6"/><rect x="1020" y="580" width="24" height="20" rx="6"/></g></svg>`,
  'product-p6': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f3f4f6"/><rect x="200" y="230" width="800" height="480" rx="34" fill="#111827"/><rect x="248" y="275" width="704" height="390" rx="22" fill="#1d4ed8"/><rect x="248" y="275" width="704" height="390" rx="22" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><circle cx="430" cy="470" r="86" fill="#22c55e" opacity="0.8"/><circle cx="760" cy="430" r="110" fill="#f59e0b" opacity="0.9"/><rect x="540" y="740" width="120" height="90" rx="18" fill="#6b7280"/><rect x="460" y="830" width="280" height="36" rx="18" fill="#9ca3af"/></svg>`,
  'product-p7': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#eef2ff"/><rect x="340" y="170" width="520" height="860" rx="34" fill="#ffffff" stroke="#cbd5e1" stroke-width="12"/><rect x="420" y="260" width="180" height="500" rx="20" fill="#e5e7eb"/><rect x="630" y="260" width="140" height="140" rx="16" fill="#dbeafe"/><rect x="630" y="430" width="140" height="140" rx="16" fill="#dbeafe"/><rect x="630" y="600" width="140" height="140" rx="16" fill="#dbeafe"/><circle cx="520" cy="860" r="34" fill="#94a3b8"/><circle cx="680" cy="860" r="34" fill="#94a3b8"/></svg>`,
  'product-p8': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f8fafc"/><rect x="220" y="360" width="760" height="360" rx="38" fill="#111827"/><rect x="310" y="430" width="210" height="220" rx="22" fill="#ef4444"/><rect x="580" y="430" width="290" height="220" rx="22" fill="#374151"/><g fill="#9ca3af"><rect x="995" y="430" width="28" height="32" rx="6"/><rect x="995" y="472" width="28" height="32" rx="6"/><rect x="995" y="514" width="28" height="32" rx="6"/><rect x="995" y="556" width="28" height="32" rx="6"/></g></svg>`,
  'product-p9': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#eff6ff"/><rect x="250" y="250" width="700" height="700" rx="36" fill="#0f172a"/><circle cx="600" cy="600" r="210" fill="#111827" stroke="#38bdf8" stroke-width="22"/><circle cx="600" cy="600" r="108" fill="#38bdf8"/><g stroke="#cbd5e1" stroke-width="18" stroke-linecap="round"><line x1="600" y1="430" x2="600" y2="325"/><line x1="600" y1="770" x2="600" y2="875"/><line x1="430" y1="600" x2="325" y2="600"/><line x1="770" y1="600" x2="875" y2="600"/></g></svg>`,
  'product-p10': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f8fafc"/><path d="M600 220c170 0 240 160 240 310v170c0 115-85 210-190 210H550c-105 0-190-95-190-210V530c0-150 70-310 240-310z" fill="#111827"/><rect x="560" y="315" width="80" height="150" rx="38" fill="#1f2937"/><line x1="600" y1="310" x2="600" y2="460" stroke="#f8fafc" stroke-width="10" stroke-linecap="round"/></svg>`,
  'product-p11': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#f3f4f6"/><rect x="320" y="170" width="560" height="860" rx="36" fill="#111827"/><rect x="390" y="250" width="160" height="220" rx="20" fill="#ef4444"/><rect x="610" y="250" width="200" height="110" rx="18" fill="#374151"/><rect x="610" y="400" width="200" height="270" rx="18" fill="#1f2937"/><rect x="390" y="530" width="130" height="180" rx="18" fill="#4b5563"/><rect x="760" y="250" width="28" height="420" rx="12" fill="#ef4444"/><rect x="360" y="780" width="460" height="34" rx="17" fill="#ef4444"/></svg>`
};
const EXTRA_PRODUCTS = [];

function cloneCart(items) {
  return (items || []).map(item => ({ ...item }));
}

function readUiState() {
  try {
    const raw = ss.getItem(UI_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function persistUiState() {
  try {
    ss.setItem(UI_STORAGE_KEY, JSON.stringify({
      catalogState,
    }));
  } catch (err) {
  }
}

function buildDefaultSessionState() {
  return {
    cart: cloneCart(DEFAULT_CART),
    voucherApplied: null,
    walletConnected: false,
    walletAddress: '',
  };
}

function getDefaultAccountDetails(email) {
  return { orders: [], nfts: [] };
}

function readPersistedState() {
  try {
    const raw = ss.getItem(STORAGE_KEY);
    if (!raw) return { accounts: {}, guest: buildDefaultSessionState() };
    const parsed = JSON.parse(raw);
    return {
      accounts: parsed?.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {},
      guest: parsed?.guest && typeof parsed.guest === 'object' ? parsed.guest : buildDefaultSessionState(),
    };
  } catch (err) {
    return { accounts: {}, guest: buildDefaultSessionState() };
  }
}

function writePersistedState(state) {
  try {
    ss.setItem(STORAGE_KEY, JSON.stringify({
      accounts: state?.accounts && typeof state.accounts === 'object' ? state.accounts : {},
      guest: state?.guest && typeof state.guest === 'object' ? state.guest : buildDefaultSessionState(),
    }));
  } catch (err) {
  }
}

function getAccountKey(user) {
  return (user?.email || '').trim().toLowerCase();
}

function getSavedAccountState(email) {
  const state = readPersistedState();
  return state.accounts?.[email] || null;
}

function getRegisteredAccount(email) {
  return null;
}

function saveAccountState(user, sessionState) {
  const state = readPersistedState();
  const key = getAccountKey(user);
  if (!key) {
    state.guest = {
      cart: cloneCart(sessionState?.cart?.length ? sessionState.cart : DEFAULT_CART),
      voucherApplied: sessionState?.voucherApplied ? { ...sessionState.voucherApplied } : null,
      walletConnected: !!sessionState?.walletConnected,
      walletAddress: sessionState?.walletAddress || '',
    };
    writePersistedState(state);
    return;
  }

  state.accounts[key] = {
    cart: cloneCart(sessionState?.cart?.length ? sessionState.cart : DEFAULT_CART),
    voucherApplied: sessionState?.voucherApplied ? { ...sessionState.voucherApplied } : null,
    walletConnected: !!sessionState?.walletConnected,
    walletAddress: sessionState?.walletAddress || '',
  };
  writePersistedState(state);
}

function saveRegisteredAccount(user, password) {
  return;
}

function readPersistedUser() {
  try {
    const raw = ss.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    return null;
  }
}

function persistCurrentUserSnapshot(user) {
  try {
    if (!user) {
      ss.removeItem(USER_STORAGE_KEY);
      return;
    }

    ss.setItem(USER_STORAGE_KEY, JSON.stringify({
      ...user,
      address: user.address || {},
      accountData: user.accountData || { orders: [], nfts: [] },
    }));
  } catch (err) {
  }
}

/* ─── PRODUCT CATALOG ─── */
function parseTextPrice(value) {
  return Number(String(value || '').replace(/[^\d]/g, '')) || 0;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildDiscountLabel(price, oldPrice) {
  if (!(oldPrice > price && price > 0)) return '';
  const percent = Math.round((1 - (price / oldPrice)) * 100);
  return percent > 0 ? `-${percent}%` : '';
}

function buildCatalogBadges(product) {
  const badges = [];
  if (product.sale) {
    badges.push({ className: 'badge-sale', label: buildDiscountLabel(product.price, product.oldPrice) || 'SALE' });
  } else if (product.featuredIndex <= 1) {
    badges.push({ className: 'badge-hot', label: 'HOT' });
  } else {
    badges.push({ className: 'badge-new', label: 'MỚI' });
  }

  if (product.nft) {
    badges.push({ className: 'badge-nft', label: 'NFT' });
  }

  return badges;
}

function createProductCard(product) {
  const card = document.createElement('div');
  const badges = buildCatalogBadges(product)
    .map(badge => `<span class="badge ${badge.className}">${escapeHtml(badge.label)}</span>`)
    .join('');
  const specs = (product.specs || [])
    .slice(0, 3)
    .map(spec => `<span class="spec">${escapeHtml(spec)}</span>`)
    .join('');
  const discountLabel = buildDiscountLabel(product.price, product.oldPrice);
  const oldPriceLine = product.oldPrice > 0 ? `<div class="prod-old">Giá cũ: ${fmt(product.oldPrice)}</div>` : '';
  const cryptoLine = product.crypto ? `<div class="prod-crypto">${escapeHtml(product.crypto)}</div>` : '';
  const nftLine = product.nft && product.warranty ? `<div class="prod-nft-badge">◈ Kèm NFT bảo hành ${escapeHtml(product.warranty)}</div>` : '';

  card.className = 'prod-card';
  card.dataset.id = product.id;
  card.dataset.category = product.category;
  card.dataset.price = String(product.price || 0);
  card.dataset.oldPrice = String(product.oldPrice || 0);
  card.dataset.name = product.name;
  card.dataset.nft = String(!!product.nft);
  card.dataset.sale = String(!!product.sale);
  card.dataset.image = product.image || '';
  card.innerHTML = `
    <div class="prod-badges">${badges}</div>
    <div class="prod-img" onclick="openQuickView('${escapeHtml(product.id)}', event)">${escapeHtml(product.icon || '🛒')}</div>
    <div class="prod-name" onclick="openQuickView('${escapeHtml(product.id)}', event)">${escapeHtml(product.name)}</div>
    <div class="prod-specs">${specs}</div>
    <div class="prod-rating"><span class="stars">${escapeHtml(product.rating || '')}</span><span class="rating-count">${escapeHtml(product.ratingCount || '')}</span></div>
    <div class="prod-price-row">
      <span class="prod-price">${fmt(product.price)}</span>
      ${product.oldPrice > 0 ? `<span class="prod-old">${fmt(product.oldPrice)}</span>` : ''}
      ${discountLabel ? `<span class="prod-discount">${escapeHtml(discountLabel)}</span>` : ''}
    </div>
    ${oldPriceLine}
    ${cryptoLine}
    ${nftLine}
    <button class="add-cart-btn" onclick="addProductToCart('${escapeHtml(product.id)}')">🛒 Thêm vào giỏ</button>
    <div class="prod-actions">
      <button class="prod-ghost-btn" data-favorite-btn="${escapeHtml(product.id)}" onclick="toggleFavorite('${escapeHtml(product.id)}', event)">♡ Yêu thích</button>
      <button class="prod-ghost-btn" onclick="openQuickView('${escapeHtml(product.id)}', event)">Xem nhanh</button>
    </div>
  `;

  return card;
}

async function buildProductCatalog() {
  const grid = document.getElementById('featuredProductGrid');
  const products = await apiFetch('/api/catalog/products');
  if (!Array.isArray(products)) {
    productCatalog = [];
    grid.innerHTML = '';
    return;
  }

  productCatalog = products.map((product, index) => {
    const card = createProductCard(product);
    return {
      id: String(product.id),
      featuredIndex: Number(product.featuredIndex ?? index),
      card,
      name: product.name || '',
      category: product.category || 'Khác',
      price: Number(product.price || 0),
      oldPrice: Number(product.oldPrice || 0),
      nft: !!product.nft,
      sale: !!product.sale,
      image: product.image || '',
      icon: product.icon || '🛒',
      specs: Array.isArray(product.specs) ? product.specs : [],
      crypto: product.crypto || '',
      rating: product.rating || '',
      ratingCount: product.ratingCount || '',
      warranty: product.warranty || '',
      addToCartPayload: {
        id: String(product.id),
        name: product.name || '',
        price: Number(product.price || 0),
        eth: Number(product.cryptoPrice || 0),
        oldPrice: Number(product.oldPrice || 0),
        icon: product.icon || '🛒',
        nft: !!product.nft,
        warranty: product.warranty || '',
      },
    };
  });

  grid.innerHTML = '';
  productCatalog.forEach(product => grid.appendChild(product.card));
  hydrateProductImages();
}

function hydrateProductImages() {
  productCatalog.forEach(product => {
    const imageWrap = product.card.querySelector('.prod-img');
    if (!imageWrap) return;
    imageWrap.innerHTML = buildImageMarkup(product.image, product.name, product.icon, 'prod-img-fallback');
  });
}

function buildImageMarkup(path, alt, fallback, fallbackClass) {
  if (path && path.startsWith('inline:')) {
    const inlineKey = path.replace('inline:', '');
    const inlineSvg = INLINE_PRODUCT_ART[inlineKey];
    if (inlineSvg) return inlineSvg;
  }
  if (!path) return fallback;
  return `
    <span class="${fallbackClass}">${fallback}</span>
    <img src="${path}" alt="${alt}" loading="lazy" onload="this.previousElementSibling.style.display='none';" onerror="this.style.display='none';">
  `;
}

function getProductById(productId) {
  return productCatalog.find(product => product.id === productId) || null;
}

function hydrateUiState() {
  const saved = readUiState();
  favoriteProductIds = Array.isArray(saved.favorites) ? saved.favorites.filter(id => getProductById(id)) : [];
  catalogState = {
    ...DEFAULT_CATALOG_STATE,
    ...(saved.catalog || {}),
  };

  document.getElementById('searchInput').value = catalogState.query || '';
  document.getElementById('catalogSort').value = catalogState.sort || 'featured';
  document.getElementById('filterNftBtn').classList.toggle('active', !!catalogState.onlyNft);
  document.getElementById('filterSaleBtn').classList.toggle('active', !!catalogState.onlySale);
  document.querySelectorAll('.sec-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.trim() === catalogState.category);
  });
  syncCatalogScopeUi();
}

function getCatalogBaseProducts() {
  if (catalogState.showAll) {
    return [...productCatalog];
  }

  return [...productCatalog]
    .sort((a, b) => a.featuredIndex - b.featuredIndex)
    .slice(0, FEATURED_CATALOG_LIMIT);
}

function syncCatalogScopeUi() {
  const seeAllButton = document.getElementById('catalogSeeAllBtn');
  if (seeAllButton) {
    if (isAllProductsPage()) {
      seeAllButton.textContent = 'Về trang chủ ›';
      return;
    }
    seeAllButton.textContent = catalogState.showAll ? 'Thu gọn ›' : 'Xem tất cả ›';
  }
}

function applyCatalogFilters() {
  const grid = document.getElementById('featuredProductGrid');
  const normalizedQuery = (catalogState.query || '').trim().toLowerCase();
  const filtered = getCatalogBaseProducts().filter(product => {
    const matchQuery = !normalizedQuery || [product.name, product.category, ...product.specs].join(' ').toLowerCase().includes(normalizedQuery);
    const matchCategory = catalogState.category === 'Tất cả'
      || product.category === catalogState.category
      || (catalogState.category === 'CPU' && product.category === 'Mainboard');
    const matchNft = !catalogState.onlyNft || product.nft;
    const matchSale = !catalogState.onlySale || product.sale;
    return matchQuery && matchCategory && matchNft && matchSale;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (catalogState.sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name-asc': return a.name.localeCompare(b.name, 'vi');
      default: return a.featuredIndex - b.featuredIndex;
    }
  });

  productCatalog.forEach(product => product.card.classList.add('hidden'));
  sorted.forEach(product => {
    product.card.classList.remove('hidden');
    grid.appendChild(product.card);
  });

  document.getElementById('catalogResultCount').textContent = sorted.length;
  document.getElementById('catalogEmptyState').classList.toggle('active', sorted.length === 0);
  document.getElementById('filterNftBtn').classList.toggle('active', !!catalogState.onlyNft);
  document.getElementById('filterSaleBtn').classList.toggle('active', !!catalogState.onlySale);
  syncCatalogScopeUi();
  persistUiState();
  return sorted.length;
}

function changeCatalogSort(value) {
  catalogState.sort = value;
  applyCatalogFilters();
}

function toggleCatalogFlag(type) {
  if (type === 'nft') catalogState.onlyNft = !catalogState.onlyNft;
  if (type === 'sale') catalogState.onlySale = !catalogState.onlySale;
  applyCatalogFilters();
}

function resetCatalogFilters() {
  catalogState = { ...DEFAULT_CATALOG_STATE };
  document.getElementById('searchInput').value = '';
  document.getElementById('catalogSort').value = catalogState.sort;
  document.querySelectorAll('.sec-tab').forEach(tab => tab.classList.toggle('active', tab.textContent.trim() === 'Tất cả'));
  applyCatalogFilters();
}

function toggleCatalogScope() {
  catalogState.showAll = !catalogState.showAll;
  applyCatalogFilters();
  focusCatalog();
  showToast(
    catalogState.showAll
      ? 'Đang hiển thị toàn bộ sản phẩm từ database.'
      : 'Đã quay về danh sách sản phẩm nổi bật.',
    'info'
  );
}

function focusCatalog() {
  document.getElementById('featuredProductsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isAllProductsPage() {
  return !!document.getElementById('allProductsPage');
}

function openAllProductsPage() {
  window.location.href = '/Home/AllProducts';
}

function setCatalogCategory(categoryLabel) {
  catalogState.category = categoryLabel;
  document.querySelectorAll('.sec-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.trim() === categoryLabel);
  });
}

function setActiveNav(key) {
  document.querySelectorAll('.nav-item[data-nav-key]').forEach(item => {
    item.classList.toggle('active', item.dataset.navKey === key);
  });
}

function applyShowcaseRoute(routeKey, options = {}) {
  const routeMap = {
    'home': { category: 'Táº¥t cáº£', query: '', note: '' },
    'cpu-main': { category: 'CPU', query: '', note: 'Äang xem CPU vĂ  mainboard ná»•i báº­t' },
    'gpu': { category: 'GPU', query: '', note: 'Äang xem card Ä‘á»“ há»a ná»•i báº­t' },
    'ram-ssd': { category: 'Táº¥t cáº£', query: 'DDR5', note: 'Äang Æ°u tiĂªn nhĂ³m RAM/SSD trong dá»¯ liá»‡u demo' },
    'monitor': { category: 'Táº¥t cáº£', query: 'MĂ n hĂ¬nh', note: 'Hiá»‡n dá»¯ liá»‡u demo chÆ°a cĂ³ nhiá»u mĂ n hĂ¬nh' },
    'case-psu': { category: 'Táº¥t cáº£', query: 'PSU', note: 'NhĂ³m Case/PSU Ä‘ang chá» thĂªm sáº£n pháº©m demo' },
    'peripheral': { category: 'Táº¥t cáº£', query: 'Chuá»™t', note: 'NhĂ³m ngoáº¡i vi Ä‘ang chá» thĂªm sáº£n pháº©m demo' },
    'build-pc': { category: 'Táº¥t cáº£', query: '', note: 'Mục Build PC nĂªn lĂ m sau báº±ng combo cáº¥u hĂ¬nh sáºµn' },
    'cooling': { category: 'Táº¥t cáº£', query: 'Táº£n', note: 'NhĂ³m táº£n nhiá»‡t Ä‘ang chá» thĂªm sáº£n pháº©m demo' },
    'gaming-pc': { category: 'Táº¥t cáº£', query: '', note: 'Mục PC Gaming nĂªn lĂ m sau báº±ng combo build sáºµn' },
  };

  const route = routeMap[routeKey] || routeMap.home;
  catalogState.query = route.query || '';
  document.getElementById('searchInput').value = catalogState.query;
  setCatalogCategory(route.category || 'Táº¥t cáº£');
  applyCatalogFilters();
  focusCatalog();
  if (route.note && !options.silent) showToast(route.note, 'info');
}

function handleQuickCategory(routeKey) {
  applyShowcaseRoute(routeKey);
  const navKey = ['cpu-main', 'gpu', 'ram-ssd', 'monitor', 'case-psu', 'peripheral'].includes(routeKey) ? routeKey : 'home';
  setActiveNav(navKey);
}

function handleNavAction(routeKey, el) {
  setActiveNav(routeKey);
  if (routeKey === 'home') {
    document.querySelector('.main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  applyShowcaseRoute(routeKey);
}

/* Override route text with safe strings to avoid mojibake in local-file demos */
function applyShowcaseRoute(routeKey, options = {}) {
  const routeMap = {
    'home': { category: 'Tất cả', query: '', note: '' },
    'cpu-main': { category: 'CPU', query: '', note: 'Dang xem CPU va mainboard noi bat' },
    'gpu': { category: 'GPU', query: '', note: 'Dang xem card do hoa noi bat' },
    'ram-ssd': { category: 'Tất cả', query: 'DDR5', note: 'Dang uu tien nhom RAM/SSD trong du lieu demo' },
    'monitor': { category: 'Tất cả', query: 'Màn hình', note: 'Nhom man hinh hien chua co nhieu du lieu demo' },
    'case-psu': { category: 'Tất cả', query: 'PSU', note: 'Nhom Case/PSU dang cho them san pham demo' },
    'peripheral': { category: 'Tất cả', query: 'Chuột', note: 'Nhom ngoai vi dang cho them san pham demo' },
    'build-pc': { category: 'Tất cả', query: '', note: 'Muc Build PC se hop hon khi co combo cau hinh san' },
    'cooling': { category: 'Tất cả', query: 'Tản', note: 'Nhom tan nhiet dang cho them san pham demo' },
    'gaming-pc': { category: 'Tất cả', query: '', note: 'Muc PC Gaming nen lam sau bang combo build san' },
  };

  const route = routeMap[routeKey] || routeMap.home;
  catalogState.query = route.query || '';
  document.getElementById('searchInput').value = catalogState.query;
  setCatalogCategory(route.category || 'Tất cả');
  applyCatalogFilters();
  focusCatalog();
  if (route.note && !options.silent) showToast(route.note, 'info');
}

function applyShowcaseRoute(routeKey, options = {}) {
  const routeMap = {
    'home': { category: 'Tất cả', query: '', note: '' },
    'cpu-main': { category: 'CPU', query: '', note: 'Dang xem CPU va mainboard noi bat' },
    'gpu': { category: 'GPU', query: '', note: 'Dang xem card do hoa noi bat' },
    'ram-ssd': { category: 'Tất cả', query: 'DDR5', note: 'Dang uu tien nhom RAM/SSD trong du lieu demo' },
    'monitor': { category: 'Màn hình', query: '', note: 'Dang xem man hinh demo' },
    'case-psu': { category: 'Case & PSU', query: '', note: 'Dang xem Case va PSU demo' },
    'peripheral': { category: 'Ngoại vi', query: '', note: 'Dang xem thiet bi ngoai vi demo' },
    'build-pc': { category: 'PC Gaming', query: '', note: 'Dang xem combo PC Gaming demo' },
    'cooling': { category: 'Tản nhiệt', query: '', note: 'Dang xem tan nhiet demo' },
    'gaming-pc': { category: 'PC Gaming', query: '', note: 'Dang xem PC Gaming demo' },
  };

  const route = routeMap[routeKey] || routeMap.home;
  catalogState.query = route.query || '';
  document.getElementById('searchInput').value = catalogState.query;
  setCatalogCategory(route.category || 'Tất cả');
  applyCatalogFilters();
  focusCatalog();
  if (route.note && !options.silent) showToast(route.note, 'info');
}

function syncFavoriteUi() {
  const count = favoriteProductIds.length;
  document.getElementById('favoriteCount').textContent = count;
  document.querySelectorAll('[data-favorite-btn]').forEach(btn => {
    const isActive = favoriteProductIds.includes(btn.dataset.favoriteBtn);
    btn.classList.toggle('active', isActive);
    btn.textContent = isActive ? '♥ Đã lưu' : '♡ Yêu thích';
  });
  const qvBtn = document.getElementById('qvFavoriteBtn');
  if (qvBtn && currentQuickViewId) {
    const active = favoriteProductIds.includes(currentQuickViewId);
    qvBtn.classList.toggle('active', active);
    qvBtn.textContent = active ? '♥ Đã lưu yêu thích' : '♡ Yêu thích';
  }
}

function toggleFavorite(productId, event) {
  if (event) event.stopPropagation();
  if (favoriteProductIds.includes(productId)) {
    favoriteProductIds = favoriteProductIds.filter(id => id !== productId);
    showToast('Đã bỏ khỏi danh sách yêu thích', 'info');
  } else {
    favoriteProductIds = [productId, ...favoriteProductIds.filter(id => id !== productId)].slice(0, 12);
    showToast('Đã thêm vào danh sách yêu thích');
  }
  syncFavoriteUi();
  persistUiState();
  if (document.getElementById('favoritesModal').classList.contains('active')) renderFavorites();
}

function toggleFavoriteFromQuickView() {
  if (currentQuickViewId) toggleFavorite(currentQuickViewId);
}

function openQuickView(productId, event) {
  if (event) event.stopPropagation();
  const product = getProductById(productId);
  if (!product) return;

  currentQuickViewId = productId;
  document.getElementById('qvVisual').innerHTML = buildImageMarkup(product.image, product.name, product.icon, 'qv-visual-fallback');
  document.getElementById('qvTitle').textContent = product.name;
  document.getElementById('qvPrice').textContent = fmt(product.price);
  document.getElementById('qvOldPrice').textContent = product.oldPrice > 0 ? fmt(product.oldPrice) : '';
  document.getElementById('qvDesc').textContent = `${product.category} chính hãng, phù hợp cho build PC hiệu năng cao. Giữ phong cách trưng bày nhanh của SilverFlag nhưng bổ sung lớp xem chi tiết để chốt đơn thuận tiện hơn.`;
  document.getElementById('qvMeta').innerHTML = `
    <span class="qv-badge">${product.category}</span>
    <span class="qv-badge">${product.rating || '★★★★★'} ${product.ratingCount || ''}</span>
    ${product.nft ? '<span class="qv-badge nft">◈ NFT bảo hành</span>' : ''}
    ${product.sale ? '<span class="qv-badge sale">Đang khuyến mãi</span>' : ''}
  `;
  document.getElementById('qvSpecs').innerHTML = product.specs.map(spec => `<span class="qv-spec">${spec}</span>`).join('');
  document.getElementById('qvBenefits').innerHTML = `
    <div class="qv-benefit">⚡ Giá retail cập nhật theo phong cách siêu thị linh kiện của trang gốc.</div>
    <div class="qv-benefit">🛡️ ${product.warranty || 'Bảo hành chính hãng toàn quốc.'}</div>
    <div class="qv-benefit">◈ ${product.crypto || 'Hỗ trợ thanh toán crypto với ưu đãi sẵn có.'}</div>
    <div class="qv-benefit">🚚 Miễn phí giao hàng nội thành cho đơn phù hợp.</div>
  `;
  document.getElementById('qvAddCartBtn').onclick = () => addToCart(product.addToCartPayload || {
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    icon: product.icon,
    nft: product.nft,
  });
  syncFavoriteUi();
  document.getElementById('quickViewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderFavorites() {
  const container = document.getElementById('favoritesBody');
  const products = favoriteProductIds.map(getProductById).filter(Boolean);

  if (!products.length) {
    container.innerHTML = `
      <div class="favorite-empty">
        <div class="catalog-empty-icon">❤️</div>
        <div class="catalog-empty-title">Chưa có sản phẩm yêu thích</div>
        <div class="catalog-empty-sub">Hãy lưu vài cấu hình hoặc linh kiện để quay lại so sánh nhanh.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="favorite-list">
      ${products.map(product => `
        <div class="favorite-item">
          <div class="favorite-icon">${buildImageMarkup(product.image, product.name, product.icon, 'favorite-icon-fallback')}</div>
          <div>
            <div class="favorite-name">${product.name}</div>
            <div class="favorite-meta">${product.category} · ${product.specs.join(' · ')}</div>
            <div class="favorite-price">${fmt(product.price)}</div>
          </div>
          <div class="favorite-actions">
            <button class="qv-primary" onclick="addFavoriteToCart('${product.id}')">Thêm vào giỏ</button>
            <button class="qv-secondary" onclick="openQuickViewFromFavorites('${product.id}')">Xem nhanh</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addFavoriteToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  addToCart(product.addToCartPayload || {
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    icon: product.icon,
    nft: product.nft,
  });
}

function addProductToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  addToCart(product.addToCartPayload || {
    id: product.id,
    name: product.name,
    price: product.price,
    eth: parseFloat(String(product.crypto || '').replace(/[^\d.]/g, '')) || 0,
    oldPrice: product.oldPrice,
    icon: product.icon,
    nft: product.nft,
    warranty: product.warranty || '',
  });
}

function openQuickViewFromFavorites(productId) {
  closeModal('favoritesModal');
  openQuickView(productId);
}

function openFavoritesModal() {
  renderFavorites();
  document.getElementById('favoritesModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ─── AUTH MODAL ─── */
function openAuthModal() {
  switchAuthTab('login');
  document.getElementById('authModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
  document.body.style.overflow = '';
}
function authOverlayClick(e) {
  if (e.target === document.getElementById('authModal')) closeAuthModal();
}
function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
  document.getElementById('formLogin').style.display = isLogin ? '' : 'none';
  document.getElementById('formRegister').style.display = isLogin ? 'none' : '';
}
function clearAuthErr(id) { document.getElementById(id).classList.remove('show'); }
function togglePw(inputId, eyeEl) {
  const el = document.getElementById(inputId);
  el.type = el.type === 'password' ? 'text' : 'password';
  eyeEl.textContent = el.type === 'password' ? '👁' : '🙈';
}
function checkPwStrength(pw) {
  const bar = document.getElementById('pwStrengthBar');
  const txt = document.getElementById('pwStrengthTxt');
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const levels = [
    {w:'0%',  c:'var(--red)',    t:''},
    {w:'25%', c:'var(--red)',    t:'Yếu'},
    {w:'50%', c:'var(--orange)', t:'Trung bình'},
    {w:'75%', c:'#2196f3',      t:'Khá mạnh'},
    {w:'100%',c:'var(--green)',  t:'Mạnh'},
  ];
  const l = levels[score];
  bar.style.width = l.w; bar.style.background = l.c; txt.textContent = l.t;
}
function showForgotPw() {
  const email = document.getElementById('loginEmail').value.trim();
  if (email) {
    closeAuthModal();
    showToast(`📧 Đã gửi link khôi phục đến: ${email}`);
  } else {
    document.getElementById('loginEmail').focus();
    showToast('Nhập email để khôi phục mật khẩu', 'warn');
  }
}
function socialLogin(provider) {
  if (provider === 'Web3') {
    connectWallet('MetaMask', { closeAuth: true, requireLoginMessage: true });
    return;
  }

  closeAuthModal();
  showToast(`Kênh đăng nhập ${provider} chưa được cấu hình với backend.`, 'warn');
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pw    = document.getElementById('loginPw').value;
  let hasErr  = false;
  const isAdminLogin = email === 'admin';
  if (!email || (!isAdminLogin && !/\S+@\S+/.test(email) && !/^\d{10}/.test(email))) {
    document.getElementById('loginEmailErr').classList.add('show'); hasErr = true;
  }
  if (!pw) { document.getElementById('loginPwErr').classList.add('show'); hasErr = true; }
  if (hasErr) return;

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Đang đăng nhập...'; btn.classList.add('loading');

  try {
    const user = await apiFetch('/api/account/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pw }),
    });
    btn.textContent = 'Đăng nhập'; btn.classList.remove('loading');
    closeAuthModal();
    simulateLogin(user);
    showToast(`👋 Chào mừng trở lại, ${user.name.split(' ').pop()}!`);
  } catch (err) {
    btn.textContent = 'Đăng nhập'; btn.classList.remove('loading');
    document.getElementById('loginPwErr').textContent = err.message || 'Đăng nhập thất bại';
    document.getElementById('loginPwErr').classList.add('show');
  }
}

async function doRegister() {
  const first = document.getElementById('regFirst').value.trim();
  const last  = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const pw    = document.getElementById('regPw').value;
  const pw2   = document.getElementById('regPw2').value;
  let hasErr  = false;

  if (!email || !/\S+@\S+/.test(email)) {
    document.getElementById('regEmailErr').classList.add('show'); hasErr = true;
  }
  if (pw.length < 6) {
    document.getElementById('regPw2Err').textContent = 'Mật khẩu cần ít nhất 6 ký tự';
    document.getElementById('regPw2Err').classList.add('show'); hasErr = true;
  }
  if (pw !== pw2) {
    document.getElementById('regPw2Err').textContent = 'Mật khẩu không khớp';
    document.getElementById('regPw2Err').classList.add('show'); hasErr = true;
  }
  if (hasErr) return;

  const btn = document.getElementById('registerBtn');
  btn.textContent = 'Đang tạo tài khoản...'; btn.classList.add('loading');

  try {
    const fullName = (last + ' ' + first).trim() || email.split('@')[0];
    const user = await apiFetch('/api/account/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: pw,
        fullName,
        phoneNumber: phone,
      }),
    });

    btn.textContent = 'Tạo tài khoản'; btn.classList.remove('loading');
    closeAuthModal();
    simulateLogin(user);
    showToast(`🎉 Đăng ký thành công! Chào mừng ${fullName}!`);
  } catch (err) {
    btn.textContent = 'Tạo tài khoản'; btn.classList.remove('loading');
    document.getElementById('regEmailErr').textContent = err.message || 'Không thể tạo tài khoản';
    document.getElementById('regEmailErr').classList.add('show');
  }
}

/* ─── ACCOUNT PAGE ─── */
function simulateLogin(user) {
  if (user?.isAdmin && user?.redirectUrl) {
    window.location.href = user.redirectUrl;
    return;
  }

  const persistedState = readPersistedState();
  const savedAccountState = getSavedAccountState(getAccountKey(user));
  const fallbackState = currentUser
    ? {
        cart,
        voucherApplied,
        walletConnected,
        walletAddress,
      }
    : (persistedState.guest || buildDefaultSessionState());
  const nextSessionState = savedAccountState || fallbackState;

  currentUser = {
      ...user,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || {},
      accountData: user.accountData || { orders: [], nfts: [] },
    };
    persistCurrentUserSnapshot(currentUser);
    applySessionState({
      ...buildDefaultSessionState(),
      ...nextSessionState,
      walletConnected: nextSessionState.walletConnected ?? walletConnected,
      walletAddress: nextSessionState.walletAddress || walletAddress,
    });
    persistCurrentState();
    /* Update header button */
    document.getElementById('headerAccLabel').textContent = (currentUser.name || '').split(' ').pop();
  /* Update account page data */
  const initials = (currentUser.avatar || currentUser.name.split(' ').map(w=>w[0]).join('')).slice(0,2).toUpperCase();
  document.getElementById('accAvatar').textContent     = initials;
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('accUserName').textContent   = currentUser.name;
  document.getElementById('profileName').textContent   = currentUser.name;
  document.getElementById('accUserEmail').textContent  = currentUser.email || '';
  document.getElementById('accOrderCount').textContent = currentUser.accountData.orders.length;
  document.getElementById('accPointsTop').textContent  = (currentUser.points||0).toLocaleString('vi-VN');
  document.getElementById('accNftCount').textContent   = currentUser.accountData.nfts.length;
  document.getElementById('loyaltyPoints').textContent = (currentUser.points||0).toLocaleString('vi-VN');
    document.getElementById('pfFirst').value  = currentUser.name.split(' ').pop();
    document.getElementById('pfLast').value   = currentUser.name.split(' ').slice(0,-1).join(' ') || '';
    document.getElementById('pfEmail').value  = currentUser.email || '';
    document.getElementById('pfPhone').value  = currentUser.phone || '';
    renderAccountData();
  }

function hydrateCurrentUserFromSnapshot() {
  if (currentUser) return currentUser;

  const persistedUser = readPersistedUser();
  if (!persistedUser || persistedUser.isAdmin) return null;

  simulateLogin(persistedUser);
  return currentUser;
}

function handleAccountClick() {
  hydrateCurrentUserFromSnapshot();
  if (currentUser?.isAdmin && currentUser?.redirectUrl) {
    window.location.href = currentUser.redirectUrl;
    return;
  }
  if (currentUser) openAccountPage();
  else openAuthModal();
}

function openAccountPage() {
  document.getElementById('accountPage').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openMyNftsEntry() {
  hydrateCurrentUserFromSnapshot();
  if (!currentUser) {
    openAuthModal();
    showToast('Vui lòng đăng nhập để xem NFT bảo hành của bạn', 'warn');
    return;
  }

  openAccountPage();
  const nftNav = Array.from(document.querySelectorAll('.acc-nav-item'))
    .find(item => item.textContent.includes('NFT bảo hành'));

  if (nftNav) {
    switchAccPanel('nft', nftNav);
  }
}

function closeAccountPage() {
  document.getElementById('accountPage').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAccPanel(id, el) {
  document.querySelectorAll('.acc-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.acc-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  el.classList.add('active');
}

async function saveProfile() {
  if (!currentUser) return;
  const first = document.getElementById('pfFirst').value.trim();
  const last  = document.getElementById('pfLast').value.trim();
  const name  = (last + ' ' + first).trim();
  const phone = document.getElementById('pfPhone').value.trim();

  try {
    const user = await apiFetch('/api/account/profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName: name, phoneNumber: phone }),
    });
    simulateLogin(user);
    document.getElementById('headerAccLabel').textContent = first || name.split(' ').pop();
    showToast('✅ Đã lưu thông tin cá nhân!');
  } catch (err) {
    showToast(err.message || 'Không thể lưu hồ sơ', 'warn');
  }
}

async function saveAddress() {
  if (!currentUser) return;

  const recipientName = document.getElementById('addrRecipientName').value.trim();
  const phoneNumber = document.getElementById('addrPhone').value.trim();
  const shippingAddress = document.getElementById('addrShippingAddress').value.trim();
  const contactEmail = document.getElementById('addrContactEmail').value.trim();

  if (!recipientName || !phoneNumber || !shippingAddress) {
    showToast('Vui lòng nhập đủ người nhận, số điện thoại và địa chỉ giao hàng', 'warn');
    return;
  }

  try {
    const user = await apiFetch('/api/account/address', {
      method: 'PUT',
      body: JSON.stringify({
        recipientName,
        phoneNumber,
        shippingAddress,
        contactEmail,
      }),
    });
    simulateLogin(user);
    showToast('✅ Đã lưu địa chỉ giao hàng');
  } catch (err) {
    showToast(err.message || 'Không thể lưu địa chỉ', 'warn');
  }
}

function toggleSecurity(el, label) {
  el.classList.toggle('on');
  const on = el.classList.contains('on');
  showToast(`${on ? '✅ Bật' : '⛔ Tắt'} ${label}`, on ? '' : 'warn');
  if (label === 'Web3' && on && walletConnected) {
    document.getElementById('web3LoginDesc').textContent = 'Đã kết nối: ' + document.getElementById('walletHeaderText').textContent;
  }
}

async function doLogout() {
  try {
    await apiFetch('/api/account/logout', { method: 'POST' });
  } catch (err) {}
  currentUser = null;
  persistCurrentUserSnapshot(null);
  document.getElementById('headerAccLabel').textContent = 'Đăng nhập';
  document.getElementById('accWeb3Badge').style.display = 'none';
  const guestState = readPersistedState().guest || buildDefaultSessionState();
  applySessionState({
    ...buildDefaultSessionState(),
    ...guestState,
    walletConnected: guestState.walletConnected ?? walletConnected,
    walletAddress: guestState.walletAddress || walletAddress,
  });
  persistCurrentState();
  closeAccountPage();
  showToast('👋 Đã đăng xuất thành công', 'info');
}

async function restoreServerSession() {
  try {
    const user = await apiFetch('/api/account/me');
    if (user) {
      simulateLogin(user);
    }
  } catch (err) {
    if (!hydrateCurrentUserFromSnapshot()) {
      currentUser = null;
    }
  } finally {
    await syncWalletFromProvider();
    loadHomeNftShowcase();
  }
}


/* ─── STATE ─── */
let walletConnected = false;
let voucherApplied = null; // { code, pct }
let walletAddress = '';
let walletProviderInitialized = false;
let bankProofFile = null;
let bankProofUploadedUrl = '';
const nftMetadataCache = new Map();
const BANK_TRANSFER_ACCOUNT_NO = '141329092005';
const BANK_TRANSFER_BANK_CODE = 'MB';
const BANK_TRANSFER_ACCOUNT_NAME = 'SILVERFLAG PC';
const ESCROW_CONTRACT_ADDRESS = '0xdc251d82647e3FA2c4D5200eCcd3622b85d61263';
const ESCROW_SAPPHIRE_TESTNET = {
  chainId: '0x5aff',
  chainName: 'Oasis Sapphire Testnet',
  nativeCurrency: {
    name: 'TEST',
    symbol: 'TEST',
    decimals: 18,
  },
  rpcUrls: ['https://testnet.sapphire.oasis.dev'],
  blockExplorerUrls: ['https://explorer.oasis.io/testnet/sapphire']
};
const ESCROW_ABI = [
  'function confirmDelivery(uint256 orderId)',
  'function getOrder(uint256 orderId) view returns (address buyer, address seller, uint256 amount, uint8 status)',
  'function refundBuyer(uint256 orderId)'
];
let bankTransferContent = 'SF PAYMENT';

const VOUCHERS = {
  'CRYPTO5': { pct: 5,  label: 'Crypto -5%' },
  'SALE10':  { pct: 10, label: 'Khuyến mãi -10%' },
};

/* Initial cart items (3 pre-filled) */
let cart = cloneCart(DEFAULT_CART);

/* ─── HELPERS ─── */
function fmt(n) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatWalletAddress(address) {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getEthereumProvider() {
  return typeof window !== 'undefined' ? window.ethereum : null;
}

function setWalletState(address) {
  walletConnected = !!address;
  walletAddress = address || '';
  syncWalletUi();
  persistCurrentState();
  if (document.getElementById('cartDrawer')?.classList.contains('open')) {
    renderSummary();
  }
}

function clearWalletState() {
  setWalletState('');
}

async function syncWalletFromProvider() {
  const provider = getEthereumProvider();
  if (!provider) {
    clearWalletState();
    return null;
  }

  try {
    const accounts = await provider.request({ method: 'eth_accounts' });
    const nextAddress = Array.isArray(accounts) && accounts.length ? accounts[0] : '';
    setWalletState(nextAddress);
    return nextAddress || null;
  } catch (err) {
    clearWalletState();
    return null;
  }
}

function handleWalletAccountsChanged(accounts) {
  const nextAddress = Array.isArray(accounts) && accounts.length ? accounts[0] : '';
  setWalletState(nextAddress);
  showToast(
    nextAddress ? `Đã kết nối ví ${formatWalletAddress(nextAddress)}` : 'Ví đã bị ngắt kết nối khỏi trình duyệt.',
    nextAddress ? '' : 'warn'
  );
}

function handleWalletChainChanged() {
  syncWalletFromProvider();
}

function initializeWalletIntegration() {
  const provider = getEthereumProvider();
  if (!provider || walletProviderInitialized) {
    if (!provider) {
      syncWalletUi();
    }
    return;
  }

  provider.on?.('accountsChanged', handleWalletAccountsChanged);
  provider.on?.('chainChanged', handleWalletChainChanged);
  walletProviderInitialized = true;
  syncWalletFromProvider();
}

function formatShortDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatShortTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function createOrderId() {
  return '#SF' + Date.now().toString().slice(-6);
}

function addCompletedPurchaseToAccount(purchasedItems, orderId) {
  return { nftCount: 0 };
}

function syncWalletUi() {
  const displayAddress = walletConnected ? formatWalletAddress(walletAddress) : '';
  document.getElementById('walletHeaderBtn').classList.toggle('connected', walletConnected);
  document.getElementById('walletHeaderText').textContent = walletConnected ? displayAddress : 'Kết nối ví';
  document.getElementById('wsDot').classList.toggle('on', walletConnected);
  document.getElementById('wsText').textContent = walletConnected ? displayAddress : 'Chưa kết nối ví';
  document.getElementById('connectMiniBtn').textContent = walletConnected ? '✅ Đã kết nối' : 'Kết nối ví →';
  document.getElementById('connectMiniBtn').style.background = walletConnected ? 'var(--green)' : '';
  document.getElementById('cdWalletStatus').textContent = walletConnected ? displayAddress : 'Chưa kết nối ví';
  document.getElementById('accWeb3Badge').style.display = currentUser && walletConnected ? '' : 'none';
  document.getElementById('toggleWeb3').classList.toggle('on', walletConnected);
  document.getElementById('web3LoginDesc').textContent = walletConnected ? (`Đã kết nối: ${displayAddress}`) : 'Chưa kết nối ví';
}

function renderOrders() {
  const container = document.getElementById('accOrdersList');
  const orders = currentUser?.accountData?.orders || [];
  document.getElementById('accOrdersBadge').textContent = orders.length;

  if (!orders.length) {
    container.innerHTML = `
      <div style="border:1px dashed var(--border);border-radius:10px;padding:28px 20px;text-align:center;color:var(--text-3)">
        <div style="font-size:28px;margin-bottom:8px">📦</div>
        <div style="font-weight:700;color:var(--text-2);margin-bottom:4px">Chưa có đơn hàng nào</div>
        <div>Account này đang bắt đầu từ trạng thái mới.</div>
      </div>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="acc-order-item">
      <div class="acc-order-head">
        <div><div class="acc-order-id">${order.id}</div><div class="acc-order-date">${order.date} · ${order.items}</div></div>
        <span class="acc-order-status ${order.statusClass}">${order.statusText}</span>
      </div>
      <div class="acc-order-body">
        <div class="acc-order-prods">${order.products}</div>
        <div class="acc-order-meta" style="margin-top:8px;color:var(--text-2);font-size:13px;line-height:1.5">
          <div>${escapeHtml(order.recipientName || '')}${order.recipientPhone ? ` · ${escapeHtml(order.recipientPhone)}` : ''}</div>
          <div>${escapeHtml(order.shippingAddress || '')}</div>
          ${(order.contactEmail || '') ? `<div>${escapeHtml(order.contactEmail)}</div>` : ''}
        </div>
        <div class="acc-order-footer">
          <span class="acc-order-total">${order.total}</span>
          <div class="acc-order-btns">
            ${order.canConfirmDelivery ? `<button class="acc-order-btn primary" onclick="confirmOrderDelivery(${order.orderIdValue})">${order.requiresWalletConfirmation ? 'Đã nhận được hàng (MetaMask)' : 'Đã nhận được hàng'}</button>` : ''}
            ${order.canRequestRefund ? `<button class="acc-order-btn secondary" style="margin-left:8px" onclick="requestOrderRefund(${order.orderIdValue})">Yêu cầu hoàn tiền</button>` : ''}
            ${(order.actions || []).map(action => `<button class="acc-order-btn ${action.kind}" onclick="showToast('${action.toast}','${action.type || 'info'}')">${action.label}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  Array.from(container.querySelectorAll('.acc-order-item')).forEach((itemEl, index) => {
    const order = orders[index];
    if (!order) return;

    if (order.paidAtTime) {
      const dateEl = itemEl.querySelector('.acc-order-date');
      if (dateEl && !dateEl.textContent.includes(order.paidAtTime)) {
        dateEl.textContent = `${order.date} · ${order.paidAtTime} · ${order.items}`;
      }
    }

    if (order.paymentMethod === 'Crypto (TEST)' && order.cryptoTotal) {
      const bodyEl = itemEl.querySelector('.acc-order-body');
      const footerEl = itemEl.querySelector('.acc-order-footer');
      if (bodyEl && footerEl && !bodyEl.querySelector('.acc-order-payment')) {
        footerEl.insertAdjacentHTML('beforebegin', `<div class="acc-order-payment">Thanh toan TEST: ${order.cryptoTotal}</div>`);
      }
    }

    if (order.deliveryConfirmTxHash) {
      const bodyEl = itemEl.querySelector('.acc-order-body');
      const footerEl = itemEl.querySelector('.acc-order-footer');
      if (bodyEl && footerEl && !bodyEl.querySelector('.acc-order-confirmed-tx')) {
        footerEl.insertAdjacentHTML('afterend', `<div class="acc-order-payment acc-order-confirmed-tx">Tx xác nhận nhận hàng: ${escapeHtml(order.deliveryConfirmTxHash)}</div>`);
      }
    }
  });
}

async function ensureEscrowSapphireNetwork() {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Không tìm thấy MetaMask trong trình duyệt hiện tại.');
  }

  const currentChainId = await provider.request({ method: 'eth_chainId' });
  if (currentChainId === ESCROW_SAPPHIRE_TESTNET.chainId) {
    return;
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ESCROW_SAPPHIRE_TESTNET.chainId }]
    });
  } catch (error) {
    if (error?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [ESCROW_SAPPHIRE_TESTNET]
      });
      return;
    }

    throw error;
  }
}

async function confirmOrderDelivery(orderId) {
  hydrateCurrentUserFromSnapshot();
  if (!currentUser) {
    openAuthModal();
    showToast('Vui lòng đăng nhập để xác nhận nhận hàng.', 'warn');
    return;
  }

  const order = currentUser?.accountData?.orders?.find(item => item.orderIdValue === orderId);
  if (!order || !order.canConfirmDelivery) {
    showToast('Đơn hàng này hiện chưa thể xác nhận đã nhận.', 'warn');
    return;
  }

  let txHash = null;

  try {
    if (order.requiresWalletConfirmation) {
      if (typeof ethers === 'undefined') {
        throw new Error('Chưa tải thư viện ví để xác nhận on-chain.');
      }

      await ensureEscrowSapphireNetwork();
      const provider = new ethers.BrowserProvider(getEthereumProvider());
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      if (!walletConnected || !walletAddress || signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        setWalletState(signerAddress);
      }

      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      showToast('Đang chờ xác nhận giao dịch nhận hàng trong MetaMask...', 'info');
      const tx = await contract.confirmDelivery(BigInt(order.chainOrderId));
      txHash = tx.hash;
      await tx.wait();
    }

    const updatedUser = await apiFetch(`/api/checkout/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    });

    simulateLogin(updatedUser);
    showToast('✅ Đã xác nhận nhận hàng thành công.');
  } catch (err) {
    showToast(err?.message || 'Không thể xác nhận nhận hàng.', 'warn');
  }
}

async function requestOrderRefund(orderId) {
  hydrateCurrentUserFromSnapshot();
  if (!currentUser) {
    openAuthModal();
    showToast('Vui lòng đăng nhập để yêu cầu hoàn tiền.', 'warn');
    return;
  }

  const order = currentUser?.accountData?.orders?.find(item => item.orderIdValue === orderId);
  if (!order || !order.canRequestRefund) {
    showToast('Đơn hàng này hiện chưa thể yêu cầu hoàn tiền.', 'warn');
    return;
  }

  try {
    const updatedUser = await apiFetch(`/api/checkout/orders/${orderId}/request-refund`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    simulateLogin(updatedUser);
    showToast('✅ Đã gửi yêu cầu hoàn tiền thành công.');
  } catch (err) {
    showToast(err?.message || 'Không thể yêu cầu hoàn tiền.', 'warn');
  }
}

function renderNfts() {
  const container = document.getElementById('accNftGrid');
  const nfts = currentUser?.accountData?.nfts || [];
  document.getElementById('accNftBadge').textContent = nfts.length;

  if (!nfts.length) {
    container.innerHTML = `
      <div class="acc-nft-empty">
        <div class="acc-nft-empty-icon">◈</div>
        <div class="acc-nft-empty-title">Chưa có NFT bảo hành</div>
        <div class="acc-nft-empty-sub">NFT sẽ xuất hiện tại đây sau khi đơn hàng có sản phẩm hỗ trợ warranty NFT được mint thành công.</div>
      </div>`;
    return;
  }

  const normalizedNfts = nfts.map(normalizeNftDisplayData);

  container.innerHTML = normalizedNfts.map(item => `
    <article class="acc-nft-card">
      <div class="acc-nft-top">
        <div class="acc-nft-icon-wrap">
          <div class="acc-nft-icon">${item.icon}</div>
        </div>
        <span class="acc-nft-status ${item.statusClass}">${item.statusText}</span>
      </div>
      <div class="acc-nft-name">${escapeHtml(item.name)}</div>
      <div class="acc-nft-summary">${escapeHtml(item.summary || 'NFT này đại diện cho quyền bảo hành của sản phẩm trong đơn hàng của bạn.')}</div>
      <div class="acc-nft-token">${escapeHtml(item.tokenLabel || '')}</div>
      ${item.info ? `<div class="acc-nft-info">${escapeHtml(item.info)}</div>` : ''}
      <div class="acc-nft-order-box">
        <div class="acc-nft-order-title">Thông tin đơn hàng</div>
        <div class="acc-nft-order-grid">
          <div class="acc-nft-order-item">
            <span class="acc-nft-order-label">Mã đơn</span>
            <span class="acc-nft-order-value">${escapeHtml(item.orderLabel || 'Đang cập nhật')}</span>
          </div>
          <div class="acc-nft-order-item">
            <span class="acc-nft-order-label">Giá sản phẩm</span>
            <span class="acc-nft-order-value">${escapeHtml(item.productPrice || 'Đang cập nhật')}</span>
          </div>
          <div class="acc-nft-order-item">
            <span class="acc-nft-order-label">Ngày mua</span>
            <span class="acc-nft-order-value">${escapeHtml(item.purchaseDate || 'Đang cập nhật')}</span>
          </div>
          <div class="acc-nft-order-item">
            <span class="acc-nft-order-label">Hết hạn NFT</span>
            <span class="acc-nft-order-value">${escapeHtml(item.expiryDate || 'Đang cập nhật')}</span>
          </div>
        </div>
      </div>
      <div class="acc-nft-meta-list">
        <div class="acc-nft-meta-row">
          <span class="acc-nft-meta-label">Hash</span>
          <span class="acc-nft-meta-value acc-nft-hash" title="${escapeHtml(item.mintTxHash || 'Chưa có tx hash')}">${escapeHtml(item.mintTxShort || 'Chưa có tx hash')}</span>
        </div>
        <div class="acc-nft-meta-row">
          <span class="acc-nft-meta-label">Metadata</span>
          <span class="acc-nft-meta-value" title="${escapeHtml(item.metadataUri || 'pending')}">${escapeHtml(item.metadataUri || 'pending')}</span>
        </div>
      </div>
      <div class="acc-nft-actions">
        ${item.explorerUrl
          ? `<a class="acc-nft-link" href="${item.explorerUrl}" target="_blank" rel="noopener noreferrer">Xem trên Oasis Sapphire Testnet →</a>`
          : `<button type="button" class="acc-nft-link muted" onclick="showToast('NFT này chưa có tx hash để tra cứu.', 'warn')">Chưa có giao dịch on-chain</button>`}
      </div>
    </article>
  `).join('');

  normalizedNfts.forEach((item, index) => {
    hydrateNftCardFromMetadata(item, index);
  });
}

function normalizeNftDisplayData(item) {
  const normalized = { ...item };
  const sanitizedInfo = stripLegacyExpiryInfo(normalized.info);
  const orderLabel = normalized.orderLabel || findOrderLabelForNft(normalized);
  const purchaseDate = normalized.purchaseDate || findPurchaseDateForNft(normalized, orderLabel);
  const expiryDate = isMeaningfulNftValue(normalized.expiryDate) ? normalized.expiryDate : parseExpiryDateFromInfo(normalized.info);
  const productPrice = normalized.productPrice || findProductPriceForNft(normalized, orderLabel);

  normalized.orderLabel = orderLabel || '';
  normalized.purchaseDate = purchaseDate || '';
  normalized.expiryDate = expiryDate || '';
  normalized.productPrice = productPrice || '';
  normalized.info = sanitizedInfo;
  return normalized;
}

function isMeaningfulNftValue(value) {
  const text = String(value || '').trim().toLowerCase();
  return !!text && text !== 'đang cập nhật' && text !== 'không có dữ liệu';
}

function stripLegacyExpiryInfo(info) {
  const text = String(info || '').trim();
  if (!text) return '';
  if (/^hsd\s*:/i.test(text)) return '';
  return text;
}

function findOrderLabelForNft(item) {
  const metadataMatch = (item.info || '').match(/#SF\d{6}/i);
  if (metadataMatch) return metadataMatch[0].toUpperCase();
  const matchedOrder = (currentUser?.accountData?.orders || []).find(order =>
    String(order.products || '').toLowerCase().includes(String(item.name || '').toLowerCase()));
  return matchedOrder?.id || '';
}

function findPurchaseDateForNft(item, orderLabel) {
  const orders = currentUser?.accountData?.orders || [];
  const matchedOrder = orders.find(order => order.id === orderLabel)
    || orders.find(order => String(order.products || '').toLowerCase().includes(String(item.name || '').toLowerCase()));
  return matchedOrder?.date || '';
}

function findProductPriceForNft(item, orderLabel) {
  const orders = currentUser?.accountData?.orders || [];
  const matchedOrder = orders.find(order => order.id === orderLabel)
    || orders.find(order => String(order.products || '').toLowerCase().includes(String(item.name || '').toLowerCase()));
  if (!matchedOrder?.total) return '';
  const products = String(matchedOrder.products || '').split('·').map(x => x.trim()).filter(Boolean);
  return products.length <= 1 ? matchedOrder.total : '';
}

function parseExpiryDateFromInfo(info) {
  const match = String(info || '').match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : '';
}

async function hydrateNftCardFromMetadata(item, index) {
  const card = document.querySelectorAll('#accNftGrid .acc-nft-card')[index];
  if (!card) return;

  try {
    const metadata = await loadNftMetadata(item);
    if (!metadata) return;

    const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];
    const getAttr = traitType => {
      const found = attributes.find(attr => String(attr?.trait_type || '').toLowerCase() === traitType.toLowerCase());
      return found?.value ? String(found.value) : '';
    };

    const nextOrderLabel = isMeaningfulNftValue(item.orderLabel) ? item.orderLabel : getAttr('Order ID');
    const nextExpiryDate = isMeaningfulNftValue(item.expiryDate) ? item.expiryDate : normalizeMetadataDate(getAttr('Expiry Date')) || normalizeMetadataDate(getAttr('Warranty Until'));
    const nextProductPrice = isMeaningfulNftValue(item.productPrice) ? item.productPrice : normalizeMetadataPrice(getAttr('Product Price'));
    const nextPurchaseDate = isMeaningfulNftValue(item.purchaseDate) ? item.purchaseDate : normalizeMetadataDate(getAttr('Purchase Date')) || findPurchaseDateForNft(item, nextOrderLabel);

    updateNftCardValue(card, 0, nextOrderLabel || 'Không có dữ liệu');
    updateNftCardValue(card, 1, nextProductPrice || 'Không có dữ liệu');
    updateNftCardValue(card, 2, nextPurchaseDate || 'Không có dữ liệu');
    updateNftCardValue(card, 3, nextExpiryDate || 'Không có dữ liệu');
  } catch (err) {
  }
}

async function loadNftMetadata(item) {
  const candidates = buildMetadataCandidates(item);
  const cacheKey = candidates.join('|');
  if (!cacheKey) return null;

  if (nftMetadataCache.has(cacheKey)) {
    return nftMetadataCache.get(cacheKey);
  }

  const promise = (async () => {
    for (const url of candidates) {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
      }
    }
    return null;
  })();

  nftMetadataCache.set(cacheKey, promise);
  return promise;
}

function buildMetadataCandidates(item) {
  const candidates = [];
  const metadataUri = String(item?.metadataUri || '').trim();
  if (metadataUri.startsWith('/')) {
    candidates.push(metadataUri);
  }

  const numericToken = extractNumericTokenId(item);
  if (numericToken) {
    const localPath = `/nft/metadata/warranty-${numericToken}.json`;
    if (!candidates.includes(localPath)) {
      candidates.push(localPath);
    }
  }

  return candidates;
}

function extractNumericTokenId(item) {
  const tokenLabel = String(item?.tokenLabel || '').trim();
  const match = tokenLabel.match(/(\d+)/);
  return match ? match[1] : '';
}

function updateNftCardValue(card, index, value) {
  const values = card.querySelectorAll('.acc-nft-order-value');
  if (!values[index]) return;
  values[index].textContent = value;
}

function normalizeMetadataDate(value) {
  if (!value) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function normalizeMetadataPrice(value) {
  if (!value) return '';
  const digits = Number(String(value).replace(/[^\d]/g, ''));
  return digits > 0 ? `${digits.toLocaleString('vi-VN')}đ` : '';
}

async function loadHomeNftShowcase() {
  try {
    const data = await apiFetch('/api/account/nft-showcase');
    const mintedCountEl = document.getElementById('homeNftMintedCount');
    const cardsEl = document.getElementById('homeNftCards');

    if (mintedCountEl) {
      mintedCountEl.textContent = `${(data?.mintedCount || 0).toLocaleString('vi-VN')} NFT đã mint`;
    }

    if (!cardsEl) return;

    const showcaseCards = (data?.items || []).map(item => `
      <div class="nft-card">
        <div class="nft-card-icon">${item.icon}</div>
        <div class="nft-card-info">
          <div class="nft-card-title">${escapeHtml(item.name)}</div>
          <div class="nft-card-meta">${escapeHtml(item.meta)}</div>
          <div class="nft-card-status">
            <div class="nft-status-dot" style="background:${item.statusColor}"></div>
            <span class="nft-card-token">${escapeHtml(item.tokenLabel)}</span>
          </div>
        </div>
      </div>
    `);

    showcaseCards.push(`
      <div class="nft-card" style="background:var(--purple-light);cursor:pointer" onclick="showToast('Kết nối ví để xem NFT của bạn', 'info')">
        <div class="nft-card-icon">◈</div>
        <div class="nft-card-info">
          <div class="nft-card-title" style="color:var(--purple)">Xem NFT của tôi</div>
          <div class="nft-card-meta">Kết nối ví để kiểm tra bảo hành</div>
          <div class="nft-card-status">
            <div class="nft-card-token" style="color:var(--blue);cursor:pointer">Kết nối ngay →</div>
          </div>
        </div>
      </div>
    `);

    cardsEl.innerHTML = showcaseCards.join('');
  } catch (err) {
    const mintedCountEl = document.getElementById('homeNftMintedCount');
    if (mintedCountEl) {
      mintedCountEl.textContent = '0 NFT đã mint';
    }
  }
}

function renderAccountData() {
  if (!currentUser) return;
  renderOrders();
  renderNfts();
  renderAddress();
}

function renderAddress() {
  const address = currentUser?.address || {};
  const recipientName = address.recipientName || currentUser?.name || '';
  const phoneNumber = address.phoneNumber || currentUser?.phone || '';
  const shippingAddress = address.shippingAddress || '';
  const contactEmail = address.contactEmail || currentUser?.email || '';

  const summaryName = document.getElementById('accAddressSummaryName');
  const summaryPhone = document.getElementById('accAddressSummaryPhone');
  const summaryLine = document.getElementById('accAddressSummaryLine');
  const summaryEmail = document.getElementById('accAddressSummaryEmail');

  if (summaryName) summaryName.textContent = recipientName || 'Chưa có người nhận mặc định';
  if (summaryPhone) summaryPhone.textContent = phoneNumber || 'Chưa có số điện thoại giao hàng';
  if (summaryLine) summaryLine.textContent = shippingAddress || 'Hãy cập nhật địa chỉ để dùng lại khi đặt hàng.';
  if (summaryEmail) summaryEmail.textContent = contactEmail || '';

  const recipientInput = document.getElementById('addrRecipientName');
  const phoneInput = document.getElementById('addrPhone');
  const addressInput = document.getElementById('addrShippingAddress');
  const emailInput = document.getElementById('addrContactEmail');

  if (recipientInput) recipientInput.value = recipientName;
  if (phoneInput) phoneInput.value = phoneNumber;
  if (addressInput) addressInput.value = shippingAddress;
  if (emailInput) emailInput.value = contactEmail;
}

function applySessionState(sessionState) {
  const nextState = sessionState || buildDefaultSessionState();
  cart = cloneCart(nextState.cart?.length ? nextState.cart : DEFAULT_CART);
  voucherApplied = nextState.voucherApplied ? { ...nextState.voucherApplied } : null;
  walletConnected = !!nextState.walletConnected;
  walletAddress = nextState.walletAddress || '';

  document.getElementById('voucherInput').value = '';
  const voucherMsg = document.getElementById('voucherMsg');
  if (voucherApplied) {
    voucherMsg.textContent = `✅ Đang áp dụng: ${voucherApplied.label}`;
    voucherMsg.style.color = 'var(--green)';
  } else {
    voucherMsg.textContent = '';
    voucherMsg.style.color = '';
  }

  syncWalletUi();
  updateCartCount();
  renderAccountData();
  if (document.getElementById('cartDrawer').classList.contains('open')) {
    renderCart();
  }
}

function persistCurrentState() {
  saveAccountState(currentUser, {
    cart,
    voucherApplied,
    walletConnected,
    walletAddress,
  });
}

/* ─── CART DRAWER ─── */
function openCartDrawer() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  if (!document.querySelector('.modal-overlay.active')) {
    document.body.style.overflow = '';
  }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCartDrawer();
    closeModal('checkoutModal');
    closeModal('walletModal');
    closeModal('quickViewModal');
    closeModal('favoritesModal');
  }
});

function renderCart() {
  const container = document.getElementById('cdItems');
  updateCartCount();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cd-empty">
        <div class="cd-empty-icon">🛒</div>
        <div class="cd-empty-text">Giỏ hàng trống<br><small>Hãy thêm sản phẩm vào giỏ!</small></div>
      </div>`;
    document.getElementById('cdVoucherBar').style.display = 'none';
    document.getElementById('cdSummary').style.display = 'none';
    return;
  }

  document.getElementById('cdVoucherBar').style.display = '';
  document.getElementById('cdSummary').style.display = '';

  container.innerHTML = cart.map(item => `
    <div class="cd-item" id="ci-${item.id}">
      <div class="cd-item-img">${item.icon}</div>
      <div class="cd-item-info">
        <div class="cd-item-name">${item.name}</div>
        <div class="cd-item-badges">
          ${item.nft ? `<span class="cd-item-badge nft">◈ NFT bảo hành ${item.warranty}</span>` : ''}
          ${item.oldPrice > 0 ? `<span class="cd-item-badge sale">-${Math.round((1 - item.price/item.oldPrice)*100)}%</span>` : ''}
        </div>
        <div class="cd-item-price-row">
          <span class="cd-item-price">${fmt(item.price)}</span>
          ${item.oldPrice > 0 ? `<span class="cd-item-old">${fmt(item.oldPrice)}</span>` : ''}
        </div>
        <div class="cd-item-qty">
          <button class="cd-qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="cd-qty-num">${item.qty}</span>
          <button class="cd-qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <div class="cd-item-remove" onclick="removeItem('${item.id}')" title="Xóa">✕</div>
    </div>
  `).join('');

  renderSummary();
}

function renderSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const nftCount = cart.filter(i => i.nft).reduce((s,i) => s + i.qty, 0);
  const itemCount = cart.reduce((s,i) => s + i.qty, 0);

  document.getElementById('cdSubtotal').textContent = fmt(subtotal);
  document.getElementById('cdItemCount').textContent = itemCount;
  document.getElementById('cdNftCount').textContent = nftCount;

  let discount = 0;
  if (voucherApplied) {
    discount = Math.round(subtotal * voucherApplied.pct / 100);
    document.getElementById('cdDiscountRow').style.display = '';
    document.getElementById('cdDiscountAmt').textContent = '-' + fmt(discount);
  } else {
    document.getElementById('cdDiscountRow').style.display = 'none';
  }

  let cryptoDiscount = 0;
  if (walletConnected) {
    cryptoDiscount = Math.round(subtotal * 5 / 100);
    document.getElementById('cdCryptoDiscRow').style.display = '';
    document.getElementById('cdCryptoAmt').textContent = '-' + fmt(cryptoDiscount);
  } else {
    document.getElementById('cdCryptoDiscRow').style.display = 'none';
  }

  const total = subtotal - discount - cryptoDiscount;
  document.getElementById('cdTotal').textContent = fmt(total);
}

function updateCartCount() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  el.textContent = total;
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');

  document.getElementById('cdHeadCount').textContent = total + ' sản phẩm';
  setTimeout(() => el.classList.remove('bounce'), 400);
}

/* ─── CART ACTIONS ─── */
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
    showToast(`✅ Đã tăng số lượng: ${product.name.split(' ').slice(0,4).join(' ')}...`);
  } else {
    cart.push({ ...product, qty: 1 });
    showToast(`✅ Đã thêm vào giỏ: ${product.name.split(' ').slice(0,4).join(' ')}...`);
  }
  updateCartCount();
  /* Auto-open drawer for a moment then re-render if open */
  if (document.getElementById('cartDrawer').classList.contains('open')) {
    renderCart();
  }
  persistCurrentState();
}

function removeItem(id) {
  const item = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  showToast(`🗑️ Đã xóa: ${item?.name.split(' ').slice(0,4).join(' ')}...`, 'warn');
  renderCart();
  persistCurrentState();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderCart();
  persistCurrentState();
}

/* ─── VOUCHER ─── */
function applyVoucher() {
  const code = document.getElementById('voucherInput').value.trim().toUpperCase();
  const msgEl = document.getElementById('voucherMsg');
  if (!code) { msgEl.textContent = ''; return; }

  const v = VOUCHERS[code];
  if (v) {
    voucherApplied = { pct: v.pct, label: v.label };
    msgEl.textContent = `✅ Áp dụng thành công: ${v.label}`;
    msgEl.style.color = 'var(--green)';
    showToast(`🎉 Mã giảm giá: ${v.label}!`);
  } else {
    voucherApplied = null;
    msgEl.textContent = '❌ Mã không hợp lệ. Thử: CRYPTO5, SALE10';
    msgEl.style.color = 'var(--red)';
  }
  renderSummary();
  persistCurrentState();
}

/* ─── CHECKOUT from drawer ─── */
function proceedToCheckout() { 
  if (cart.length === 0) return; 
  hydrateCurrentUserFromSnapshot();
  if (!currentUser) { 
    closeCartDrawer(); 
    openAuthModal(); 
    showToast('Vui long dang nhap truoc khi dat hang', 'warn'); 
    return; 
  } 
  closeCartDrawer(); 
  openCheckout(); 
}

/* ─── MODALS ─── */
function selectPay(el) {
  document.querySelectorAll('.pay-method').forEach(item => {
    item.classList.remove('selected');
    const radio = item.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  el.classList.add('selected');
  const selectedRadio = el.querySelector('input[type="radio"]');
  if (selectedRadio) selectedRadio.checked = true;

  const selectedName = el.querySelector('.pay-name')?.textContent?.trim() || '';
  toggleBankTransferPanel(selectedName.includes('Chuyển khoản ngân hàng'));
}

function toggleBankTransferPanel(show) {
  const panel = document.getElementById('bankTransferPanel');
  if (panel) {
    panel.style.display = show ? 'block' : 'none';
  }
}

function updateBankTransferQr(totalAmount) {
  const qrImg = document.getElementById('bankTransferQr');
  const amountEl = document.getElementById('bankTransferAmount');
  const accountEl = document.getElementById('bankTransferAccountNo');
  const contentEl = document.getElementById('bankTransferContent');

  bankTransferContent = `SF${Date.now().toString().slice(-8)}`;

  if (amountEl) {
    amountEl.textContent = fmt(totalAmount);
  }
  if (accountEl) {
    accountEl.textContent = BANK_TRANSFER_ACCOUNT_NO;
  }
  if (contentEl) {
    contentEl.textContent = bankTransferContent;
  }
  if (qrImg) {
    const qrUrl =
      `https://img.vietqr.io/image/${BANK_TRANSFER_BANK_CODE}-${BANK_TRANSFER_ACCOUNT_NO}-compact2.png` +
      `?amount=${Math.round(totalAmount)}` +
      `&addInfo=${encodeURIComponent(bankTransferContent)}` +
      `&accountName=${encodeURIComponent(BANK_TRANSFER_ACCOUNT_NAME)}`;
    qrImg.src = qrUrl;
  }
}

function handleBankProofSelected(event) {
  const file = event.target.files?.[0] || null;
  bankProofFile = file;
  bankProofUploadedUrl = '';

  const fileNameEl = document.getElementById('bankProofFilename');
  const previewEl = document.getElementById('bankProofPreview');

  if (!file) {
    fileNameEl.textContent = 'Chưa chọn ảnh minh chứng.';
    previewEl.style.display = 'none';
    previewEl.removeAttribute('src');
    return;
  }

  fileNameEl.textContent = `Đã chọn: ${file.name}`;

  const reader = new FileReader();
  reader.onload = () => {
    previewEl.src = reader.result;
    previewEl.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function uploadBankProofFile() {
  if (!bankProofFile) {
    throw new Error('Vui lòng tải ảnh minh chứng chuyển khoản ngân hàng.');
  }

  if (bankProofUploadedUrl) {
    return bankProofUploadedUrl;
  }

  const formData = new FormData();
  formData.append('file', bankProofFile);

  const response = await fetch('/api/checkout/upload-bank-proof', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Không thể tải ảnh minh chứng lên máy chủ.');
  }

  bankProofUploadedUrl = payload?.url || '';
  return bankProofUploadedUrl;
}

function openCheckout() {
    /* Sync order summary from real cart */
    const itemsEl = document.querySelector('.order-summary');
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let discount = 0;
  let discountRow = '';
  if (voucherApplied) {
    discount = Math.round(subtotal * voucherApplied.pct / 100);
    discountRow = `<div class="os-row"><span>Mã giảm giá (${voucherApplied.label})</span><span style="color:var(--green)">-${fmt(discount)}</span></div>`;
  }
  let cryptoDiscount = 0;
  let cryptoRow = '';
  if (walletConnected) {
    cryptoDiscount = Math.round(subtotal * 5 / 100);
    cryptoRow = `<div class="os-row"><span>Giảm giá Crypto (-5%)</span><span style="color:var(--green)">-${fmt(cryptoDiscount)}</span></div>`;
  }
    const total = subtotal - discount - cryptoDiscount;
  const nftCount = cart.filter(i => i.nft).reduce((s,i) => s + i.qty, 0);
  const itemCount = cart.reduce((s,i) => s + i.qty, 0);

  itemsEl.innerHTML = `
    <div class="os-title">Tóm tắt đơn hàng (${itemCount} sản phẩm)</div>
    ${cart.map(i => `<div class="os-row"><span>${i.name.split(' ').slice(0,5).join(' ')}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}
    <div class="os-row"><span>Phí vận chuyển</span><span style="color:var(--green)">Miễn phí</span></div>
    ${discountRow}${cryptoRow}
    <div class="os-row os-total"><span>Tổng thanh toán</span><span>${fmt(total)}</span></div>
      ${nftCount > 0 ? `<div class="os-row"><span class="os-nft">◈ ${nftCount} NFT bảo hành sẽ được mint sau khi thanh toán</span><span class="os-nft">Free</span></div>` : ''}
    `;
    bankProofFile = null;
    bankProofUploadedUrl = '';
    const bankProofInput = document.getElementById('bankProofInput');
    const bankProofFilename = document.getElementById('bankProofFilename');
    const bankProofPreview = document.getElementById('bankProofPreview');
    if (bankProofInput) bankProofInput.value = '';
    if (bankProofFilename) bankProofFilename.textContent = 'Chưa chọn ảnh minh chứng.';
    if (bankProofPreview) {
      bankProofPreview.style.display = 'none';
      bankProofPreview.removeAttribute('src');
    }
    updateBankTransferQr(total);
    const selectedMethod = document.querySelector('.pay-method.selected .pay-name')?.textContent?.trim() || '';
    toggleBankTransferPanel(selectedMethod.includes('Chuyển khoản ngân hàng'));
    hydrateCheckoutAddress();
    document.getElementById('checkoutModal').classList.add('active');
  }

function hydrateCheckoutAddress() {
  const address = currentUser?.address || {};
  const recipientName = address.recipientName || currentUser?.name || '';
  const phoneNumber = address.phoneNumber || currentUser?.phone || '';
  const shippingAddress = address.shippingAddress || '';
  const contactEmail = address.contactEmail || currentUser?.email || '';

  const nameInput = document.getElementById('checkoutRecipientName');
  const phoneInput = document.getElementById('checkoutRecipientPhone');
  const addressInput = document.getElementById('checkoutShippingAddress');
  const emailInput = document.getElementById('checkoutContactEmail');

  if (nameInput) nameInput.value = recipientName;
  if (phoneInput) phoneInput.value = phoneNumber;
  if (addressInput) addressInput.value = shippingAddress;
  if (emailInput) emailInput.value = contactEmail;
}

function collectCheckoutAddress() {
  const recipientName = document.getElementById('checkoutRecipientName')?.value?.trim() || '';
  const recipientPhone = document.getElementById('checkoutRecipientPhone')?.value?.trim() || '';
  const shippingAddress = document.getElementById('checkoutShippingAddress')?.value?.trim() || '';
  const contactEmail = document.getElementById('checkoutContactEmail')?.value?.trim() || '';

  if (!recipientName || !recipientPhone || !shippingAddress) {
    throw new Error('Vui lòng nhập đủ thông tin giao hàng trước khi đặt hàng.');
  }

  return {
    recipientName,
    recipientPhone,
    shippingAddress,
    contactEmail,
  };
}
function openWalletModal() {
  document.getElementById('walletModal').classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  const hasOpenModal = document.querySelector('.modal-overlay.active');
  const cartOpen = document.getElementById('cartDrawer')?.classList.contains('open');
  if (!hasOpenModal && !cartOpen) {
    document.body.style.overflow = '';
  }
}
function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

/* ─── WALLET ─── */
async function connectWallet(name, options = {}) {
  const { closeAuth = false, requireLoginMessage = false } = options;

  if (name !== 'MetaMask') {
    showToast(`${name} chưa được nối thật trong project này. Hãy dùng MetaMask.`, 'warn');
    return;
  }

  const provider = getEthereumProvider();
  if (!provider) {
    showToast('Không tìm thấy MetaMask trong trình duyệt hiện tại.', 'warn');
    return;
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const nextAddress = Array.isArray(accounts) && accounts.length ? accounts[0] : '';
    if (!nextAddress) {
      throw new Error('MetaMask không trả về địa chỉ ví.');
    }

    setWalletState(nextAddress);
    if (closeAuth) {
      closeAuthModal();
    }
    closeModal('walletModal');

    showToast(`✅ Đã kết nối MetaMask: ${formatWalletAddress(nextAddress)}`);
    if (requireLoginMessage) {
      showToast('Ví đã kết nối. Hãy đăng nhập hoặc đăng ký để gắn đơn hàng vào tài khoản.', 'info');
    }
  } catch (err) {
    showToast(err?.message || 'Không thể kết nối MetaMask.', 'warn');
  }
}

/* ─── PAYMENT ─── */
async function handleConfirmPayment() {
  hydrateCurrentUserFromSnapshot();
  if (!currentUser) {
    closeModal('checkoutModal');
    openAuthModal();
    showToast('Vui lòng đăng nhập trước khi đặt hàng', 'warn');
    return;
  }

  const selectedMethodEl = document.querySelector('.pay-method.selected .pay-name');
  const selectedMethod = selectedMethodEl ? selectedMethodEl.textContent.trim() : "Thanh toán thường";
  const isCrypto = selectedMethod.includes('Crypto');
  const isBankTransfer = selectedMethod.includes('Chuyển khoản ngân hàng');
  let shippingInfo;

  try {
    shippingInfo = collectCheckoutAddress();
  } catch (err) {
    showToast(err.message || 'Thiếu thông tin giao hàng', 'warn');
    return;
  }

  const purchasedItems = cloneCart(cart);

if (isCrypto) {
  if (!walletConnected) {
    closeModal('checkoutModal');
    openWalletModal();
    showToast('⚠️ Vui lòng kết nối ví', 'warn');
    return;
  }

  const purchasedItems = cloneCart(cart);
  let totalETH = 0;
  purchasedItems.forEach(item => {
    if (item.eth) totalETH += (item.eth * (item.qty || 1));
  });
  if (totalETH <= 0) totalETH = 0.015; // fallback
  const totalTestText = Number(totalETH.toFixed(4)).toString();
  const checkoutProductName = purchasedItems.length === 1
    ? purchasedItems[0].name
    : `${purchasedItems[0].name} + ${purchasedItems.length - 1} món khác`;

  try {
    await apiFetch('/api/checkout/prepare-crypto', {
      method: 'POST',
      body: JSON.stringify({
        items: purchasedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          cryptoPrice: item.eth || null,
          qty: item.qty || 1,
          nft: !!item.nft,
          warranty: item.warranty || null,
        })),
        cryptoAmount: Number(totalTestText),
        tokenSymbol: 'TEST',
        wallet: walletAddress,
        recipientName: shippingInfo.recipientName,
        recipientPhone: shippingInfo.recipientPhone,
        shippingAddress: shippingInfo.shippingAddress,
        contactEmail: shippingInfo.contactEmail,
      }),
    });
  } catch (err) {
    showToast(err.message || 'Khong the chuan bi don crypto', 'warn');
    return;
  }

  closeModal('checkoutModal');
  cart = [];
  voucherApplied = null;
  updateCartCount();
  persistCurrentState();
  showToast(`🚀 Chuyển sang thanh toán Crypto ≈ ${totalTestText} TEST`);

  setTimeout(() => {
    window.location.href = `/Home/CryptoPayment?price=${totalTestText}&name=${encodeURIComponent(checkoutProductName)}`;
  }, 700);

  return;
  }

  if (isBankTransfer) {
    try {
      await uploadBankProofFile();
    } catch (err) {
      showToast(err.message || 'Khong the tai anh minh chung', 'warn');
      return;
    }
  }

    // ==================== THANH TOÁN THƯỜNG ====================
    closeModal('checkoutModal');
    try {
      const result = await apiFetch('/api/checkout/create-order', {
        method: 'POST',
        body: JSON.stringify({
        items: purchasedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          cryptoPrice: item.eth || null,
          qty: item.qty || 1,
          nft: !!item.nft,
          warranty: item.warranty || null,
          })),
          paymentMethod: selectedMethod,
          txHash: isBankTransfer ? bankTransferContent : null,
          wallet: walletConnected ? walletAddress : null,
          status: 'Processing',
          recipientName: shippingInfo.recipientName,
          recipientPhone: shippingInfo.recipientPhone,
          shippingAddress: shippingInfo.shippingAddress,
          contactEmail: shippingInfo.contactEmail,
        }),
      });

    cart = [];
    voucherApplied = null;
    updateCartCount();
    persistCurrentState();
    await restoreServerSession();

    showToast(`✅ Đặt hàng thành công! Mã đơn: #SF${String(result.orderId).padStart(6, '0')}`);
  } catch (err) {
    showToast(err.message || 'Không thể tạo đơn hàng', 'warn');
  }
}

/* ─── TABS ─── */
function setTab(el) {
  document.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  catalogState.category = el.textContent.trim();
  applyCatalogFilters();
}

/* ─── FLASH TIMER ─── */
let secs = 5 * 3600 + 47 * 60 + 23;
function updateTimer() {
  secs--;
  if (secs < 0) secs = 24 * 3600;
  const h = String(Math.floor(secs/3600)).padStart(2,'0');
  const m = String(Math.floor((secs%3600)/60)).padStart(2,'0');
  const s = String(secs%60).padStart(2,'0');
  const el = document.getElementById('flashTimer');
  if (el) el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateTimer, 1000);

/* ─── SEARCH ─── */
function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  catalogState.query = q;
  applyCatalogFilters();
  document.getElementById('featuredProductsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (q) showToast(`🔍 Đã lọc sản phẩm theo: "${q}"`, 'info');
}
document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

/* ─── TOAST ─── */
function showToast(msg, type = '') {
  const c = document.getElementById('toasts');
    const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ─── INIT ─── */
function applyDemoTextFixes() {
  document.title = 'SilverFlag PC — Thiết Bị Máy Tính Chính Hãng';
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  const setMany = (selector, values) => {
    const els = document.querySelectorAll(selector);
    values.forEach((value, index) => {
      if (els[index]) els[index].textContent = value;
    });
  };
  setText('.logo-sub', 'CHÍNH HÃNG — WEB3');
  setText('.header-btn[onclick="openFavoritesModal()"] .label', 'Yêu thích');
  setText('.header-btn[onclick="openCartDrawer()"] .label', 'Giỏ hàng');
  setMany('.nav-item[data-nav-key]', ['🏠 Trang chủ', '💻 CPU & Mainboard', '🖼️ Card đồ họa', '💾 RAM & SSD', '🖥️ Màn hình', '🏗️ Case & PSU', '🖱️ Thiết bị ngoại vi', '🔧 Build PC']);
  setMany('.qcat-icon', ['⚡', '🖼️', '💾', '🖥️', '🏗️', '❄️', '🖱️', '🎮']);
  setMany('.qcat-name', ['CPU &\nMainboard', 'Card\nĐồ Họa', 'RAM\n& SSD', 'Màn\nHình', 'Case\n& PSU', 'Tản\nNhiệt', 'Ngoại\nVi', 'PC\nGaming']);
  setText('.banner-tag', '🔥 SIÊU KHUYẾN MÃI');
  setText('.banner-sub', 'Kiến trúc Blackwell — Hiệu năng đột phá');
  setText('.banner-price', 'Từ 54.900.000đ');
  setText('.banner-cta', 'Mua ngay →');
  setMany('.bsc-label', ['MỚI RA MẮT', '⚡ FLASH SALE', 'WEB3 ƯU ĐÃI']);
  setMany('.bsc-title', ['AMD Ryzen 9 9950X', 'RAM DDR5-7200 64GB', 'Thanh toán Crypto']);
  setMany('.bsc-price', ['Từ 22.500.000đ', 'Chỉ 6.900.000đ', 'Giảm thêm 5%']);
  setText('.wallet-panel-head', '◈ Web3 Wallet');
  if (!walletConnected) setText('#wsText', 'Chưa kết nối ví');
  if (!walletConnected) setText('#connectMiniBtn', 'Kết nối ví →');
  setMany('.rate-name', ['⟠ ETH', '₿ BTC', '◎ SOL', '💲 USDT']);
  const flashHead = document.querySelector('.flash-head');
  if (flashHead && flashHead.firstChild) flashHead.firstChild.textContent = '⚡ FLASH SALE';
  setMany('.dsi-icon', ['◈', '🎫']);
  setMany('.dsi-title', ['Thanh Toán Crypto', 'NFT Bảo Hành On-Chain']);
  setMany('.dsi-desc', ['Hỗ trợ ETH, BTC, SOL, USDT và 15+ đồng coin. Tỷ giá real-time, phí gas thấp nhất.', 'Mỗi đơn hàng kèm NFT bảo hành minh bạch, không thể giả mạo. Chuyển nhượng cùng sản phẩm.']);
  setMany('.dsi-link', ['Kết nối ví ngay →', 'Xem NFT của tôi →']);
}

function applyDemoTextFixesSafe() {
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  const setMany = (selector, values) => {
    const els = document.querySelectorAll(selector);
    values.forEach((value, index) => {
      if (els[index]) els[index].textContent = value;
    });
  };
  document.title = 'SilverFlag PC - Thiet Bi May Tinh Chinh Hang';
  setText('.logo-sub', 'CHINH HANG - WEB3');
  setText('.header-btn[onclick="openFavoritesModal()"] .label', 'Yeu thich');
  setText('.header-btn[onclick="openCartDrawer()"] .label', 'Gio hang');
  setMany('.nav-item[data-nav-key]', ['Home', 'CPU & Mainboard', 'Card do hoa', 'RAM & SSD', 'Man hinh', 'Case & PSU', 'Thiet bi ngoai vi', 'Build PC']);
  setMany('.qcat-icon', ['CPU', 'GPU', 'RAM', 'MON', 'CASE', 'COOL', 'MSE', 'PC']);
  setMany('.qcat-name', ['CPU &\nMainboard', 'Card\nDo Hoa', 'RAM\n& SSD', 'Man\nHinh', 'Case\n& PSU', 'Tan\nNhiet', 'Ngoai\nVi', 'PC\nGaming']);
  setText('.banner-tag', 'SIEU KHUYEN MAI');
  setText('.banner-sub', 'Kien truc Blackwell - Hieu nang dot pha');
  setText('.banner-price', 'Tu 54.900.000d');
  setText('.banner-cta', 'Mua ngay ->');
  setMany('.bsc-label', ['MOI RA MAT', 'FLASH SALE', 'WEB3 UU DAI']);
  setMany('.bsc-title', ['AMD Ryzen 9 9950X', 'RAM DDR5-7200 64GB', 'Thanh toan Crypto']);
  setMany('.bsc-price', ['Tu 22.500.000d', 'Chi 6.900.000d', 'Giam them 5%']);
  setText('.wallet-panel-head', 'Web3 Wallet');
  if (!walletConnected) setText('#wsText', 'Chua ket noi vi');
  if (!walletConnected) setText('#connectMiniBtn', 'Ket noi vi ->');
  setMany('.rate-name', ['ETH', 'BTC', 'SOL', 'USDT']);
  const flashHead = document.querySelector('.flash-head');
  if (flashHead && flashHead.firstChild) flashHead.firstChild.textContent = 'FLASH SALE';
  setMany('.dsi-icon', ['WEB3', 'NFT']);
  setMany('.dsi-title', ['Thanh toan Crypto', 'NFT Bao Hanh On-Chain']);
  setMany('.dsi-desc', ['Ho tro ETH, BTC, SOL, USDT va 15+ dong coin. Ty gia real-time, phi gas thap.', 'Moi don hang kem NFT bao hanh minh bach, khong the gia mao. Chuyen nhuong cung san pham.']);
  setMany('.dsi-link', ['Ket noi vi ngay ->', 'Xem NFT cua toi ->']);
}

applyDemoTextFixes();
applyDemoTextFixesSafe();
(async function initializeCatalogExperience() {
  try {
    await buildProductCatalog();
    hydrateUiState();
    if (isAllProductsPage()) {
      catalogState.showAll = true;
      syncCatalogScopeUi();
    }
    const initialCatalogCount = applyCatalogFilters();
    if (initialCatalogCount === 0 && productCatalog.length > 0) {
      catalogState = { ...DEFAULT_CATALOG_STATE };
      if (isAllProductsPage()) {
        catalogState.showAll = true;
      }
      document.getElementById('searchInput').value = '';
      document.getElementById('catalogSort').value = catalogState.sort;
      document.querySelectorAll('.sec-tab').forEach(tab => tab.classList.toggle('active', tab.textContent.trim() === 'Táº¥t cáº£'));
      applyCatalogFilters();
    }
    syncFavoriteUi();
  } catch (err) {
    console.error('Failed to initialize product catalog', err);
  }
  loadHomeNftShowcase();
  const persistedUser = readPersistedUser();
  if (persistedUser && !persistedUser.isAdmin) {
    currentUser = {
      ...persistedUser,
      email: persistedUser.email || '',
      phone: persistedUser.phone || '',
      address: persistedUser.address || {},
      accountData: persistedUser.accountData || { orders: [], nfts: [] },
    };
    document.getElementById('headerAccLabel').textContent = (currentUser.name || '').split(' ').pop() || 'Tài khoản';
    renderAccountData();
  }
  const bootstrapState = persistedUser && !persistedUser.isAdmin
    ? (getSavedAccountState(getAccountKey(persistedUser)) || buildDefaultSessionState())
    : (readPersistedState().guest || buildDefaultSessionState());
  applySessionState(bootstrapState);
  initializeWalletIntegration();
})();
const el = document.querySelector('.product');
//const product = getProduct(el);

function getProductFromModal() {
  const modal = document.querySelector(".modal"); // hoặc id modal của bạn

  const name = modal.querySelector("h2")?.innerText;

  const price = parseFloat(
    modal.querySelector(".price")?.innerText.replace(/\D/g, "")
  );

  const cryptoText = modal.querySelector(".prod-crypto")?.innerText;

  let eth = 0;

  if (cryptoText) {
    const match = cryptoText.match(/([\d.]+)\s*ETH/);
    if (match) eth = parseFloat(match[1]);
  }

  return {
    id: Date.now(),
    name,
    price,
    eth
  };
}

function handleAddClick(el) {
  const product = getProduct(el); // 🔥 tạo product tại đây
  addToCart(product);
}

window.addEventListener('load', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  await restoreServerSession();

  if (urlParams.get("paid") === "1") {
    showToast("🎉 Thanh toán Crypto thành công! Đơn hàng đã được cập nhật.", "");
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
