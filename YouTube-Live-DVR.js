// ==UserScript==
// @name        YouTube Live DVR
// @namespace   https://github.com/J-Aca/Personal-Userscripts
// @version     1.1
// @description Enables rewinding on YouTube live streams that don't have DVR enabled.
// @description:es Habilita el rebobinado en las transmisiones en vivo de YouTube que no tienen DVR habilitado.
// @author      J-Aca
// @match       *://*.youtube-nocookie.com/embed/*
// @match       *://*.youtube.com/embed/*
// @match       *://*.youtube.com/*
// @run-at      document-start
// @icon        https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/YouTube-Live-DVR.js
// @downloadURL https://raw.githubusercontent.com/J-Aca/Personal-Userscripts/refs/heads/main/YouTube-Live-DVR.js
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // A helper function to check if a value is a non-null object.
    const isNonNullObject = (val) => val && typeof val === 'object';

    // Get the original property descriptor for 'playerResponse' on Object.prototype.
    const originalDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, 'playerResponse') || {
        set(value) {
            this.yt_internal_playerResponse = value;
        },
        get() {
            return this.yt_internal_playerResponse;
        }
    };

    // A reference to the original setter and getter.
    const originalSetter = originalDescriptor.set;
    const originalGetter = originalDescriptor.get;

    /**
     * The custom setter function that intercepts and modifies the player data.
     * @param {object} playerResponse - The data object for the YouTube player.
     */
    const customSetter = function(playerResponse) {
        if (isNonNullObject(playerResponse)) {
            const { streamingData, videoDetails, playerConfig } = playerResponse;

            // Check if it's a live stream without DVR enabled.
            if (isNonNullObject(videoDetails) && videoDetails.isLive && !videoDetails.isLiveDvrEnabled) {
                videoDetails.isLiveDvrEnabled = true;

                // Adjust ABR (Adaptive Bitrate) settings for better compatibility.
                if (isNonNullObject(playerConfig?.mediaCommonConfig)) {
                    playerConfig.mediaCommonConfig.useServerDrivenAbr = false;
                }

                // Remove the server-driven streaming URL to force the player to use a DVR-compatible manifest.
                if (isNonNullObject(streamingData) && streamingData.serverAbrStreamingUrl) {
                    if (streamingData.hlsManifestUrl || streamingData.dashManifestUrl) {
                        delete streamingData.serverAbrStreamingUrl;
                    }
                }
            }
        }
        // Call the original setter with the (potentially modified) value.
        originalSetter.call(this, playerResponse);
    };

    // Define the new custom property descriptor.
    Object.defineProperty(Object.prototype, 'playerResponse', {
        set: customSetter,
        get: originalGetter,
        configurable: true
    });

    console.log("%c YouTube Live DVR: Rebobinado habilitado", "background: #0080ff; color: #ffffff; padding: 4px 10px; font-size: 13px; font-weight: bold; border-radius: 4px;");

})();