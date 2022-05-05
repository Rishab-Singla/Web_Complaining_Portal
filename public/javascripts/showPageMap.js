mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/dark-v10', // style URL
        center: complaint.geometry.coordinates, // starting position [lng, lat]
        zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(complaint.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset :25})
            .setHTML(
                `<h3>${complaint.title}</h3><p>${complaint.location}</p>`
            )
    )
    .addTo(map);
    
