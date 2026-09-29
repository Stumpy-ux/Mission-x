/* ====== Coded By Emily ====== */

// ========================================
// Map initialization
// ========================================


const map = L.map("map", {
  zoomControl: false
}).setView(
  [-36.8485, 174.7633], 13
);


L.control.zoom({
  position: "bottomright"
}).addTo(map);


L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      "&copy; OpenStreetMap contributors"
  }
).addTo(map);


let marker = null;


// ========================================
// Create popup
// ========================================

function createLocationPopup(address) {
  
  return `
  <div class="location-popup">
  
  <strong>
  Selected location
  </strong>
  
  <p>
  ${address}
  </p>
  
  <button
  type="button"
  class="confirm-location"
  >
  Confirm location
  </button>
  
  </div>
  `;
}


// ========================================
// Show popup
// ========================================

function showLocationPopup(address) {
  
  const maxPopupWidth = getMaxPopupWidth();
  
  
  marker
  .bindPopup(
    createLocationPopup(address),
    {
      autoPan: true,
      maxWidth: maxPopupWidth
    }
  )
  .openPopup();
}


// ========================================
// Get maximum popup width
// ========================================

function getMaxPopupWidth() {

  const mapElement =
    document.getElementById("map");

  const mapWidth =
    mapElement.clientWidth;

  return mapWidth * 0.8;
}


// ========================================
// Current location
// ========================================

const myLocationButton = document.getElementById(
    "getLocationButton"
  );


myLocationButton.addEventListener("click", function () {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      async function (position) {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        map.setView(
          [latitude, longitude],
          17
        );


        if (marker) {
          map.removeLayer(marker);
        }


        marker = L.marker(
          [latitude,longitude],
          {alt: "Selected issue location"}
        ).addTo(map);


        const url =
          `https://nominatim.openstreetmap.org/reverse?` +
          `lat=${latitude}` +
          `&lon=${longitude}` +
          `&format=json`;


        try {

          const response =
            await fetch(url);

          const data =
            await response.json();


          const address =
            data.display_name ||
            "Address unavailable";


          showLocationPopup(address);

        } catch (error) {

          console.error(error);

          marker
            .bindPopup(
              "Unable to find the address."
            )
            .openPopup();
        }
      },


      function (error) {

        console.error(error);

        alert(
          "Unable to get your location."
        );
      }
    );
});


// ========================================
// Address search
// ========================================

const addressInput = document.getElementById(
    "address"
  );


const searchButton = document.getElementById(
    "searchButton"
  );


addressInput.addEventListener("keydown", function (event) {

  if (event.key === "Enter") {

    searchButton.click();

  }
});


searchButton.addEventListener("click", async function () {

  const address =
    addressInput.value.trim();


  if (!address) {
    return;
  }


  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}` +
    `&format=json`;


  try {

    const response =
      await fetch(url);

    const data =
      await response.json();


    if (data.length === 0) {

      alert(
        "Address not found."
      );

      return;
    }


    const latitude =
      parseFloat(data[0].lat);

    const longitude =
      parseFloat(data[0].lon);


    map.setView(
      [latitude, longitude],
      17
    );


    if (marker) {
      map.removeLayer(marker);
    }


    marker = L.marker(
      [latitude,longitude],
      {alt: "Selected issue location"}
    ).addTo(map);


    showLocationPopup(
      data[0].display_name
    );

  } catch (error) {

    console.error(error);

    alert(
      "Unable to search for this address."
    );
  }
});


// ========================================
// Click on map
// ========================================

map.on("click", async function (event) {

  const latitude =
    event.latlng.lat;

  const longitude =
    event.latlng.lng;


  if (marker) {
    map.removeLayer(marker);
  }


  marker = L.marker(
    [latitude,longitude],
    {alt: "Selected issue location"}
  ).addTo(map);


  const url =
    `https://nominatim.openstreetmap.org/reverse?` +
    `lat=${latitude}` +
    `&lon=${longitude}` +
    `&format=json`;


  try {

    const response =
      await fetch(url);

    const data =
      await response.json();


    const address =
      data.display_name ||
      "Address unavailable";


    showLocationPopup(address);

  } catch (error) {

    console.error(error);

    marker
      .bindPopup(
        "Unable to find the address."
      )
      .openPopup();
  }
});


// ========================================
// Confirm location
// ========================================

document.addEventListener("click", function (event) {

  if (
    event.target &&
    event.target.classList.contains("confirm-location")
  ) {
      if (!marker) {
        return;
      }

      const position = marker.getLatLng();

      const locationData = {
        address: event.target
          .closest(".location-popup")
          .querySelector("p")
          .textContent,
        latitude: position.lat,
        longitude: position.lng
      };

      sessionStorage.setItem(
        "selectedLocation",
        JSON.stringify(locationData)
      );


      event.target.textContent = "✓ Location confirmed";
      event.target.disabled = true;

      console.log("Location confirmed", locationData);
    }

});