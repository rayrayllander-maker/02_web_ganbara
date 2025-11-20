'use strict';

const adminConfig = window.ADMIN_CONFIG || {};
let currentAdminConfig = { ...adminConfig };
let publishFeatureEnabled = adminConfig.publishEnabled === true;

const sectionButtons = Array.from(document.querySelectorAll('[data-section-target]'));
const sections = Array.from(document.querySelectorAll('[data-section]'));
const mobileNavToggle = document.querySelector('[data-admin-nav-toggle]');
const sidebarNav = document.querySelector('[data-admin-nav]');
const adminShell = document.querySelector('[data-admin-shell]');
const authGuardSection = document.querySelector('[data-auth-guard]');
const authGuardMessage = document.querySelector('[data-auth-guard-message]');
const authRefreshButton = document.querySelector('[data-admin-refresh-session]');
const adminLogoutButton = document.querySelector('[data-admin-logout]');
const previewButton = document.querySelector('[data-admin-preview]');
const publishButton = document.querySelector('[data-admin-publish]');
const importJsonButton = document.querySelector('[data-menu-import-json]');
const importJsonInput = document.querySelector('[data-menu-import-json-input]');
const menuScrollButton = document.querySelector('[data-menu-scroll-target]');
const lastDeployLabel = document.getElementById('last-deploy');
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
const menuFormSubmitButton = menuForm ? menuForm.querySelector('button[type="submit"]') : null;
const menuFormResetButton = menuForm ? menuForm.querySelector('button[type="reset"]') : null;
const menuFormDefaultSubmitLabel = menuFormSubmitButton ? menuFormSubmitButton.textContent : '';
const menuFormDefaultResetLabel = menuFormResetButton ? menuFormResetButton.textContent : '';
const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let menuUnsubscribe = null;
let authGuardInitialized = false;
let menuFormHandlerAttached = false;
let globalActionsInitialized = false;
let tableActionsInitialized = false;
let menuItemsState = new Map();
let menuFormTextareas = [];
let refreshPublishStatus = null;

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

function resolveAdminUrl(pathOrUrl) {
    if (!pathOrUrl) {
        return null;
    }

    try {
        return new URL(pathOrUrl, window.location.origin).toString();
    } catch (error) {
        console.warn('No se pudo resolver la URL proporcionada:', pathOrUrl, error);
        return null;
    }
}

function mergeAdminConfig(partial) {
    if (!partial || typeof partial !== 'object') {
        return;
    }

    const next = { ...currentAdminConfig };
    const assignIfString = (key, value) => {
        if (typeof value === 'string' && value.trim().length) {
            next[key] = value.trim();
        }
    };

    assignIfString('previewUrl', partial.previewUrl);
    assignIfString('publishEndpoint', partial.publishEndpoint);
    assignIfString('publishStatusEndpoint', partial.publishStatusEndpoint);

    if (typeof partial.publishEnabled === 'boolean') {
        publishFeatureEnabled = partial.publishEnabled;
    }

    currentAdminConfig = next;

    if (typeof refreshPublishStatus === 'function') {
        refreshPublishStatus().catch(error => {
            console.warn('No se pudo refrescar el estado de publicación tras actualizar la configuración:', error);
        });
    }
}

function resetMenuFormState() {
    if (!menuForm) {
        return;
    }

    menuForm.dataset.editingId = '';
    menuForm.dataset.displayOrder = '';
    menuForm.classList.remove('is-editing');

    if (menuFormSubmitButton) {
        menuFormSubmitButton.textContent = menuFormDefaultSubmitLabel || 'Guardar plato';
    }

    if (menuFormResetButton) {
        menuFormResetButton.textContent = menuFormDefaultResetLabel || 'Limpiar';
    }
}

