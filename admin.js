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
/* eslint-disable no-console */
'use strict';

const migrationButton = document.querySelector('[data-copy-plan]');
const migrationFeedback = document.querySelector('[data-copy-feedback]');

const migrationPlan = `Migración a Netlify CMS - Pasos
1. Desactivar panel Firebase y congelar cambios manuales.
2. Integrar Netlify CMS en el repositorio (config.yml, colecciones de menú/hero/media).
3. Configurar Netlify Identity + Git Gateway para autenticación.
4. Conectar despliegue: commits desde Netlify CMS -> GitHub -> GitHub Pages.
5. Retirar claves Firebase una vez verificado el nuevo flujo.`;

async function copyMigrationPlan() {
    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(migrationPlan);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = migrationPlan;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        if (migrationFeedback) {
            migrationFeedback.hidden = false;
            window.setTimeout(() => {
                migrationFeedback.hidden = true;
            }, 4000);
        }
    } catch (error) {
        console.error('No se pudo copiar el plan de migración:', error);
        if (migrationFeedback) {
            migrationFeedback.textContent = 'No se pudo copiar el plan. Revisa la consola.';
            migrationFeedback.hidden = false;
        }
    }
}

migrationButton?.addEventListener('click', copyMigrationPlan);
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
