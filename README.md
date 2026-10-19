# North Star Bakery

Introduction to Web Development — Touchstone 4

This project continues the same four pages, color palette, typography, and course media from Touchstone 3. It uses HTML, CSS, and plain JavaScript without a framework.

## Pages

- `index.html`: bakery introduction, responsive featured image, hours, and location.
- `products.html`: product categories plus favorites and a category filter.
- `about.html`: bakery story, staff, sourcing, and welcome audio.
- `contact.html`: saved favorites and an inquiry/preorder form.
- `styles.css`: shared responsive styles, including a 768px breakpoint.
- `scripts.js`: functions, product data, favorites, storage, and validation.
- `media/`: course-provided bakery images and audio.

## Features

Save or remove product favorites, filter by category, and see the favorite count update. Favorites and the selected category are stored with localStorage under `northStarBakery.preferences.v1`. They return after a refresh. Saved favorites also appear on the Contact page and can be added to request details without replacing existing text.

The form checks name length, email format, request type, details length, and pickup dates for preorders. Errors appear next to the fields, and entries remain available for correction. This course demonstration does not send requests or place orders.

## Publishing

Upload these files and the media folder directly into the repository root, with index.html at the top level. In Settings → Pages, select Deploy from a branch, main, and /(root), then Save.

## Browser checks before submission

1. On Products, save Signature Loaf. Confirm the button, list, and count update. Remove it and save it again.
2. Select Breads, refresh, and confirm Breads and Signature Loaf are restored.
3. Visit Contact and add the saved favorite to the request details. Repeat the action and confirm it does not duplicate the item.
4. Check an invalid form. Confirm at least two messages appear beside the fields and existing text stays in place.
5. Correct the fields and check a valid general inquiry. Confirm the success message appears without an unnecessary pickup-date error.
6. Test a preorder with an open future pickup date. A missing, past, or Monday date should show a relevant error.
7. Open all four pages, test images and audio, and check narrow and desktop widths. Confirm the browser console has no errors.
8. Open the repository and live preview in a signed-out/private window.

Local logic checks and file-reference checks have passed. Browser interactions, mobile rendering, audio playback, screenshots, and the public deployment still need their final review before the explanation document is submitted.
