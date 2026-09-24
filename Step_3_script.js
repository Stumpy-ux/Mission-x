/* const map = L.map("map").setView(
  [-36.8485, 174.7633],
  13
);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);

let marker = null;

const selectedLocation =
  document.getElementById("selectedLocation");

const confirmButton =
  document.getElementById("confirmButton"); */

/* map.on("click", function (event) {

  const latitude = event.latlng.lat;
  const longitude = event.latlng.lng;

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([
    latitude,
    longitude
  ]).addTo(map);

  selectedLocation.textContent =
    `Selected location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  confirmButton.disabled = false;
});

const addressInput =
  document.getElementById("address");

const searchButton =
  document.getElementById("searchButton");

searchButton.addEventListener("click", async function () {

  const address = addressInput.value.trim();

  if (!address) {
    return;
  }

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}` +
    `&format=json`;

  const response = await fetch(url);

  const data = await response.json();

  if (data.length === 0) {
    alert("Address not found.");
    return;
  }

  const latitude = parseFloat(data[0].lat);
  const longitude = parseFloat(data[0].lon);

  map.setView(
    [latitude, longitude],
    17
  );

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([
    latitude,
    longitude
  ]).addTo(map);

  selectedLocation.textContent =
    `Selected location: ${data[0].display_name}`;

  confirmButton.disabled = false;
});

confirmButton.addEventListener("click", function () {

  if (!marker) {
    return;
  }

  const position = marker.getLatLng();

  console.log("Confirmed location:");
  console.log("Latitude:", position.lat);
  console.log("Longitude:", position.lng);

  alert("Location confirmed!");
}); */


// map initialization
/* const map = L.map("map").setView(
  [-36.8485, 174.7633],
  13
);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);


// Marker variable
let marker = null;


// Get user's location
const myLocationButton =
  document.getElementById("myLocationButton");

myLocationButton.addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Move map to user's location
      map.setView([latitude, longitude], 17);

      // Remove existing marker
      if (marker) {
        map.removeLayer(marker);
      }

      // Add marker at user's location
      /* marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Your location")
        .openPopup();
    }, */
    
    /* marker = L.marker([
      latitude, 
      longitude
    ]).addTo(map);


// Reverse geocoding
      const url =
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${latitude}` +
        `&lon=${longitude}` +
        `&format=json`;

      try {

        const response = await fetch(url);
        const data = await response.json();

        const address = data.display_name;


        // Show address in popup
        marker
          .bindPopup(`
            <div class="location-popup">
              <strong>Selected location</strong>
              <p>${address}</p>
              <button id="confirmLocation">
                Confirm location
              </button>
            </div>
          `)
          .openPopup();

      } catch (error) {

        console.error(error);

        marker
          .bindPopup("Unable to find the address.")
          .openPopup();
      }

    },

    

    function (error) {
      console.error(error);
      alert("Unable to get your location.");
    }
  );
});


let marker = null;

const addressInput = document.getElementById("address");
const searchButton = document.getElementById("searchButton");


// Search button
addressInput.addEventListener("keydown", function (event) {

  if (event.key === "Enter") {
    searchButton.click();
  }

});


searchButton.addEventListener("click", async function () {

  const address = addressInput.value.trim();

  if (!address) {
    return;
  }

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}` +
    `&format=json`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      alert("Address not found.");
      return;
    }

    const latitude = parseFloat(data[0].lat);
    const longitude = parseFloat(data[0].lon);

    // Move map
    map.setView(
      [latitude, longitude],
      17
    );

    // Remove old marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Create marker
    marker = L.marker([
      latitude,
      longitude
    ]).addTo(map);

    // Show address
    marker
      .bindPopup(`
        <div class="location-popup">
          <strong>Selected location</strong>
          <p>${data[0].display_name}</p>
          <button id="confirmLocation">
            Confirm location
          </button>
        </div>
      `)
      .openPopup();

  } catch (error) {

    console.error(error);
    alert("Unable to search for this address.");

  }

});


map.on("click", async function (event) {

  const latitude = event.latlng.lat;
  const longitude = event.latlng.lng;

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([
    latitude,
    longitude
  ]).addTo(map);

  // Reverse geocoding
  const url =
    `https://nominatim.openstreetmap.org/reverse?` +
    `lat=${latitude}` +
    `&lon=${longitude}` +
    `&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  const address = data.display_name;

  const popupContent = `
    <div class="location-popup">
      <strong>Selected location</strong>

      <p>${address}</p>

      <button id="confirmLocation">
        Confirm location
      </button>
    </div>
  `;

  marker
    .bindPopup(popupContent)
    .openPopup();
}); */




