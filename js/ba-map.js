var mymap;

google.maps.event.addDomListener(window, 'load', handleLoadGoogleMap);

function handleLoadGoogleMap()
{
  var mapOptions = {
    center: new google.maps.LatLng(35.6874916666667,139.766158333333),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    disableDefaultUI: true
  };
  mymap = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
  d3.json('data/line_data.geojson', function(error, data)
  {
    if (error != null)
    {
      console.log(error);
      return;
    }
    mymap.data.addGeoJson(data);
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
       labelStyle: {opacity: 1.0},
       icon: 'img/s_TokyoMetro.png'
      };
      var marker = new MarkerWithLabel(markerOpts);
      google.maps.event.addListener(marker, 'click', function()
      {
        show(d.id);
      });
    });
  });
}

// ここから出力
function show(station)　{
  destination = station;
  getBlackCars();
  location.href = '#output';
}