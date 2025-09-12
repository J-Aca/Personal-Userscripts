// ==UserScript==
// @name Advanced Fingerprint Blocker
// @namespace J-Aca :)
// @version 2.8.0
// @description Generates random browser fingerprint
// @author J-Aca
// @match *://*/*
// @match *://*.*/*
// @icon https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/icon/ico.png
// @run-at document-start
// @grant GM_xmlhttpRequest
// @grant GM_setValue
// @grant GM_getValue
// @updateURL https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/Advanced%20Fingerprint%20Blocker.js
// @downloadURL https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/Advanced%20Fingerprint%20Blocker.js
// ==/UserScript==

(function() {
    'use strict';
console.log("%c ¡Ofuscacion de huella digital activo!", "background: #000000; color: #00FF00; padding: 15px 20px; font-size: 24px; font-weight: bold; text-align: center; border: 2px solid #00FF00;");

    // =================================================================
    //                🛠️ MÓDULOS Y FUNCIONES AUXILIARES
    // =================================================================

    const SETTINGS = {
        mode: 'aggressive', // Opciones: 'silent' o 'aggressive'
        obfuscateCanvas: true,
        obfuscateWebGL: true,
        spoofNavigator: true,
        spoofScreen: true,
        spoofTimezone: true,
        spoofPlugins: true
    };

    // Genera un objeto de sesión con valores fijos para mantener la consistencia
    const sessionData = {
        userAgent: null,
        platform: null,
        vendor: null,
        appName: null,
        hardwareConcurrency: null,
        deviceMemory: null,
        screen: null,
        timezone: null,
        language: null
    };

    // Funciones auxiliares para obtener valores aleatorios
    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function checkAndDefineProperty(obj, prop, getFn) {
        try {
            const propDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
            if (propDescriptor && !propDescriptor.configurable) {
                console.warn(`[!] Propiedad '${prop}' no es configurable. No se puede modificar.`);
                return false;
            }
            Object.defineProperty(obj, prop, { get: getFn, configurable: true, enumerable: true });
            return true;
        } catch (error) {
            console.error(`[!] Error al intentar modificar '${prop}':`, error);
            return false;
        }
    }

    // =================================================================
    //                 🎨 MÓDULO: OFUSCACIÓN DE CANVAS
    // =================================================================

    const canvasProtector = {
        protect: function() {
            if (!SETTINGS.obfuscateCanvas) return;

            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            const patchCanvasMethod = (methodName) => {
                const originalMethod = HTMLCanvasElement.prototype[methodName];
                if (!originalMethod) return;

                Object.defineProperty(HTMLCanvasElement.prototype, methodName, {
                    value: function(...args) {
                        const ctx = this.getContext('2d');
                        if (ctx) {
                            ctx.fillStyle = `rgba(${getRandomNumber(0, 255)},${getRandomNumber(0, 255)},${getRandomNumber(0, 255)},0.01)`;
                            ctx.fillRect(0, 0, 1, 1);
                        }
                        return originalMethod.apply(this, args);
                    },
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            };

            // Aplica ruido en toDataURL y toBlob antes de que se llamen
            patchCanvasMethod('toDataURL');
            patchCanvasMethod('toBlob');

            // Agrega ruido a getImageData
            HTMLCanvasElement.prototype.getContext = function (...args) {
                const context = originalGetContext.apply(this, args);
                if (args[0] === '2d' && context) {
                    const originalGetImageData = context.getImageData;
                    context.getImageData = function (...a) {
                        const original = originalGetImageData.apply(this, a);
                        const data = original.data;
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] += getRandomNumber(-5, 5);
                            data[i + 1] += getRandomNumber(-5, 5);
                            data[i + 2] += getRandomNumber(-5, 5);
                        }
                        return original;
                    };
                }
                return context;
            };
            console.log("Canvas Fingerprinting modificado.");
        }
    };

    // =================================================================
    //                 💻 MÓDULO: OFUSCACIÓN DE WEBGL
    // =================================================================

    const webglProtector = {
        protect: function() {
            if (!SETTINGS.obfuscateWebGL) return;
            const originalGetParameterWebGL = WebGLRenderingContext.prototype.getParameter;

            const webglVendors = ['Google Inc.', 'Mozilla', 'WebKit', 'NVIDIA Corporation', 'Intel', 'Microsoft Corporation', 'Qualcomm', 'Apple'];
            const webglRenderers = [
                'ANGLE (Intel(R) UHD Graphics 620 Direct3D11)',
                'WebKit WebGL',
                'Adreno (TM) 630',
                'GeForce RTX 3080/PCIe/SSE2',
                'AMD Radeon(TM) Graphics (Raven Ridge)',
                'SwiftShader Direct3D 11',
                'Apple A14 Bionic GPU'
            ];

            WebGLRenderingContext.prototype.getParameter = function(pname) {
                const GL_VENDOR = 0x1F00;
                const GL_RENDERER = 0x1F01;
                const GL_VERSION = 0x1F02;
                const GL_SHADING_LANGUAGE_VERSION = 0x8B8C;

                switch (pname) {
                    case GL_VENDOR:
                        return getRandomElement(webglVendors);
                    case GL_RENDERER:
                        return getRandomElement(webglRenderers);
                    case GL_VERSION:
                        return originalGetParameterWebGL.call(this, pname).replace(/\d+\.\d+(\.\d+)?/, 'WebGL 1.0');
                    case GL_SHADING_LANGUAGE_VERSION:
                        return originalGetParameterWebGL.call(this, pname).replace(/\d+\.\d+(\.\d+)?/, 'WebGL GLSL ES 1.00');
                    default:
                        return originalGetParameterWebGL.call(this, pname);
                }
            };

            // Oculta el hash de WebGL si es posible
            if (WebGL2RenderingContext) {
                WebGL2RenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
            }
            console.log("WebGL Fingerprinting modificado.");
        }
    };

    // =================================================================
    //               📱 MÓDULO: OFUSCACIÓN DE NAVIGATOR
    // =================================================================

    const navigatorProtector = {
        protect: function() {
            if (!SETTINGS.spoofNavigator) return;

            const fakeUserAgents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0.0 Safari/605.1.15",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; rv:110.0) Gecko/20100101 Firefox/122.0"
            ];
            const fakePlatforms = ['Win32', 'Win64', 'MacIntel', 'Linux x86_64', 'ARM', 'iPhone', 'iPad', 'Android'];
            const fakeVendors = ['Google Inc.', 'Apple Computer, Inc.', 'Microsoft Corp.', 'Mozilla Foundation'];
            const fakeAppNames = ['Netscape', 'Mozilla'];

            if (!sessionData.userAgent) {
                sessionData.userAgent = getRandomElement(fakeUserAgents);
                sessionData.platform = getRandomElement(fakePlatforms);
                sessionData.vendor = getRandomElement(fakeVendors);
                sessionData.appName = getRandomElement(fakeAppNames);
                sessionData.hardwareConcurrency = getRandomNumber(2, 16);
                sessionData.deviceMemory = getRandomNumber(2, 32);
                sessionData.language = getRandomElement(['es-ES', 'en-US', 'fr-FR', 'de-DE']);
            }

            checkAndDefineProperty(navigator, 'userAgent', () => sessionData.userAgent);
            checkAndDefineProperty(navigator, 'appVersion', () => sessionData.userAgent.substring(sessionData.userAgent.indexOf('/') + 1));
            checkAndDefineProperty(navigator, 'platform', () => sessionData.platform);
            checkAndDefineProperty(navigator, 'vendor', () => sessionData.vendor);
            checkAndDefineProperty(navigator, 'appName', () => sessionData.appName);
            checkAndDefineProperty(navigator, 'hardwareConcurrency', () => sessionData.hardwareConcurrency);
            checkAndDefineProperty(navigator, 'deviceMemory', () => sessionData.deviceMemory);
            checkAndDefineProperty(navigator, 'language', () => sessionData.language);
            checkAndDefineProperty(navigator, 'languages', () => [sessionData.language, getRandomElement(['en-US', 'fr-FR'])]);
            checkAndDefineProperty(navigator, 'webdriver', () => false);

            console.log("Propiedades del navegador modificadas.");
        }
    };

    // =================================================================
    //                🖥️ MÓDULO: OFUSCACIÓN DE PANTALLA
    // =================================================================

    const screenProtector = {
        protect: function() {
            if (!SETTINGS.spoofScreen) return;
            const screenResolutions = [
                { width: 2560, height: 1440 },
                { width: 1920, height: 1080 },
                { width: 1280, height: 720 },
                { width: 3840, height: 2160 }
            ];

            if (!sessionData.screen) {
                sessionData.screen = getRandomElement(screenResolutions);
            }

            checkAndDefineProperty(screen, 'width', () => sessionData.screen.width);
            checkAndDefineProperty(screen, 'height', () => sessionData.screen.height);
            checkAndDefineProperty(screen, 'availWidth', () => sessionData.screen.width - getRandomNumber(0, 50));
            checkAndDefineProperty(screen, 'availHeight', () => sessionData.screen.height - getRandomNumber(50, 100));
            checkAndDefineProperty(screen, 'colorDepth', () => getRandomElement([24, 32]));
            checkAndDefineProperty(screen, 'pixelDepth', () => screen.colorDepth);
            checkAndDefineProperty(window, 'innerWidth', () => screen.availWidth - getRandomNumber(0, 100));
            checkAndDefineProperty(window, 'innerHeight', () => screen.availHeight - getRandomNumber(0, 150));
            checkAndDefineProperty(window, 'devicePixelRatio', () => getRandomElement([1, 1.25, 1.5, 2, 2.5, 3]));
            console.log("Dimensiones de pantalla y DPI modificados.");
        }
    };

    // =================================================================
    //             ⏰ MÓDULO: OFUSCACIÓN DE ZONA HORARIA
    // =================================================================

    const timezoneProtector = {
        protect: function() {
            if (!SETTINGS.spoofTimezone) return;

            const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles'];
            if (!sessionData.timezone) {
                sessionData.timezone = getRandomElement(timezones);
            }

            try {
                // Sobrescribe Date.prototype.getTimezoneOffset para ser dinámico
                const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
                Object.defineProperty(Date.prototype, 'getTimezoneOffset', {
                    value: function() {
                        const simulatedDate = new Date();
                        const timeZoneOffset = new Intl.DateTimeFormat('en-US', { timeZone: sessionData.timezone }).format(simulatedDate);
                        const parts = timeZoneOffset.match(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/);
                        if (!parts) return originalGetTimezoneOffset.call(this);

                        const [_, month, day, year, hours, minutes, seconds] = parts.map(Number);
                        const timezoneDate = new Date(year, month - 1, day, hours, minutes, seconds);
                        const utcDate = new Date(this.getTime());
                        const offset = (utcDate.getTime() - timezoneDate.getTime()) / 60000;
                        return offset;
                    },
                    configurable: true,
                    enumerable: false
                });

                // Sobrescribe Intl.DateTimeFormat para simular la zona horaria
                const originalIntlDateTimeFormat = Intl.DateTimeFormat;
                Intl.DateTimeFormat = function(locale, options) {
                    options = options || {};
                    options.timeZone = sessionData.timezone;
                    return new originalIntlDateTimeFormat(locale, options);
                };
                Intl.DateTimeFormat.prototype = originalIntlDateTimeFormat.prototype;

                console.log("Zona horaria simulada: " + sessionData.timezone);
            } catch (e) {
                console.error("Error al ofuscar zona horaria:", e);
            }
        }
    };

    // =================================================================
    //                 PLUGIN Y OTROS PROTECTORES
    // =================================================================

    const pluginProtector = {
        protect: function() {
            if (!SETTINGS.spoofPlugins) return;
            // Ofuscacion de Plugins y MimeTypes
            checkAndDefineProperty(navigator, 'plugins', () => {
                const commonPlugins = [
                    { name: "Chrome PDF Viewer", description: "Portable Document Format", filename: "internal-pdf-viewer" },
                    { name: "Widevine Content Decryption Module", description: "Enables secure playback of HTML5 video & audio.", filename: "widevinecdm.dll" }
                ];
                const numPlugins = getRandomNumber(0, commonPlugins.length);
                const shuffledPlugins = commonPlugins.sort(() => 0.5 - Math.random());
                const selectedPlugins = shuffledPlugins.slice(0, numPlugins);
                return selectedPlugins;
            });
            checkAndDefineProperty(navigator, 'mimeTypes', () => {
                const commonMimeTypes = [
                    { type: "application/pdf", description: "Portable Document Format", suffixes: "pdf" },
                    { type: "image/jpeg", description: "JPEG Image", suffixes: "jpeg,jpg" }
                ];
                const numMimeTypes = getRandomNumber(0, commonMimeTypes.length);
                const shuffledMimeTypes = commonMimeTypes.sort(() => 0.5 - Math.random());
                const selectedMimeTypes = shuffledMimeTypes.slice(0, numMimeTypes);
                return selectedMimeTypes;
            });
            console.log("Plugins y MimeTypes modificados.");
        }
    };

    // =================================================================
    //                      ✅ FUNCIÓN PRINCIPAL
    // =================================================================

    function initializeFingerprintProtection() {
        if (Object.isFrozen(navigator)) {
            console.error('El objeto navigator esta congelado. La ofuscacion no es posible.');
            return;
        }

        // Si el modo es 'silent', desactiva las ofuscaciones más agresivas
        if (SETTINGS.mode === 'silent') {
            SETTINGS.spoofNavigator = false;
            SETTINGS.spoofScreen = false;
            SETTINGS.spoofTimezone = false;
        }

        // Llama a los módulos protectores
        canvasProtector.protect();
        webglProtector.protect();
        navigatorProtector.protect();
        screenProtector.protect();
        timezoneProtector.protect();
        pluginProtector.protect();

        console.log("Configuración de protección activa:", JSON.stringify(SETTINGS, null, 2));
    }

    // Inicia la protección
    initializeFingerprintProtection();

})();