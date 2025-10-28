// ==UserScript==
// @name         Persistent Image Dragging on Bluesky Posts (Future-proof)
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Keep images draggable in Bluesky’s maximized view by forcing draggable=true and blocking modal dismissal on drag.
// @match        https://bsky.app/profile/*/post/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // --- Utility: make an image draggable ---
    function updateDraggable(el) {
        if (el && el.getAttribute('draggable') === 'false') {
            el.setAttribute('draggable', 'true');
            console.log('[Bluesky Drag Fix] Made image draggable:', el.src);
        }
    }

    // --- Initial scan after DOM is ready ---
    function checkInitialImages() {
        document.querySelectorAll('img').forEach(updateDraggable);
    }
    setTimeout(checkInitialImages, 500);

    // --- Observe DOM changes to catch new images ---
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('img')) {
                        updateDraggable(node);
                    }
                    node.querySelectorAll?.('img').forEach(updateDraggable);
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // --- Safety net: recheck periodically ---
    setInterval(() => {
        document.querySelectorAll('img[draggable="false"]').forEach(updateDraggable);
    }, 2000);

    // --- Block Bluesky modal from closing on drag ---
    function stopDismiss(e) {
        // Instead of relying on fragile CSS classes, detect images inside the modal’s <button>
        const modalButton = e.target.closest('button');
        if (!modalButton) return;

        const img = e.target.closest('img[draggable]');
        if (img && modalButton.contains(img)) {
            e.stopImmediatePropagation();
        }
    }

    document.addEventListener('mousedown', stopDismiss, true);
    document.addEventListener('mouseup', stopDismiss, true);
})();
