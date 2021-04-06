'use strict'

let paikka = null;

// liitetään kartta elementtiin #map
const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
paivitaKartta({latitude: 64, longitude: 24}, 5);

// Asetukset paikkatiedon hakua varten (valinnainen)
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

// LEAFLET ROUTING CODE-------------------------------------------------

const discIcon = L.icon({
    iconUrl: 'Kuvat/fg-map_frisbee.png',
    iconSize: [30, 30]
})

let control = L.Routing.control({
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}

function lahtoCrd (crd) {
    control.spliceWaypoints(0, 1, {lat: crd.latitude, lng: crd.longitude});
}

map.on('click', function (e) {

    var container = L.DomUtil.create('div'),
        startBtn = createButton('Start from this location', container),
        destBtn = createButton('Go to this location', container);

    L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);

    L.DomEvent.on(startBtn, 'click', function() {
        control.spliceWaypoints(0, 1, e.latlng);
        map.closePopup();
    });

    L.DomEvent.on(destBtn, 'click', function() {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
        map.closePopup();
    });
});

//-------------------------------------------------------------------------

// Käynnistetään paikkatietojen haku
navigator.geolocation.getCurrentPosition(success, error, options);


function success(pos) {
    const omaSijainti = document.getElementById('omaSijainti')
    const crd = pos.coords;
    paikka = crd;

    // Tulostetaan paikkatiedot konsoliin
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);

    lahtoCrd(crd)

    sijaintiMarker(crd)

    omaSijainti.addEventListener('click', function (){

        //päivitä kartta
        paivitaKartta({latitude: crd.latitude, longitude: crd.longitude}, 11)

        // poista vanhat markerit
        poistaMarkerit()

        // lisää marker
        sijaintiMarker(crd);

        // hae asemat
        haeFGradat(crd);
    });
}

// funktio, joka keskittää kartan
function paivitaKartta(crd, zoom) {
    map.setView([crd.latitude, crd.longitude], zoom);
}

function sijaintiMarker(crd) {
    let merkki = L.marker([crd.latitude, crd.longitude])
    merkki.addTo(map)
        .bindPopup('Olen tässä')
}

// tehdään layergroup
let merkit = L.layerGroup().addTo(map)

// funktio, joka tekee markerin
function lisaaMarker(crd, radat, teksti) {

        var container = L.DomUtil.create('div'),
        destBtn = createButton('Reittiohjeet', container);
        let rata = document.createElement('p')
        rata.innerHTML = teksti
        container.appendChild(rata)

    L.DomEvent.on(destBtn, 'click', function() {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, {lat:crd.latitude, lng:crd.longitude});
        map.closePopup();
    });

    let merkki = L.marker([crd.latitude, crd.longitude], {icon: discIcon})
    merkki
        .addTo(merkit)
        .bindPopup(container)
        .on('click', function() {
        try {
            document.getElementById(
                'nimi').innerHTML = 'Radan nimi:' + ' ' + radat.name;

            document.getElementById(
                'osoite').innerHTML = 'Radan osoite:' + ' ' + radat.street_addr + ', ' +  radat.city;
            document.getElementById(
                'arvostelu').innerHTML = 'Arvostelut:' + ' ' + radat.rating;
            document.getElementById('lisätiedot').href = radat.dgcr_url;
             // navigointinappi
            document.querySelector('#navigoi a').href = `https://www.google.com/maps/dir/?api=1&origin=${paikka.latitude},${paikka.longitude}&destination=${crd.latitude},${crd.longitude}&travelmode=driving`;
        } catch (e) {}
        haeRataKuva()
    });
}

// Funktio, joka ajetaan, jos paikkatietojen hakemisessa tapahtuu virhe
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function k(s) {

    const rataID = []
    let nimi = document.getElementById('nimi').valueOf()

    for (let i = 0; i < s.length; i++) {

        if (s[i].name == nimi) {
            rataID.push(s[i].course_id)
        }
    }
}

function haeRataKuva() {

    k()

        function haeID() {
            fetch(`https://cors-anywhere.herokuapp.com/https://www.dgcoursereview.com/api/index.php?key=6h2cozd1c70cy2dzuzas00im&mode=crseinfo&id=${rataID}&sig=1a7feff3e83a22b07053c68dde9b162f`)
                .then(function (vastaus) {
                    console.log('palvelimen vastaus', vastaus);
                    return vastaus.json();
                })
                .then(function (FGradat) {
                    console.log('tulos', FGradat);
                    let ratakuva = document.getElementById('rataKuva')
                    ratakuva.src = FGradat.course_photo_url_medium
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        haeID()
    }

function haeFGradat() {

    // poista vanhat markerit
    poistaMarkerit()
    // Adding layer group to map
    merkit.addTo(map)

    console.log(radat)

    for (let i = 0; i < radat.length; i++) {
        const rata = {
            latitude: radat[i].latitude,
            longitude: radat[i].longitude


        }
        lisaaMarker(rata, radat[i], radat[i].name)
    }
    const lista = document.querySelector('#radat');
    for (let i = 0; i < 5; i++) {
        const nimi = (radat[i].name);
        const listItem = document.createElement('li')
        listItem.innerText = nimi
        lista.appendChild(listItem)
    }
}

const nappi = document.getElementById('nappi');

nappi.addEventListener('click', function () {
        poistaMarkerit()

        console.log(EspoonRadat)

        function eRadat() {
            for (let i = 0; i < EspoonRadat.length; i++) {
                const rata = {
                    latitude: EspoonRadat[i].latitude,
                    longitude: EspoonRadat[i].longitude
                }
                lisaaMarker(rata, EspoonRadat[i], EspoonRadat[i].name)
            }
        }

        eRadat()
    })

const poistaMarkeritnappi = document.getElementById('poista')
    poistaMarkeritnappi.addEventListener('click', function () {
        merkit.clearLayers()
    })

function poistaMarkerit() {
        merkit.clearLayers()
}





