$(window).on('load', function () {
    'use strict';
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function (registration) {
                registration.onupdatefound = function () {
                    if (navigator.serviceWorker.controller) {
                        var installingWorker = registration.installing;
                        installingWorker.onstatechange = function () {
                            switch (installingWorker.state) {
                                case 'installed':
                                    break;
                                case 'redundant':
                                    throw new Error('The installing ' +
                                        'service worker became redundant.');
                                default:
                            }
                        };
                    }
                };
            }).catch(function (e) {
                console.error('Error during service worker registration:', e);
            });
    }

    // Your custom JavaScript goes here
    var $login = $('#login');
    var $login_sec = $('#login_section');
    var $start = $('#start');
    var $modal = $('#modal');
    var $toggle = $('#toggle');
    var disp = 0;

    // 描画オブジェクトの定義
    var map;
    var marker = [];
    var infoWindow = [];
    // 場所設定
    var origin = {
        name: '東京都武蔵野市境南町4丁目10-19',
        latlng: {
            lat: 35.7011436,
            lng: 139.53608580000002
        }
    };
    var destination = {
        name: 'モリパークアウトドアヴィレッジ',
        latlng: {
            lat: 35.7165416,
            lng: 139.36167439999997
        }
    };

    // マップ表示関数
    function init() {
        if (navigator.geolocation) {
            // 現在地を取得
            navigator.geolocation.getCurrentPosition(function (position) {
                // 緯度・経度を変数に格納
                var mapLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map = new google.maps.Map(document.getElementById('map'), {
                    center: mapLatLng,
                    zoom: 12,
                    scrollwheel: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    preserveViewport: true
                });
                // クリックで座標取得
                google.maps.event.addListener(map, 'click', mylistener);
                // モーダルの制御
                modalOut();
            });
        } else {
            alert('すみません，無理っすorz');
        }
    }

    // ルートとマーカーを表示する関数
    function route(origin, destination) {
        // ルート表示設定
        var directionsDisplay = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true
        });
        var directionsService = new google.maps.DirectionsService();
        // リクエスト設定
        var request = {
            origin: origin.latlng,
            destination: destination.latlng,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,  //高速を避ける場合true
            provideRouteAlternatives: true
            // waypoints: [
            //     { location: test }  //経由地を追加する場合はここに記載
            // ]
        };
        // ルート検索結果描画
        directionsService.route(request, function (response, status) {
            // 複数ルート表示
            if (status == google.maps.DirectionsStatus.OK) {
                for (var routeIndex = 0; routeIndex < response.routes.length; routeIndex++) {
                    var directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsRenderer.setOptions({
                        // ルート表示をいい感じにする
                        suppressMarkers: true,
                        suppressPolylines: false,
                        suppressInfoWindows: false,
                        draggable: true,
                        preserveViewport: false,
                        polylineOptions: {
                            strokeColor: '#0000ff',
                            strokeOpacity: 0.5,
                            strokeWeight: 5
                        }
                    });
                    directionsRenderer.setDirections(response);
                    directionsRenderer.setRouteIndex(routeIndex);
                    directionsRenderer.setMap(map);
                    setTimeout(function () {
                        map.setZoom(12); // ルート表示後にズーム率を変更
                    });
                }
            }
        });
        // マーカーの場所を指定
        var markerData = [
            destination,
            {
                name: '酔いやすい地点あり',
                latlng: {
                    lat: 35.66157352830955,
                    lng: 139.5354538584777
                },
                icon: 'img/1234.png'
            },
            {
                name: '酔いやすい地点あり',
                latlng: {
                    lat: 35.680483281753936,
                    lng: 139.34014809911616
                },
                icon: 'img/1234.png'
            },
            {
                name: '酔いやすい地点あり',
                latlng: {
                    lat: 35.674907017288106,
                    lng: 139.35024295849212
                },
                icon: 'img/1234.png'
            },
            origin
        ];
        // マーカーの描画(ちょっと遅らせてみる)
        setTimeout(() => {
            for (var i = 0; i < markerData.length; i++) {
                var markerLatLng = new google.maps.LatLng({ lat: markerData[i].latlng.lat, lng: markerData[i].latlng.lng }); // 緯度経度のデータ作成
                marker[i] = new google.maps.Marker({
                    position: markerLatLng,
                    map: map
                });
                // 酔いやすい地点はアイコンを設定
                if (i > 0 && i < markerData.length - 1) {
                    marker[i].setOptions({
                        icon: {
                            url: markerData[i]['icon']
                        }
                    });
                }
                // インフォウインドウの作成と表示
                infoWindow[i] = new google.maps.InfoWindow({
                    content: '<div class="sample">' + markerData[i].name + '</div>'
                });
                infoWindow[i].open(map, marker[i]);
                // モーダルの制御
                modalOut();
            }
        }, 1000);
    }

    // クリックで座標表示(テスト用)
    function mylistener(e) {
        var loc = e.latLng;
        $('#latitude').val(loc.lat());
        $('#longitude').val(loc.lng());
    }

    // モーダルの制御
    function modalIn() {
        $modal.removeClass('hidden');
    }
    function modalOut() {
        setTimeout(() => {
            $modal.addClass('hidden');
        }, 1000);
    }

    // mapとmemberを切りかえる処理
    function toggle() {
        ($toggle.text() == "$ member") ? $toggle.text('$ map') : $toggle.text('$ member');
        var wh = $(window).height();
        var nh = $('#title').outerHeight(true);
        $('#member').css({
            'top': nh
        });
        $('#member').toggleClass('hidden');
        (disp == 0) ? disp = 1 : disp = 0;
    }
    // 車酔いポイント変更用の配列を作成
    function rand(persons, min, max) {
        var rand = [];
        var map = [];
        for (var i = min; i <= max; i++) {
            map.push(i);
        }
        for (i = 0; i < persons; i++) {
            var v = map[~~(Math.random() * map.length)];
            rand.push(v);
        }
        return rand;
    }

    // mapとmemberの表示切り替え
    $toggle.on('click', function () {
        toggle();
    });

    // マップ表示関数実行
    $login.on('click', function () {
        modalIn();
        $toggle.removeClass('hidden');
        $login_sec.addClass('hidden');
        $('#route').removeClass('hidden');
        var wh = $(window).height();
        var nh = $('#title').outerHeight(true);
        var rfh = $('#route_form').outerHeight(true);
        $('#map').height(wh - nh - rfh);
        setTimeout(() => {
            init();
        }, 500);
    });

    // ログイン情報の入力
    $('#uid').on('click', function () {
        $('#uid').val('t.hirahara@gs.tokyo');
    });
    $('#pass').on('click', function () {
        $('#pass').val('password');
    });


    // 場所の入力
    $('#origin').on('click', function () {
        $('#origin').val(origin.name);
    });
    $('#destination').on('click', function () {
        $('#destination').val(destination.name);
    });

    // ルート検索スタート
    $start.on('click', function () {
        modalIn();
        setTimeout(() => {
            route(origin, destination);
        }, 500);
        // 3秒毎に車酔いポイントの変更
        var al = 0;
        setInterval(() => {
            var person_num = 4;
            // console.log(rand(person_num, -1, 1));
            var a = rand(person_num, -1, 1);
            for (var i = 0; i < person_num; i++) {
                var num_id = Number($('#p' + i).text());
                (i == 0) ? $('#p' + i).text(num_id + a[i] + 1) : $('#p' + i).text(num_id + a[i]);
                (i == 0 && num_id + a[i] + 1 > 60) ? al += 1 : i;
                (i == 0 && al == 1) ? ((disp == 0) ? toggle() : disp, alert('めいさんに車酔いの兆候があります！\n早めの休憩をおすすめします！')) : al
            }
        }, 3000);
    });

});