/*
 * 📝 TODO:
 * Center SVG Text properly (what if 1 word?)
 * Cluster our markers: https://github.com/mapbox/mapbox-gl-js/issues/4491
 * Do something sweet on Click
*/

// Import all of the nice things from Popmotion ❤️
// https://popmotion.io/
const { svg, css, timeline, physics, chain, delay, tween, easing } = window.popmotionXL;

const markers = [];

// ⚙️ HELPERS
// Get TranslateXY values of added object, returns array `[x, y]`
// https://stackoverflow.com/questions/21912684/how-to-get-value-of-translatex-and-translatey
function getComputedTranslateXY(obj) {
	const transArr = [];
    if(!window.getComputedStyle) return;
    const style = getComputedStyle(obj),
        transform = style.transform || style.webkitTransform || style.mozTransform;
    let mat = transform.match(/^matrix3d\((.+)\)$/);    
    if(mat) return parseFloat(mat[1].split(', ')[13]);
    mat = transform.match(/^matrix\((.+)\)$/);
    mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : 0;
    mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : 0;
    return transArr;
}

// Get X and Y Width of window
function getWindowXYSize() {
    const windowXY = [];
    const w = window;
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName('body')[0];
    const x = w.innerWidth||e.clientWidth||g.clientWidth;
    const y = w.innerHeight||e.clientHeight||g.clientHeight;
    windowXY.push(x, y)
    return windowXY;
}

// 🏄 ICONS
const iconCity = `
    <path class="e-marker__icon e-marker__icon--city" d="M41.1,68.7V58.5L36,53.4l-5.1,5.1v3.4H20.8v23.7h30.5V68.7H41.1z M27.5,82.2h-3.4v-3.4h3.4V82.2z M27.5,75.4h-3.4
	V72h3.4V75.4z M27.5,68.7h-3.4v-3.4h3.4V68.7z M37.7,82.2h-3.4v-3.4h3.4V82.2z M37.7,75.4h-3.4V72h3.4V75.4z M37.7,68.7h-3.4v-3.4
	h3.4V68.7z M37.7,61.9h-3.4v-3.4h3.4V61.9z M47.9,82.2h-3.4v-3.4h3.4V82.2z M47.9,75.4h-3.4V72h3.4V75.4z"/>
`;

var iconBeach = '\n  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="16px" y="50px" width="1500px" height="1500px" viewBox="0 0 1000 1000" enable-background="new 0 0 850.39 850.39" xml:space="preserve" class="hand">  <g>  <path class="e-marker__icon e-marker__icon--beach"   d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z"></path></g></svg> \n';


// 💻 DATA
var geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {
            "title": "REPÚBLICA MUKIFU",
            "imageUrl": "https://i.ytimg.com/vi/SZQz9o3RzC8/maxresdefault.jpg",
            "type": "beach",
            "iconSize": [60, 60]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-47.421278,-21.984655 ]
        }

    },
                {
        "type": "Feature",
        "properties": {
            "title": "REPÚBLICA POCILGA",
            "imageUrl": "https://fb-s-a-a.akamaihd.net/h-ak-fbx/v/t1.0-1/c91.0.200.200/p200x200/206752_200492026652391_7455393_n.jpg?oh=e789e251651617c50aa31f961a0556d7&oe=5A586365&__gda__=1512460277_4947795a507dbaf18cc95adb92c28054",
            "type": "beach",
            "iconSize": [100, 100]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-47.428573, -21.988822]
        }

    }, {
        "type": "Feature",
        "properties": {
            "title": "USP FZEA",
            "imageUrl": "http://brazil-dev.enactus.org/wp-content/uploads/sites/2/2015/08/FZEA-USP.png",
            "type": "city",
            "iconSize": [100, 100]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-47.429817, -21.982236]
        }

    },
                {
        "type": "Feature",
        "properties": {
            "title": "COVABRA MERCADO",
            "imageUrl": "https://comotrabalhar.org/wp-content/uploads/2016/08/vagas-covabra.jpg",
            "type": "city",
            "iconSize": [100, 100]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-47.425793, -22.000308]
        }

    }]
};

