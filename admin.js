'use strict';

const sectionButtons = Array.from(document.querySelectorAll('[data-section-target]'));
const sections = Array.from(document.querySelectorAll('[data-section]'));
const mobileNavToggle = document.querySelector('[data-admin-nav-toggle]');
const sidebarNav = document.querySelector('[data-admin-nav]');
const adminShell = document.querySelector('[data-admin-shell]');
const authGuardSection = document.querySelector('[data-auth-guard]');
const authGuardMessage = document.querySelector('[data-auth-guard-message]');
const authRefreshButton = document.querySelector('[data-admin-refresh-session]');
const adminLogoutButton = document.querySelector('[data-admin-logout]');
const AUTH_LOCK_CLASS = 'is-locked';

if (adminShell) {
    adminShell.classList.add(AUTH_LOCK_CLASS);
}

function setActiveSection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle('is-active', section.dataset.section === sectionId);
    });
    sectionButtons.forEach(button => {
        button.classList.toggle('is-active', button.dataset.sectionTarget === sectionId);
    });
}

sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.sectionTarget;
        if (!target) return;
        setActiveSection(target);
        if (sidebarNav && sidebarNav.classList.contains('is-open')) {
            sidebarNav.classList.remove('is-open');
        }
    });
});

if (sectionButtons.length) {
    const first = sectionButtons[0];
    const initialSection = first.dataset.sectionTarget;
    if (initialSection) {
        setActiveSection(initialSection);
    }
}

if (mobileNavToggle && sidebarNav) {
    mobileNavToggle.addEventListener('click', () => {
        sidebarNav.classList.toggle('is-open');
        mobileNavToggle.setAttribute('aria-expanded', sidebarNav.classList.contains('is-open') ? 'true' : 'false');
    });
}

const autoResizeTextareas = Array.from(document.querySelectorAll('[data-autogrow]'));

autoResizeTextareas.forEach(textarea => {
    const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };
    textarea.addEventListener('input', resize);
    resize();
});

const menuTableBody = document.querySelector('[data-menu-table-body]');
const menuForm = document.querySelector('[data-menu-form]');
const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let menuUnsubscribe = null;
let authGuardInitialized = false;
let menuFormHandlerAttached = false;

function setMenuStatus(message) {
    if (!menuTableBody) return;
    menuTableBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
}

function setMenuFormEnabled(enabled) {
    if (!menuForm) {
        return;
    }

    menuForm.dataset.locked = enabled ? 'false' : 'true';
    menuForm.classList.toggle('is-readonly', !enabled);

    const elements = Array.from(menuForm.elements || []);
    elements.forEach(element => {
        if (element && typeof element.disabled === 'boolean') {
            element.disabled = !enabled;
        }
    });
}

function teardownMenuListener() {
    if (menuUnsubscribe) {
        menuUnsubscribe();
        menuUnsubscribe = null;
    }
}

function showAuthGuard(message) {
    if (authGuardSection) {
        authGuardSection.classList.remove('hidden');
    }
    if (authGuardMessage && typeof message === 'string') {
        authGuardMessage.textContent = message;
    }
    if (adminShell) {
        adminShell.classList.add(AUTH_LOCK_CLASS);
    }
    if (adminLogoutButton) {
        adminLogoutButton.classList.add('hidden');
    }
    setMenuFormEnabled(false);
    setMenuStatus('Inicia sesion como administrador para ver los platos.');
    teardownMenuListener();
    if (menuForm) {
        menuForm.reset();
    }
}

function hideAuthGuard() {
    if (authGuardSection) {
        authGuardSection.classList.add('hidden');
    }
    if (adminShell) {
        adminShell.classList.remove(AUTH_LOCK_CLASS);
    }
    if (adminLogoutButton) {
        adminLogoutButton.classList.remove('hidden');
    }
    setMenuFormEnabled(true);
}

function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return 'N/A';
    }
    return currencyFormatter.format(value);
}

function renderMenuRows(items) {
    if (!menuTableBody) {
        return;
    }

    if (!items.length) {
        setMenuStatus('No hay platos guardados todavia.');
        return;
    }

    const rows = items.map(item => {
        const titleEs = item?.title?.es?.trim() || 'Sin titulo';
        const category = item?.category || 'Sin categoria';
        const priceLabel = formatCurrency(item?.price);
        const mediaLabel = typeof item?.mediaPrice === 'number' ? ` / ${formatCurrency(item.mediaPrice)} media` : '';
        const availability = item?.isAvailable ? 'Activo' : 'Oculto';
        const safeId = item?.id || '';

        return `<tr data-id="${safeId}">
            <td>${titleEs}</td>
            <td><span class="badge">${category}</span></td>
            <td>${priceLabel}${mediaLabel}</td>
            <td><span class="badge"><span class="status-dot"></span> ${availability}</span></td>
            <td class="controls">
                <button type="button" data-action="edit" data-id="${safeId}">Editar</button>
                <button type="button" data-action="delete" data-id="${safeId}">Eliminar</button>
            </td>
        </tr>`;
    });

    menuTableBody.innerHTML = rows.join('');
}

function initMenuListeners(services) {
    if (!menuTableBody) {
        return;
    }

    const { firestore } = services;
    const { db, collection, query, orderBy, onSnapshot } = firestore;
    const collectionRef = collection(db, 'menuItems');
    const menuQuery = query(collectionRef, orderBy('category'), orderBy('displayOrder'));

    if (menuUnsubscribe) {
        menuUnsubscribe();
        menuUnsubscribe = null;
    }

    setMenuStatus('Cargando platos...');

    menuUnsubscribe = onSnapshot(
        menuQuery,
        snapshot => {
            const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            renderMenuRows(items);
        },
        error => {
            console.error('Error al escuchar menuItems:', error);
            setMenuStatus('No se pudo cargar el menu. Revisa la consola.');
        }
    );
}

