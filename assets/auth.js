/* Google sign-in + saved data (Firebase Auth + Firestore). Loaded by site.js only when
   TAGD_STORE.firebase.apiKey is set. Exposes window.TAGD_ACCOUNT. */
(function () {
    var STORE = window.TAGD_STORE, CART = window.TAGD_CART;
    var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
    var listeners = [], user = null, ready = false, db, auth, synced = false, timer;

    function loadScript(src) {
        return new Promise(function (ok, fail) {
            var s = document.createElement('script');
            s.src = src; s.onload = ok; s.onerror = fail;
            document.head.appendChild(s);
        });
    }
    function esc(v) { var d = document.createElement('div'); d.textContent = v == null ? '' : String(v); return d.innerHTML; }
    function userDoc() { return db.collection('users').doc(user.uid); }
    function fire() { listeners.forEach(function (f) { f(user); }); document.dispatchEvent(new CustomEvent('tagd:auth', { detail: user })); }

    var A = window.TAGD_ACCOUNT = {
        esc: esc,
        user: function () { return user; },
        ready: function () { return ready; },
        onChange: function (f) { listeners.push(f); if (ready) f(user); },
        signIn: function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            return auth.signInWithPopup(provider).catch(function (e) {
                if (e.code === 'auth/popup-blocked') return auth.signInWithRedirect(provider);
                if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') alert('Sign-in failed: ' + e.message);
            });
        },
        signOut: function () { CART.clear(); synced = false; return auth.signOut(); },
        getProfile: function () { return userDoc().get().then(function (d) { return d.exists ? d.data() : {}; }); },
        saveProfile: function (data) { return userDoc().set(data, { merge: true }); },
        saveNamedCart: function (name) {
            return userDoc().collection('savedCarts').add({ name: name, lines: CART.raw(), createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        },
        listSavedCarts: function () {
            return userDoc().collection('savedCarts').orderBy('createdAt', 'desc').get().then(function (q) {
                return q.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
            });
        },
        deleteSavedCart: function (id) { return userDoc().collection('savedCarts').doc(id).delete(); },
        saveOrder: function (order) {
            order.status = 'requested';
            order.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            return userDoc().collection('orders').add(order);
        },
        listOrders: function () {
            return userDoc().collection('orders').orderBy('createdAt', 'desc').get().then(function (q) {
                return q.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
            });
        }
    };

    /* ---- active cart sync (users/{uid}/cart/current) ---- */
    function cartRef() { return userDoc().collection('cart').doc('current'); }
    function mergeCarts(a, b) {
        var m = {};
        a.concat(b).forEach(function (l) { m[l.id] = Math.max(m[l.id] || 0, l.qty); });
        return Object.keys(m).map(function (id) { return { id: id, qty: m[id] }; });
    }
    function pullAndMerge() {
        return cartRef().get().then(function (d) {
            var remote = d.exists ? (d.data().lines || []) : [];
            CART.replace(mergeCarts(CART.raw(), remote));
            synced = true;
            return push();
        }).catch(function (e) { console.warn('Cart sync failed', e); });
    }
    function push() {
        if (!user || !synced) return;
        return cartRef().set({ lines: CART.raw(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(function (e) { console.warn('Cart save failed', e); });
    }
    document.addEventListener('tagd:cart', function () { clearTimeout(timer); timer = setTimeout(push, 600); });

    /* ---- header / drawer UI ---- */
    function paintChrome() {
        var btn = document.getElementById('tagd-account-btn');
        if (btn) {
            if (user && user.photoURL) btn.innerHTML = '<img alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer" src="' + esc(user.photoURL) + '"/>';
            else btn.innerHTML = '<span class="material-symbols-outlined text-2xl font-bold">person</span>';
            btn.setAttribute('aria-label', user ? 'Account (' + (user.displayName || user.email) + ')' : 'Sign in');
        }
        var note = document.getElementById('tagd-acct-note'), save = document.getElementById('tagd-save-cart');
        if (note) note.innerHTML = user ? 'Signed in &mdash; your cart is saved to your account.' :
            '<a class="underline text-black" href="account.html">Sign in with Google</a> to save your cart.';
        if (save) save.classList.toggle('hidden', !user || !CART.count());
    }
    document.addEventListener('tagd:cart', paintChrome);
    document.addEventListener('click', function (e) {
        if (!e.target.closest('#tagd-save-cart')) return;
        var name = prompt('Name this saved cart:', 'Cart ' + new Date().toLocaleDateString());
        if (name && name.trim()) A.saveNamedCart(name.trim()).then(function () {
            var n = document.getElementById('tagd-acct-note');
            if (n) n.textContent = 'Saved! Find it under My Account.';
        }).catch(function (err) { alert('Could not save cart: ' + err.message); });
    });

    /* ---- boot ---- */
    var cfg = STORE.firebase;
    loadScript(SDK + 'firebase-app-compat.js')
        .then(function () { return Promise.all([loadScript(SDK + 'firebase-auth-compat.js'), loadScript(SDK + 'firebase-firestore-compat.js')]); })
        .then(function () {
            firebase.initializeApp(cfg);
            auth = firebase.auth(); db = firebase.firestore();
            auth.onAuthStateChanged(function (u) {
                user = u; ready = true; synced = false;
                paintChrome();
                if (u) pullAndMerge().then(function () { paintChrome(); fire(); }); else fire();
            });
        })
        .catch(function (e) { console.warn('Accounts unavailable', e); ready = true; fire(); });
})();