function populateMenuForm(item) {
    if (!menuForm || !item) {
        return;
    }

    menuForm.dataset.editingId = item.id || '';
    menuForm.dataset.displayOrder = Number.isFinite(item.displayOrder) ? String(item.displayOrder) : '';
    menuForm.classList.add('is-editing');

    const setValue = (selector, value) => {
        const element = menuForm.querySelector(selector);
        if (!element) {
            return;
        }
        element.value = value;
    };

    setValue('#dish-name-es', getString(item?.title?.es || ''));
    setValue('#dish-name-eu', getString(item?.title?.eu || item?.title?.es || ''));
    setValue('#dish-category', getString(item?.category || ''));
    setValue('#dish-description-es', getString(item?.description?.es || ''));
    setValue('#dish-description-eu', getString(item?.description?.eu || item?.description?.es || ''));

    const priceInput = menuForm.querySelector('#dish-price');
    if (priceInput) {
        priceInput.value = Number.isFinite(item?.price) ? item.price.toString() : '';
    }

    const mediaPriceInput = menuForm.querySelector('#dish-price-medium');
    if (mediaPriceInput) {
        const mediaValue = item?.mediaPrice;
        mediaPriceInput.value = Number.isFinite(mediaValue) ? mediaValue.toString() : '';
    }

    if (menuFormSubmitButton) {
        menuFormSubmitButton.textContent = 'Actualizar plato';
    }

    if (menuFormResetButton) {
        menuFormResetButton.textContent = 'Cancelar';
    }

    menuForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const focusTarget = menuForm.querySelector('#dish-name-es');
    if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus();
    }

    menuFormTextareas.forEach(textarea => {
        textarea.dispatchEvent(new Event('input'));
    });
}

function parseNumberInput(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const raw = value.toString().trim();
    if (!raw) {
        return null;
    }

    const normalized = raw.replace(/,/g, '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function collectMenuFormValues(formData) {
    const titleEs = getString((formData.get('dish-name-es') || '').toString());
    const titleEu = getString((formData.get('dish-name-eu') || '').toString());
    const category = getString((formData.get('dish-category') || '').toString());
    const descEs = getString((formData.get('dish-description-es') || '').toString());
    const descEu = getString((formData.get('dish-description-eu') || '').toString());
    const price = parseNumberInput(formData.get('dish-price'));
    const mediaPrice = parseNumberInput(formData.get('dish-price-medium'));

    return {
        titleEs,
        titleEu,
        category,
        descEs,
        descEu,
        price,
        mediaPrice
    };
}

function buildImageField(source) {
    if (!source || typeof source !== 'object') {
        return { desktop: '', mobile: '' };
    }

    const desktop = getString(source.desktop || source.main || '');
    const mobile = getString(source.mobile || source.main || desktop);

    return {
        desktop,
        mobile
    };
}

function createMenuPayload(values, options) {
    const existingItem = options?.existingItem || null;
    const serverTimestamp = options?.serverTimestamp;

    const payload = {
        title: {
            es: values.titleEs,
            eu: values.titleEu || values.titleEs
        },
        description: {
            es: values.descEs,
            eu: values.descEu || values.descEs
        },
        category: values.category,
        price: Number.isFinite(values.price) ? values.price : 0,
        mediaPrice: Number.isFinite(values.mediaPrice) ? values.mediaPrice : null,
        isAvailable: existingItem?.isAvailable ?? true,
        displayOrder: Number.isFinite(existingItem?.displayOrder) ? existingItem.displayOrder : Date.now(),
        tags: Array.isArray(existingItem?.tags) ? existingItem.tags : [],
        image: buildImageField(existingItem?.image),
        lastUpdated: typeof serverTimestamp === 'function' ? serverTimestamp() : new Date()
    };

    return payload;
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

    menuItemsState = new Map();

    if (!items.length) {
        setMenuStatus('No hay platos guardados todavia.');
        return;
    }

    menuItemsState = new Map(items.map(item => [item.id, item]));

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
    const { db, collection, addDoc, serverTimestamp, doc, updateDoc } = firestore || {};

    if (!db || typeof collection !== 'function' || typeof addDoc !== 'function') {
        console.warn('Firestore no esta listo para escribir platos.');
        return;
    }

    menuFormTextareas = Array.from(menuForm.querySelectorAll('textarea[data-autogrow]'));

    menuForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (menuForm.dataset.locked === 'true') {
            return;
        }

        if (menuFormSubmitButton) {
            menuFormSubmitButton.disabled = true;
        }

        try {
            const formData = new FormData(menuForm);
            const values = collectMenuFormValues(formData);

            if (!values.titleEs || !values.titleEu || !values.category) {
                alert('Completa nombre y categoria antes de guardar.');
                return;
            }

            const editingId = menuForm.dataset.editingId;
            const existingItem = editingId ? menuItemsState.get(editingId) : null;
            const payload = createMenuPayload(values, { serverTimestamp, existingItem });

            if (editingId && existingItem && typeof doc === 'function' && typeof updateDoc === 'function') {
                await updateDoc(doc(db, 'menuItems', editingId), payload);
            } else {
                await addDoc(collection(db, 'menuItems'), payload);
            }

            menuForm.reset();
            menuFormTextareas.forEach(textarea => {
                textarea.dispatchEvent(new Event('input'));
            });
        } catch (error) {
            console.error('No se pudo guardar el plato:', error);
            alert('No se pudo guardar el plato. Revisa la consola para mas detalles.');
        } finally {
            if (menuFormSubmitButton) {
                menuFormSubmitButton.disabled = false;
            }
        }
    });

    menuForm.addEventListener('reset', () => {
        resetMenuFormState();
        window.setTimeout(() => {
            menuFormTextareas.forEach(textarea => {
                textarea.dispatchEvent(new Event('input'));
            });
        }, 0);
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
            await loadCmsConfig(services);
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
        setupGlobalActions(services);
        setupMenuTableActions(services);
        initAuthGuard(services);
    } catch (error) {
        console.error('No se pudo inicializar Firebase:', error);
        setMenuStatus('No se pudo conectar con Firebase.');
    }
}

