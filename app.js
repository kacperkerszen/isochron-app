// Inicjalizacja mapy
var map = L.map('map').setView([52.2297, 21.0122], 13); // Ustawienie na Warszawę

// Dodanie warstwy mapy (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker; // Zmienna przechowująca marker

// Funkcja dodająca marker w miejscu kliknięcia na mapie
map.on('click', function(e) {
    if (marker) {
        marker.setLatLng(e.latlng); // Przemieszczanie markera, jeśli już istnieje
    } else {
        marker = L.marker(e.latlng).addTo(map); // Dodawanie nowego markera
    }
    console.log('Wybrany punkt:', e.latlng); // Logowanie współrzędnych
});

// Funkcja generująca izochrony (poligony)
function generateIsochron(mode) {
    if (!marker) {
        alert("Wybierz punkt na mapie.");
        return;
    }

    var lat = marker.getLatLng().lat;
    var lon = marker.getLatLng().lng;

    // Twój klucz API z GraphHopper
    var apiKey = '7e539117-ecab-4f5c-b7ab-ed83f1fd4825'; 

    // Konstrukcja URL do GraphHopper
    var url = `https://graphhopper.com/api/1/isochrone?point=${lat},${lon}&time_limit=600&vehicle=${mode}&key=${apiKey}`;

    // Logowanie zapytania
    console.log("Zapytanie do API:", url);

    // Wysłanie zapytania do API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Odpowiedź z API:', data);  // Logowanie odpowiedzi

            // Sprawdzamy, czy odpowiedź zawiera dane w formacie, który możemy zamienić na GeoJSON
            if (data && data.polygons && data.polygons.length > 0) {
                var polygonCoordinates = data.polygons[0];
                console.log('Współrzędne poligonu:', polygonCoordinates);  // Logowanie współrzędnych

                // Konwersja danych na GeoJSON
                var geoJson = {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [polygonCoordinates]  // Współrzędne muszą być tablicą tablic współrzędnych
                        },
                        properties: {}
                    }]
                };

                // Dodanie GeoJSON do mapy
                L.geoJSON(geoJson, {
                    style: {
                        color: 'blue',  // Kolor poligonu
                        weight: 2,      // Grubość linii
                        opacity: 1      // Przezroczystość
                    }
                }).addTo(map);
            } else {
                console.error('Błąd: Brak danych w polu polygons.');
            }
        })
        .catch(error => {
            console.error('Błąd podczas generowania izochrony:', error);
        });
}

// Dodanie event listenerów dla przycisków
document.getElementById('carBtn').addEventListener('click', function() {
    generateIsochron('car'); // Samochód
});

document.getElementById('footBtn').addEventListener('click', function() {
    generateIsochron('foot'); // Pieszo
});

document.getElementById('bikeBtn').addEventListener('click', function() {
    generateIsochron('bike'); // Rower
});
