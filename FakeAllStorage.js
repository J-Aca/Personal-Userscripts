// ==UserScript==
// @name         Fake APIs de almacenamiento
// @author       J-Aca
// @namespace    J-Aca :)
// @version      2.0.6
// @description  Simula localStorage, sessionStorage, CacheStorage e Intl para evitar errores de seguridad en sitios
// @match        *://*/*
// @match        *://*.*/*
// @match        *://*.*.*/*
// @exclude      *://*.twitch.tv/*
// @exclude      *://twitter.com/*
// @exclude      *://*.x.com/*
// @exclude      *://x.com/*
// @grant        none
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/icon/ico2.png
// @updateURL    https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/FakeAllStorage.js
// @downloadURL  https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/FakeAllStorage.js
// ==/UserScript==

(function () {
    'use strict';
    const SETTINGS = {
        //Logs: true
        Logs: false
    };

    // 🩹 Parche para Intl.DateTimeFormat.supportedLocalesOf
    if (typeof Intl?.DateTimeFormat?.supportedLocalesOf !== 'function') {
        Intl.DateTimeFormat.supportedLocalesOf = function (locale) {
            return locale ? [locale] : [];
        };

        console.log('✅ Parche aplicado a Intl.DateTimeFormat.supportedLocalesOf');
    }

    // 🗃️ Fake local/sessionStorage
function createFakeStorage(name) {
    let storage = Object.create(null);
    const channel = new BroadcastChannel(`sync-${name}`);

    channel.onmessage = (event) => {
        const { type, key, value } = event.data;
        if (type === 'set') {
            storage[key] = value;
if (!SETTINGS.Logs) return;
            console.log(`🔄 ${name} sincronizado: ${key} = ${value}`);
        } else if (type === 'remove') {
            // No hacemos nada, la clave permanece en 'storage'
            console.log(`🚫 ${name} intento de eliminación de clave ignorado: ${key}`);
        } else if (type === 'clear') {
            storage = Object.create(null);
            console.log(`🧹 ${name} limpiado`);
        }
    };

    return {
        getItem: key => storage[key] || null,
        setItem: (key, value) => {
            const stringValue = String(value);
            if (storage[key] !== stringValue) { // 🚨 Comprueba si el valor es diferente antes de actualizar
                storage[key] = stringValue;
                channel.postMessage({ type: 'set', key, value: stringValue });
            }
        },
// 🚨 Ignoramos la llamada a removeItem
        removeItem: key => {
            console.warn(`🔒 Acceso bloqueado: intento de eliminar la clave de ${name}: ${key}`);
               // delete storage[key];
               // channel.postMessage({ type: 'remove', key });
        },
        clear: () => {
            storage = Object.create(null);
            channel.postMessage({ type: 'clear' });
        },
        key: i => Object.keys(storage)[i] || null,
        get length() { return Object.keys(storage).length; }
    };
}

    function tryDefineFake(target, name, value) {
        try {
            Object.defineProperty(target, name, {
                value,
                configurable: false,
                enumerable: true,
                writable: false
            });
            console.log(`✅ Redefinido ${name}`);
        } catch (err) {
            console.warn(`⚠️ No se pudo redefinir ${name}:`, err.message);
        }
    }

    // 🧱 Aplicar los fakes con sincronización por BroadcastChannel
    tryDefineFake(window, 'localStorage', createFakeStorage('localStorage'));
    tryDefineFake(window, 'sessionStorage', createFakeStorage('sessionStorage'));

    // ---
    // 🍪 FAKE para cookies con sincronización
    // ---
    const fakeCookies = {};
    const cookieChannel = new BroadcastChannel('sync-cookies');

    // Listener para sincronización de cookies
    cookieChannel.onmessage = (event) => {
        const { key, value } = event.data;
        if (value === null) {
            delete fakeCookies[key];
  if (!SETTINGS.Logs) return;
            console.log(`🗑️ Cookie sincronizada: ${key} eliminada`);
        } else {
            fakeCookies[key] = value;
  if (!SETTINGS.Logs) return;
            console.log(`🔄 Cookie sincronizada: ${key} = ${value}`);
        }
    };

    Object.defineProperty(document, 'cookie', {
        get() {
            return Object.entries(fakeCookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
        },
        set(value) {
            try {
                const [key, ...rest] = value.split('=').map(s => s.trim());
                const cookieValue = rest.join('=');

                if (key.length > 0) {
                    fakeCookies[key] = cookieValue;
                    cookieChannel.postMessage({ key, value: cookieValue });
  if (!SETTINGS.Logs) return;
                    console.log(`✅ Cookie establecida: ${key} = ${cookieValue}`);
                }
            } catch (err) {
                console.warn('⚠️ Error al establecer cookie:', err);
            }
        },
        configurable: false,
        enumerable: true
    });
    console.log(`✅ Redefinido document.cookie`);

    // 🛡️ Fake robusto para CacheStorage que evita SecurityError
    const fakeCaches = {
        has: async () => false,
        match: async () => undefined,
        open: async () => ({
            put: async () => {},
            match: async () => undefined,
            delete: async () => false,
            keys: async () => [],
        }),
        keys: async () => [],
        delete: async () => false
    };

    // 🔒 Evita errores de promesa con try/catch silencioso
    tryDefineFake(window, 'caches', new Proxy(fakeCaches, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return async () => undefined;
        }
    }));

    console.log(`%c 🛡️ Todos los parches aplicados: localStorage=${!!localStorage}, sessionStorage=${!!sessionStorage}, caches=${!!caches}, Intl=${!!Intl}`, "color: #fff; background: #ae3380");

})();