function setupGlobalActions(services) {
    if (globalActionsInitialized) {
        return;
    }
    globalActionsInitialized = true;

    const hasFetchSupport = typeof window.fetch === 'function';
    const getPreviewUrl = () => resolveAdminUrl(currentAdminConfig.previewUrl || 'index.html');
    const getPublishEndpoint = () => resolveAdminUrl(currentAdminConfig.publishEndpoint || '/api/publish');
    const getPublishStatusEndpoint = () => resolveAdminUrl(currentAdminConfig.publishStatusEndpoint || '/api/publish/status');

    if (previewButton) {
        previewButton.addEventListener('click', () => {
            const targetUrl = getPreviewUrl();
            if (!targetUrl) {
                alert('No se pudo determinar la URL de previsualizacion.');
                return;
            }
            window.open(targetUrl, '_blank', 'noopener');
        });
    }

    if (menuScrollButton && menuForm) {
        menuScrollButton.addEventListener('click', () => {
            menuForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const focusable = menuForm.querySelector('input, select, textarea');
            if (focusable && typeof focusable.focus === 'function') {
                focusable.focus();
            }
        });
    }

    const updateDeployLabel = status => {
        if (!lastDeployLabel) {
            return;
        }

        if (!status || !status.finishedAt) {
            lastDeployLabel.textContent = 'Pendiente';
            return;
        }

        const finishedAt = new Date(status.finishedAt);
        if (Number.isNaN(finishedAt.getTime())) {
            lastDeployLabel.textContent = 'Pendiente';
            return;
        }

        lastDeployLabel.textContent = finishedAt.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    const fetchPublishStatus = async () => {
        if (!hasFetchSupport || publishFeatureEnabled !== true) {
            updateDeployLabel(null);
            return;
        }

        const statusEndpoint = getPublishStatusEndpoint();
        if (!statusEndpoint) {
            return;
        }

        try {
            const response = await fetch(statusEndpoint, { cache: 'no-store' });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            updateDeployLabel(data);
        } catch (error) {
            console.warn('No se pudo obtener el estado de publicación:', error);
        }
    };

    refreshPublishStatus = fetchPublishStatus;

    if (publishButton) {
        if (publishFeatureEnabled !== true) {
            publishButton.disabled = true;
            publishButton.textContent = 'Publicación deshabilitada';
            publishButton.title = 'La publicación automática está deshabilitada temporalmente.';
        } else if (hasFetchSupport) {
            publishButton.addEventListener('click', async () => {
                const publishEndpoint = getPublishEndpoint();
                if (!publishEndpoint) {
                    alert('No hay un endpoint configurado para publicar el sitio.');
                    return;
                }
                const originalLabel = publishButton.textContent;
                publishButton.disabled = true;
                publishButton.textContent = 'Publicando...';

                try {
                    const response = await fetch(publishEndpoint, { method: 'POST' });
                    if (!response.ok) {
                        let errorMessage = '';
                        const contentType = response.headers.get('content-type') || '';
                        if (contentType.includes('application/json')) {
                            const errorBody = await response.json().catch(() => ({}));
                            errorMessage = errorBody?.error || '';
                        } else {
                            const textBody = await response.text().catch(() => '');
                            if (textBody) {
                                errorMessage = textBody.slice(0, 180);
                            }
                        }

                        const normalizedMessage = errorMessage && errorMessage.trim()
                            ? errorMessage.trim()
                            : `Publicación rechazada (HTTP ${response.status})`;

                        throw new Error(normalizedMessage);
                    }
                    const data = await response.json();
                    updateDeployLabel(data);
                    alert('Publicación completada correctamente.');
                } catch (error) {
                    console.error('No se pudo publicar:', error);
                    alert(`No se pudo publicar el sitio: ${error.message}`);
                } finally {
                    publishButton.disabled = false;
                    publishButton.textContent = originalLabel;
                    fetchPublishStatus();
                }
            });
        }
    }

    if (importJsonButton && importJsonInput) {
        importJsonButton.addEventListener('click', () => {
            if (menuForm?.dataset.locked === 'true') {
                alert('Debes confirmar tu sesión de administrador antes de importar el menú.');
                return;
            }
            importJsonInput.click();
        });

        importJsonInput.addEventListener('change', async event => {
            const file = event.target?.files?.[0];
            // Reset input so selecting the same file twice triggers change
            importJsonInput.value = '';

            if (!file) {
                return;
            }

            if (!file.name.toLowerCase().endsWith('.json')) {
                alert('Selecciona un archivo con formato JSON.');
                return;
            }

            if (!window.confirm(`Se importarán los platos de "${file.name}". Esto añadirá nuevos registros sin eliminar los existentes. ¿Quieres continuar?`)) {
                return;
            }

            const originalLabel = importJsonButton.textContent;
            importJsonButton.disabled = true;
            importJsonButton.textContent = 'Importando...';

            try {
                const result = await importMenuJsonFile(file, services);
                alert(`Importación completada. Se añadieron ${result.importedCount} platos.`);
            } catch (error) {
                console.error('No se pudo importar el archivo JSON:', error);
                alert(`No se pudo importar el archivo JSON: ${error.message}`);
            } finally {
                importJsonButton.disabled = false;
                importJsonButton.textContent = originalLabel;
            }
        });
    }

    fetchPublishStatus();
}

function setupMenuTableActions(services) {
    if (tableActionsInitialized || !menuTableBody) {
        return;
    }

    tableActionsInitialized = true;
    const firestoreOps = services?.firestore || null;

    menuTableBody.addEventListener('click', async event => {
        const rawTarget = event.target;
        if (!rawTarget || typeof rawTarget !== 'object') {
            return;
        }

        const button = typeof rawTarget.closest === 'function'
            ? rawTarget.closest('button[data-action]')
            : null;

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        if (!action) {
            return;
        }

        const row = typeof button.closest === 'function' ? button.closest('tr[data-id]') : null;
        const itemId = button.dataset.id || row?.dataset.id;
        if (!itemId) {
            return;
        }

        if (action === 'edit') {
            const item = menuItemsState.get(itemId);
            if (!item) {
                alert('No se encontraron los datos del plato seleccionado.');
                return;
            }
            populateMenuForm(item);
            return;
        }

        if (action === 'delete') {
            if (!firestoreOps || !firestoreOps.db || typeof firestoreOps.doc !== 'function' || typeof firestoreOps.deleteDoc !== 'function') {
                alert('No es posible eliminar el plato porque Firestore no esta disponible.');
                return;
            }

            if (!window.confirm('¿Seguro que quieres eliminar este plato? Esta accion no se puede deshacer.')) {
                return;
            }

            if (menuForm && menuForm.dataset.editingId === itemId) {
                menuForm.reset();
            }

            const originalLabel = button.textContent;
            button.textContent = 'Eliminando...';
            button.disabled = true;

            try {
                await firestoreOps.deleteDoc(firestoreOps.doc(firestoreOps.db, 'menuItems', itemId));
            } catch (error) {
                console.error('No se pudo eliminar el plato:', error);
                alert('No se pudo eliminar el plato. Revisa la consola para mas detalles.');
            } finally {
                button.disabled = false;
                button.textContent = originalLabel;
            }
        }
    });
}

async function importMenuJsonFile(file, services) {
    if (!services?.firestore) {
        throw new Error('Firestore no está disponible.');
    }

    const fileText = await file.text();
    let parsed;

    try {
        parsed = JSON.parse(fileText);
    } catch (error) {
        throw new Error('El archivo no contiene JSON válido.');
    }

    const entries = extractMenuEntries(parsed);
    if (!entries.length) {
        throw new Error('No se encontraron platos en el archivo.');
    }

    const { firestore } = services;
    const { db, collection, addDoc, serverTimestamp } = firestore;

    if (!db || typeof collection !== 'function' || typeof addDoc !== 'function') {
        throw new Error('Firestore no está listo para escribir.');
    }

    const collectionRef = collection(db, 'menuItems');
    const baseTime = Date.now();
    let importedCount = 0;

    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const payload = normalizeMenuEntry(entry.raw, entry.fallbackCategory, baseTime + index, serverTimestamp);
        if (!payload) {
            console.warn('Elemento del menú omitido por datos insuficientes:', entry);
            continue;
        }

        await addDoc(collectionRef, payload);
        importedCount += 1;
    }

    return { importedCount };
}

