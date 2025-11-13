/**
 * Legacy analytics shim.
 * The original click-tracking system has been replaced by
 * the Firestore-backed like feature implemented in script.js.
 * This file remains to avoid loading errors in existing builds.
 */
(function () {
    'use strict';
    console.info('Analytics deshabilitado: ahora usamos valoraciones en Firestore.');
})();
