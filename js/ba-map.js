
/*
var map={};
map.width = '100%';
map.height = '100%';
map.scale = 99733.04720950831;
map.translate = [-242672.78506345925, 66831.91654338205];

map.zoom = d3.behavior.zoom();

map.zoomed = function()
{
  map.translate = map.zoom.translate();
  map.scale = map.zoom.scale();
  map.draw();
}

map.zoom.on('zoom',map.zoomed);
map.zoom.translate(map.translate);
map.zoom.scale(map.scale);

map.canvas = d3.select('#map-canvas')
  .append('svg')
  .attr('width', map.width)
  .attr('height',map.height)
  .call(map.zoom);

map.draw = function()
{
  map.projection.scale(map.scale);
  map.projection.translate(map.translate);
  map.canvas.selectAll('path')
    .attr('d',map.path);
  map.canvas.selectAll('.station')
    .attr('transform',function(d){return 'translate('+(''+map.projection([d.lon,d.lat])).replace('[\[\]]','')+')';});

}

d3.json('data/tokyo.topojson',function(error,data)
{
  if (error)
  {
    console.log(error);
    return;
  }
  map.canvas.append('rect')
    .attr('x',0).attr('y',0).attr('height',map.height).attr('width',map.width).attr('fill','#F8F8F8');
  map.prefectures = topojson.feature(data, data.objects.tokyo).features;
  map.projection = d3.geo.mercator()
    .scale(map.scale)
    .translate(map.translate);
  map.path = d3.geo.path().projection(map.projection);
  map.canvas.append("g")
      .attr("class", "city")
    .selectAll("path")
      .data(map.prefectures)
    .enter().append("path")
      .style("fill", '#ccc')
      .style('stroke', '#888')
      .style('stroke-width', '1.2px')
      .attr("d", map.path);
  d3.json('data/line_data.geojson', function(error2, data2)
  {
    if (error2 != null)
    {
      console.log(error2);
      return;
    }
    map.canvas.append('g')
      .attr('class','railway')
      .selectAll('path')
        .data(data2.features)
        .enter().append('path')
        .style('stroke',function(d){return d.properties.color;})
        .style('stroke-width','10px')
        .style('fill','none')
        .attr('d',map.path);
    d3.json('data/station_latlon.json', function(error3, data3)
    {
      if (error3 != null)
      {
        console.log(error3);
        return;
      }
      var s = map.canvas.append('g')
        .attr('class','station_layer')
        .selectAll('g.station')
          .data(data3)
          .enter().append('g')
            .attr('class','station')
            .attr('transform',function(d){return 'translate('+(''+map.projection([d.lon,d.lat])).replace('[\[\]]','')+')';});
      s.append('circle').attr('r',10).attr('fill','#FFF');
      s.append('text').style('text-anchor','middle').style('dominant-baseline','middle').text(function(d){return d.name;});
      data3.forEach(function(d)
      {
        var markerOpts =
        {
         position: new google.maps.LatLng(d.lat,d.lon),
         draggable: false,
         raiseOnDrag: false,
         map: mymap,
         labelContent: d.name,
         labelAnchor: new google.maps.Point(22, 0),
         labelClass: 'labels',
         labelStyle: {opacity: 0.75},
         icon: 'img/s_TokyoMetro.png'
        };
        var marker = new MarkerWithLabel(markerOpts);
        google.maps.event.addListener(marker, 'click', function()
        {
          show(d.id);
        });
      });

    });
    map.draw();
  });
});
*/

var mymap;

google.maps.event.addDomListener(window, 'load', handleLoadGoogleMap);

function handleLoadGoogleMap()
{
  var styles = [
  {
    stylers: [
        { color: "#FFFFFF" },
        { saturation: -20 }
      ]
   },
  {
    "featureType": "road.local",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" },
      { "color": "#808080" }
    ]
  },{
    "featureType": "road.highway",
    "stylers": [
      { "color": "#808080" }
    ]
  },
  {
    "featureType": "transit.station",
    elementType: 'label',
    "stylers": [
      { visibility: "off" }
    ]
  },
  {
    "featureType": "transit.line",
    "stylers": [
      { "color": "#C0C0C0" }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      { "color": "#CCe6FF" },
      { "saturation": -19 }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "hue": "#00b2ff" },
      { "color": "#404040" }
    ]
  }
  ];
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});
  var mapOptions = {
    center: new google.maps.LatLng(35.6874916666667,139.766158333333),
    zoom: 14,
//    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    },
//    mapTypeControl: false,
    disableDefaultUI: true
  };
  mymap = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
  mymap.mapTypes.set('map_style', styledMap);
  mymap.setMapTypeId('map_style');
  d3.json('data/line_data.geojson', function(error, data)
  {
    if (error != null)
    {
      console.log(error);
      return;
    }
    var styleFeature = function(feature)
    {
      return {strokeWeight: 8, strokeColor: feature.getProperty('color')};
    };
    mymap.data.addGeoJson(data);
    mymap.data.setStyle(styleFeature);
  });
  d3.json('data/station_latlon.json', function(error, data)
  {
    if (error != null)
    {
      console.log(error);
      return;
    }
    data.forEach(function(d)
    {
      var markerOpts =
      {
       position: new google.maps.LatLng(d.lat,d.lon),
       draggable: false,
       raiseOnDrag: false,
       map: mymap,
       labelContent: d.name,
       labelAnchor: new google.maps.Point(22, 0),
       labelClass: 'labels',
       labelStyle: {opacity: 0.75},
       icon: 'img/s_TokyoMetro.png'
      };
      var marker = new MarkerWithLabel(markerOpts);
      google.maps.event.addListener(marker, 'click', function()
      {
        show(d.id,d.name);
      });
    });
  });
}


// ここから出力
function show(station,name)
{
  destination = station;
  showResult(station,name);
//  getBlackCars();
  location.href = '#output';
}