function extractMenuEntries(source) {
    if (!source) {
        return [];
    }

    const entries = [];

    if (Array.isArray(source)) {
        source.forEach(raw => {
            if (raw && typeof raw === 'object') {
                entries.push({ raw });
            }
        });
        return entries;
    }

    if (typeof source === 'object') {
        Object.entries(source).forEach(([category, value]) => {
            if (Array.isArray(value)) {
                value.forEach(raw => {
                    if (raw && typeof raw === 'object') {
                        entries.push({ raw, fallbackCategory: category });
                    }
                });
            } else if (value && typeof value === 'object') {
                entries.push({ raw: value, fallbackCategory: category });
            }
        });
    }

    return entries;
}

function toNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const sanitized = value.replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
        const parsed = Number.parseFloat(sanitized);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return null;
}

function getString(value) {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toString();
    }
    return '';
}

async function loadCmsConfig(services) {
    if (!services?.firestore) {
        return;
    }

    const { db, doc, getDoc } = services.firestore;
    if (!db || typeof doc !== 'function' || typeof getDoc !== 'function') {
        console.warn('Firestore no esta listo para leer la configuración del CMS.');
        return;
    }

    try {
        const configDoc = await getDoc(doc(db, 'cmsConfig', 'general'));
        if (!configDoc.exists()) {
            console.warn('Documento cmsConfig/general no encontrado. Usa window.ADMIN_CONFIG para establecer las URLs.');
            return;
        }

        const data = configDoc.data() || {};
        mergeAdminConfig({
            previewUrl: getString(data.previewUrl || data.previewURL || ''),
            publishEndpoint: getString(data.publishEndpoint || data.publishURL || ''),
            publishStatusEndpoint: getString(data.publishStatusEndpoint || data.publishStatusURL || ''),
            publishEnabled: data.publishEnabled === true
        });
    } catch (error) {
        console.error('No se pudo cargar la configuración remota del CMS:', error);
    }
}

