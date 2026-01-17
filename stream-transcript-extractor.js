// ==UserScript==
// @name         Microsoft Stream Transcript Extractor
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Extract full transcript from Microsoft Stream videos, regardless of disabled download button
// @author       Daniel Allen via Claude 3.5 Sonnet
// @match        https://*.sharepoint.com/*/stream.aspx*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('Transcript extractor script loaded');

    function addButton() {
        const checkInterval = setInterval(() => {
            const transcriptPanel = document.querySelector('[aria-label="Transcript"]') ||
                                   document.querySelector('#pluginContent');

            if (transcriptPanel && !document.getElementById('myExtractBtn')) {
                clearInterval(checkInterval);

                const btn = document.createElement('button');
                btn.id = 'myExtractBtn';
                btn.textContent = 'Extract Full Transcript';
                btn.style.cssText = `
                    position: fixed;
                    top: 150px;
                    right: 20px;
                    z-index: 99999;
                    padding: 12px 24px;
                    background: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;

                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked!');
                    extractTranscript();
                }, true);

                document.body.appendChild(btn);
                console.log('Button added to page');
            }
        }, 1000);
    }

    function getVideoTitle() {
        // Try multiple methods to get the video title

        // Method 1: From the video heading on the page
        const videoHeading = document.querySelector('h1');
        if (videoHeading && videoHeading.textContent.trim()) {
            return videoHeading.textContent.trim();
        }

        // Method 2: From the document title (remove " - Microsoft Stream" or similar suffixes)
        const docTitle = document.title
            .replace(/\s*-\s*Microsoft Stream.*$/i, '')
            .replace(/\s*-\s*Stream.*$/i, '')
            .replace(/\.mp4$/i, '')
            .trim();

        if (docTitle) {
            return docTitle;
        }

        // Method 3: Fallback to generic name
        return 'Stream Video Transcript';
    }

    function sanitizeFilename(filename) {
        // Remove or replace characters that are invalid in filenames
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid chars with underscore
            .replace(/\s+/g, '_')            // Replace spaces with underscore
            .replace(/_+/g, '_')             // Replace multiple underscores with single
            .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
            .substring(0, 200);              // Limit length to 200 chars
    }

    async function extractTranscript() {
        console.log('=== EXTRACTION STARTED ===');
        console.log('This will take 2-3 minutes. Please do not close the browser or tab.');

        const btn = document.getElementById('myExtractBtn');
        btn.textContent = 'Working... 0%';
        btn.style.background = '#d83b01';

        const container = document.querySelector('#scrollToTargetTargetedFocusZone') ||
                         document.querySelector('[id*="scrollToTarget"]') ||
                         document.querySelector('#OneTranscript');

        if (!container) {
            alert('Cannot find transcript container!');
            btn.textContent = 'Extract Full Transcript';
            btn.style.background = '#0078d4';
            return;
        }

        console.log('Container found:', container);

        // Get video title
        const videoTitle = getVideoTitle();
        console.log('Video title:', videoTitle);

        // Scroll to top
        container.scrollTop = 0;
        await wait(1000);

        const allEntries = new Map();
        let maxScrollTop = 0;
        const SCROLL_INCREMENT = 300;
        const WAIT_TIME = 700;

        const totalHeight = container.scrollHeight;
        console.log(`Total scroll height: ${totalHeight}`);

        let iteration = 0;
        let consecutiveNoNewEntries = 0;

        while (consecutiveNoNewEntries < 15) {
            iteration++;

            const listItems = container.querySelectorAll('[id^="listItem-"]');
            const beforeCount = allEntries.size;

            listItems.forEach(item => {
                const timestampBtn = item.querySelector('button[id^="Left-timestamp-"]');
                const textContainer = item.querySelector('[id^="sub-entry-"]');

                if (timestampBtn && textContainer) {
                    const timestamp = timestampBtn.textContent.trim();
                    const textContent = textContainer.textContent.trim();

                    if (timestamp && textContent && textContent.length > 3) {
                        allEntries.set(timestamp, textContent);
                    }
                }
            });

            const newEntriesFound = allEntries.size - beforeCount;

            const currentScroll = container.scrollTop;
            const progress = Math.min(95, Math.round((currentScroll / totalHeight) * 100));
            btn.textContent = `Working... ${progress}% (${allEntries.size} entries)`;

            console.log(`Iteration ${iteration}: Position ${currentScroll}/${totalHeight}, Found ${newEntriesFound} new, Total: ${allEntries.size}`);

            if (newEntriesFound === 0) {
                consecutiveNoNewEntries++;
            } else {
                consecutiveNoNewEntries = 0;
            }

            if (currentScroll > maxScrollTop) {
                maxScrollTop = currentScroll;
                consecutiveNoNewEntries = 0;
            }

            const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

            if (isAtBottom) {
                console.log('At bottom, waiting for any final content...');
                await wait(1500);

                const finalCheck = container.querySelectorAll('[id^="listItem-"]');
                finalCheck.forEach(item => {
                    const timestampBtn = item.querySelector('button[id^="Left-timestamp-"]');
                    const textContainer = item.querySelector('[id^="sub-entry-"]');

                    if (timestampBtn && textContainer) {
                        const timestamp = timestampBtn.textContent.trim();
                        const textContent = textContainer.textContent.trim();

                        if (timestamp && textContent && textContent.length > 3) {
                            allEntries.set(timestamp, textContent);
                        }
                    }
                });

                if (consecutiveNoNewEntries >= 5) {
                    console.log('Reached bottom with no new content');
                    break;
                }
            }

            container.scrollBy(0, SCROLL_INCREMENT);
            await wait(WAIT_TIME);

            if (iteration > 500) {
                console.log('Reached iteration limit');
                break;
            }
        }

        console.log(`Extraction complete. Total entries collected: ${allEntries.size}`);

        if (allEntries.size === 0) {
            alert('No transcript entries found. Please make sure transcript is visible.');
            btn.textContent = 'Extract Full Transcript';
            btn.style.background = '#0078d4';
            return;
        }

        // Create text file
        let output = `TRANSCRIPT: ${videoTitle}\n`;
        output += `Extracted: ${new Date().toLocaleString()}\n`;
        output += `Total entries: ${allEntries.size}\n`;
        output += `Duration: ~${Math.floor(allEntries.size / 60)} minutes of content\n`;
        output += `${'='.repeat(80)}\n\n`;

        for (const [timestamp, text] of allEntries) {
            output += `${timestamp}\n${text}\n\n`;
        }

        // Download with sanitized filename
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFilename(videoTitle)}_transcript.txt`;
        a.click();

        console.log('Download initiated with filename:', a.download);

        btn.textContent = `✓ Saved ${allEntries.size} entries!`;
        btn.style.background = '#107c10';

        setTimeout(() => {
            btn.textContent = 'Extract Full Transcript';
            btn.style.background = '#0078d4';
        }, 8000);
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addButton();
})();