// map initialization
/* const map = L.map("map").setView(
  [-36.8485, 174.7633],
  13
); */
const map = L.map("map", {
  zoomControl: false
}).setView([-36.8485, 174.7633], 13);

L.control.zoom({
  position: "bottomright"
}).addTo(map);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);


// Marker variable
let marker = null;


// Get user's location
const myLocationButton =
  document.getElementById("myLocationButton");

myLocationButton.addEventListener("click", function () {

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function (position) {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Move map to user's location
      map.setView([latitude, longitude], 17);

      // Remove existing marker
      if (marker) {
        map.removeLayer(marker);
      }

      // Add marker
      marker = L.marker([
        latitude,
        longitude
      ]).addTo(map);


      // Reverse geocoding
      const url =
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${latitude}` +
        `&lon=${longitude}` +
        `&format=json`;

      try {

        const response = await fetch(url);
        const data = await response.json();

        const address = data.display_name;


        // Show address in popup
        marker
          .bindPopup(`
            <div class="location-popup">
              <strong>Selected location</strong>
              <p>${address}</p>
              <button id="confirmLocation">
                Confirm location
              </button>
            </div>
          `)
          .openPopup();

      } catch (error) {

        console.error(error);

        marker
          .bindPopup("Unable to find the address.")
          .openPopup();
      }

    },

    function (error) {
      console.error(error);
      alert("Unable to get your location.");
    }
  );

});


// Address search
const addressInput =
  document.getElementById("address");

const searchButton =
  document.getElementById("searchButton");


// Press Enter to search
addressInput.addEventListener("keydown", function (event) {

  if (event.key === "Enter") {
    searchButton.click();
  }

});


// Search button
searchButton.addEventListener("click", async function () {

  const address = addressInput.value.trim();

  if (!address) {
    return;
  }

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}` +
    `&format=json`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
      alert("Address not found.");
      return;
    }

    const latitude = parseFloat(data[0].lat);
    const longitude = parseFloat(data[0].lon);

    // Move map
    map.setView(
      [latitude, longitude],
      17
    );

    // Remove old marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Create marker
    marker = L.marker([
      latitude,
      longitude
    ]).addTo(map);


    // Show address
    marker
      .bindPopup(`
        <div class="location-popup">
          <strong>Selected location</strong>
          <p>${data[0].display_name}</p>
          <button id="confirmLocation">
            Confirm location
          </button>
        </div>
      `)
      .openPopup();

  } catch (error) {

    console.error(error);
    alert("Unable to search for this address.");

  }

});


// Click directly on map
map.on("click", async function (event) {

  const latitude = event.latlng.lat;
  const longitude = event.latlng.lng;

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([
    latitude,
    longitude
  ]).addTo(map);


  // Reverse geocoding
  const url =
    `https://nominatim.openstreetmap.org/reverse?` +
    `lat=${latitude}` +
    `&lon=${longitude}` +
    `&format=json`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    const address = data.display_name;


    const popupContent = `
      <div class="location-popup">
        <strong>Selected location</strong>
        <p>${address}</p>
        <button id="confirmAddress">
          Confirm address
        </button>
      </div>
    `;

    marker
      .bindPopup(popupContent)
      .openPopup();

  } catch (error) {

    console.error(error);

    marker
      .bindPopup("Unable to find the address.")
      .openPopup();
  }

});