function normalizeMenuEntry(raw, fallbackCategory, orderValue, serverTimestamp) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const titleEs = getString(raw?.nombre?.es || raw?.nombre || raw?.title?.es || raw?.title);
    if (!titleEs) {
        return null;
    }

    const titleEu = getString(raw?.nombre?.eu || raw?.title?.eu || titleEs);
    const descriptionEs = getString(raw?.descripcion?.es || raw?.descripcion || raw?.description?.es || raw?.description);
    const descriptionEu = getString(raw?.descripcion?.eu || raw?.description?.eu || descriptionEs);
    const category = getString(raw?.categoria || raw?.category || fallbackCategory) || 'sin-categoria';

    const priceValue = toNumber(raw?.precio ?? raw?.price);
    const mediaPriceValue = toNumber(raw?.mediaRacion ?? raw?.mediaPrice);
    const availability = raw?.disponible ?? raw?.isAvailable;
    const isAvailable = availability === undefined ? true : Boolean(availability);

    const imageSource = raw?.imagen ?? raw?.image ?? '';
    let desktopImage = '';
    let mobileImage = '';

    if (typeof imageSource === 'string') {
        desktopImage = imageSource;
        mobileImage = imageSource;
    } else if (imageSource && typeof imageSource === 'object') {
        desktopImage = getString(imageSource.desktop || imageSource.main || '');
        mobileImage = getString(imageSource.mobile || imageSource.main || desktopImage);
    }

    const rawTags = Array.isArray(raw?.tags) ? raw.tags : [];
    const tags = rawTags
        .filter(tag => typeof tag === 'string' && tag.trim().length)
        .map(tag => tag.trim());

    return {
        title: {
            es: titleEs,
            eu: titleEu || titleEs
        },
        description: {
            es: descriptionEs,
            eu: descriptionEu || descriptionEs
        },
        category,
        price: Number.isFinite(priceValue) ? priceValue : 0,
        mediaPrice: Number.isFinite(mediaPriceValue) ? mediaPriceValue : null,
        isAvailable,
        displayOrder: Number.isFinite(orderValue) ? orderValue : Date.now(),
        tags,
        image: {
            desktop: desktopImage,
            mobile: mobileImage || desktopImage
        },
        lastUpdated: typeof serverTimestamp === 'function' ? serverTimestamp() : new Date()
    };
}

if (menuForm) {
    resetMenuFormState();
}

initFirebaseFeatures();
