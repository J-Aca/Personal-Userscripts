// ==UserScript==
// @name         Fake APIs de almacenamiento
// @namespace    J-Aca :)
// @version      2.0.5
// @author       J-Aca
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

    if (typeof Intl?.DateTimeFormat?.supportedLocalesOf !== 'function') {
        Intl.DateTimeFormat.supportedLocalesOf = function (locale) {
            return locale ? [locale] : [];
        };
        console.log('Parche aplicado a Intl.DateTimeFormat.supportedLocalesOf');
    }

    function createFakeStorage(name) {
        let storage = Object.create(null);

        const channel = new BroadcastChannel(`sync-${name}`);

        channel.onmessage = (event) => {
            const { type, key, value } = event.data;
            if (type === 'set') {
                storage[key] = value;
                console.log(`${name} sincronizado: ${key} = ${value}`);
            } else if (type === 'remove') {
                delete storage[key];
                console.log(`${name} clave eliminada: ${key}`);
            } else if (type === 'clear') {
                storage = Object.create(null);
                console.log(`${name} limpiado`);
            }
        };

        return {
            getItem: key => storage[key] || null,
            setItem: (key, value) => {
                storage[key] = String(value);
                channel.postMessage({ type: 'set', key, value: String(value) });
            },
            removeItem: key => {
                delete storage[key];
                channel.postMessage({ type: 'remove', key });
            },
            clear: () => {
                storage = Object.create(null);
                channel.postMessage({ type: 'clear' });
            },
            key: i => Object.keys(storage)[i] || null,
            get length() { return Object.keys(storage).length; }
        };
    }

    function tryDefineFake(name, value) {
        try {
            Object.defineProperty(window, name, {
                value,
                configurable: false,
                enumerable: true,
                writable: false
            });
            console.log(`Redefinido ${name}`);
        } catch (err) {
            console.warn(`No se pudo redefinir ${name}:`, err.message);
        } 
    }

    tryDefineFake('localStorage', createFakeStorage('localStorage'));
    tryDefineFake('sessionStorage', createFakeStorage('sessionStorage'));

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

    tryDefineFake('caches', new Proxy(fakeCaches, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return async () => undefined;
        }
    }));

    console.log(`%c Todos los parches aplicados: localStorage=${!!localStorage}, sessionStorage=${!!sessionStorage}, caches=${!!caches}, Intl=${!!Intl}`, "color: #fff; background: #ae3380");


})();
