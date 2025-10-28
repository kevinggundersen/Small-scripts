// ==UserScript==
// @name         Twitch Always Visible Docked Seekbar (Pixel-Perfect)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Permanent docked seekbar that syncs exactly with video playback, hides on hover
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getPlayerContainer() {
        // Twitch’s main player container or the video’s parent
        return document.querySelector('.video-player__container') || document.querySelector('video')?.parentElement;
    }

    function getVideo() {
        return document.querySelector('video');
    }

    function createDockedBar() {
        const dockedBar = document.createElement('div');
        dockedBar.id = 'my-docked-bar';
        dockedBar.style.position = 'absolute';
        dockedBar.style.bottom = '0';
        dockedBar.style.left = '0';
        dockedBar.style.width = '0px'; // will update in pixels
        dockedBar.style.height = '3px';
        dockedBar.style.backgroundColor = 'rgb(145, 70, 255)'; // Twitch purple
        dockedBar.style.zIndex = '9999';
        dockedBar.style.pointerEvents = 'none';

        // Create the white handle
        const handle = document.createElement('div');
        handle.id = 'my-docked-handle';
        handle.style.position = 'absolute';
        handle.style.right = '-3px'; // stick to the end of the purple bar
        handle.style.top = '-0px'; // adjust above the bar
        handle.style.width = '3px';
        handle.style.height = '3px';
        handle.style.borderRadius = '30%';
        handle.style.backgroundColor = 'white';
        handle.style.boxShadow = '0 0 2px rgba(0,0,0,0.5)';
        handle.style.pointerEvents = 'none';

        dockedBar.appendChild(handle);
        return dockedBar;
    }

function updateBar(bar, player) {
    const video = getVideo();
    if (!video || !player) {
        return requestAnimationFrame(() => updateBar(bar, player));
    }

    // Horizontal offsets to match Twitch's native bar
    const leftOffset = 16;
    const rightOffset = 16;

    // Usable width is container width minus offsets
    const usableWidth = player.clientWidth - leftOffset - rightOffset;
    const progressPx = (video.currentTime / video.duration) * usableWidth;

    // Apply offsets
    bar.style.left = `${leftOffset}px`;
    bar.style.width = `${progressPx}px`;
    bar.style.borderRadius = `${bar.offsetHeight / 2}px`; // rounded ends
    requestAnimationFrame(() => updateBar(bar, player));
}


    function init() {
        const player = getPlayerContainer();
        if (!player) {
            setTimeout(init, 1000);
            return;
        }

        // Ensure the player container is relative
        const style = window.getComputedStyle(player);
        if (style.position === 'static') {
            player.style.position = 'relative';
        }

        const dockedBar = createDockedBar();
        player.appendChild(dockedBar);

        // Hide bar when hovering the player
        player.addEventListener('mouseenter', () => dockedBar.style.display = 'none');
        player.addEventListener('mouseleave', () => dockedBar.style.display = 'block');

        console.log('[DockedBar Debug] Attached to player container');
        updateBar(dockedBar, player);
    }

    init();
})();
