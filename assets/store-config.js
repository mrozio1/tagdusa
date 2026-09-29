// Single source of truth for the storefront: settings + catalog.
// Edit prices, descriptions and shipping/tax rules here; every page picks them up.
window.TAGD_STORE = {
    email: "tagdsupport@gmail.com",
    currency: "USD",
    shipping: 5.00,            // flat rate
    freeShippingOver: 50.00,   // subtotal that unlocks free shipping (set to null to disable)
    taxRate: 0.0825,           // Texas combined state + local (estimate)
    taxLabel: "Est. TX tax (8.25%)",
    // Google sign-in + saved carts/orders use Firebase (Auth + Firestore).
    // Paste your web app config from Firebase console > Project settings. Leave apiKey empty to hide accounts.
    // See SETUP-ACCOUNTS.md.
    firebase: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        appId: ""
    },
    products: [
        {
            id: "NFC-KEY-01",
            name: "TAGD NFC Keychain",
            price: 15.00,
            image: "assets/keychain.png",
            tag: "BEST SELLER",
            description: "Our signature 3D printed keychain with an embedded NFC chip. Program it with your link, contact card or portfolio and share with one tap. No battery, no app."
        },
        {
            id: "NFC-SET-04",
            name: "Creator 4-Pack",
            price: 50.00,
            image: "assets/cleetus.png",
            tag: "SET OF 4",
            description: "Four multi-color NFC tags in the style of our latest custom batch. Great for teams, events and gifting."
        }
    ]
};