// 🌎 CREATE GLORIOUS MARKERS
function renderMarker(marker) {
    const { title, imageUrl, type } = marker.properties;
    const titleArr = title.split(' ');
    const titleLast = titleArr.slice(Math.ceil(titleArr.length / 2), titleArr.length);
    const titleFirst = titleArr.slice(0, Math.ceil(titleArr.length / 2));
    let currentIcon = '';
    
    switch(type) {
        case 'beach':
            currentIcon = iconBeach;
            break;
        case 'city':
            currentIcon = iconCity;
            break;
        case 'mountain':
            currentIcon = iconMountain;
            break;
        case 'jungle':
            currentIcon = iconJungle;
            break;
        default: 
            currentIcon = '';
    };
  
    return `
        <div>
            <svg class="e-marker" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 72 130.7" width="36">
                <defs>
                    <clipPath id="circle">
                        <path d="M36,97.4c15,0,27.3-12.2,27.3-27.3c0-15-12.2-27.3-27.3-27.3S8.7,55.1,8.7,70.2S21,97.4,36,97.4z"/>
                    </clipPath>
                </defs>
                <path class="e-marker__marker" d="M60.7,45.4C54.1,38.8,45.3,35.2,36,35.2c-9.3,0-18.1,3.6-24.7,10.3C4.6,52,1,60.8,1,70.2c0,6.3,1.5,11.6,4.6,16.7
      C8.4,91.3,12.1,95,16,98.9c7.3,7.2,15.5,15.4,19,30.5c0.1,0.5,0.5,0.8,1,0.8s0.9-0.3,1-0.8c3.5-15.1,11.7-23.3,19-30.5
      c3.9-3.9,7.6-7.6,10.4-12.1c3.1-5.1,4.6-10.3,4.6-16.7C71,60.8,67.4,52,60.7,45.4z M36,97.4c-15,0-27.3-12.2-27.3-27.3
      S21,42.9,36,42.9c15,0,27.3,12.2,27.3,27.3C63.3,85.2,51,97.4,36,97.4z"/>
          <path class="e-marker__circle" d="M36,97.4c15,0,27.3-12.2,27.3-27.3c0-15-12.2-27.3-27.3-27.3S8.7,55.1,8.7,70.2S21,97.4,36,97.4z"/>
                ${currentIcon}
                <image class="e-marker__image" width="100%" height="100%" clip-path="url(#circle)" xlink:href="${imageUrl}" />
                <text class="e-marker__text" transform="matrix(1 0 0 1 0 13.9998)">
                    <tspan x="50%" y="0" >${titleFirst.join(' ')}</tspan>
                    <tspan x="50%" y="13" >${titleLast.join(' ')}</tspan>      
                </text>
            </svg>
        </div>
    `;
}

// ➡️ Offset the map when a marker is too close to the edge for all sides but the bottom
function offSetMarker(marker, markerGrowSize, map) {
    // Set the max width and height of the marker and shrink it a bit by multiplying with 0.x. This is to compensate for padding around the marker
    const markerMaxWidth = (marker.offsetWidth * markerGrowSize) * 0.55;
    const markerMaxHeight = (marker.offsetHeight * markerGrowSize) * 0.7;
    const markerOffSetX = getComputedTranslateXY(marker)[0];
    const markerOffSetY = getComputedTranslateXY(marker)[1];
    if (
        markerOffSetY < markerMaxHeight
        || markerOffSetX < markerMaxWidth
        || (getWindowXYSize()[0] - markerOffSetX) < (markerMaxWidth + marker.offsetWidth)
    ) {
        let offSetY = 0;
        let offSetX = 0;

        if (markerOffSetY < markerMaxHeight) {            
            offSetY = markerOffSetY - markerMaxHeight;
        }

        if (markerOffSetX < markerMaxWidth) {
            offSetX = markerOffSetX - markerMaxWidth;
        }
        // Add `marker.offsetWidth` to this calculation because the position is calculated from top-left
        if((getWindowXYSize()[0] - markerOffSetX) < (markerMaxWidth + marker.offsetWidth)) {            
            offSetX = (markerMaxWidth + marker.offsetWidth) - (getWindowXYSize()[0] - markerOffSetX);
        }
        
        map.panBy([offSetX, offSetY]);
    }
}

