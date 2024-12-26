var map = L.map('map').setView([52.2297, 21.0122], 13); // Warszawa jako domyślny punkt

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker;

map.on('click', function(e) {
  if (marker) {
    marker.setLatLng(e.latlng); // Przesuń marker, jeśli już istnieje
  } else {
    marker = L.marker(e.latlng).addTo(map); // Dodaj nowy marker
  }
  console.log('Wybrany punkt:', e.latlng);
});

function generateIsochron(lat, lon, mode) {
    var url = `http://router.project-osrm.org/isoline?loc=${lat},${lon}&range=600&points=100&algorithm=MGRS&transport_mode=${mode}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        L.geoJSON(data).addTo(map); // Dodaj izochronę na mapie
      })
      .catch(error => console.error('Błąd podczas generowania izochrony:', error));
  }
  