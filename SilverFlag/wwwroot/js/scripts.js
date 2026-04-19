const ss = sessionStorage;
/* ─── AUTH STATE ─── */
let currentUser = null; /* null = not logged in */

/* Demo accounts for testing */
const DEMO_ACCOUNTS = {
    'demo@silverflag.vn': { pw: '123456', name: 'Nguyễn Văn A', phone: '0912 345 678', avatar: 'NV', points: 4200, orders: 12, nfts: 5 },
    'admin@silverflag.vn': { pw: 'admin123', name: 'Admin SilverFlag', phone: '1800 6018', avatar: 'AD', points: 99000, orders: 88, nfts: 20 },
};

const DEMO_ACCOUNT_DETAILS = {
    'demo@silverflag.vn': {
        orders: [
            { id: '#SF240301', date: '01/03/2024', items: '3 sản phẩm', products: 'RTX 4090 24GB Founders · Ryzen 9 7950X3D · G.Skill DDR5 64GB', total: '76.200.000đ', statusClass: 'status-done', statusText: '✅ Đã hoàn thành', actions: [{ label: 'Hóa đơn', kind: 'outline', toast: 'Đang tải hóa đơn...' }, { label: 'Mua lại', kind: 'fill', toast: 'Thêm lại vào giỏ hàng!' }] },
            { id: '#SF240218', date: '18/02/2024', items: '1 sản phẩm', products: 'ASUS ROG Maximus Z790 Apex Encore DDR5 Wi-Fi 7', total: '14.400.000đ', statusClass: 'status-ship', statusText: '🚚 Đang giao hàng', actions: [{ label: 'Theo dõi', kind: 'outline', toast: 'Mở trang theo dõi đơn hàng' }] },
            { id: '#SF240105', date: '05/01/2024', items: '2 sản phẩm', products: 'Samsung 990 Pro 2TB · Corsair Vengeance DDR5 32GB', total: '6.390.000đ', statusClass: 'status-proc', statusText: '⏳ Đang xử lý', actions: [{ label: 'Hủy đơn', kind: 'outline', toast: 'Đã gửi yêu cầu hủy đơn', type: 'warn' }] },
        ],
        nfts: [
            { icon: '🖼️', name: 'RTX 4090 24GB', info: 'Mua: 01/03/2024<br>HSD: 01/03/2027<br>Token: #SF-001', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT #001 — RTX 4090' },
            { icon: '⚡', name: 'Ryzen 9 7950X3D', info: 'Mua: 01/03/2024<br>HSD: 01/03/2026<br>Token: #SF-002', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT #002 — Ryzen 9 7950X3D' },
            { icon: '🔩', name: 'ROG Maximus Z790', info: 'Mua: 18/02/2024<br>HSD: 18/02/2026<br>Token: #SF-003', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT #003 — ROG Z790' },
            { icon: '🖥️', name: 'LG 32\" 4K OLED', info: 'Mua: 10/11/2023<br>HSD: 10/11/2024<br>Token: #SF-004', statusClass: 'nft-expired', statusText: '✕ Hết hạn', toast: 'NFT #004 — Màn hình LG' },
            { icon: '🌀', name: 'Samsung 990 Pro 2TB', info: 'Mua: 05/01/2024<br>HSD: 05/01/2026<br>Token: #SF-005', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT #005 — Samsung 990 Pro' },
        ],
    },
    'admin@silverflag.vn': {
        orders: [
            { id: '#SF260401', date: '01/04/2026', items: '4 sản phẩm', products: 'RTX 5090 · Threadripper PRO · 128GB ECC DDR5 · 4TB Gen5 NVMe', total: '168.900.000đ', statusClass: 'status-done', statusText: '✅ Đã hoàn thành', actions: [{ label: 'Hóa đơn', kind: 'outline', toast: 'Đang tải hóa đơn...' }] },
            { id: '#SF260329', date: '29/03/2026', items: '2 sản phẩm', products: 'Switch 10GbE managed · UPS Online 3KVA', total: '27.500.000đ', statusClass: 'status-ship', statusText: '🚚 Đang giao hàng', actions: [{ label: 'Theo dõi', kind: 'outline', toast: 'Mở trang theo dõi đơn hàng' }] },
        ],
        nfts: [
            { icon: '🖼️', name: 'RTX 5090 Founders', info: 'Mua: 01/04/2026<br>HSD: 01/04/2029<br>Token: #ADM-001', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT admin #001' },
            { icon: '🧠', name: 'Threadripper PRO', info: 'Mua: 01/04/2026<br>HSD: 01/04/2029<br>Token: #ADM-002', statusClass: 'nft-active', statusText: '◈ Còn hiệu lực', toast: 'NFT admin #002' },
        ],
    },
};

const STORAGE_KEY = 'silverflag-demo-state-v3';
const UI_STORAGE_KEY = 'silverflag-demo-ui-v1';
const DEFAULT_CART = [];
const DEFAULT_CATALOG_STATE = {
    query: '',
    category: 'Tất cả',
    onlyNft: false,
    onlySale: false,
    sort: 'featured',
};

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
const EXTRA_PRODUCTS = [
    {
        id: 'fx1',
        name: 'Corsair Vengeance DDR5 32GB',
        category: 'RAM',
        price: 2190000,
        oldPrice: 2900000,
        nft: false,
        sale: true,
        image: 'inline:product-p4',
        icon: '💾',
        specs: ['32GB Kit', 'DDR5', 'Heatspreader'],
        crypto: '≈ 0.56 ETH',
        rating: '★★★★★',
        ratingCount: '(128)',
        warranty: '',
        addToCartPayload: { id: 'fx1', name: 'Corsair Vengeance DDR5 32GB', price: 2190000, oldPrice: 2900000, icon: '💾', nft: false },
    },
];

function cloneCart(items) {
    return (items || []).map(item => ({ ...item }));
}

function readUiState() {
    try {
        return JSON.parse(localStorage.getItem(UI_STORAGE_KEY)) || {};
    } catch (err) {
        return {};
    }
}

function persistUiState() {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({
        favorites: favoriteProductIds,
        catalog: catalogState,
    }));
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
    const details = DEMO_ACCOUNT_DETAILS[email];
    if (!details) return { orders: [], nfts: [] };
    return {
        orders: (details.orders || []).map(item => ({ ...item, actions: (item.actions || []).map(action => ({ ...action })) })),
        nfts: (details.nfts || []).map(item => ({ ...item })),
    };
}

function readPersistedState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { accounts: {} };
    } catch (err) {
        return { accounts: {} };
    }
}

function writePersistedState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getAccountKey(user) {
    return (user?.email || '').trim().toLowerCase();
}

function getSavedAccountState(email) {
    const state = readPersistedState();
    return state.accounts?.[email] || null;
}

function getRegisteredAccount(email) {
    const saved = getSavedAccountState(email);
    if (!saved?.auth) return null;
    return saved.auth;
}

function saveAccountState(user, sessionState) {
    const email = getAccountKey(user);
    if (!email) return;

    const state = readPersistedState();
    state.accounts[email] = {
        auth: state.accounts[email]?.auth || null,
        profile: {
            name: user.name || '',
            email: user.email || email,
            phone: user.phone || '',
            avatar: user.avatar || '',
            points: user.points || 0,
            orders: user.orders || 0,
            nfts: user.nfts || 0,
        },
        session: {
            cart: cloneCart(sessionState.cart),
            voucherApplied: sessionState.voucherApplied ? { ...sessionState.voucherApplied } : null,
            walletConnected: !!sessionState.walletConnected,
            walletAddress: sessionState.walletAddress || '',
        },
        accountData: state.accounts[email]?.accountData || getDefaultAccountDetails(email),
    };

    writePersistedState(state);
}

function saveRegisteredAccount(user, password) {
    const email = getAccountKey(user);
    if (!email) return;

    const state = readPersistedState();
    state.accounts[email] = {
        auth: {
            email,
            pw: password,
        },
        profile: state.accounts[email]?.profile || {
            name: user.name || '',
            email,
            phone: user.phone || '',
            avatar: user.avatar || '',
            points: user.points || 0,
            orders: user.orders || 0,
            nfts: user.nfts || 0,
        },
        session: state.accounts[email]?.session || buildDefaultSessionState(),
        accountData: state.accounts[email]?.accountData || getDefaultAccountDetails(email),
    };

    writePersistedState(state);
}

/* ─── PRODUCT CATALOG ─── */
function parseTextPrice(value) {
    return Number(String(value || '').replace(/[^\d]/g, '')) || 0;
}

function buildProductCatalog() {
    productCatalog = Array.from(document.querySelectorAll('.prod-card[data-id]')).map((card, index) => {
        const specs = Array.from(card.querySelectorAll('.spec')).map(spec => spec.textContent.trim());
        return {
            id: card.dataset.id,
            featuredIndex: index,
            card,
            name: card.dataset.name || card.querySelector('.prod-name')?.textContent.trim() || '',
            category: card.dataset.category || 'Khác',
            price: Number(card.dataset.price || 0),
            oldPrice: Number(card.dataset.oldPrice || 0),
            nft: card.dataset.nft === 'true',
            sale: card.dataset.sale === 'true',
            image: card.dataset.image || '',
            icon: card.querySelector('.prod-img')?.textContent.trim() || '🛒',
            specs,
            crypto: card.querySelector('.prod-crypto')?.textContent.trim() || '',
            rating: card.querySelector('.stars')?.textContent.trim() || '',
            ratingCount: card.querySelector('.rating-count')?.textContent.trim() || '',
            warranty: card.querySelector('.prod-nft-badge')?.textContent.replace('◈', '').trim() || '',
            addToCartPayload: extractInlineProduct(card.querySelector('.add-cart-btn')?.getAttribute('onclick') || ''),
        };
    });
}

function hydrateProductImages() {
    productCatalog.forEach(product => {
        const imageWrap = product.card.querySelector('.prod-img');
        if (!imageWrap) return;
        imageWrap.innerHTML = buildImageMarkup(product.image, product.name, product.icon, 'prod-img-fallback');
    });
}

function extractInlineProduct(source) {
    const match = source.match(/addToCart\((\{.*\})\)/);
    if (!match) return null;
    try {
        return Function(`return (${match[1]});`)();
    } catch (err) {
        return null;
    }
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
    return productCatalog.find(product => product.id === productId)
        || EXTRA_PRODUCTS.find(product => product.id === productId)
        || null;
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
}

function applyCatalogFilters() {
    const grid = document.getElementById('featuredProductGrid');
    const normalizedQuery = (catalogState.query || '').trim().toLowerCase();
    const filtered = productCatalog.filter(product => {
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

function focusCatalog() {
    document.getElementById('featuredProductsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        { w: '0%', c: 'var(--red)', t: '' },
        { w: '25%', c: 'var(--red)', t: 'Yếu' },
        { w: '50%', c: 'var(--orange)', t: 'Trung bình' },
        { w: '75%', c: '#2196f3', t: 'Khá mạnh' },
        { w: '100%', c: 'var(--green)', t: 'Mạnh' },
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
    closeAuthModal();
    simulateLogin({ name: 'Người dùng ' + provider, avatar: provider[0], points: 500, orders: 0, nfts: 0, phone: '' });
    showToast(`✅ Đăng nhập bằng ${provider} thành công!`);
}

function doLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pw = document.getElementById('loginPw').value;
    let hasErr = false;
    if (!email || !/\S+@\S+/.test(email) && !/^\d{10}/.test(email)) {
        document.getElementById('loginEmailErr').classList.add('show'); hasErr = true;
    }
    if (!pw) { document.getElementById('loginPwErr').classList.add('show'); hasErr = true; }
    if (hasErr) return;

    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Đang đăng nhập...'; btn.classList.add('loading');

    setTimeout(() => {
        btn.textContent = 'Đăng nhập'; btn.classList.remove('loading');
        const acc = DEMO_ACCOUNTS[email];
        const registered = getRegisteredAccount(email);
        if (acc && acc.pw === pw) {
            closeAuthModal();
            simulateLogin({ ...acc, email });
            showToast(`👋 Chào mừng trở lại, ${acc.name.split(' ').pop()}!`);
        } else if (acc) {
            document.getElementById('loginPwErr').classList.add('show');
        } else if (registered && registered.pw === pw) {
            closeAuthModal();
            const saved = getSavedAccountState(email);
            simulateLogin({
                name: saved?.profile?.name || email.split('@')[0],
                avatar: saved?.profile?.avatar || email[0].toUpperCase(),
                points: saved?.profile?.points || 100,
                orders: saved?.profile?.orders || 0,
                nfts: saved?.profile?.nfts || 0,
                phone: saved?.profile?.phone || '',
                email,
            });
            showToast('✅ Đăng nhập thành công!');
        } else if (registered) {
            document.getElementById('loginPwErr').classList.add('show');
        } else {
            document.getElementById('loginEmailErr').textContent = 'Tài khoản chưa tồn tại. Hãy đăng ký trước';
            document.getElementById('loginEmailErr').classList.add('show');
        }
    }, 900);
}

function doRegister() {
    const first = document.getElementById('regFirst').value.trim();
    const last = document.getElementById('regLast').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const pw = document.getElementById('regPw').value;
    const pw2 = document.getElementById('regPw2').value;
    let hasErr = false;

    if (!email || !/\S+@\S+/.test(email)) {
        document.getElementById('regEmailErr').classList.add('show'); hasErr = true;
    }
    if (DEMO_ACCOUNTS[email] || getRegisteredAccount(email)) {
        document.getElementById('regEmailErr').textContent = 'Email đã tồn tại';
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
    setTimeout(() => {
        btn.textContent = 'Tạo tài khoản'; btn.classList.remove('loading');
        closeAuthModal();
        const fullName = (last + ' ' + first).trim() || email.split('@')[0];
        saveRegisteredAccount({ name: fullName, avatar: (last[0] || email[0]).toUpperCase(), points: 100, orders: 0, nfts: 0, phone, email }, pw);
        simulateLogin({ name: fullName, avatar: (last[0] || email[0]).toUpperCase(), points: 100, orders: 0, nfts: 0, phone, email });
        showToast(`🎉 Đăng ký thành công! Chào mừng ${fullName}!`);
        setTimeout(() => showToast('🎁 +100 điểm chào mừng đã được cộng vào tài khoản!'), 1200);
    }, 1000);
}

/* ─── ACCOUNT PAGE ─── */
function simulateLogin(user) {
    persistCurrentState();
    const email = getAccountKey(user);
    const saved = email ? getSavedAccountState(email) : null;
    currentUser = {
        ...user,
        ...(saved?.profile || {}),
        email: user.email || saved?.profile?.email || '',
        accountData: saved?.accountData || getDefaultAccountDetails(email),
    };
    applySessionState(saved?.session);
    /* Update header button */
    document.getElementById('headerAccLabel').textContent = (currentUser.name || '').split(' ').pop();
    /* Update account page data */
    const initials = (currentUser.avatar || currentUser.name.split(' ').map(w => w[0]).join('')).slice(0, 2).toUpperCase();
    document.getElementById('accAvatar').textContent = initials;
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('accUserName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('accUserEmail').textContent = currentUser.email || '';
    document.getElementById('accOrderCount').textContent = currentUser.accountData.orders.length;
    document.getElementById('accPointsTop').textContent = (currentUser.points || 0).toLocaleString('vi-VN');
    document.getElementById('accNftCount').textContent = currentUser.accountData.nfts.length;
    document.getElementById('loyaltyPoints').textContent = (currentUser.points || 0).toLocaleString('vi-VN');
    document.getElementById('pfFirst').value = currentUser.name.split(' ').pop();
    document.getElementById('pfLast').value = currentUser.name.split(' ').slice(0, -1).join(' ') || '';
    document.getElementById('pfEmail').value = currentUser.email || '';
    document.getElementById('pfPhone').value = currentUser.phone || '';
    persistCurrentState();
}

function handleAccountClick() {
    if (currentUser) openAccountPage();
    else openAuthModal();
}

function openAccountPage() {
    document.getElementById('accountPage').classList.add('open');
    document.body.style.overflow = 'hidden';
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

function saveProfile() {
    if (!currentUser) return;
    const first = document.getElementById('pfFirst').value.trim();
    const last = document.getElementById('pfLast').value.trim();
    const name = (last + ' ' + first).trim();
    currentUser.name = name;
    currentUser.phone = document.getElementById('pfPhone').value.trim();
    document.getElementById('accUserName').textContent = name;
    document.getElementById('profileName').textContent = name;
    document.getElementById('headerAccLabel').textContent = first || name.split(' ').pop();
    persistCurrentState();
    showToast('✅ Đã lưu thông tin cá nhân!');
}

function toggleSecurity(el, label) {
    el.classList.toggle('on');
    const on = el.classList.contains('on');
    showToast(`${on ? '✅ Bật' : '⛔ Tắt'} ${label}`, on ? '' : 'warn');
    if (label === 'Web3' && on && walletConnected) {
        document.getElementById('web3LoginDesc').textContent = 'Đã kết nối: ' + document.getElementById('walletHeaderText').textContent;
    }
}

function doLogout() {
    persistCurrentState();
    currentUser = null;
    document.getElementById('headerAccLabel').textContent = 'Đăng nhập';
    document.getElementById('accWeb3Badge').style.display = 'none';
    applySessionState(buildDefaultSessionState());
    closeAccountPage();
    showToast('👋 Đã đăng xuất thành công', 'info');
}

(function autoRestoreSession() {
    try {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        if (isLoggedIn !== "1") return; // 🔥 CHẶN AUTO LOGIN

        const raw = localStorage.getItem("currentUser");
        if (!raw) return;

        const saved = JSON.parse(raw);
        if (saved && saved.email) {
            simulateLogin(saved);
        }
    } catch (e) { }
})();


/* ─── STATE ─── */
let walletConnected = false;
let voucherApplied = null; // { code, pct }
let walletAddress = '';

const VOUCHERS = {
    'NEXUS15': { pct: 15, label: 'DAO Member -15%' },
    'CRYPTO5': { pct: 5, label: 'Crypto -5%' },
    'SALE10': { pct: 10, label: 'Khuyến mãi -10%' },
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
    if (!currentUser || !purchasedItems.length) return { nftCount: 0 };

    const orderTotal = purchasedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = purchasedItems.reduce((sum, item) => sum + item.qty, 0);
    const purchasedAt = formatShortDate();
    const productSummary = purchasedItems.map(item => item.name.split(' ').slice(0, 5).join(' ')).join(' · ');

    currentUser.accountData.orders.unshift({
        id: orderId,
        date: purchasedAt,
        items: `${totalQty} sản phẩm`,
        products: productSummary,
        total: fmt(orderTotal),
        statusClass: 'status-proc',
        statusText: '⏳ Đang xử lý',
        actions: [
            { label: 'Theo dõi', kind: 'outline', toast: `Đang theo dõi đơn ${orderId}` },
        ],
    });

    const nftItems = [];
    purchasedItems.forEach(item => {
        if (!item.nft) return;
        const qty = item.qty || 1;
        for (let index = 0; index < qty; index++) {
            const tokenId = '#SF-' + Math.random().toString(16).slice(2, 8).toUpperCase();
            nftItems.push({
                icon: item.icon || '◈',
                name: escapeHtml(item.name.split(' ').slice(0, 4).join(' ')),
                info: `Mua: ${purchasedAt}<br>Đơn: ${orderId}<br>Token: ${tokenId}`,
                statusClass: 'nft-active',
                statusText: '◈ Còn hiệu lực',
                toast: `NFT ${tokenId} — ${item.name}`,
            });
        }
    });

    if (nftItems.length) {
        currentUser.accountData.nfts.unshift(...nftItems);
    }

    currentUser.orders = currentUser.accountData.orders.length;
    currentUser.nfts = currentUser.accountData.nfts.length;
    document.getElementById('accOrderCount').textContent = currentUser.orders;
    document.getElementById('accNftCount').textContent = currentUser.nfts;
    renderAccountData();
    persistCurrentState();

    return { nftCount: nftItems.length };
}

function syncWalletUi() {
    document.getElementById('walletHeaderBtn').classList.toggle('connected', walletConnected);
    document.getElementById('walletHeaderText').textContent = walletConnected ? walletAddress : 'Kết nối ví';
    document.getElementById('wsDot').classList.toggle('on', walletConnected);
    document.getElementById('wsText').textContent = walletConnected ? walletAddress : 'Chưa kết nối ví';
    document.getElementById('connectMiniBtn').textContent = walletConnected ? '✅ Đã kết nối' : 'Kết nối ví →';
    document.getElementById('connectMiniBtn').style.background = walletConnected ? 'var(--green)' : '';
    document.getElementById('cdWalletStatus').textContent = walletConnected ? walletAddress : 'Chưa kết nối ví';
    document.getElementById('accWeb3Badge').style.display = currentUser && walletConnected ? '' : 'none';
    document.getElementById('toggleWeb3').classList.toggle('on', walletConnected);
    document.getElementById('web3LoginDesc').textContent = walletConnected ? ('Đã kết nối: ' + walletAddress) : 'Chưa kết nối ví';
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
        <div class="acc-order-footer">
          <span class="acc-order-total">${order.total}</span>
          <div class="acc-order-btns">
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
    });
}

function renderNfts() {
    const container = document.getElementById('accNftGrid');
    const nfts = currentUser?.accountData?.nfts || [];
    document.getElementById('accNftBadge').textContent = nfts.length;

    if (!nfts.length) {
        container.innerHTML = `
      <div style="grid-column:1/-1;border:1px dashed var(--border);border-radius:10px;padding:28px 20px;text-align:center;color:var(--text-3)">
        <div style="font-size:28px;margin-bottom:8px">◈</div>
        <div style="font-weight:700;color:var(--text-2);margin-bottom:4px">Chưa có NFT bảo hành</div>
        <div>Những account mới sẽ không dùng chung dữ liệu NFT với account khác.</div>
      </div>`;
        return;
    }

    container.innerHTML = nfts.map(item => `
    <div class="acc-nft-card" onclick="showToast('${escapeHtml(item.toast)}','info')">
      <div class="acc-nft-icon">${item.icon}</div>
      <div class="acc-nft-name">${escapeHtml(item.name)}</div>
      <div class="acc-nft-info">${item.info}</div>
      <span class="acc-nft-status ${item.statusClass}">${item.statusText}</span>
    </div>
  `).join('');
}

function renderAccountData() {
    if (!currentUser) return;
    renderOrders();
    renderNfts();
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
    if (!currentUser) return;
    saveAccountState(currentUser, { cart, voucherApplied, walletConnected, walletAddress });
    // Đồng bộ sang key "currentUser" để các trang khác đọc được
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
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
          ${item.oldPrice > 0 ? `<span class="cd-item-badge sale">-${Math.round((1 - item.price / item.oldPrice) * 100)}%</span>` : ''}
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
    const nftCount = cart.filter(i => i.nft).reduce((s, i) => s + i.qty, 0);
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);

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
    const total = cart.reduce((s, i) => s + i.qty, 0);
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
        showToast(`✅ Đã tăng số lượng: ${product.name.split(' ').slice(0, 4).join(' ')}...`);
    } else {
        cart.push({ ...product, qty: 1 });
        showToast(`✅ Đã thêm vào giỏ: ${product.name.split(' ').slice(0, 4).join(' ')}...`);
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
    showToast(`🗑️ Đã xóa: ${item?.name.split(' ').slice(0, 4).join(' ')}...`, 'warn');
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
        msgEl.textContent = '❌ Mã không hợp lệ. Thử: NEXUS15, CRYPTO5, SALE10';
        msgEl.style.color = 'var(--red)';
    }
    renderSummary();
    persistCurrentState();
}

/* ─── CHECKOUT from drawer ─── */
function proceedToCheckout() {
    if (cart.length === 0) return;
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
    const nftCount = cart.filter(i => i.nft).reduce((s, i) => s + i.qty, 0);
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);

    itemsEl.innerHTML = `
    <div class="os-title">Tóm tắt đơn hàng (${itemCount} sản phẩm)</div>
    ${cart.map(i => `<div class="os-row"><span>${i.name.split(' ').slice(0, 5).join(' ')}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}
    <div class="os-row"><span>Phí vận chuyển</span><span style="color:var(--green)">Miễn phí</span></div>
    ${discountRow}${cryptoRow}
    <div class="os-row os-total"><span>Tổng thanh toán</span><span>${fmt(total)}</span></div>
    ${nftCount > 0 ? `<div class="os-row"><span class="os-nft">◈ ${nftCount} NFT bảo hành sẽ được mint sau khi thanh toán</span><span class="os-nft">Free</span></div>` : ''}
  `;
    document.getElementById('checkoutModal').classList.add('active');
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
function connectWallet(name) {
    closeModal('walletModal');
    walletConnected = true;
    walletAddress = '0x' + Math.random().toString(16).substr(2, 4).toUpperCase() + '...' + Math.random().toString(16).substr(2, 4).toUpperCase();
    syncWalletUi();
    persistCurrentState();

    showToast(`✅ Đã kết nối ${name}: ${walletAddress}`);
    if (document.getElementById('cartDrawer').classList.contains('open')) renderSummary();
}

/* ─── PAYMENT ─── */
function handleConfirmPayment() {
    if (!currentUser) {
        closeModal('checkoutModal');
        openAuthModal();
        showToast('Vui lòng đăng nhập trước khi đặt hàng', 'warn');
        return;
    }

    const selectedMethodEl = document.querySelector('.pay-method.selected .pay-name');
    const selectedMethod = selectedMethodEl ? selectedMethodEl.textContent.trim() : "Thanh toán thường";
    const isCrypto = selectedMethod.includes('Crypto');

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

        // === LƯU TOÀN BỘ TRẠNG THÁI TRƯỚC KHI CHUYỂN TRANG ===
        localStorage.setItem("pendingCart", JSON.stringify(purchasedItems));
        if (currentUser) {
            localStorage.setItem("currentUserBackup", JSON.stringify(currentUser));
        }
        localStorage.setItem("justPaidCrypto", "true");

        closeModal('checkoutModal');
        showToast(`🚀 Chuyển sang thanh toán Crypto ≈ ${totalTestText} TEST`);

        setTimeout(() => {
            window.location.href = `crypto_payment.html?price=${totalTestText}&name=${encodeURIComponent(checkoutProductName)}`;
        }, 700);

        return;
    }

    // ==================== THANH TOÁN THƯỜNG ====================
    closeModal('checkoutModal');

    const result = addCompletedPurchaseToAccount(purchasedItems, createOrderId());

    cart = [];
    voucherApplied = null;
    updateCartCount();
    persistCurrentState();

    showToast('⏳ Đang xử lý đơn hàng...');
    setTimeout(() => {
        showToast(`✅ Đặt hàng thành công! Mã đơn: ${result.orderId || 'Unknown'}`);
    }, 1200);

    if (result.nftCount > 0) {
        setTimeout(() => showToast(`🎫 ${result.nftCount} NFT bảo hành đã được mint!`), 2500);
    }
} ss

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
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
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
    setMany('.dsi-icon', ['◈', '🎫', '🏛️']);
    setMany('.dsi-title', ['Thanh Toán Crypto', 'NFT Bảo Hành On-Chain', 'DAO Member — Cashback 15%']);
    setMany('.dsi-desc', ['Hỗ trợ ETH, BTC, SOL, USDT và 15+ đồng coin. Tỷ giá real-time, phí gas thấp nhất.', 'Mỗi đơn hàng kèm NFT bảo hành minh bạch, không thể giả mạo. Chuyển nhượng cùng sản phẩm.', 'Stake NEXUS token, tham gia DAO, nhận cashback mọi đơn hàng và quyền vote sản phẩm.']);
    setMany('.dsi-link', ['Kết nối ví ngay →', 'Xem NFT của tôi →', 'Tham gia DAO →']);
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
    setMany('.dsi-icon', ['WEB3', 'NFT', 'DAO']);
    setMany('.dsi-title', ['Thanh toan Crypto', 'NFT Bao Hanh On-Chain', 'DAO Member - Cashback 15%']);
    setMany('.dsi-desc', ['Ho tro ETH, BTC, SOL, USDT va 15+ dong coin. Ty gia real-time, phi gas thap.', 'Moi don hang kem NFT bao hanh minh bach, khong the gia mao. Chuyen nhuong cung san pham.', 'Stake NEXUS token, tham gia DAO, nhan cashback moi don hang va quyen vote san pham.']);
    setMany('.dsi-link', ['Ket noi vi ngay ->', 'Xem NFT cua toi ->', 'Tham gia DAO ->']);
}

applyDemoTextFixes();
applyDemoTextFixesSafe();
buildProductCatalog();
hydrateProductImages();
hydrateUiState();
applySessionState(buildDefaultSessionState());
const initialCatalogCount = applyCatalogFilters();
if (initialCatalogCount === 0 && productCatalog.length > 0) {
    catalogState = { ...DEFAULT_CATALOG_STATE };
    document.getElementById('searchInput').value = '';
    document.getElementById('catalogSort').value = catalogState.sort;
    document.querySelectorAll('.sec-tab').forEach(tab => tab.classList.toggle('active', tab.textContent.trim() === 'Táº¥t cáº£'));
    applyCatalogFilters();
}
syncFavoriteUi();
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

function loadOrdersFromStorage() {
    const stored = JSON.parse(localStorage.getItem("orders") || "[]");

    if (!currentUser.accountData.orders) {
        currentUser.accountData.orders = [];
    }

    // tránh trùng
    stored.forEach(o => {
        if (!currentUser.accountData.orders.find(x => x.id === o.id)) {
            currentUser.accountData.orders.unshift(o);
        }
    });

    persistCurrentState();
}

function syncOrdersFromStorage() {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

    if (!currentUser) return;

    if (!currentUser.accountData) {
        currentUser.accountData = {};
    }

    if (!currentUser.accountData.orders) {
        currentUser.accountData.orders = [];
    }

    // tránh trùng đơn
    storedOrders.forEach(o => {
        if (!currentUser.accountData.orders.find(x => x.id === o.id)) {
            currentUser.accountData.orders.unshift(o);
        }
    });

    persistCurrentState();
}

// Xử lý sau khi thanh toán Crypto thành công
// ==================== CALLBACK SAU THANH TOÁN CRYPTO ====================
// ==================== XỬ LÝ SAU KHI THANH TOÁN CRYPTO ====================
function handleCryptoPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("paid") === "1") {
        console.log("✅ Phát hiện thanh toán thành công, đang kiểm tra đơn hàng...");

        // 1. Lấy đơn hàng mới nhất từ mảng "orders" (mà trang crypto_payment vừa lưu)
        let ordersFromStorage = JSON.parse(localStorage.getItem("orders") || "[]");

        if (ordersFromStorage.length > 0) {
            const newOrder = ordersFromStorage[0]; // Lấy đơn hàng mới nhất vừa thêm vào đầu mảng

            // 2. Khôi phục User (Đảm bảo currentUser có dữ liệu)
            if (!currentUser) {
                const backup = localStorage.getItem("currentUserBackup");
                if (backup) {
                    currentUser = JSON.parse(backup);
                    simulateLogin(currentUser); // 🔥 BẮT BUỘC
                }
            }

            if (currentUser) {
                if (!currentUser.accountData) currentUser.accountData = { orders: [] };
                if (!currentUser.accountData.orders) currentUser.accountData.orders = [];

                // 3. Kiểm tra xem đơn này đã có trong tài khoản chưa (tránh trùng lặp)
                const isExisted = currentUser.accountData.orders.some(o => o.id === newOrder.id);

                if (!isExisted) {
                    console.log("📦 Đang nạp đơn hàng mới vào tài khoản:", newOrder.id);
                    currentUser.accountData.orders.unshift(newOrder);

                    // 4. LƯU VĨNH VIỄN VÀO HỆ THỐNG TỔNG
                    // Gọi persistCurrentState để ghi đè vào SILVER_FLAG_USERS_DATA
                    if (typeof persistCurrentState === "function") {
                        persistCurrentState();
                    } else {
                        // Nếu không có hàm persist, ta tự lưu vào mảng users tổng
                        let allUsers = JSON.parse(localStorage.getItem("SILVER_FLAG_USERS_DATA") || "[]");
                        const idx = allUsers.findIndex(u => u.username === currentUser.username);
                        if (idx !== -1) {
                            allUsers[idx] = currentUser;
                            localStorage.setItem("SILVER_FLAG_USERS_DATA", JSON.stringify(allUsers));
                        }
                    }

                    // 5. Vẽ lại bảng ngay lập tức
                    if (typeof renderAccountData === "function") renderAccountData();
                }
            }
        }

        showToast("🎉 Thanh toán thành công! Đơn hàng đã được cập nhật.", "");

        // Xóa dấu vết và dọn dẹp
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            localStorage.removeItem("currentUserBackup");
        }, 3000);
        // localStorage.removeItem("orders"); // Tùy chọn: Xóa mảng tạm nếu muốn sạch sẽ
    }
}

function restoreUserAfterCryptoPayment() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("paid") === "1") {
        console.log("🔄 Đang khôi phục sau thanh toán Crypto...");

        // 1. Khôi phục đăng nhập
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser && (!currentUser || !currentUser.name)) {
            try {
                currentUser = JSON.parse(savedUser);
                simulateLogin(currentUser);   // hàm này của bạn sẽ cập nhật UI
                console.log("✅ Khôi phục đăng nhập thành công");
            } catch (e) { console.error("Lỗi khôi phục user", e); }
        }

        // 2. Đồng bộ đơn hàng
        if (typeof syncOrdersFromStorage === "function") {
            syncOrdersFromStorage();
            console.log("✅ Đã chạy syncOrdersFromStorage");
        } else {
            // Fallback trực tiếp
            const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
            if (currentUser && currentUser.accountData) {
                if (!currentUser.accountData.orders) currentUser.accountData.orders = [];
                storedOrders.forEach(order => {
                    if (!currentUser.accountData.orders.find(o => o.id === order.id)) {
                        currentUser.accountData.orders.unshift(order);
                    }
                });
                renderAccountData();   // hàm render đơn hàng của bạn
            }
        }

        showToast("🎉 Thanh toán Crypto thành công! Đơn hàng đã được cập nhật.", "");

        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


// ====================== KHÔI PHỤC ĐĂNG NHẬP + ĐƠN HÀNG SAU CRYPTO PAYMENT ======================
function restoreAfterCryptoPayment() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("paid") !== "1") return;

    console.log("🔄 Đang khôi phục sau thanh toán Crypto...");

    // 1. Khôi phục đăng nhập
    const backup = localStorage.getItem("currentUserBackup");
    if (backup) {
        try {
            currentUser = JSON.parse(backup);
            simulateLogin(currentUser);        // hàm này sẽ cập nhật UI
            console.log("✅ Đã khôi phục đăng nhập thành công");
        } catch (e) {
            console.error("Lỗi khôi phục user", e);
        }
    }

    // 2. Đồng bộ đơn hàng
    const ordersFromStorage = JSON.parse(localStorage.getItem("orders") || "[]");
    if (currentUser && currentUser.accountData) {
        if (!currentUser.accountData.orders) currentUser.accountData.orders = [];

        ordersFromStorage.forEach(order => {
            if (!currentUser.accountData.orders.find(o => o.id === order.id)) {
                currentUser.accountData.orders.unshift(order);
            }
        });

        renderAccountData();   // hàm render đơn hàng của bạn
        persistCurrentState();
        console.log("✅ Đã đồng bộ đơn hàng, tổng đơn:", currentUser.accountData.orders.length);
    }

    showToast("🎉 Thanh toán Crypto thành công! Đơn hàng đã được cập nhật.", "");

    // Xóa param URL và dữ liệu tạm
    window.history.replaceState({}, document.title, window.location.pathname);
    localStorage.removeItem("justPaidCrypto");
}

window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("paid") !== "1") return;

    console.log("🔥 Crypto callback triggered");

    // 1. Lấy backup
    const backup = localStorage.getItem("currentUserBackup");
    let backupUser = backup ? JSON.parse(backup) : null;

    // 2. Nếu chưa có currentUser → restore + login
    if (!currentUser && backupUser && urlParams.get("paid") === "1") {
        currentUser = backupUser;
        simulateLogin(currentUser);
    }

    // 3. Merge orders từ backup
    if (currentUser && backupUser?.accountData?.orders) {
        if (!currentUser.accountData) currentUser.accountData = { orders: [], nfts: [] };
        if (!currentUser.accountData.orders) currentUser.accountData.orders = [];

        backupUser.accountData.orders.forEach(order => {
            if (!currentUser.accountData.orders.find(o => o.id === order.id)) {
                currentUser.accountData.orders.unshift(order);
            }
        });
    }

    // 4. Merge từ orders chung (fallback)
    const ordersFromStorage = JSON.parse(localStorage.getItem("orders") || "[]");

    if (currentUser && ordersFromStorage.length > 0) {
        if (!currentUser.accountData) currentUser.accountData = { orders: [], nfts: [] };
        if (!currentUser.accountData.orders) currentUser.accountData.orders = [];

        ordersFromStorage.forEach(order => {
            if (!currentUser.accountData.orders.find(o => o.id === order.id)) {
                currentUser.accountData.orders.unshift(order);
            }
        });
    }

    // 5. Render + persist
    if (currentUser) {
        console.log("✅ Render lại UI + lưu state");

        if (typeof renderAccountData === "function") renderAccountData();
        if (typeof persistCurrentState === "function") persistCurrentState();
    }

    showToast("🎉 Thanh toán Crypto thành công! Đơn hàng đã được cập nhật.", "");

    // 6. Cleanup AN TOÀN (delay để tránh race condition)
    setTimeout(() => {
        console.log("🧹 Xoá backup sau khi hoàn tất");
        localStorage.removeItem("currentUserBackup");
    }, 1500);

    // 7. Xoá query param
    window.history.replaceState({}, document.title, window.location.pathname);
});