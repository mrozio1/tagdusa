# Enabling Google sign-in, saved carts and order history

The site is static, so accounts use Firebase (free Spark tier is plenty). Until you add a config, the
account button is hidden and everything else works as before.

1. Go to https://console.firebase.google.com and create a project.
2. **Build > Authentication > Get started > Sign-in method > Google > Enable.**
3. **Authentication > Settings > Authorized domains**: add `www.tagdusa.com` and `tagdusa.com`
   (`localhost` is there by default for testing).
4. **Build > Firestore Database > Create database** (production mode), then open the **Rules** tab and
   paste the contents of `firestore.rules`, then Publish.
5. **Project settings > General > Your apps > Web (`</>`)**: register an app and copy the config values
   into `firebase: { ... }` in `assets/store-config.js` (`apiKey`, `authDomain`, `projectId`, `appId`).
   These values are safe to be public; the security rules protect the data.

## What is stored (all under `users/{uid}`)
- profile doc: name, email, last shipping details
- `cart/current`: the active cart (synced across devices; merged with the local cart at sign-in)
- `savedCarts/*`: named carts the user saved
- `orders/*`: order requests made at checkout (status `requested`; you update status in the console)

Once Stripe is added, have its webhook (server side) write confirmed orders here instead.
