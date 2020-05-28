/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};



var projection = new ol.proj.Projection({
    code: 'EPSG:4326',
    extent: [-180, -90, 180, 90]
  });

/*var extents = [
    -20026376.39, //minX
    -20048966.10, //minY
    20026376.39, //maxX
    20048966.10 //maxY
]; // NATIVE*/
//var extents = ol.proj.transformExtent([-10, -65, 10, 65], 'EPSG:4326', 'EPSG:3857');
var extents = ol.proj.transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'EPSG:3857');
//var extents = [-180, -90, 180, 90];

var map = new ol.Map({
    /*controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ /*({
            collapsible: false
        })
    }),*/
    layers: [
        new ol.layer.Tile({
            name: 'osm',
            source: new ol.source.OSM({
                //wrapX: false,
                layer: 'OSM'
            })  
        }),
        new ol.layer.Tile({
            name: 'states',
            source: new ol.source.TileWMS({
                url: 'https://ahocevar.com/geoserver/wms',
                params: {'LAYERS':'topp:states','TILED':true},
                //transition: 0,
                wrapX: false,
                serverType: 'geoserver'
            })
        })
    ],
    overlays: [overlay],
    target: 'map',
    controls: [],
    view: new ol.View({
        //projection: projection,
        extent: extents,
        center: ol.proj.fromLonLat([-99.6569007, 19.292545]),
        minZoom: 3,
        zoom: 5
    })
});

function pickLayer(layerName) {
    let visibilityInput = document.getElementById(layerName);
    map.getLayers().forEach(function(layer, i) {
        if (layer.get('name') == layerName) {
            layer.setVisible(visibilityInput.checked);
        }
    });
}


function enlazarEntradas(layer) {
    console.log(layer);
    let visibilityInput = document.getElementById(layer.get('name'));
    visibilityInput.addEventListener('change', function() {
        //layer.
    });

    //var visibilityInput = $('#' + layer.get('name') + ' input.visible');
    /*visibilityInput.on('change', function() {
      layer.setVisible(this.checked);
      alert("change");
    });
    visibilityInput.prop('checked', layer.getVisible());
    //console.log(visibilityInput);
  
    /*var opacityInput = $(layerid + ' input.opacity');
    opacityInput.on('input change', function() {
      layer.setOpacity(parseFloat(this.value));
    });
    opacityInput.val(String(layer.getOpacity()));*/
}

document.addEventListener("DOMContentLoaded", () => {
    //cargarDatos();
    map.getLayers().forEach(function(layer, i) {
        //enlazarEntradas(layer);
    });
});

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function(evt) {
    var coordinate = evt.coordinate;
    var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
        coordinate, 'EPSG:3857', 'EPSG:4326'));
    var lnglat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');

    var setAddress = function(res) {
        console.log(res);
        var address = 'Dirección no encontrada'
        if (res.results.length > 0) {
            address = res.results[0].formatted;
        }
        content.innerHTML = '<p>' + hdms + '</p><code>' + address + '</code>';
        overlay.setPosition(coordinate);
        console.log(res.results.length);
      }
      geocode(lnglat[1] + ',' + lnglat[0], setAddress);

    /*content.innerHTML = '<p>' + hdms + '</p><code>' + lnglat + '</code>';
    overlay.setPosition(coordinate);
    console.log(lnglat);*/
    
  });

  function geocode(query, f){
    $.ajax({
      url: 'https://api.opencagedata.com/geocode/v1/json',
      type: 'get',
      data: {
        'key': '7c208594b4424d9ea8df9ad977d77f6c',
        'q': query,
        'no_annotations': 1
      },
      success: function(res) {
        console.log(res);
        f(res);
      }, error: function(res) {
        console.log(res);
        console.log('hit free-trial daily limit');
        console.log('become a customer: https://opencagedata.com/pricing');
      }
    });
  }