function handleMenuFormSubmit(services) {
    if (!menuForm) {
        return;
    }

    if (menuFormHandlerAttached) {
        return;
    }
    menuFormHandlerAttached = true;
    const { firestore } = services;
    const { db, collection, addDoc, serverTimestamp } = firestore;
    const formTextareas = Array.from(menuForm.querySelectorAll('textarea[data-autogrow]'));

    menuForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (menuForm.dataset.locked === 'true') {
            return;
        }

        const submitButton = menuForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const formData = new FormData(menuForm);
            const titleEs = (formData.get('dish-name-es') || '').toString().trim();
            const titleEu = (formData.get('dish-name-eu') || '').toString().trim();
            const category = (formData.get('dish-category') || '').toString().trim();
            const descEs = (formData.get('dish-description-es') || '').toString().trim();
            const descEu = (formData.get('dish-description-eu') || '').toString().trim();
            const priceInput = formData.get('dish-price');
            const mediaPriceInput = formData.get('dish-price-medium');

            const price = priceInput === null || priceInput === '' ? 0 : Number.parseFloat(priceInput);
            const mediaPrice = mediaPriceInput === null || mediaPriceInput === '' ? null : Number.parseFloat(mediaPriceInput);

            if (!titleEs || !titleEu || !category) {
                alert('Completa nombre y categoria antes de guardar.');
                return;
            }

            const payload = {
                title: {
                    es: titleEs,
                    eu: titleEu
                },
                description: {
                    es: descEs,
                    eu: descEu
                },
                category,
                price: Number.isFinite(price) ? price : 0,
                mediaPrice: Number.isFinite(mediaPrice) ? mediaPrice : null,
                isAvailable: true,
                displayOrder: Date.now(),
                tags: [],
                image: {
                    desktop: '',
                    mobile: ''
                },
                lastUpdated: serverTimestamp()
            };

            await addDoc(collection(db, 'menuItems'), payload);

            menuForm.reset();
            formTextareas.forEach(textarea => {
                textarea.dispatchEvent(new Event('input'));
            });
        } catch (error) {
            console.error('No se pudo guardar el plato:', error);
            alert('No se pudo guardar el plato. Revisa la consola para mas detalles.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

async function fetchIdTokenResult(user, services, forceRefresh = false) {
    if (!user) {
        return null;
    }

    if (services && typeof services.getIdTokenResult === 'function') {
        return services.getIdTokenResult(user, forceRefresh);
    }

    if (typeof user.getIdTokenResult === 'function') {
        return user.getIdTokenResult(forceRefresh);
    }

    if (services && typeof services.getIdToken === 'function') {
        await services.getIdToken(user, forceRefresh);
    } else if (typeof user.getIdToken === 'function') {
        await user.getIdToken(forceRefresh);
    }

    return null;
}

function initAuthGuard(services) {
    if (authGuardInitialized) {
        return;
    }
    authGuardInitialized = true;

    const auth = services?.auth;
    const signOut = services?.signOut;
    const authChangeHandler = typeof services?.onIdTokenChanged === 'function'
        ? services.onIdTokenChanged
        : services?.onAuthStateChanged;

    if (!auth || typeof authChangeHandler !== 'function') {
        console.warn('No se pudo inicializar la verificacion de autenticacion.');
        showAuthGuard('No se pudo conectar con Firebase Auth. Recarga la pagina.');
        return;
    }

    const processUser = async (user, forceRefresh = false) => {
        if (!user) {
            showAuthGuard('Debes iniciar sesion en la pagina publica y volver aqui.');
            return;
        }

        try {
            const tokenResult = await fetchIdTokenResult(user, services, forceRefresh);
            const isAdmin = Boolean(tokenResult?.claims?.admin);

            if (!isAdmin) {
                showAuthGuard('Tu cuenta no tiene permisos de administrador. Solicita acceso al responsable del sitio.');
                return;
            }

            hideAuthGuard();
            setMenuStatus('Cargando platos...');
            initMenuListeners(services);
        } catch (error) {
            console.error('No se pudo verificar el rol de administrador:', error);
            showAuthGuard('No se pudieron verificar tus permisos. Recarga la pagina e intentalo de nuevo.');
        }
    };

    authChangeHandler(auth, user => {
        processUser(user).catch(error => {
            console.error('Fallo procesando el estado de autenticacion:', error);
        });
    });

    authRefreshButton?.addEventListener('click', async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        try {
            await processUser(currentUser, true);
        } catch (error) {
            console.error('No se pudo refrescar la sesion:', error);
        }
    });

    adminLogoutButton?.addEventListener('click', async () => {
        if (typeof signOut !== 'function') {
            return;
        }

        try {
            adminLogoutButton.disabled = true;
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('No se pudo cerrar la sesion:', error);
        } finally {
            adminLogoutButton.disabled = false;
        }
    });
}

async function initFirebaseFeatures() {
    if (typeof window.loadFirebaseServices !== 'function') {
        console.warn('No se encontro el cargador de Firebase.');
        return;
    }

    try {
        const services = await window.loadFirebaseServices();
        handleMenuFormSubmit(services);
        setMenuFormEnabled(false);
        initAuthGuard(services);
    } catch (error) {
        console.error('No se pudo inicializar Firebase:', error);
        setMenuStatus('No se pudo conectar con Firebase.');
    }
}

initFirebaseFeatures();
