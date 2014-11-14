'use strict';

var URL = 'https://api.tokyometroapp.jp/api/v2/datapoints';
var TOKEN = '22b4f2f8dd953bb676f7145b0777fb20e7d288e5f3662dd3837ccb6854eefadd';
var destination = '';

function getBlackCars() {
  $('#result *').remove();

  $.ajax({
    url: URL,
    data: {
      'acl:consumerKey': TOKEN,
      'rdf:type': 'odpt:StationFacility',
      'owl:sameAs': destination
    }
  }).done(function(facility) {
    d3.csv('data/line_direction.csv',function(err, direction)
    {
    var platformInformation = facility[0]['odpt:platformInformation'];
    // 路線、進行方向、車両編成の一覧を取得
    var targets = [];
    platformInformation.forEach(function(info){
      var target = [ info['odpt:railway'], info['odpt:railDirection'], info['odpt:carComposition']];
      target.push(direction.filter(function(d){return d['railway']===target[0] && d['direction']===target[1];})[0].lr);
      if(targets.join().indexOf(target.join()) < 0){
        targets.push(target);
      }
    });

    // 駅名の表示
    setStationName(targets[0][0], destination);

    // 路線、進行方向ごとに、バリアフリーの有無を判定し、図を表示
    targets.forEach(function(target){
      var railway = target[0];
      var railDirection = target[1];
      var carComposition = target[2];
      var arrow = target[3];
      var cars = [];
      for(var i = 1; i <= carComposition; i++){
        cars[i] = 0;
      }
      platformInformation.forEach(function(info){
        if( info['odpt:railway'] === railway && info['odpt:railDirection'] === railDirection ){
          // transferInformationがある or surroundingAreaがある => ブラック候補
          if( info['odpt:transferInformation'] || info['odpt:surroundingArea'] ){
            cars[Number(info['odpt:carNumber'])] -= 1;
          }
          // エレベーターかエスカレーターがあれば除外
          if( info['odpt:barrierfreeFacility'] ){
            info['odpt:barrierfreeFacility'].forEach(function(bff){
              // エレベーターかエスカレーターのどちらかがある場合
              if( bff.search(/Escalator/) > 0 || bff.search(/Elevator/) > 0 ){
                cars[Number(info['odpt:carNumber'])] += 1;
              }
            });
          }
        }
      });

      // 路線、進行方向のタグを表示
      setTag(railway, railDirection, arrow);

      // (transferInformationがある or surroundingAreaがある) and (バリアフリー施設がない) => black
      for(var i = 1; i <= carComposition; i++){
        if( cars[i] < 0 ){
          $('#result').append('<span class="car black">' + i + '</span>');
        } else {
          $('#result').append('<span class="car white">' + i + '</span>');
        } 
      }
    });
    });
  });
}

function setStationName(railway, destination){
  var railway_split = railway.split('.');
  var destination_split = destination.split('.');
  var sameAs = 'odpt.Station:TokyoMetro.' + railway_split[railway_split.length - 1] + '.' + destination_split[destination_split.length - 1];

  $.ajax({
    url: URL,
    async: false,
    data: {
      'acl:consumerKey': TOKEN,
      'rdf:type': 'odpt:Station',
      'owl:sameAs': sameAs
    }
  }).done(function(station) {
    $('#result').prepend('<div><span class="label label-primary">' + station[0]['dc:title'] + '駅</span></div>');
  });
}

function setTag(railway, railDirection, lr){
  // 路線名を取得
  var railway_name = '';
  $.ajax({
    url: URL,
    async: false,
    data: {
      'acl:consumerKey': TOKEN,
      'rdf:type': 'odpt:Railway',
      'owl:sameAs': railway
    }
  }).done(function(railway) {
    railway_name = railway[0]['dc:title'];
    // $('#result').append('<div><span class="label label-default">' + railway[0]['dc:title'] + '線</span></div>');
  });

  // 進行方向名を取得
  var railDirection_name = '';
  var railway_split = railway.split('.');
  var railDirection_split = railDirection.split('.');
  var sameAs = 'odpt.Station:TokyoMetro.' + railway_split[railway_split.length - 1] + '.' + railDirection_split[railDirection_split.length - 1];

  $.ajax({
    url: URL,
    async: false,
    data: {
      'acl:consumerKey': TOKEN,
      'rdf:type': 'odpt:Station',
      'owl:sameAs': sameAs
    }
  }).done(function(station) {
    railDirection_name = station[0]['dc:title'];
    // $('#result').append('<div><span class="label label-default">' + station[0]['dc:title'] + '駅方面行き</span></div>');
  });
  $('#result').append('<div class="tag"><span class="label label-default">' + railway_name + '線</span> <span class="label label-default">' + railDirection_name + '駅方面行き ('+(lr==='l'?'←':'→')+')</span></div>');
}
