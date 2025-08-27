// ==UserScript==
// @name         Persistent Image Dragging on Bluesky Posts
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Ensures images remain draggable by updating their draggable attribute even after re-rendering on Bluesky posts.
// @match        https://bsky.app/profile/*/post/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to update the draggable attribute if it's set to "false"
    function updateDraggable(el) {
        if (el && el.getAttribute('draggable') === 'false') {
            el.setAttribute('draggable', 'true');
            console.log('Updated draggable attribute for an image.');
        }
    }

    // Check and update images using multiple methods for better reliability
    function checkInitialImages() {
        // Try the updated XPath first
        const xpath = '/html/body/div[1]/div/div/div/div/div/div/button/div/img';
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const imgElement = result.singleNodeValue;
        updateDraggable(imgElement);

        // Also check all images as a fallback
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => updateDraggable(img));
    }

    // Run initial check after a short delay to ensure DOM is ready
    setTimeout(checkInitialImages, 500);

    // Create a MutationObserver to watch for new nodes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Ensure the added node is an element
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // If the node itself is an image, update it
                        if (node.matches('img')) {
                            updateDraggable(node);
                        }
                        // Also update any images found within the added node
                        const imgs = node.querySelectorAll('img');
                        imgs.forEach((img) => {
                            updateDraggable(img);
                        });
                    }
                });
            }
        });
    });

    // Start observing the entire document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Additional periodic check every 2 seconds as a safety net
    setInterval(() => {
        const allImages = document.querySelectorAll('img[draggable="false"]');
        allImages.forEach(img => updateDraggable(img));
    }, 2000);
})();