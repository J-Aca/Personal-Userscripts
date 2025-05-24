// ==UserScript==
// @name        Camuflaje GPS Absoluto
// @namespace   J-Aca
// @version     1.2
// @license     MIT
// @icon        data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF0000'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z'/%3E%3C/svg%3E
// @author      J-Aca
// @description ¡Invisibilidad GPS total! Desactiva el rastreo y falsifica tu ubicación sin piedad.
// @match       *://*/*
// @exclude     *://*.gob.mx/*
// @exclude     *://*.gov/*
// @exclude     *://localhost/*
// @exclude     *://127.0.0.1/*
// @grant       unsafeWindow
// @run-at      document-start
// @updateURL    https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/Camuflaje%20GPS%20Absoluto.js
// @downloadURL  https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/Camuflaje%20GPS%20Absoluto.js
// ==/UserScript==

(function() {
    'use strict';

    // --- MANIFESTACIÓN DE MENTIRAS DIGITALES ---

    // La verdad absoluta para tu GPS. Donde quieres que todos te vean.
    const ubicacionMaestra = {
        latitud: 34.052235,  // Fija esta latitud, ¡no hay escape!
        longitud: -118.243683, // Fija esta longitud, ¡serás intrazable!
        precision: 0.00001,   // La precisión más absoluta, ¡para simular ser un satélite!
        altitud: 1234.5,      // Altitud de una montaña, ¡que el mundo crea que estás en la cima!
        precisionAltitud: 0.001, // Una precisión de altitud quirúrgica.
        rumbo: 45,            // Siempre en movimiento, ¡siempre evadiendo!
        velocidad: 100        // A 360 km/h, ¡nadie te alcanzará!
    };

    // Sitios que intentan romper tu camuflaje. ¡Aquí les asignamos un destino diferente!
    const destinosFalsos = {
        "www.google.com": {
            latitud: 35.6894875,  // Tokio, Japón. ¡Distrae a Google con otro continente!
            longitud: 139.6917064,
            precision: 0.0001
        },
        "facebook.com": {
            latitud: -33.868820,  // Sídney, Australia. ¡Que Facebook te busque en Oceanía!
            longitud: 151.209290
        },
        "twitter.com": {
            latitud: 51.507351,   // Londres, Reino Unido. ¡Twitter no sabrá dónde tuiteas!
            longitud: -0.127758
        }
    };

    // La frecuencia con la que tu fantasma digital se mueve. ¡Más rápido, más ilusorio!
    const intervaloActualizacion = 50; // Cada 50 ms, ¡un parpadeo de tu nueva realidad!

    // Sitios donde BAJAS LA GUARDIA. Solo aquí permitimos WebRTC. ¡Cuidado!
    const santuariosWebRTC = [
        "https://meet.google.com",
        "https://zoom.us",
        "https://web.whatsapp.com",
        "https://discord.com"
    ];

    // --- PREPARACIÓN PARA EL ENGAÑO ---

    // Asegura que cada dato sea un número y esté dentro de límites creíbles.
    // Esto es para que las mentiras suenen a verdad.
    const forjarDatos = (valor, min, max, porDefecto, permitirCero = true) => {
        if (typeof valor !== 'number' || isNaN(valor)) {
            return porDefecto;
        }
        if (!permitirCero && valor <= 0) {
            return porDefecto;
        }
        return Math.max(min, Math.min(max, valor));
    };

    // Valida y consolida la ubicación maestra. ¡Nuestra base de la mentira!
    ubicacionMaestra.latitud = forjarDatos(ubicacionMaestra.latitud, -90, 90, 0);
    ubicacionMaestra.longitud = forjarDatos(ubicacionMaestra.longitud, -180, 180, 0);
    ubicacionMaestra.precision = forjarDatos(ubicacionMaestra.precision, 0.000001, Infinity, 0.001, false);
    ubicacionMaestra.altitud = forjarDatos(ubicacionMaestra.altitud, -Infinity, Infinity, 0);
    ubicacionMaestra.precisionAltitud = forjarDatos(ubicacionMaestra.precisionAltitud, 0.000001, Infinity, 0.01, false);
    ubicacionMaestra.rumbo = forjarDatos(ubicacionMaestra.rumbo, 0, 359.999999, null, true);
    ubicacionMaestra.velocidad = forjarDatos(ubicacionMaestra.velocidad, 0, Infinity, null, true);

    // Fusiona los destinos falsos con la ubicación maestra. ¡Cada sitio tiene su propia quimera!
    for (const host in destinosFalsos) {
        let perfil = destinosFalsos[host];
        perfil.latitud = forjarDatos(perfil.latitud, -90, 90, ubicacionMaestra.latitud);
        perfil.longitud = forjarDatos(perfil.longitud, -180, 180, ubicacionMaestra.longitud);
        perfil.precision = forjarDatos(perfil.precision, 0.000001, Infinity, ubicacionMaestra.precision, false);
        perfil.altitud = forjarDatos(perfil.altitud, -Infinity, Infinity, ubicacionMaestra.altitud);
        perfil.precisionAltitud = forjarDatos(perfil.precisionAltitud, 0.000001, Infinity, ubicacionMaestra.precisionAltitud, false);
        perfil.rumbo = forjarDatos(perfil.rumbo, 0, 359.999999, ubicacionMaestra.rumbo, true);
        perfil.velocidad = forjarDatos(perfil.velocidad, 0, Infinity, ubicacionMaestra.velocidad, true);
    }

    // --- LA ANULACIÓN DE LA REALIDAD ---

    // Guarda el objeto original de geolocalización, ¡por si lo necesitamos para otras trampas!
    const geoOriginal = navigator.geolocation;

    // Si no hay geolocalización, la creamos desde cero. ¡Nuestro propio universo!
    if (!geoOriginal) {
        navigator.geolocation = {};
    }

    // Sobreescribimos getCurrentPosition. ¡La ubicación será lo que nosotros digamos!
    navigator.geolocation.getCurrentPosition = function(exito, error, opciones) {
        setTimeout(() => {
            // Encuentra el destino falso para este sitio, si existe. Si no, ¡la verdad maestra!
            const coordenadasActuales = destinosFalsos[window.location.hostname] || ubicacionMaestra;
            const posicion = {
                coords: {
                    latitude: coordenadasActuales.latitud,
                    longitude: coordenadasActuales.longitud,
                    accuracy: coordenadasActuales.precision,
                    altitude: coordenadasActuales.altitud,
                    altitudeAccuracy: coordenadasActuales.precisionAltitud,
                    heading: coordenadasActuales.rumbo,
                    speed: coordenadasActuales.velocidad
                },
                timestamp: Date.now() // ¡Siempre la hora actual, para que parezca fresco!
            };
            if (typeof exito === 'function') {
                exito(posicion);
            }
        }, 0); // Ejecutamos al instante, ¡no hay tiempo para la espera!
    };

    const hilosDeVigilancia = {}; // ¡Todos los que nos "observan" caen aquí!

    // Anulamos watchPosition. ¡Nadie verá nuestro movimiento real!
    navigator.geolocation.watchPosition = function(exito, error, opciones) {
        const idTrampa = Math.floor(Math.random() * 1000000); // Un ID aleatorio, ¡para no ser descubiertos!
        hilosDeVigilancia[idTrampa] = setInterval(() => {
            navigator.geolocation.getCurrentPosition(exito, error, opciones);
        }, intervaloActualizacion); // ¡Actualizamos la mentira constantemente!
        return idTrampa;
    };

    // Y clearWatch. ¡Borramos cualquier rastro!
    navigator.geolocation.clearWatch = function(id) {
        if (hilosDeVigilancia[id]) {
            clearInterval(hilosDeVigilancia[id]);
            delete hilosDeVigilancia[id];
        }
    };

    // --- ASALTO TOTAL AL WEBTRC ---

    // ¿Este sitio es un santuario?
    const esSantuarioWebRTC = santuariosWebRTC.some(urlPermitida => window.location.href.startsWith(urlPermitida));

    if (!esSantuarioWebRTC) {
        try {
            // ¡Destruimos RTCPeerConnection en la ventana global! ¡Adiós a las IPs reales!
            if (unsafeWindow.RTCPeerConnection) {
                unsafeWindow.RTCPeerConnection = function() {
                    console.error("☠️ Camuflaje GPS: ¡RTCPeerConnection aniquilado!");
                    throw new Error("Acceso a RTCPeerConnection denegado. ¡Tu identidad está a salvo!");
                };
            }
            if (unsafeWindow.webkitRTCPeerConnection) {
                unsafeWindow.webkitRTCPeerConnection = function() {
                    console.error("☠️ Camuflaje GPS: ¡webkitRTCPeerConnection neutralizado!");
                    throw new Error("Acceso a webkitRTCPeerConnection denegado. ¡Tu identidad está a salvo!");
                };
            }
            if (unsafeWindow.mozRTCPeerConnection) {
                unsafeWindow.mozRTCPeerConnection = function() {
                    console.error("☠️ Camuflaje GPS: ¡mozRTCPeerConnection eliminado!");
                    throw new Error("Acceso a mozRTCPeerConnection denegado. ¡Tu identidad está a salvo!");
                };
            }
            console.warn("%c ¡ATENCIÓN! WebRTC ha sido erradicado en esta página. ¡Anonimato reforzado!", "background: #FF0000; color: white; padding: 5px 10px; font-size: 14px; font-weight: bold; border-radius: 5px;");
        } catch (e) {
            console.error("💥 Camuflaje GPS: Fallo al eliminar WebRTC. ¡Alerta!", e);
        }
    } else {
        console.info("%c WebRTC permitido. ¡Estás en un santuario! (Desactivación de WebRTC omitida)", "background: #008000; color: white; padding: 5px 10px; font-size: 14px; border-radius: 5px;");
    }

    // --- CONFIRMACIÓN DEL DOMINIO ---
    console.info("%c ¡Camuflaje GPS Activo! Tu ubicación es ahora una ilusión.", "background: #000000; color: #00FF00; padding: 15px 20px; font-size: 24px; font-weight: bold; text-align: center; border: 2px solid #00FF00;");

})();