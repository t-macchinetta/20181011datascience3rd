$(window).on('load', function () {
    $login = $('#login');
    $login_sec = $('#login_section');
    $start = $('#start');
    $modal = $('#modal');
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
    function route() {
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
            origin,
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
            }
        ];
        // マーカーの描画(ちょっと遅らせてみる)
        setTimeout(() => {
            for (var i = 0; i < markerData.length; i++) {
                markerLatLng = new google.maps.LatLng({ lat: markerData[i].latlng.lat, lng: markerData[i].latlng.lng }); // 緯度経度のデータ作成
                marker[i] = new google.maps.Marker({
                    position: markerLatLng,
                    map: map
                });
                // 酔いやすい地点はアイコンを設定
                if (i > 1) {
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

    // マップ表示関数実行
    $login.on('click', function () {
        modalIn();
        $login_sec.addClass('hidden');
        $('#route').removeClass('hidden');
        setTimeout(() => {
            init();
        }, 500);
    });
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
            route();
        }, 500);
    });
});