// 🌎 MAP
function initMap(map) {
    const bounds = new mapboxgl.LngLatBounds();

    // ADD MARKERS TO MAP
    geojson.features.forEach((marker) => {
        const svgMarker = renderMarker(marker);
        // To get an actual DOM node instead of a string we append our marker to a dummy element and query it again with 'firstchild'. This way we retrieve a normal DOM node
        const placeholder = document.createElement('div');
        placeholder.innerHTML = svgMarker;
        const el = placeholder.firstChild;

        el.nextSibling.addEventListener('click', () => {
            map.flyTo({
                center: marker.geometry.coordinates,
                zoom: 15,
            });      
        });

        // Extend bounds with marker coordinates
        bounds.extend(marker.geometry.coordinates);

        markers.push(el.nextSibling);

        new mapboxgl.Marker(el.nextSibling, {offset: [0, -30]})
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
    });

    map.on('load', (e) => {
        setTimeout(() => {
            map.fitBounds(bounds, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                easing(t) {
                    return t * (2 - t);
                },
            });
        }, 300);
    });

    markers.forEach((marker) => {
        const markerSVG = marker.querySelector('svg');
        const markerIcon = marker.querySelector('.e-marker__icon');
        const markerImage = marker.querySelector('.e-marker__image');
        const markerText = marker.querySelector('.e-marker__text');

        const markerRenderer = css(markerSVG, { enableHardwareAcceleration: false });
        const iconRenderer = svg(markerIcon);
        const imageRenderer = css(markerImage);
        const textRenderer = css(markerText);

        const markerGrowSize = 3;

        const markerScale = physics({
            from: 1,
            to: markerGrowSize,
            velocity: 20,
            spring: 300,
            friction: 0.8,
            onUpdate: (x) => markerRenderer.set('scale', x),
        });

        const iconScale = tween({
            from: 1,
            to: 0,
            duration: 300,
            ease: easing.backIn,
            onUpdate: (x) => iconRenderer.set('scale', x),
        });

        const imageScale = tween({
            from: 0,
            to: 1,
            duration: 300,
            ease: easing.backOut,
            onUpdate: (x) => imageRenderer.set('scale', x),
        });

        const textToggle = tween({
            from: 0,
            to: 1,
            duration: 300,
            ease: easing.backOut,
            onUpdate: (x) => textRenderer.set('opacity', x),
        });

        const hoverTimeline = timeline([
            iconScale,
            '0',
            imageScale,
            '-100',
            textToggle,
        ]);

        marker.addEventListener('mouseenter', () => {
            offSetMarker(marker, markerGrowSize, map);
            markerScale.props.from = 1;
            markerScale.props.to = markerGrowSize;
            imageScale.props.playDirection = 1;
            iconScale.props.playDirection = 1;
            hoverTimeline.props.playDirection = 1;
            textToggle.props.playDirection = 1; 
            markerScale.start();
            hoverTimeline.start();  
        });

        marker.addEventListener('mouseleave', () => {
            markerScale.props.from = markerGrowSize;
            markerScale.props.to = 1;
            hoverTimeline.reverse();
            hoverTimeline.start();
            markerScale.start();
        });

    });
}

// 👉🏼 Fetch Map Style data - Vector tilesHosted by OpenMapTiles.com
fetch('https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json')
    .then(response => { 
	    return response.json();
    })
    .then(function(json) {
        const map = new mapboxgl.Map({
        container: 'map',
        style: json,
        zoom: 2,
        center: [-47.429817, -21.982236],
    });
    initMap(map);
});
