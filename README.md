# FixIt

FixIt is a mobile-first prototype for reporting a local issue to the council. Someone chooses the type of issue, marks where it is on a map, adds a description and photos, checks the details, and gets a reference number they can copy and use to follow up.

It is a front-end prototype built with plain HTML, CSS and JavaScript. There is no backend yet, so nothing is actually sent anywhere.

**Live prototype:** _add your GitHub Pages link here_

## How it works

The report is built up over five steps, with a "submitting" screen and a confirmation screen at the end.

| Page | What it does |
| --- | --- |
| `Step_3_index.html` | Pick the location: use the current location, search an address, or tap the map. Confirming saves the place. |
| `Step_4_index.html` | Add photos (in progress). |
| `Step_5_index.html` | Check everything. **Change a Detail** opens a menu to edit the description, the photos or the location. Nothing can be edited without going through that menu. |
| `Step_5_5_index.html` | "Submitting your report" screen: an animated logo, an inspirational quote, and a reference number is generated. |
| `Step_6_index.html` | Confirmation with the reference number (with a copy button), what happens next, and optional contact details. |
| `endpage.html` | The council page the user lands on after finishing. |

Steps 1 and 2 (the home page and choosing the issue type) are not covered here yet.

## How the steps share data

The pages pass the report along using the browser's own storage:

- **Step 3** saves the confirmed location in `sessionStorage` as `selectedLocation` (address, latitude, longitude).
- **Step 4** will save photos in `sessionStorage` as `selectedPhotos`, an array of image data URLs (up to 4).
- **Step 5** copies both into `localStorage["fixit_report"]`, then clears the temporary copies so edits made on Step 5 are not overwritten.
- **Step 5.5** adds a reference number in the format `FX-` followed by six digits.
- **Step 6** reads the report and shows the reference number.

When a real backend exists, only `getReport()` and `saveReport()` in the Step 5 script need to change.

## Running it locally

The pages need a local web server, because Step 5.5 loads the animated logo with `fetch()`, which browsers block when a page is opened straight from disk.

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `Step_3_index.html` and choose **Open with Live Server**.

It also works as-is on GitHub Pages.

## Built with

- HTML, CSS and JavaScript, with no framework
- [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/) tiles for the map
- [Nominatim](https://nominatim.org/) for address search and turning map points into addresses
- [Quotable](https://api.quotable.io) for the quote on the submitting screen, with built-in quotes as a fallback if it can't be reached
- Google Fonts: Poppins and Inter

## Designed for phones

Every page is designed for phones first and scales up to tablets and desktop.

- The pages size to the visible screen, so the browser's address bar and the phone's bottom controls do not hide the buttons.
- The main buttons sit pinned at the bottom of the screen.
- The logo stays beside the title box at every screen width.
- On large screens the content stays in a centred column.

## Known limitations

- No backend: reports are not stored or sent anywhere.
- The reference number is random and not checked for duplicates.
- Photos are stored in the browser as text, so very large photos can fill the browser's storage. Step 4 should shrink them before saving.
- The quote service can be unavailable, in which case a built-in quote is shown.

## Credits

Built by Iain O'Donnell and Emily.

- Step 3 and Step 4: Emily
- Steps 5, 5.5 and 6: Iain
