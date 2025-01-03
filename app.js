// Inicjalizacja mapy
var map = L.map('map').setView([54.37324226722646, 18.615535036114153], 12); // Ustawienie na Warszawę

// Dodanie warstwy mapy (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker; // Zmienna przechowująca marker
var poligony = []; // Tablica do przechowywania poligonów

// Dodanie kontrolki geokodera do mapy (wyszukiwanie adresów)
var geocoder = L.Control.Geocoder.nominatim();
L.Control.geocoder({
    geocoder: geocoder,
    position: 'topright', // Pozycja kontrolki wyszukiwania
    placeholder: 'Wyszukaj adres',
    collapsed: false // Rozwinięta kontrolka
}).addTo(map);

// Funkcja dodająca marker w miejscu kliknięcia na mapie
map.on('click', function(e) {
    if (marker) {
        marker.setLatLng(e.latlng); // Przemieszczanie markera, jeśli już istnieje
    } else {
        marker = L.marker(e.latlng).addTo(map); // Dodawanie nowego markera
    }
    console.log('Wybrany punkt:', e.latlng);
});

// Funkcja generująca izochrony (poligony)
function generateIsochron(mode) {
    if (!marker) {
        alert("Wybierz punkt na mapie.");
        return;
    }

    var lat = marker.getLatLng().lat;
    var lon = marker.getLatLng().lng;

    // Pobieranie wybranego czasu podróży
    var timeLimit = document.getElementById("timeSelect").value;
    
    // Twój klucz API z GraphHopper
    var apiKey = '7e539117-ecab-4f5c-b7ab-ed83f1fd4825'; 

    // Konstrukcja URL do GraphHopper
    var url = `https://graphhopper.com/api/1/isochrone?point=${lat},${lon}&time_limit=${timeLimit * 60}&vehicle=${mode}&key=${apiKey}`;

    // Logowanie zapytania
    console.log("Zapytanie do API:", url);

    // Wysłanie zapytania do API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Odpowiedź z API:', data);  // Logowanie odpowiedzi

            // Sprawdzamy, czy odpowiedź zawiera dane w formacie, który możemy zamienić na GeoJSON
            if (data && data.polygons && data.polygons.length > 0) {
                var polygonCoordinates = data.polygons[0].geometry.coordinates;
                console.log('Współrzędne poligonu:', polygonCoordinates);  // Logowanie współrzędnych

                var polygonColor;
                var fillColor;
                if (mode === 'car') {
                    polygonColor = 'red'; // Czerwony dla samochodu
                    fillColor = 'rgba(255, 0, 0, 0.3)'; // Wypełnienie czerwone
                } else if (mode === 'bike') {
                    polygonColor = 'green'; // Zielony dla roweru
                    fillColor = 'rgba(0, 255, 0, 0.3)'; // Wypełnienie zielone
                } else if (mode === 'foot') {
                    polygonColor = 'blue'; // Niebieski dla pieszo
                    fillColor = 'rgba(0, 0, 255, 0.3)'; // Wypełnienie niebieskie
                }
                
                // Konwersja danych na GeoJSON
                var geoJson = {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: polygonCoordinates  // Współrzędne muszą być tablicą tablic współrzędnych
                        },
                        properties: {}
                    }]
                };

                // Dodanie GeoJSON do mapy
                var polygonLayer = L.geoJSON(geoJson, {
                    style: {
                        color: polygonColor,        // Kolor krawędzi poligonu
                        weight: 2,                  // Grubość linii
                        opacity: 0.7,               // Przezroczystość krawędzi
                        fillColor: fillColor,       // Kolor wypełnienia
                        fillOpacity: 0.3            // Przezroczystość wypełnienia
                    }
                }).addTo(map);

                // Przechowywanie poligonu w tablicy
                poligony.push(polygonLayer); // Przechowuj warstwę, a nie zmienną polygonLayer

                // Wymuszenie renderowania mapy
                map.invalidateSize();
            } else {
                console.error('Błąd: Brak danych w polu polygons.');
            }
        })
        .catch(error => {
            console.error('Błąd podczas generowania izochrony:', error);
        });
}

// Funkcja ukrywająca wszystkie poligony
function hidePolygons() {
    poligony.forEach(function(polygon) {
        polygon.setStyle({ 
            opacity: 0,               // Ustawienie przezroczystości na 0 dla krawędzi
            fillOpacity: 0            // Ustawienie przezroczystości na 0 dla wypełnienia
        });
    });
}

// Funkcja pokazująca wszystkie poligony
function showPolygons() {
    poligony.forEach(function(polygon) {
        polygon.setStyle({ 
            opacity: 0.7,             // Przywrócenie przezroczystości krawędzi
            fillOpacity: 0.3          // Przywrócenie przezroczystości wypełnienia
        });
    });
}

// Funkcja usuwająca wszystkie poligony
function removePolygons() {
    poligony.forEach(function(polygon) {
        map.removeLayer(polygon); // Usunięcie poligonu z mapy
    });
    poligony = []; // Czyszczenie tablicy z poligonami
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

// Dodanie event listenerów dla przycisków do kontroli widoczności poligonów
document.getElementById('hidePolygonsBtn').addEventListener('click', function() {
    hidePolygons(); // Ukrywanie poligonów
});

document.getElementById('showPolygonsBtn').addEventListener('click', function() {
    showPolygons(); // Pokazywanie poligonów
});

document.getElementById('removePolygonsBtn').addEventListener('click', function() {
    removePolygons(); // Usuwanie poligonów
});
