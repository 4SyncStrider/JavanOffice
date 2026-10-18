# JavanOffice

JavanOffice is a lightweight browser-based toolkit and game hub built with HTML, CSS, and vanilla JavaScript.

## Included sections

- Main landing menu with links to tools and games
- To-do list manager with multiple independent lists and localStorage persistence
- Simplified / Traditional Chinese conversion tool
- Calculator and formula helper
- Existing browser games preserved and integrated into the main menu

## Open the project

For regular use, you can open the root file directly:

- index.html

## Progressive Web App

JavanOffice includes a web app manifest and a service worker that caches the site pages and local game assets for offline use. To install the app or enable offline support, serve the project from `localhost` or an HTTPS host; browsers do not enable service workers for `file://` pages.

For example, run a local static server from the project root with `npx serve .`, then open the URL it prints. The browser's install command appears when its PWA install criteria are met.

## Notes

- No backend is required for the frontend features in this project.
- LocalStorage is used for non-sensitive list data only.
- The game pages remain separate HTML files for easy reuse and compatibility.
