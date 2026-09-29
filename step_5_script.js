/* ===================================================================
   Step 5 — Confirm Details
   ===================================================================*/

const REPORT_KEY = "fixit_report";
const MAX_PHOTOS = 4;

/* ---- Shared report state ------------------------------------------ */
function getReport() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_KEY)) || {};
  } catch (error) {
    console.error("Could not read saved report, starting fresh.", error);
    return {};
  }
}

function saveReport(partial) {
  const updated = { ...getReport(), ...partial };
  localStorage.setItem(REPORT_KEY, JSON.stringify(updated));
  return updated;
}

/* ---- Populate the page from whatever has been saved so far ----- */
function renderReport(report) {
  if (report.description) {
    document.querySelector(".issue-text").textContent = report.description;
  }
  if (report.location && report.location.address) {
    document.getElementById("location").value = report.location.address;
  }
  initializePhotoSlots(report.photos);
}

/* ---- Photos:  */
function initializePhotoSlots(savedPhotos) {
  const slots = document.querySelectorAll(".photo-list li");
  slots.forEach((slot, index) => {
    const saved = savedPhotos && savedPhotos[index];
    const existingImg = slot.querySelector("img.photo--filled");
    const photoUrl =
      saved || (existingImg ? existingImg.getAttribute("src") : null);
    setPhotoSlot(slot, photoUrl);
  });
}

function currentPhotosFromDom() {
  return Array.from(document.querySelectorAll(".photo-list li")).map((slot) => {
    const img = slot.querySelector("img");
    return img ? img.getAttribute("src") : null;
  });
}

function setPhotoSlot(slot, photoDataUrl) {
  slot.innerHTML = "";

  if (photoDataUrl) {
    const wrapper = document.createElement("div");
    wrapper.className = "photo photo--filled photo--wrapper";

    const img = document.createElement("img");
    img.src = photoDataUrl;
    img.alt = "Uploaded photo";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "photo-remove";
    removeButton.setAttribute("aria-label", "Remove this photo");
    removeButton.textContent = "×";
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removePhoto(slot);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeButton);
    slot.appendChild(wrapper);
  } else {
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "photo photo--empty";
    addButton.innerHTML = `<img src="assets/icon-photo.png" alt="" /><span class="photo-add-label">Add</span>`;
    addButton.addEventListener("click", () => triggerPhotoPicker(slot));
    slot.appendChild(addButton);
  }
}

function triggerPhotoPicker(slot) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.hidden = true;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => addPhoto(slot, reader.result);
    reader.readAsDataURL(file);
  });

  document.body.appendChild(input);
  input.click();
  input.addEventListener("change", () => input.remove(), { once: true });
}

function addPhoto(slot, dataUrl) {
  setPhotoSlot(slot, dataUrl);
  saveReport({ photos: currentPhotosFromDom().slice(0, MAX_PHOTOS) });
  flashUpdated(slot);
}

function removePhoto(slot) {
  setPhotoSlot(slot, null);
  saveReport({ photos: currentPhotosFromDom() });
}

/* ---- Issue detail: "Change a Detail" turns the text into a textarea */
function editDescription() {
  const textEl = document.querySelector(".issue-text");
  const currentValue = textEl.textContent.trim();

  const textarea = document.createElement("textarea");
  textarea.className = "issue-text-input";
  textarea.value = currentValue;
  textarea.rows = 4;

  const actions = buildSaveCancelRow(
    () => {
      const newValue = textarea.value.trim();
      saveReport({ description: newValue });
      textEl.textContent = newValue;
      swapIn(textarea.parentElement, textEl);
      flashUpdated(textEl);
    },
    () => swapIn(textarea.parentElement, textEl),
  );

  const container = document.createElement("div");
  container.appendChild(textarea);
  container.appendChild(actions);

  swapIn(textEl, container);
  textarea.focus();
}

/* ---- Location: a REAL map (Leaflet + OpenStreetMap tiles) */
const DEFAULT_MAP_CENTER = { lat: -36.8485, lng: 174.7633 }; // Auckland; used only until a real location is saved
let map = null;
let marker = null;
let locationEditActions = null;
let preEditLocation = null;

function initMap() {
  const report = getReport();
  const saved = report.location || {};
  const lat =
    typeof saved.lat === "number" ? saved.lat : DEFAULT_MAP_CENTER.lat;
  const lng =
    typeof saved.lng === "number" ? saved.lng : DEFAULT_MAP_CENTER.lng;

  map = L.map("mapCanvas", {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false,
    keyboard: false,
  }).setView([lat, lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  marker = L.marker([lat, lng]).addTo(map);

  document.getElementById("mapSection").classList.add("map--locked");
  document.getElementById("mapSection").addEventListener("click", () => {
    if (!editingLocation()) enableMapEditing();
  });

  document
    .getElementById("mapSearchButton")
    .addEventListener("click", handleAddressSearch);
  document
    .getElementById("mapAddressInput")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddressSearch();
      }
    });
}

function editingLocation() {
  return locationEditActions !== null;
}

