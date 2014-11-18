'use strict';

var URL = 'https://api.tokyometroapp.jp/api/v2/datapoints';
var TOKEN = '22b4f2f8dd953bb676f7145b0777fb20e7d288e5f3662dd3837ccb6854eefadd';
var api = URL + '?acl:consumerKey='+TOKEN;
var destination = '';

function showResult(station,name)
{
  d3.selectAll('#result *').remove();
  d3.select('#loading').append('img').attr('src','img/loading.gif');
  d3.select('#result').append('div').attr('id','station-name').append('span').attr('class','label label-primary').text(name);
  d3.json(api+'&rdf:type=odpt:StationFacility&owl:sameAs='+station,function(err,facData)
  {
    if (err != null)
    {
      console.log(err);
      return;
    }
    d3.csv('data/direction.csv', function(err2, dirData)
    {
      if (err2 != null)
      {
        $('#loading img').remove();
        console.log(err);
        return;
      }
      var facility = facData[0];
      var platformInformation = facility['odpt:platformInformation'];
      platformInformation.forEach(function(d)
      {
        d.black = ((d['odpt:transferInformation']!=null || d['odpt:surroundingArea']!=null) && (d['odpt:barrierfreeFacility']==null || d['odpt:barrierfreeFacility'].every(function(dd){return (dd.search(/Escalator/)==0)&&(dd.search(/Elevator/)==0);})));
        d.head = false;
        if (d['odpt:carNumber']===d['odpt:carComposition']||d['odpt:carNumber']===1)
        {
          var lr = dirData.filter(function(dd){return dd.railway===d['odpt:railway']&&dd.direction===d['odpt:railDirection'];});
          if (lr.length < 1)
          {
            $('#loading img').remove();
            console.log('direction data not found');
            return;
          }
          d.head = (d['odpt:carNumber']===1 && lr[0].lr ==='l') || (d['odpt:carNumber']===d['odpt:carComposition'] && lr[0].lr ==='r');
        }
      });
      var railways = d3.set(platformInformation.map(function(d){return d['odpt:railway'];})).values();
      var displayData = [];
      railways.forEach(function(rail)
      {
        var tmp = platformInformation.filter(function(d){return d['odpt:railway']===rail;});
        var directions = d3.set(tmp.map(function(d){return d['odpt:railDirection'];})).values();
        directions.forEach(function(dir)
        {
          var lr = dirData.filter(function(d){return d.railway===rail&&d.direction===dir;});
          if (lr.length < 1)
          {
            $('#loading img').remove();
            console.log('direction data not found');
            return;
          }
          var cars = tmp.filter(function(d){return d['odpt:railDirection']===dir;}).sort(function(a,b){return a['odpt:carNumber']<b['odpt:carNumber']?-1:1;});
          displayData.push({railway:rail,railwayName:lr[0].railwayName, direction:dir,directionName:lr[0].directionName,cars:cars.map(function(d){return {black:d.black,head:d.head,number:d['odpt:carNumber']};})});
        });
      });
      // show the results
      $('#loading img').remove();
      var s = d3.select('#result').append('div').selectAll('.train').data(displayData).enter().append('div').attr('class','train');
      var s1 = s.append('div').attr('class','tag');
      s1.append('img').attr('class','line-mark').attr('src',function(d){return 'img/LineMark/'+d.railway.replace(/.*\./g,'')+'.jpg';});
      s1.append('span').attr('class','label label-default').text(function(d){return d.directionName + '駅方面行き';});
      s.filter(function(d){return d.cars.every(function(dd){return !dd.black;});}).append('p').text('エスカレーターではマナーを守って歩かないでくださいね。');
      var s2 = s.append('div').attr('class','cars');
      s2.each(function(node)
      {
        d3.select(this).selectAll('span').data(node.cars).enter().append('span').text(function(d){return d.number;}).attr('class',function(d)
        {
          return 'car'+((d.black)?' black':' white')+((d.head)?((d.number==1)?' left':' right'):'');
        });
      });
    });
  });
}

function getBlackCars() {
  d3.selectAll('#result *').remove();
  $('#loading').append('<img src="img/loading.gif"></img>');
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
        target.push(direction.filter(function(d){return d['railway']===target[0] && d['direction']===target[1];})[0].lr); // target に進行方向 l か r を追加
        if(targets.join().indexOf(target.join()) < 0){
          targets.push(target);
        }
      });

      // 駅名の表示
      if (destination.split('.')[destination.split('.').length - 1]==='NakanoShimbashi' ||
        destination.split('.')[destination.split('.').length - 1]==='NakanoFujimicho' ||
        destination.split('.')[destination.split('.').length - 1]==='Honancho')
      {
        targets[0][0] += 'Branch';
        targets[1][0] += 'Branch';
      }
      setStationName(targets[0][0], destination);

      // 路線、進行方向ごとに、バリアフリーの有無を判定し、図を表示
      targets.forEach(function(target){
        var railway = target[0];
        var railDirection = target[1];
        var carComposition = target[2];
        var arrow = target[3];  // 'l' か 'r'
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

        $('#loading img').remove();
        // 路線、進行方向のタグを表示
        setTag(railway, railDirection, arrow);

        // 全てが白い車両の場合のメッセージ表示
        if( cars.every(function(element, index, array){ return element >= 0; }) ){
          $('#result').append('<p>エスカレーターではマナーを守って歩かないでくださいね。</p>');
        }

        // (transferInformationがある or surroundingAreaがある) and (バリアフリー施設がない) => black
        var all_white = true;
        for(var i = 1; i <= carComposition; i++){
          var top_car = '';
          // 左が先頭の場合
          if( arrow === 'l' && i === 1 ){
            top_car = 'left';
          }
          // 右が先頭の場合
          if( arrow === 'r' && i === carComposition ){
            top_car = 'right';
          }
          if( cars[i] < 0 ){
            $('#result').append('<span class="car black ' + top_car + '">' + i + '</span>');
          } else {
            $('#result').append('<span class="car white ' + top_car + '">' + i + '</span>');
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
    $('#result').prepend('<div id="station-name"><span class="label label-primary">' + station[0]['dc:title'] + '駅</span></div>');
  });
}

function setTag(railway, railDirection, lr){  // lr に進行方向情報 'l' か 'r'
  // 路線名を取得
  var railway_name = '';
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
      'rdf:type': 'odpt:Railway',
      'owl:sameAs': railway
    }
  }).done(function(v) {
    railway_name = v[0]['dc:title'];
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
        $('#result').append('<div class="tag"><img class="line-mark" src="img/LineMark/' + railway_name + '.jpg"></img> <span class="label label-default">' + railDirection_name + '駅方面行き</span> </div>'); // lr に応じて矢印を表示
    });
  });    
}
