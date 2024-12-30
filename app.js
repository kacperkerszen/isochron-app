// Inicjalizacja mapy
var map = L.map('map').setView([52.2297, 21.0122], 13); // Ustawienie na Warszawę

// Dodanie warstwy mapy (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker; // Zmienna przechowująca marker
var poligony = []; // Tablica do przechowywania poligonów

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
                if (mode === 'car') {
                    polygonColor = 'red'; // Czerwony dla samochodu
                } else if (mode === 'bike') {
                    polygonColor = 'green'; // Zielony dla roweru
                } else if (mode === 'foot') {
                    polygonColor = 'blue'; // Niebieski dla pieszo
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
                L.geoJSON(geoJson, {
                    style: {
                        color: polygonColor,  // Kolor poligonu
                        weight: 2,      // Grubość linii
                        opacity: 0.7      // Przezroczystość
                    }
                }).addTo(map);

                // Przechowywanie poligonu w tablicy
                poligony.push(polygonLayer);

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
        polygon.setStyle({ opacity: 0 }); // Ustawienie przezroczystości na 0 (ukrycie)
    });
}

// Funkcja pokazująca wszystkie poligony
function showPolygons() {
    poligony.forEach(function(polygon) {
        polygon.setStyle({ opacity: 0.7 }); // Przywrócenie przezroczystości
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