function enableMapEditing() {
  if (editingLocation()) return;

  preEditLocation = {
    ...marker.getLatLng(),
    address: document.getElementById("location").value,
  };

  const section = document.getElementById("mapSection");
  section.classList.remove("map--locked");
  section.classList.add("map--editing");

  map.dragging.enable();
  map.scrollWheelZoom.enable();
  map.doubleClickZoom.enable();
  map.boxZoom.enable();
  map.touchZoom.enable();
  map.keyboard.enable();
  map.on("click", onMapClick);

  const addressSearch = document.getElementById("addressSearch");
  addressSearch.hidden = false;
  document.getElementById("mapAddressInput").value =
    document.getElementById("location").value;

  locationEditActions = buildSaveCancelRow(
    saveLocationEdit,
    cancelLocationEdit,
  );
  section.insertAdjacentElement("afterend", locationEditActions);
}

function finishMapEditing() {
  const section = document.getElementById("mapSection");
  section.classList.add("map--locked");
  section.classList.remove("map--editing");

  map.dragging.disable();
  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.touchZoom.disable();
  map.keyboard.disable();
  map.off("click", onMapClick);

  document.getElementById("addressSearch").hidden = true;

  if (locationEditActions) {
    locationEditActions.remove();
    locationEditActions = null;
  }
}

async function onMapClick(event) {
  const { lat, lng } = event.latlng;
  marker.setLatLng([lat, lng]);

  const address = await reverseGeocode(lat, lng);
  if (address) document.getElementById("mapAddressInput").value = address;
}

async function handleAddressSearch() {
  const query = document.getElementById("mapAddressInput").value.trim();
  if (!query) return;

  const result = await forwardGeocode(query);
  if (!result) {
    alert("Address not found.");
    return;
  }

  map.setView([result.lat, result.lng], 17);
  marker.setLatLng([result.lat, result.lng]);
  document.getElementById("mapAddressInput").value = result.address;
}

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocode failed.", error);
    return null;
  }
}

async function forwardGeocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name,
    };
  } catch (error) {
    console.error("Address search failed.", error);
    return null;
  }
}

function saveLocationEdit() {
  const { lat, lng } = marker.getLatLng();
  const address =
    document.getElementById("mapAddressInput").value.trim() ||
    document.getElementById("location").value;

  document.getElementById("location").value = address;
  saveReport({ location: { lat, lng, address } });

  finishMapEditing();
  flashUpdated(document.getElementById("mapSection"));
}

function cancelLocationEdit() {
  if (preEditLocation) {
    marker.setLatLng([preEditLocation.lat, preEditLocation.lng]);
    map.setView([preEditLocation.lat, preEditLocation.lng]);
    document.getElementById("location").value = preEditLocation.address;
  }
  finishMapEditing();
}

function buildSaveCancelRow(onSave, onCancel) {
  const row = document.createElement("div");
  row.className = "inline-edit-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", onSave);

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "inline-edit-cancel";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", onCancel);

  row.appendChild(saveButton);
  row.appendChild(cancelButton);
  return row;
}

function swapIn(oldNode, newNode) {
  oldNode.replaceWith(newNode);
}

function flashUpdated(element) {
  element.classList.add("just-updated");
  window.setTimeout(() => element.classList.remove("just-updated"), 1500);
}

/* ---- "Change a Detail" menu: picks WHICH field, edits happen here -- */
function createChangeDetailMenu() {
  const menu = document.createElement("div");
  menu.id = "changeDetailMenu";
  menu.className = "change-detail-menu";
  menu.hidden = true;

  menu.innerHTML = `
    <div class="change-detail-menu__panel" role="dialog" aria-modal="true" aria-labelledby="changeDetailHeading">
      <h2 id="changeDetailHeading">What do you need to change?</h2>
      <button type="button" data-field="description">Issue detail</button>
      <button type="button" data-field="photos">Photos</button>
      <button type="button" data-field="location">Location</button>
      <button type="button" class="change-detail-menu__cancel">Cancel</button>
    </div>
  `;

  document.body.appendChild(menu);

  menu.addEventListener("click", (event) => {
    if (event.target === menu) closeChangeDetailMenu(menu);
  });

  menu
    .querySelector(".change-detail-menu__cancel")
    .addEventListener("click", () => closeChangeDetailMenu(menu));

  const fieldHandlers = {
    description: editDescription,
    photos: () =>
      document
        .querySelector(".photo-list")
        .scrollIntoView({ behavior: "smooth", block: "center" }),
    location: enableMapEditing,
  };

  menu.querySelectorAll("button[data-field]").forEach((button) => {
    button.addEventListener("click", () => {
      closeChangeDetailMenu(menu);
      fieldHandlers[button.dataset.field]();
    });
  });

  return menu;
}

function openChangeDetailMenu() {
  const menu =
    document.getElementById("changeDetailMenu") || createChangeDetailMenu();
  menu.hidden = false;
}

function closeChangeDetailMenu(menu) {
  menu.hidden = true;
}

/* ---- Wire it all up ------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  renderReport(getReport());
  initMap();

  const changeButton = document.querySelector("footer button");
  if (changeButton) {
    changeButton.addEventListener("click", openChangeDetailMenu);
  }
});
