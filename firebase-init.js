// Lazy Firebase loader so the SDK only downloads when needed
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyAkWU3kLpYVEUG1U5_1UKFTPIawYQbKpR8",
    authDomain: "web-ganbara.firebaseapp.com",
    projectId: "web-ganbara",
    storageBucket: "web-ganbara.firebasestorage.app",
    messagingSenderId: "288421470720",
    appId: "1:288421470720:web:20f5d951acecd47491aee5"
  };

  let loadPromise = null;

  async function loadFirebaseServices() {
    if (window.firebaseServices) {
      return window.firebaseServices;
    }

    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = (async () => {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js")
      ]);

      const { initializeApp } = appModule;
      const {
        getAuth,
        onAuthStateChanged,
        onIdTokenChanged,
        signOut,
        GoogleAuthProvider,
        OAuthProvider,
        signInWithPopup,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        getIdToken,
        getIdTokenResult
      } = authModule;
      const {
        getFirestore,
        collection,
        doc,
        getDoc,
        addDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        getDocs,
        query,
        orderBy,
        limit,
        runTransaction,
        onSnapshot,
        serverTimestamp
      } = firestoreModule;

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });

      const appleProvider = new OAuthProvider("apple.com");
      appleProvider.addScope("email");
      appleProvider.addScope("name");

      const services = {
        app,
        auth,
        provider: googleProvider,
        googleProvider,
        appleProvider,
        onAuthStateChanged,
        onIdTokenChanged,
        signInWithPopup,
        signOut,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        getIdToken,
        getIdTokenResult,
        firestore: {
          db,
          collection,
          doc,
          getDoc,
          addDoc,
          setDoc,
          updateDoc,
          deleteDoc,
          getDocs,
          query,
          orderBy,
          limit,
          runTransaction,
          onSnapshot,
          serverTimestamp
        }
      };

      window.firebaseServices = services;
      return services;
    })().catch(error => {
      console.error("Error cargando Firebase:", error);
      loadPromise = null;
      throw error;
    });

    return loadPromise;
  }

  window.loadFirebaseServices = loadFirebaseServices;
})();
