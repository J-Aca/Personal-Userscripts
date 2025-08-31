// ==UserScript==
// @name Advanced Fingerprint Blocker
// @namespace J-Aca :)
// @version 2.5
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
console.log("%c ¡Ofuscacion de huella digital activo.!", "background: #000000; color: #00FF00; padding: 15px 20px; font-size: 24px; font-weight: bold; text-align: center; border: 2px solid #00FF00;");


    // Funciones auxiliares para obtener valores aleatorios
    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(min, max, decimals = 2) {
        const str = (Math.random() * (max - min) + min).toFixed(decimals);
        return parseFloat(str);
    }

    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

 // --- Canvas Fingerprinting (modificacion de toDataURL) ---
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
        const context = this.getContext('2d');
        if (context) {
            context.save();
            const uniqueText = generateRandomString(50);
            context.textBaseline = 'top';
            context.font = `${getRandomNumber(12, 16)}px ${getRandomElement(['Arial', 'Verdana', 'Times New Roman'])}`;
            context.fillStyle = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            context.fillText(uniqueText, getRandomNumber(0, 5), getRandomNumber(0, 5));
            const imageData = context.getImageData(0, 0, this.width, this.height);
            const data = imageData.data;
            for (let i = 0; i < getRandomNumber(5, 20); i++) {
                const pixelIndex = getRandomNumber(0, (data.length / 4) - 1) * 4;
                data[pixelIndex + 0] = getRandomNumber(0, 255);
                data[pixelIndex + 1] = getRandomNumber(0, 255);
                data[pixelIndex + 2] = getRandomNumber(0, 255);
            }
            context.putImageData(imageData, 0, 0);
            context.restore();
        }
        const result = originalToDataURL.apply(this, arguments);
        console.log('Canvas.toDataURL modificado con ruido.');
        return result;
    };
    //v2
    function canv() {
   const randomInt = () => Math.floor(Math.random() * 10) - 5;  

    const addNoise = (imageData) => {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] + randomInt(); 
            data[i + 1] = data[i + 1] + randomInt();  
            data[i + 2] = data[i + 2] + randomInt();  
        }
        return imageData;
    };

    // Proxy getContext to wrap context before fingerprinting begins
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args) {
        const context = originalGetContext.apply(this, args);
        if (args[0] === '2d' && context) { 
            const originalGetImageData = context.getImageData;
            context.getImageData = function (...a) {
                const original = originalGetImageData.apply(this, a);
                return addNoise(original);
            };
 
        }
        return context;
    };

    // Slightly perturb canvas before toDataURL/toBlob is called
    const patchCanvasMethod = (methodName) => {
        const original = HTMLCanvasElement.prototype[methodName];
        HTMLCanvasElement.prototype[methodName] = function (...args) {
            const ctx = this.getContext('2d');
            if (ctx) {
                ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.01)`;
                ctx.fillRect(0, 0, 1, 1);
            }
            return original.apply(this, args);
        };
    };

    patchCanvasMethod('toDataURL');
    patchCanvasMethod('toBlob');
    console.log('Canvas modificado con ruido persistente.');
};
    canv();
// --- WebGL Fingerprinting (modificacion de getParameter) ---
    const originalGetParameterWebGL = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(pname) {
        const GL_VENDOR = 0x1F00;
        const GL_RENDERER = 0x1F01;
        const GL_VERSION = 0x1F02;
        const GL_SHADING_LANGUAGE_VERSION = 0x8B8C;

        const webglVendors = ['Google Inc.', 'Mozilla', 'WebKit', 'NVIDIA Corporation', 'Intel', 'Microsoft Corporation', 'Qualcomm', 'Apple'];
        const webglRenderers = [
            'ANGLE (Intel(R) UHD Graphics 620 (PVR)',
            'WebKit WebGL',
            'Adreno (TM) 630',
            'GeForce RTX 3080/PCIe/SSE2',
            'AMD Radeon(TM) Graphics (Raven Ridge)',
            'SwiftShader Direct3D 11',
            'Apple A14 Bionic GPU',
            'Mali-G78 MP14',
            'PowerVR Rogue GE8320'
        ];
        const webglVersions = [
            'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
            'WebGL 1.0 (OpenGL ES 2.0 Apple)',
            'WebGL 2.0 (OpenGL ES 3.0 Chromium)',
            'WebGL 2.0 (OpenGL ES 3.0 Apple)'
        ];
        const webglShadingLanguages = [
            'WebGL GLSL ES 1.00 (OpenGL ES GLSL ES 2.00)',
            'WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.00)'
        ];

        switch (pname) {
            case GL_VENDOR:
                const vendor = getRandomElement(webglVendors);
                console.log(`WebGL Vendor modificado a: ${vendor}`);
                return vendor;
            case GL_RENDERER:
                const renderer = getRandomElement(webglRenderers);
                console.log(`WebGL Renderer modificado a: ${renderer}`);
                return renderer;
            case GL_VERSION:
                const version = getRandomElement(webglVersions);
                console.log(`WebGL Version modificado a: ${version}`);
                return version;
            case GL_SHADING_LANGUAGE_VERSION:
                const shLang = getRandomElement(webglShadingLanguages);
                console.log(`WebGL Shading Language Version modificado a: ${shLang}`);
                return shLang;
            default:
                return originalGetParameterWebGL.call(this, pname);
        }
    };

    // --- Suplantacion de Navigator (User Agent, Plataforma, etc.) ---
    const fakeUserAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0.0 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; rv:110.0) Gecko/20100101 Firefox/122.0"
    ];
    const fakePlatforms = ['Win32', 'Win64', 'MacIntel', 'Linux x86_64', 'ARM', 'iPhone', 'iPad', 'Android'];
    const fakeVendors = ['Google Inc.', 'Apple Computer, Inc.', 'Microsoft Corp.', 'Mozilla Foundation'];
    const fakeAppNames = ['Netscape', 'Mozilla'];

    const fixedRandomUserAgent = getRandomElement(fakeUserAgents);
    const fixedRandomPlatform = getRandomElement(fakePlatforms);
    const fixedRandomVendor = getRandomElement(fakeVendors);
    const fixedRandomAppName = getRandomElement(fakeAppNames);
    const fixedRandomHardwareConcurrency = getRandomNumber(2, 16);
    const fixedRandomDeviceMemory = getRandomNumber(2, 32);

    function applyAggressiveNavigatorSpoofing() {
        console.log('Iniciando modificacion agresiva del navegador...');
        try {
            Object.defineProperty(navigator, 'userAgent', { get: () => fixedRandomUserAgent, configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'appVersion', { get: () => fixedRandomUserAgent.substring(fixedRandomUserAgent.indexOf('/') + 1), configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'platform', { get: () => fixedRandomPlatform, configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'vendor', { get: () => fixedRandomVendor, configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'appName', { get: () => fixedRandomAppName, configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fixedRandomHardwareConcurrency, configurable: true, enumerable: true });
            Object.defineProperty(navigator, 'deviceMemory', { get: () => fixedRandomDeviceMemory, configurable: true, enumerable: true });

            console.log('Modificaciones del navegador aplicadas:');
            console.log('  User Agent:', navigator.userAgent);
            console.log('  App Version:', navigator.appVersion);
            console.log('  Plataforma:', navigator.platform);
            console.log('  Vendor:', navigator.vendor);
            console.log('  App Name:', navigator.appName);
            console.log('  Hardware Concurrency:', navigator.hardwareConcurrency);
            console.log('  Device Memory:', navigator.deviceMemory);
        } catch (error) {
            console.error('Error grave al intentar modificar las propiedades del navegador:', error);
            console.warn('No todas las propiedades pueden ser modificadas en todos los entornos o versiones de navegador. ¡El sitio podria detectar la manipulacion!');
        }
    }
    applyAggressiveNavigatorSpoofing();

    setTimeout(() => {
        console.log('\n--- Verificacion de persistencia despues de un breve retraso ---');
        console.log('  User Agent (actual):', navigator.userAgent);
        console.log('  Plataforma (actual):', navigator.platform);
        console.log('  Vendor (actual):', navigator.vendor);
        console.log('  Hardware Concurrency (actual):', navigator.hardwareConcurrency);
        console.log('  Device Memory (actual):', navigator.deviceMemory);
    }, 1500);

    // --- Suplantacion de Propiedades de Pantalla ---
    const screenResolutions = [
        { width: 2560, height: 1440 },
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 3840, height: 2160 }
    ];
    const selectedResolution = getRandomElement(screenResolutions);

    Object.defineProperty(screen, 'width', { get: () => selectedResolution.width });
    Object.defineProperty(screen, 'height', { get: () => selectedResolution.height });
    Object.defineProperty(screen, 'availWidth', { get: () => selectedResolution.width - getRandomNumber(0, 50) });
    Object.defineProperty(screen, 'availHeight', { get: () => selectedResolution.height - getRandomNumber(50, 100) });
    Object.defineProperty(screen, 'colorDepth', { get: () => getRandomElement([24, 32, 16]) });
    Object.defineProperty(screen, 'pixelDepth', { get: () => screen.colorDepth });
    Object.defineProperty(window, 'innerWidth', { get: () => screen.availWidth - getRandomNumber(0, 100) });
    Object.defineProperty(window, 'innerHeight', { get: () => screen.availHeight - getRandomNumber(0, 150) });
    Object.defineProperty(window, 'devicePixelRatio', { get: () => getRandomElement([1, 1.25, 1.5, 2, 2.5, 3]) });

    console.log('Dimensiones de pantalla y DPI modificados:', {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio
    });

    // --- Suplantacion de Zona Horaria ---
    const _timezoneShield = {};
    const _getRandomTimezone = () => {
        const availableTimezones = [
            'America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles',
            'Europe/Paris', 'Asia/Shanghai', 'America/Denver', 'Australia/Sydney',
            'Africa/Johannesburg', 'Pacific/Auckland', 'Europe/Berlin', 'Asia/Kolkata',
            'America/Chicago', 'Europe/Rome', 'America/Mexico_City', 'Asia/Dubai',
            'Europe/Moscow', 'America/Sao_Paulo', 'Canada/Eastern', 'Europe/Madrid',
            'Asia/Singapore', 'Europe/Amsterdam', 'America/Vancouver', 'America/Bogota',
            'Europe/Stockholm', 'Asia/Seoul', 'Australia/Melbourne', 'Africa/Cairo',
            'Asia/Jakarta', 'Europe/Istanbul', 'America/Toronto', 'Asia/Bangkok'
        ];
        return getRandomElement(availableTimezones);
    };

    const _getRandomOffset = () => {
        const minOffset = -720;
        const maxOffset = 840;
        const interval = 15;
        const numIntervals = (maxOffset - minOffset) / interval;
        return minOffset + getRandomNumber(0, numIntervals) * interval;
    };

    (function() {
        try {
            const simulatedOffset = _getRandomOffset();
            const simulatedTimezone = _getRandomTimezone();

            _timezoneShield._originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
            _timezoneShield._originalToString = Date.prototype.toString;
            _timezoneShield._originalToLocaleString = Date.prototype.toLocaleString;
            _timezoneShield._originalToLocaleDateString = Date.prototype.toLocaleDateString;
            _timezoneShield._originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
            _timezoneShield._originalIntlDateTimeFormat = Intl.DateTimeFormat;

            const _defineHiddenProperty = (obj, propName, valueFn) => {
                Object.defineProperty(obj, propName, {
                    value: function(...args) {
                        return valueFn.apply(this, args);
                    },
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            };

            _defineHiddenProperty(Date.prototype, 'getTimezoneOffset', function() {
                const variation = simulatedOffset + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) * 7.5 : 0);
                return Math.floor(variation / 15) * 15;
            });

            _defineHiddenProperty(Date.prototype, 'toString', function() {
                const originalString = _timezoneShield._originalToString.call(this);
                const parts = originalString.match(/^(.*?)(\([^\)]+\))?$/);
                if (parts && parts[1]) {
                    const datePart = parts[1].trim().split(' ');
                    const fakeZone = simulatedTimezone + String.fromCharCode(8203);
                    datePart.splice(5, 0, '(' + fakeZone + ')');
                    return datePart.join(' ');
                }
                return originalString + ' (' + simulatedTimezone + ')';
            });

            const _adjustDateForLocale = (dateObj, originalOffsetFn) => {
                const realCurrentOffset = originalOffsetFn.call(new Date());
                const difference = simulatedOffset - realCurrentOffset;
                return new Date(dateObj.getTime() + difference * 60 * 1000);
            };

            _defineHiddenProperty(Date.prototype, 'toLocaleString', function(locale, options) {
                const adjustedDate = _adjustDateForLocale(this, _timezoneShield._originalGetTimezoneOffset);
                const finalOptions = options || {};
                finalOptions['t' + 'ime' + 'Z' + 'one'] = simulatedTimezone;
                try {
                    return _timezoneShield._originalToLocaleString.call(adjustedDate, locale, finalOptions);
                } catch (error) {
                    console.warn("Simulacion de Zona Horaria: toLocaleString fallo, usando respaldo.", error);
                    return _timezoneShield._originalToLocaleString.call(adjustedDate, locale, options);
                }
            });

            _defineHiddenProperty(Date.prototype, 'toLocaleDateString', function(locale, options) {
                const adjustedDate = _adjustDateForLocale(this, _timezoneShield._originalGetTimezoneOffset);
                const finalOptions = options || {};
                finalOptions['t' + 'ime' + 'Z' + 'one'] = simulatedTimezone;
                try {
                    return _timezoneShield._originalToLocaleDateString.call(adjustedDate, locale, finalOptions);
                } catch (error) {
                    return _timezoneShield._originalToLocaleDateString.call(adjustedDate, locale, options);
                }
            });

            _defineHiddenProperty(Date.prototype, 'toLocaleTimeString', function(locale, options) {
                const adjustedDate = _adjustDateForLocale(this, _timezoneShield._originalGetTimezoneOffset);
                const finalOptions = options || {};
                finalOptions['t' + 'ime' + 'Z' + 'one'] = simulatedTimezone;
                try {
                    return _timezoneShield._originalToLocaleTimeString.call(adjustedDate, locale, finalOptions);
                } catch (error) {
                    return _timezoneShield._originalToLocaleTimeString.call(adjustedDate, locale, options);
                }
            });

            _defineHiddenProperty(Intl, 'DateTimeFormat', function(locale, options) {
                const finalOptions = options || {};
                finalOptions['t' + 'ime' + 'Z' + 'one'] = simulatedTimezone;
                try {
                    const OriginalConstructor = _timezoneShield._originalIntlDateTimeFormat;
                    const proxyHandler = {
                        construct(target, args) {
                            return Reflect.construct(target, args);
                        },
                        apply(target, thisArg, args) {
                            return Reflect.apply(target, thisArg, args);
                        }
                    };
                    return new Proxy(OriginalConstructor, proxyHandler)(locale, finalOptions);
                } catch (error) {
                    console.warn("Simulacion de Zona Horaria: Intl.DateTimeFormat fallo, usando respaldo.", error);
                    return new _timezoneShield._originalIntlDateTimeFormat(locale);
                }
            });

            setTimeout(() => {
                console.log("\nSimulacion de Zona Horaria ACTIVADA");
                console.log("  Desfase Simulado (minutos):", new Date().getTimezoneOffset());
                console.log("  TZ Simulada (en toString):", new Date().toString().match(/\(([^)]+)\)$/)?.[1] || "No detectado");
                console.log("  Ejemplo toLocaleString:", new Date().toLocaleString());
                console.log("  Ejemplo Intl.DateTimeFormat:", new Intl.DateTimeFormat().resolvedOptions().timeZone);
                console.log("-------------------------------------------\n");
            }, 500);
        } catch (error) {
            console.error("Error CRITICO al intentar simular la zona horaria!:", error);
        }
    })();

    _timezoneShield['revertChanges'] = function() {
        if (_timezoneShield._originalGetTimezoneOffset) Date.prototype.getTimezoneOffset = _timezoneShield._originalGetTimezoneOffset;
        if (_timezoneShield._originalToString) Date.prototype.toString = _timezoneShield._originalToString;
        if (_timezoneShield._originalToLocaleString) Date.prototype.toLocaleString = _timezoneShield._originalToLocaleString;
        if (_timezoneShield._originalToLocaleDateString) Date.prototype.toLocaleDateString = _timezoneShield._originalToLocaleDateString;
        if (_timezoneShield._originalToLocaleTimeString) Date.prototype.toLocaleTimeString = _timezoneShield._originalToLocaleTimeString;
        if (_timezoneShield._originalIntlDateTimeFormat) Intl.DateTimeFormat = _timezoneShield._originalIntlDateTimeFormat;
        console.log("¡Simulacion de Zona Horaria REVERTIDA! Volviendo a la original del navegador.");
    };

    // --- Obfuscacion de Lenguaje ---
    const fakeLanguages = ['es-ES', 'es-MX', 'es-US', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE', 'es-PR', 'es-DO', 'es-CR', 'es-GT', 'es-SV', 'es-HN', 'es-NI', 'es-PA', 'es-CU', 'es-BO', 'es-EC', 'es-UY', 'es-PY', 'es-GQ'];
    const selectedLanguage = getRandomElement(fakeLanguages);
    Object.defineProperty(navigator, 'language', { get: () => selectedLanguage });
    Object.defineProperty(navigator, 'languages', { get: () => [selectedLanguage, getRandomElement(fakeLanguages.filter(l => l !== selectedLanguage))] });
    console.log('Lenguaje modificado:', navigator.language);

    // --- Obfuscacion de Plugins y MimeTypes ---
    Object.defineProperty(navigator, 'plugins', {
        get: () => {
            const commonPlugins = [
                { name: "Chrome PDF Viewer", description: "Portable Document Format", filename: "internal-pdf-viewer" },
                { name: "WebKit Built-in PDF", description: "Portable Document Format", filename: "WebKitPlugin" },
                { name: "Native Client", description: "", filename: "internal-nacl-plugin" },
                { name: "Widevine Content Decryption Module", description: "Enables secure playback of HTML5 video & audio.", filename: "widevinecdm.dll" },
                { name: "Adobe Flash Player", description: "Shockwave Flash", filename: "pepflashplayer.dll" }
            ];
            const numPlugins = getRandomNumber(0, commonPlugins.length);
            const shuffledPlugins = commonPlugins.sort(() => 0.5 - Math.random());
            const selectedPlugins = shuffledPlugins.slice(0, numPlugins);
            console.log('navigator.plugins modificado.');
            return selectedPlugins;
        }
    });

    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => {
            const commonMimeTypes = [
                { type: "application/pdf", description: "Portable Document Format", suffixes: "pdf", enabledPlugin: {} },
                { type: "application/x-google-chrome-pdf", description: "Portable Document Format", suffixes: "pdf", enabledPlugin: {} },
                { type: "image/jpeg", description: "JPEG Image", suffixes: "jpeg,jpg", enabledPlugin: {} },
                { type: "image/png", description: "PNG Image", suffixes: "png", enabledPlugin: {} },
                { type: "application/json", description: "JSON Document", suffixes: "json", enabledPlugin: {} },
                { type: "application/x-shockwave-flash", description: "Shockwave Flash", suffixes: "swf", enabledPlugin: {} },
                { type: "audio/mpeg", description: "MPEG Audio", suffixes: "mp3", enabledPlugin: {} },
                { type: "video/mp4", description: "MP4 Video", suffixes: "mp4", enabledPlugin: {} }
            ];
            const numMimeTypes = getRandomNumber(0, commonMimeTypes.length);
            const shuffledMimeTypes = commonMimeTypes.sort(() => 0.5 - Math.random());
            const selectedMimeTypes = shuffledMimeTypes.slice(0, numMimeTypes);
            console.log('navigator.mimeTypes modificado.');
            return selectedMimeTypes;
        }
    });

    // --- Otras propiedades de Navigator ---
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    console.log('navigator.webdriver modificado a false.');

    Object.defineProperty(navigator, 'doNotTrack', { get: () => getRandomElement(['1', '0', null]) });
    console.log('navigator.doNotTrack modificado.');

    // --- Suplantacion de Network Information API (navigator.connection) ---
    if (navigator.connection) {
        Object.defineProperty(navigator, 'connection', {
            get: () => ({
                effectiveType: getRandomElement(['4g', '3g', '2g', 'slow-2g']),
                rtt: getRandomElement([50, 100, 150, 200, 300]),
                downlink: getRandomFloat(0.5, 100, 2),
                saveData: getRandomElement([true, false])
            })
        });
        console.log('navigator.connection modificado.');
    }

    // --- Suplantacion de maxTouchPoints y cookieEnabled ---
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => getRandomElement([0, 1, 5, 10]) });
    console.log('maxTouchPoints modificado.');

    Object.defineProperty(navigator, 'cookieEnabled', { get: () => getRandomElement([true, true, true, false]) });
    console.log('cookieEnabled modificado.');
 
    const webglVendors = ['Google Inc.', 'Mozilla', 'Microsoft Corporation'];
    const webglRenderers = ['ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)', 'llvmpipe (LLVM 15.0.7, 256 bits)', 'SwiftShader Direct3D 11'];

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, attributes) {
        const context = originalGetContext.call(this, type, attributes);
        if (type === 'webgl' || type === 'webgl2') {
            const originalGetParameter = context.getParameter;
            context.getParameter = function(parameter) {
                if (parameter === 37445) {  
                    return getRandomElement(webglVendors);
                }
                if (parameter === 37446) {  
                    return getRandomElement(webglRenderers);
                }
                return originalGetParameter.call(this, parameter);
            };
        }
        return context;
    };
    const tempCanvas = document.createElement('canvas');
    const glContext = tempCanvas.getContext('webgl') || tempCanvas.getContext('webgl2');
    if (glContext) {
        console.log('Random WebGL Vendor:', glContext.getParameter(37445));
        console.log('Random WebGL Renderer:', glContext.getParameter(37446));
    }

    console.log('todo listo.');
})();
