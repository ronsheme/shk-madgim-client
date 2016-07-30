var plainSelected = false;
var SELECTED_PLAIN_COLOR = 'red';
var PLAIN_COLOR = '#226688';
var selectedPlainId;
var STATIC_FILE_BASE_URL = location.origin + location.pathname + 'static';
//    var STATIC_FILE_BASE_URL = "23.251.132.20" + location.pathname + 'static';
var NUM_OF_ITEMS = 10;
var SPEED_FACTOR = 100;

var style = {
    "version": 8,
    "sources": {
        "countries": {
            "type": "vector",
            "tiles": [STATIC_FILE_BASE_URL + "/countries/{z}/{x}/{y}.pbf"],
            "maxzoom": 6
        }
    },
    "glyphs": STATIC_FILE_BASE_URL + "/font/{fontstack}/{range}.pbf",
    "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
            "background-color": "#00001E"
        }
    }, {
        "id": "country-glow-outer",
        "type": "line",
        "source": "countries",
        "source-layer": "country",
        "layout": {
            "line-join": "round"
        },
        "paint": {
            "line-color": "#226688",
            "line-width": 5,
            "line-opacity": {
                "stops": [[0, 0], [1, 0.1]]
            }
        }
    }, {
        "id": "country-glow-inner",
        "type": "line",
        "source": "countries",
        "source-layer": "country",
        "layout": {
            "line-join": "round"
        },
        "paint": {
            "line-color": "#226688",
            "line-width": {
                "stops": [[0, 1.2], [1, 1.6], [2, 2], [3, 2.4]]
            },
            "line-opacity": 0.8,
        }
    }, {
        "id": "country",
        "type": "fill",
        "source": "countries",
        "source-layer": "country",
        "paint": {
            "fill-color": "#000"
        }
    }, {
        "id": "land-border-country",
        "type": "line",
        "source": "countries",
        "source-layer": "land-border-country",
        "paint": {
            "line-color": "#fff",
            "line-opacity": 0.5,
            "line-width": {
                "base": 1.5,
                "stops": [[0, 0], [1, 0.8], [2, 1]]
            }
        }
    }]
};

var map = new mapboxgl.Map({
    container: 'map',
    center: [8.3221, 46.5928],
    zoom: 1,
    style: style
});


// disable map rotation using right click + drag
map.dragRotate.disable();
``
// disable map rotation using touch rotation gesture
//    map.touchZoomRotate.disableRotation();

map.addControl(new mapboxgl.Navigation());
var container = map.getCanvasContainer();
var svg = d3.select(container).append("svg")
var transform = d3.geo.transform({point: projectPoint});
var path = d3.geo.path().projection(transform);
var plain, sliderIndex = 0;
var plainsJSON;
var plainController = [];
var currentTimestamp;

var width = 970,
    height = 500,
    brushHeight = 60;

var minValue, maxValue, currentValue, targetValue, trailLength = 30, alpha = .25;

var dots = [];
var formatMinute = d3.format("+.0f");

// initData();

function setCurrentTimestamp(time) {
    currentTimestamp = time;
}

function getCurrentTimestamp() {
    return currentTimestamp;
}

function initlize() {
    // minValue = 0;
    // // todo take the max timestamp
    // maxValue = currentValue = targetValue = plainsData.items[0].path.coordinates.length - 1;

    plain = svg.selectAll(".g-plain")
        .data(plainsJSON.items)
        .enter().append("g")
        .attr("class", function (d) {
            return "g-plain g-plain-" + d.id;
        }).on("click", onClick)

    plain.append("path").attr({
        d: "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z",
        'stroke-width': 0}).attr('fill', PLAIN_COLOR).attr("transform", "scale(0.4)");
}


function onClick(d) {
    console.log("on click" + d.id);
    selectPlain(d.id);
}

map.on('click', function (e) {

    // if plain not selected remove the color
    if (plainSelected == false)
        svg.select(".g-plain-" + selectedPlainId).selectAll("path").attr("fill", PLAIN_COLOR);
    plainSelected = false;
});

