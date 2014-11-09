'use strict';

var URL = 'https://api.tokyometroapp.jp/api/v2/datapoints';
var TOKEN = '22b4f2f8dd953bb676f7145b0777fb20e7d288e5f3662dd3837ccb6854eefadd';
// 仮設定。本当はユーザーの入力からとる。
var destination = 'odpt.StationFacility:TokyoMetro.KokkaiGijidomae';
var railway = 'odpt.Railway:TokyoMetro.Marunouchi';
var railDirection = 'odpt.RailDirection:TokyoMetro.Ikebukuro';




$(function() {
  getBlackCars();
  // getRailways();
});

function getBlackCars() {
  $("#search").click(function() {
    $('#result .car').remove();
    $('#result h2').remove();

    $.ajax({
      url: URL,
      data: {
        'acl:consumerKey': TOKEN,
        'rdf:type': 'odpt:StationFacility',
        'owl:sameAs': destination
      }
    }).done(function(facility) {
      var platformInformation = facility[0]['odpt:platformInformation'];
      // 路線、進行方向、車両編成の一覧を取得
      var targets = [];
      platformInformation.forEach(function(info){
        var target = [ info['odpt:railway'], info['odpt:railDirection'], info['odpt:carComposition']];
        if(targets.join().indexOf(target.join()) < 0){
          targets.push(target);
        }
      });

      targets.forEach(function(target){
        var railway = target[0];
        var railDirection = target[1];
        var carComposition = target[2];
        var cars = [];
        for(var i = 1; i <= carComposition; i++){
          cars[i] = 0;
        }
        platformInformation.forEach(function(info){
          if( info['odpt:railway'] === railway
              && info['odpt:railDirection'] === railDirection
              && info['odpt:barrierfreeFacility'] ){
            info['odpt:barrierfreeFacility'].forEach(function(bff){
              // エレベーターかエスカレーターのどちらかがある場合
              if( bff.search(/Escalator/) > 0 || bff.search(/Elevator/) > 0 ){
                cars[Number(info['odpt:carNumber'])] += 1;
              }
            });
          }
        });

        // バリアフリー施設があるときは白とないときは黒で図を表示
        $('#result').append('<h2>' + railway + ',' + railDirection + '</h2>');

        for(var i = 1; i <= carComposition; i++){
          if( cars[i] === 0 ){
            $('#result').append('<div class="car black">' + i + '</div>');
          } else {
            $('#result').append('<div class="car white">' + i + '</div>');
          } 
        }



      });




    });
  });
}

        // var carComposition = Number( platformInformation[0]['odpt:carComposition'] );
        // var cars = new Array(carComposition + 1);
        // for(var i = 1; i <= carComposition; i++){
        //   cars[i] = 0;
        // }


        // var platforms = [];
        // // 路線、進行方向ごとにプラットフォームの情報をとる
        // platformInformation.forEach(function(info){
        //   var platform = {'odpt:railway': info['odpt:railway'], 
        //                   'odpt:carComposition': info['odpt:carComposition'], 
        //                   'odpt:railDirection': info['odpt:railDirection'],
        //                   'cars': new Array(Number(info['odpt:carComposition']))};

        //   if( JSON.stringify(platforms).indexOf(JSON.stringify(platform)) < 0 ){
        //     platforms.push(platform);
        //   }
        // }

        // 路線、進行方向、車両ごとにバリアフリー施設の有無を調べる


          
        
          // // 路線と進行方向が指定どおりで、バリアフリー施設がある場合のみ処理する
          // if( info['odpt:railway'] === railway
          //   && info['odpt:railDirection'] === railDirection
          //   && info['odpt:barrierfreeFacility'] ){

          //   info['odpt:barrierfreeFacility'].forEach(function(bff){
          //     // エレベーターかエスカレーターのどちらかがある場合
          //     if( bff.search(/Escalator/) > 0 || bff.search(/Elevator/) > 0 ){
          //       cars[Number(info['odpt:carNumber'])] += 1;
          //     }
          //   });

          // }


// // 仮設定。本当はユーザーの入力からとる。
// var dest_name_jp = '上野';

// function getRailways() {
//   $("#search").click(function() {
//     $.ajax({
//       url: URL,
//       data: {
//         'acl:consumerKey': TOKEN,
//         'rdf:type': 'odpt:Station',
//         'dc:title': dest_name_jp
//       }
//     }).done(function(same_stations) {
//       var railways = [];
//       same_stations.forEach(function(station){
//         if(station['dc:title'] === dest_name_jp){
//           railways.push(station['odpt:railway']);
//         }
//       });
//       console.log(railways);
//     });
//   });
// }
