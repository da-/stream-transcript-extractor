# Microsoft Stream Transcript Extractor

A Tampermonkey/Greasemonkey userscript that automatically extracts complete transcripts from Microsoft Stream videos, even when the built-in download button is disabled or restricted.

## Overview

Microsoft Stream (hosted on SharePoint) often disables transcript downloads for users without proper permissions. This script bypasses that limitation by automatically scrolling through the transcript panel, collecting all entries, and saving them to a clean, readable text file.

## Features

- Works with restricted permissions - Extracts transcripts even when download button is disabled
- Handles long videos - Successfully processes hour+ long videos with lazy-loaded transcripts
- Clean formatting - Removes duplicate timestamps and unnecessary UI elements
- Automatic filename - Uses the video title for the output file
- Progress indicator - Shows real-time progress during extraction
- One-click operation - Simple blue button added to the transcript panel

## Installation

1. **Install a userscript manager:**
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. **Install the script:**
   - Click on your userscript manager icon
   - Select "Create a new script"
   - Copy and paste the entire script
   - Save (Ctrl+S or Cmd+S)

## Usage

1. Open any Microsoft Stream video on SharePoint
2. Open the **Transcript** panel (if not already open)
3. Click the blue **"Extract Full Transcript"** button that appears in the top-right corner
4. Wait a few minutes while the script works (don't close the tab!)
5. The transcript will automatically download as a `.txt` file

### Progress Indicators

- **"Working... X%"** - Shows extraction progress and entry count
- **"Saved X entries!"** - Extraction complete, file downloaded

## Technical Details

### How It Works

1. **Lazy Loading Handling**: Microsoft Stream uses virtualized scrolling that only loads visible transcript entries. The script slowly scrolls through the entire transcript panel to trigger loading of all entries.

2. **Intelligent Collection**: As it scrolls, it collects timestamp/text pairs and uses a Map structure to prevent duplicates.

3. **Smart Stopping**: Monitors scroll position and entry count to detect when it has reached the end of the transcript.

### Performance

- **Scroll speed**: 300px every 700ms (optimized for reliable loading)
- **Typical extraction time**: 2-3 minutes for a 1-hour video

### Compatibility

- Microsoft Stream on SharePoint
- Chrome, Firefox, Edge, Safari
- Tampermonkey, Greasemonkey

## Troubleshooting

### "Cannot find transcript container!"
- Make sure the transcript panel is open before clicking the button
- Try refreshing the page and reopening the transcript

### Script extracts 0 entries
- Ensure the transcript has fully loaded (wait a few seconds after opening)
- Check browser console (F12) for error messages
- Try refreshing the page

### Extraction stops early
- Don't interact with the page while extraction is running
- Try increasing `WAIT_TIME` in the script if you have a slow connection

## Limitations

- Requires the transcript panel to be accessible (not completely blocked)
- Cannot extract from videos where transcripts don't exist
- Extraction time scales with video length (longer videos = longer wait)

## Privacy & Security

- **No data collection**: Everything runs locally in your browser
- **No external requests**: Script only interacts with the current page
- **Read-only operation**: Does not modify any data on Microsoft Stream

## License

MIT License - Feel free to modify and distribute

## Credits

**Author**: Daniel Allen via Claude 3.5 Sonnet  
**Version**: 1.7  
**Created**: January 2026

## Contributing

Found a bug or have a feature request? Please open an issue or submit a pull request.

---

## Changelog

### v1.7 (2026-01-16)
- Dynamic filename extraction from video title
- Improved title sanitization for cross-platform compatibility
- Added comprehensive documentation

### v1.6
- Clean formatting (removed duplicate timestamps)
- Better text extraction using sub-entry selectors

### v1.5
- Slower, more reliable scrolling for long videos
- Improved progress indicators
- Better bottom detection

### v1.0-1.4
- Initial development and testing
- Various improvements to collection logic
