/*
const apiOsoite = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

// haetaan pysakit koordiaattien avulla
function haePysakitKoordinaateilla(crd, dist) {
    // GraphQL haku
    const haku = `{
                  plan(
                    from: {lat: 60.168992, lon: 24.932366}
                    to: {lat: 60.175294, lon: 24.684855}
                    numItineraries: 3
                  ) {
                    itineraries {
                      legs {
                        startTime
                        endTime
                        mode
                        duration
                        realTime
                        distance
                        transitLeg
                        legGeometry {
                            lenght
                            points
                        }
                      }
                    }
                  }
                }`;

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({query: haku}), // GraphQL haku lisätään queryyn
    };

    // lähetetään haku
    fetch(apiOsoite, fetchOptions).then(function(vastaus) {
        return vastaus.json();
    }).then(function(tulos) {
        console.log(tulos);

        // tulostetaan pysäkit
        const reitti = tulos.data.plan.itineraries;
        for (let i = 0; i < pysakit.length; i++) {
            const nimi = reitti[i].legs
            const kuvaus = reitti[i].



            console.log(`<p>${nimi}, koordinaatit: ${latitude}, ${longitude}</p>`);
            document.getElementById(
                'tulosta').innerHTML += `<p>
                                              ${nimi}, ${kuvaus}, 
                                              koordinaatit: ${latitude}, ${longitude}, 
                                              bussit: ${joinObj(linjat)}
                                            </p>`;
        }
    }).catch(function(e) {
        console.error(e.message);
    });
}

// tällä funktiolla yhdistetään taulukko, jossa bussilinjojen tunnukset (shortName)
function joinObj(taulukko) {
    const out = [];
    for (let i = 0; i < taulukko.length; i++) {
        out.push(taulukko[i].shortName);
    }
    return out.join(', ');
}

// käynnistetään pysäkkien haku halutuista koordinaateista 500 metrin säteellä
haePysakitKoordinaateilla({latitude: 60.22417, longitude: 24.7582}, 500)

function lisaaMarker(crd, rata, teksti = 'Olen tässä') {
    L.marker([crd.latitude, crd.longitude]).
    addTo(map).
    bindPopup(teksti).
    on('click', function() {
        try {
            document.getElementById(
                'nimi').innerHTML = 'Radan nimi:' + ' ' + rata.name;
            document.getElementById(
                'osoite').innerHTML = 'Radan osoite:' + ' ' + rata.street_addr + ', ' +  rata.city;
            document.getElementById(
                'arvostelu').innerHTML = 'Arvostelut:' + ' ' + rata.rating;

            // lisätiedot linkki
            document.getElementById('lisatiedot').innerHTML = 'lisatiedot'
            document.getElementById('lisatiedot').href = rata.dgcr_url;

            // navigointinappi
            document.querySelector('#navigoi a').href = `https://www.google.com/maps/dir/?api=1&origin=${paikka.latitude},${paikka.longitude}&destination=${crd.latitude},${crd.longitude}&travelmode=driving`;
        } catch (e) {}
    });
}

*/
document.getElementById('nappi').addEventListener('click', function() {

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

            FGradat.course_photo_url_medium
        })
        .catch(function(error) {
            console.log(error);
    });
} haeID()
    function haeKuva () {

    }
})