function selectPlain(id) {
    svg.select(".g-plain-" + selectedPlainId).selectAll("path").attr("fill", PLAIN_COLOR);
    selectedPlainId = id;
    svg.select(".g-plain-" + id).selectAll("path").attr("fill", SELECTED_PLAIN_COLOR);
    $('#flightId').after("<li>" + id + "</li>");
    plainSelected = true;
}
;

// TODO - need to be in service
function initData() {
    $.getJSON("data/initial/1468634054", function(result){
        plainsJSON = result;
        initlize();
        initTicks();
    });
}

function updateData() {
    $.getJSON("data/initial/1468634054", function(result){
        plainsJSON = result;
    });
}

function getPlainController() {
    return plainController;
}

function initTicks(){

    plainsJSON.items.forEach(function (plainItem, i) {

        var ticks = [];
        plainItem.path.coordinates.forEach(function (coordinateItem, j) {
            // map between the timestamp to its coordinates TODO - add spped and angle
            ticks[coordinateItem[3]] = [coordinateItem[0], coordinateItem[1]];
        });
        plainController[plainItem.id] = ticks;
    });

};


map.on("load", function () {
    //
    // document.getElementById('slider').addEventListener('input', function (e) {
    //     sliderIndex = parseInt(e.target.value, 10);
    //     sliderChanged(sliderIndex)
    // });
});

map.on("render", function () {
    updateProjection();
});

function updateProjection() {

    if (typeof plain != 'undefined') {
        // move the boat by transform
        // TODO - make with map projection
        plain.attr("transform", function (d) {
            // in case the plain path is over
            if (d.endTime < currentTimestamp) {
                // TODO - hide plain from map or remove 
                // return;
            }

            var loc = plainController[d.id][currentTimestamp];
            // var loc = [d.path.coordinates[sliderIndex][0], d.path.coordinates[sliderIndex][1]];
            if (loc == undefined)
                loc = plainController[d.id][getCloseTimestamo(currentTimestamp,plainController[d.id])];
            pos = map.project(loc);
            return "translate(" + pos.x + "," + pos.y + ")";
        });
    }
}
;

function sliderChanged(sliderIndex) {
    console.log(sliderIndex);
    plain.attr("transform", function (d) {
        // in case the plain path is over
        if (d.path.coordinates.length <= sliderIndex) {
            // TODO - remove d.id from data
            return;
        }
        var loc = [d.path.coordinates[sliderIndex][0], d.path.coordinates[sliderIndex][1]];
        pos = map.project(loc);
        return "translate(" + pos.x + "," + pos.y + ")";
    });
}

function movePlain(id, newLoc) {

    pos = map.project(newLoc);
    svg.select(".g-plain-" + id).selectAll("path")
        .attr("transform", "translate(" + pos.x + "," + pos.y + ") scale(0.4)");
}


function update(rand) {
    for (var i = 0; i < dots.length; i++) {
        var loc = dots[i].loc;

        if (rand) {
            var now = Date.now();

            dots[i].loc = loc = turf.destination(turf.point(loc), dots[i].speed * SPEED_FACTOR * (now - dots[i].lastUpdate) / 1000 / 1000, dots[i].angle, 'kilometers').geometry.coordinates;
            if (loc[0] >= 180 || loc[0] <= -180 || loc[1] >= 90 || loc[1] <= -90) {
                dots[i].loc = [-180 + Math.random() * 360, -90 + Math.random() * 180];
                dots[i].angle = -180 + Math.random() * 360;
                dots[i].speed = 400 + Math.random() * 300;
            }

            dots[i].lastUpdate = now;
        }

        var pos = map.project(loc);

        dots[i].dot.attr("transform", "translate(" + pos.x + ',' + pos.y + ") scale(0.3) rotate(" + dots[i].angle + ")");
    }
}


//requestAnimationFrame(function(){
//	update(true);
//	requestAnimationFrame(arguments.callee);
//});

function projectPoint(lon, lat) {
    // TODO - change to mapbox projection
    var point = projection([lon, lat]);
    this.stream.point(point.x, point.y);
}


function getCloseTimestamo(timestamp, plainTicks) {
    // for (first in obj) break;
    var curr = Object.keys(plainTicks)[0];
    for(currTime in plainTicks){
        if (Math.abs(timestamp - currTime) < Math.abs(timestamp - curr))
            curr = currTime;
    }
    return curr;
}