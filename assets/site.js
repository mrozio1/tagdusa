/* TAGD USA storefront runtime: shared header, footer, mobile menu and shopping cart.
   Requires assets/store-config.js to be loaded first. Cart persists in localStorage. */
(function () {
    var STORE = window.TAGD_STORE;
    var KEY = 'tagd_cart_v1';
    var NAV = [
        ['home', 'HOME', 'index.html'],
        ['products', 'PRODUCTS', 'products.html'],
        ['about', 'ABOUT', 'about.html'],
        ['quote', 'QUOTE', 'quote.html']
    ];

    function currentPage() {
        var f = location.pathname.split('/').pop().replace(/\.html$/, '');
        return f === '' || f === 'index' ? 'home' : f;
    }
    var money = function (n) { return '$' + n.toFixed(2); };
    var byId = function (id) { return STORE.products.filter(function (p) { return p.id === id; })[0]; };

    /* ---------- cart state ---------- */
    function load() {
        try {
            var raw = JSON.parse(localStorage.getItem(KEY) || '[]');
            return raw.filter(function (l) { return byId(l.id) && l.qty > 0; });
        } catch (e) { return []; }
    }
    var lines = load();
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {}
        render();
    }
    var cart = {
        add: function (id, qty) {
            if (!byId(id)) return;
            var l = lines.filter(function (x) { return x.id === id; })[0];
            if (l) l.qty += qty || 1; else lines.push({ id: id, qty: qty || 1 });
            save();
        },
        setQty: function (id, qty) {
            lines = lines.map(function (l) { return l.id === id ? { id: id, qty: qty } : l; })
                         .filter(function (l) { return l.qty > 0; });
            save();
        },
        clear: function () { lines = []; save(); },
        lines: function () { return lines.map(function (l) { return { product: byId(l.id), qty: l.qty }; }); },
        count: function () { return lines.reduce(function (n, l) { return n + l.qty; }, 0); },
        totals: function () {
            var subtotal = lines.reduce(function (s, l) { return s + byId(l.id).price * l.qty; }, 0);
            var free = STORE.freeShippingOver != null && subtotal >= STORE.freeShippingOver;
            var shipping = subtotal === 0 || free ? 0 : STORE.shipping;
            var tax = Math.round(subtotal * STORE.taxRate * 100) / 100;
            return { subtotal: subtotal, shipping: shipping, tax: tax, total: subtotal + shipping + tax, free: free };
        },
        open: function () { setDrawer(true); },
        close: function () { setDrawer(false); },
        money: money
    };
    window.TAGD_CART = cart;

    /* ---------- header ---------- */
    function headerHTML() {
        var page = currentPage();
        var links = NAV.map(function (n) {
            var on = n[0] === page;
            return '<a class="px-4 py-2 border-2 ' + (on ? 'bg-primary border-black' : 'border-transparent hover:bg-zinc-100') +
                ' transition-colors" href="' + n[2] + '"' + (on ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
        }).join('');
        var mobile = NAV.map(function (n) {
            return '<a class="block px-6 py-4 border-b-2 border-black ' + (n[0] === page ? 'bg-primary' : 'hover:bg-zinc-100') + '" href="' + n[2] + '">' + n[1] + '</a>';
        }).join('');
        return '<header class="bg-white border-b-4 border-black sticky top-0 z-[100] brutalist-shadow-sm">' +
            '<div class="px-6 py-4 flex justify-between items-center">' +
            '<a href="index.html" aria-label="TAGD USA home"><img alt="TAGD USA Logo" class="h-12 w-auto brightness-0" src="assets/logo.PNG"/></a>' +
            '<nav class="hidden md:flex gap-4 font-headline font-black uppercase tracking-tight text-sm" aria-label="Primary">' + links + '</nav>' +
            '<div class="flex items-center gap-3">' +
            '<button id="tagd-cart-btn" type="button" class="relative w-12 h-12 border-2 border-black bg-white hover:bg-primary transition-colors flex items-center justify-center" aria-label="Open cart">' +
            '<span class="material-symbols-outlined text-2xl font-bold">shopping_cart</span>' +
            '<span id="tagd-cart-count" class="hidden absolute -top-3 -right-3 min-w-[1.5rem] text-center bg-tertiary text-white font-mono text-xs font-bold px-1 py-0.5 border-2 border-black">0</span></button>' +
            '<button id="tagd-menu-btn" type="button" class="md:hidden w-12 h-12 border-2 border-black flex items-center justify-center" aria-label="Toggle menu" aria-expanded="false" aria-controls="tagd-mobile-nav">' +
            '<span class="material-symbols-outlined text-3xl font-bold">menu</span></button>' +
            '</div></div>' +
            '<nav id="tagd-mobile-nav" class="hidden md:hidden border-t-4 border-black font-headline font-black uppercase tracking-tight" aria-label="Mobile">' + mobile + '</nav>' +
            '</header>';
    }

    /* ---------- footer ---------- */
    function footerHTML() {
        var a = 'class="hover:text-primary hover:opacity-100 transition-all"';
        return '<footer class="bg-zinc-900 text-white py-20 px-6 md:px-12 border-t-4 border-black">' +
            '<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">' +
            '<div class="space-y-6"><div class="flex items-center gap-4"><span class="text-tertiary text-3xl">★</span>' +
            '<span class="font-headline font-black text-2xl tracking-widest uppercase">TAGD USA</span></div>' +
            '<p class="body-refined opacity-60 text-sm max-w-xs uppercase tracking-widest">Hardware for the digital era. Built to last, engineered to connect.</p>' +
            '<p class="font-mono text-xs opacity-40 uppercase tracking-widest mt-10">©' + new Date().getFullYear() + ' TAGD USA // BUILT IN TEXAS</p></div>' +
            '<div class="grid grid-cols-2 gap-12 md:gap-20">' +
            '<div class="space-y-4"><h4 class="font-headline font-bold uppercase tracking-widest text-primary text-sm">SHOP</h4>' +
            '<nav class="flex flex-col gap-3 font-mono text-xs tracking-[0.2em] uppercase opacity-70" aria-label="Footer">' +
            '<a ' + a + ' href="index.html">Home</a><a ' + a + ' href="products.html">Products</a><a ' + a + ' href="about.html">About</a>' +
            '<a ' + a + ' href="quote.html">Custom Quote</a><a ' + a + ' href="checkout.html">Cart / Checkout</a></nav></div>' +
            '<div class="space-y-4"><h4 class="font-headline font-bold uppercase tracking-widest text-primary text-sm">LEGAL</h4>' +
            '<nav class="flex flex-col gap-3 font-mono text-xs tracking-[0.2em] uppercase opacity-70" aria-label="Legal">' +
            '<a ' + a + ' href="policies.html#shipping">Shipping &amp; Returns</a><a ' + a + ' href="policies.html#terms">Terms</a>' +
            '<a ' + a + ' href="policies.html#privacy">Privacy</a><a ' + a + ' href="about.html">Origin</a></nav></div></div>' +
            '<div class="flex gap-4">' +
            '<a class="w-14 h-14 border-4 border-white flex items-center justify-center hover:bg-primary hover:text-black transition-all" href="mailto:' + STORE.email + '" aria-label="Email us"><span class="material-symbols-outlined">mail</span></a>' +
            '<button id="tagd-share" type="button" class="w-14 h-14 border-4 border-white flex items-center justify-center hover:bg-primary hover:text-black transition-all" aria-label="Share this site"><span class="material-symbols-outlined">share</span></button>' +
            '</div></div></footer>';
    }

    /* ---------- cart drawer ---------- */
    function drawerHTML() {
        return '<div id="tagd-cart-drawer" data-open="false" class="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true">' +
            '<div class="tagd-scrim absolute inset-0 bg-black/80" data-close></div>' +
            '<aside class="tagd-panel absolute right-0 top-0 h-full w-full max-w-md bg-white border-l-8 border-black flex flex-col">' +
            '<div class="p-6 border-b-4 border-black bg-black text-white flex justify-between items-center">' +
            '<h2 class="font-headline font-black uppercase tracking-widest text-xl">YOUR CART</h2>' +
            '<button type="button" class="material-symbols-outlined" data-close aria-label="Close cart">close</button></div>' +
            '<div id="tagd-cart-lines" class="flex-grow overflow-y-auto p-6 space-y-4"></div>' +
            '<div class="p-6 border-t-4 border-black bg-zinc-50 space-y-2">' +
            '<p id="tagd-ship-note" class="font-mono text-[10px] uppercase tracking-widest text-secondary mb-2"></p>' +
            '<div class="flex justify-between font-mono text-xs uppercase"><span>Subtotal</span><span id="tagd-subtotal"></span></div>' +
            '<div class="flex justify-between font-mono text-xs uppercase"><span>Shipping</span><span id="tagd-shipping"></span></div>' +
            '<div class="flex justify-between font-mono text-xs uppercase"><span>' + STORE.taxLabel + '</span><span id="tagd-tax"></span></div>' +
            '<div class="flex justify-between font-headline font-black text-xl uppercase mt-4 pt-4 border-t-2 border-dashed border-zinc-300"><span>Total</span><span id="tagd-total"></span></div>' +
            '<a id="tagd-checkout" href="checkout.html" class="block text-center w-full bg-primary border-4 border-black p-4 mt-6 font-headline font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">CHECKOUT</a>' +
            '<a href="products.html" class="block text-center font-mono text-xs uppercase tracking-widest underline mt-3" data-close>Continue shopping</a>' +
            '</div></aside></div>';
    }

    function setDrawer(open) {
        var d = document.getElementById('tagd-cart-drawer');
        if (!d) return;
        d.dataset.open = open ? 'true' : 'false';
        d.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) { render(); d.querySelector('[aria-label="Close cart"]').focus(); }
    }

    function render() {
        var n = cart.count();
        var badge = document.getElementById('tagd-cart-count');
        if (badge) { badge.textContent = n; badge.classList.toggle('hidden', n === 0); }
        var btn = document.getElementById('tagd-cart-btn');
        if (btn) btn.setAttribute('aria-label', 'Open cart (' + n + ' items)');

        var list = document.getElementById('tagd-cart-lines');
        if (list) {
            if (!lines.length) {
                list.innerHTML = '<div class="text-zinc-400 font-mono text-center py-10 uppercase tracking-widest">[ CART EMPTY ]<br/><a class="underline text-black block mt-4" href="products.html">Browse products</a></div>';
            } else {
                list.innerHTML = cart.lines().map(function (l) {
                    var p = l.product;
                    return '<div class="border-2 border-black p-4 flex gap-4">' +
                        '<img class="w-20 h-20 object-cover border-2 border-black" src="' + p.image + '" alt=""/>' +
                        '<div class="flex-1 flex flex-col gap-2"><div class="flex justify-between gap-2 font-headline font-bold uppercase text-sm tracking-tight"><span>' + p.name + '</span><span>' + money(p.price * l.qty) + '</span></div>' +
                        '<div class="flex justify-between items-center font-mono text-[10px]"><span class="text-zinc-500">' + money(p.price) + ' EA</span>' +
                        '<div class="flex items-center border-2 border-black"><button type="button" class="px-3 py-1 hover:bg-black hover:text-white" data-qty="' + p.id + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
                        '<span class="font-bold px-2">' + l.qty + '</span>' +
                        '<button type="button" class="px-3 py-1 hover:bg-black hover:text-white" data-qty="' + p.id + '" data-delta="1" aria-label="Increase quantity">+</button></div></div></div></div>';
                }).join('');
            }
        }
        var t = cart.totals();
        var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
        set('tagd-subtotal', money(t.subtotal));
        set('tagd-shipping', !lines.length ? '$0.00' : (t.free ? 'FREE' : money(t.shipping)));
        set('tagd-tax', money(t.tax));
        set('tagd-total', money(t.total));
        var note = document.getElementById('tagd-ship-note');
        if (note) {
            note.textContent = !lines.length || STORE.freeShippingOver == null ? '' :
                t.free ? 'Free shipping unlocked' : 'Add ' + money(STORE.freeShippingOver - t.subtotal) + ' more for free shipping';
        }
        var co = document.getElementById('tagd-checkout');
        if (co) { co.classList.toggle('opacity-40', !lines.length); co.classList.toggle('pointer-events-none', !lines.length); }
        document.dispatchEvent(new CustomEvent('tagd:cart', { detail: cart }));
    }

    /* ---------- mount ---------- */
    function mount() {
        var h = document.getElementById('site-header');
        var f = document.getElementById('site-footer');
        if (h) h.outerHTML = headerHTML();
        if (f) f.outerHTML = footerHTML();
        var wrap = document.createElement('div');
        wrap.innerHTML = drawerHTML();
        document.body.appendChild(wrap.firstChild);

        document.addEventListener('click', function (e) {
            var t = e.target.closest('button, a, [data-close]');
            if (!t) return;
            if (t.id === 'tagd-cart-btn') return setDrawer(true);
            if (t.id === 'tagd-menu-btn') {
                var m = document.getElementById('tagd-mobile-nav');
                var open = m.classList.toggle('hidden') === false;
                t.setAttribute('aria-expanded', open);
                t.firstChild.textContent = open ? 'close' : 'menu';
                return;
            }
            if (t.id === 'tagd-share') {
                var data = { title: 'TAGD USA', text: 'NFC keychains, 3D printed in Texas.', url: location.origin };
                if (navigator.share) navigator.share(data).catch(function () {});
                else if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { t.title = 'Link copied'; });
                return;
            }
            if (t.hasAttribute('data-close')) return setDrawer(false);
            if (t.dataset.qty) {
                var l = lines.filter(function (x) { return x.id === t.dataset.qty; })[0];
                if (l) cart.setQty(l.id, l.qty + parseInt(t.dataset.delta, 10));
                return;
            }
            var add = t.closest('[data-add]');
            if (add) {
                cart.add(add.dataset.add, 1);
                setDrawer(true);
            }
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
        window.addEventListener('storage', function (e) { if (e.key === KEY) { lines = load(); render(); } });
        render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
