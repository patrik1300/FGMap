'use strict';

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

const discIcon = L.icon({
    iconUrl: 'Kuvat/fg-map_frisbee.png',
    iconSize: [30, 30]
})

// LEAFLET ROUTING CODE-------------------------------------------------

let control = L.Routing.control({
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim(),
    collapsible: true
}).addTo(map)

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
        startBtn.id ='start';
        destBtn.id ='dest';

    L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);

    L.DomEvent.on(startBtn, 'click', function() {
        control.spliceWaypoints(0, 1, e.latlng)
        map.closePopup();

    });

    L.DomEvent.on(destBtn, 'click', function() {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
        map.closePopup();
    });
    console.log(e)
});

//-------------------------------------------------------------------------

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
        // päivitä kartta
        paivitaKartta({latitude: crd.latitude, longitude: crd.longitude}, 11)

        // poista vanhat markerit
        poistaMarkerit()

        // lisää marker
        sijaintiMarker(crd);

        // hae radat
        haeFGradat(crd);
    });
}


//___________________________________________________________________________________________


// funktio, joka keskittää kartan
function paivitaKartta(crd, zoom) {
    map.setView([crd.latitude, crd.longitude], zoom);
}

function sijaintiMarker(crd) {
    let merkki = L.marker([crd.latitude, crd.longitude])
    merkki.addTo(map)
        .bindPopup('Olet tässä')
}

// tehdään layergroup
let merkit = L.layerGroup().addTo(map)

// funktio, joka tekee markerin
function lisaaMarker(crd, radat, teksti) {

    var container = L.DomUtil.create('div'),
        destBtn = createButton('Reittiohjeet', container);
        destBtn.id ='reittiohjeet';
    let rata = document.createElement('p')
    rata.innerHTML = teksti
    container.appendChild(rata)

    L.DomEvent.on(destBtn, 'click', function() {
        control.spliceWaypoints(control.getWaypoints().length - 1, 1, {lat:crd.latitude, lng:crd.longitude});
        map.closePopup();
    });

    let def = document.getElementById('default')
    //def.innerHTML = ''

    let merkki = L.marker([crd.latitude, crd.longitude], {icon: discIcon})
    merkki
        .addTo(merkit)
        .bindPopup(container)
        .on('click', function() {
            def.remove();
        try {
            document.getElementById(
                'nimi').innerHTML = 'Radan nimi:' + '</br>' + radat.name;

            document.getElementById(
                'osoite').innerHTML = 'Radan osoite:' + '</br>' + radat.street_addr + ', ' +  radat.city;

            document.getElementById(
                'pisteet').innerHTML = 'pisteet:' + '</br>'

            document.getElementById(
                'arv').innerHTML = 'Arvostelut:'

            document.getElementById('pisteet').src = radat.rating_img;

            document.getElementById('infoLinkki').innerHTML = 'Lisätiedot';

            document.getElementById('infoLinkki').href = radat.dgcr_url;
        } catch (e) {}
    });
}

// Funktio, joka ajetaan, jos paikkatietojen hakemisessa tapahtuu virhe
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

/* function haeRataKuva() {

    const rataID = []

    for (let i = 0; i<radat.length; i++) {
        if (radat[i].name == 'Talin Huippu') {
            rataID.push(radat[i].course_id)
        }
    }

    function haeID() {
        fetch(`https://cors-anywhere.herokuapp.com/https://www.dgcoursereview.com/api/index.php?key=6h2cozd1c70cy2dzuzas00im&mode=crseinfo&id=${rataID}&sig=1a7feff3e83a22b07053c68dde9b162f`)
            .then(function(vastaus) {
                console.log('palvelimen vastaus', vastaus);
                return vastaus.json();
            })
            .then(function(FGradat) {
                console.log('tulos', FGradat);
                let ratakuva = document.getElementById('rataKuva')
                ratakuva.src = FGradat.course_photo_url_medium
            })
            .catch(function(error) {
                console.log(error);
            });
    } haeID()
} */

// Käynnistetään paikkatietojen haku
navigator.geolocation.getCurrentPosition(success, error, options);

//Hakee oman sijainnin mukaan
function haeFGradat(crd) {
    poistaMarkerit()
    merkit.addTo(map)
    fetch(`https://cors-anywhere.herokuapp.com/https://www.dgcoursereview.com/api/index.php?key=6h2cozd1c70cy2dzuzas00im&mode=near_rad&lat=${crd.latitude}&lon=${crd.longitude}&limit=10&rad=20&sig=bcc2f23f9b870904df1e697f15e0b849`).
    then(function(vastaus) {
        console.log('palvelimen vastaus', vastaus);
        return vastaus.json();
    }).
    then(function(FGradat) {
        console.log('tulos', FGradat);

        for (let i = 0; i < FGradat.length; i++) {
            const sijainti = {
                longitude: FGradat[i].longitude,
                latitude: FGradat[i].latitude,
            };
            lisaaMarker(sijainti, FGradat[i], FGradat[i].name);
        }
    })
   .catch(function(error) {
        console.log(error);
    });
}


//_________________Hakee hakusanalla__________________________________________

const hakukentta = document.getElementById('hakukentta');
const nappi = document.getElementById('nappi');

nappi.addEventListener('click', function () {const hakusana = hakukentta.value;
    poistaMarkerit()
    merkit.addTo(map)
    fetch(`https://cors-anywhere.herokuapp.com/https://www.dgcoursereview.com/api/index.php?key=6h2cozd1c70cy2dzuzas00im&mode=findloc&city=${hakusana}&country=FI&sig=75373ec0ff867c1032c52abe6ddf7e96`).
    then(function(vastaus) {
        console.log('palvelimen vastaus', vastaus);
        return vastaus.json();
    }).
    then(function(FGradat) {
        console.log('tulos', FGradat);

        for (let i = 0; i < FGradat.length; i++) {
            const sijainti = {
                longitude: FGradat[i].longitude,
                latitude: FGradat[i].latitude,
            };
            lisaaMarker(sijainti, FGradat[i], FGradat[i].name);
        }

    }).
    catch(function(error) {
        console.log(error);
    });
});

/*const poistaMarkeritnappi = document.getElementById('poista')
poistaMarkeritnappi.addEventListener('click', function () {
    merkit.clearLayers()
})*/

function poistaMarkerit () {
    merkit.clearLayers()
}


