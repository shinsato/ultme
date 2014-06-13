/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.initDb();


        function testInit(){
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("Did you drink coffee?","binary")')});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("How many cups?","tally")')});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("Are you glad you did?","binary")')});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("How many red lights?","tally")')});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type,min,max) VALUES("How would you rate today?","scale",-5,5)')});
        }
        //testInit();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('documentready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        this.initDb();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    initDb: function(){
        app.db = window.openDatabase("ultme", "1.0", "Ultimately Me", 1000000);
        app.db.transaction(setupDB);
    }
};
    app.initialize();
    loadTiles(app);
    //console.log($('div.count'));

$(document).on("pagecreate","#pageone",function(){
  $("div").on("click",function(){
    console.log('heeeelp');
    // $(this).hide();
  });
}).on('submit','#update-tile',function(){
    var self = $(this);
    var tile = [];
    $.each(self.serializeArray(), function(_, kv) {
        tile[kv.name] = kv.value;
    });

    if(tile['tile-id'] > 0){//Update
        //nothing to see here
    } else {//Insert
        new Date().getTime();
        time = Date.now();
        option = {
                    'label-a':tile['label-a'],
                    'label-b':tile['label-b'],
                    'timebox':tile['tile-timebox']}
        app.db.transaction(function(tx){
            tx.executeSql('INSERT INTO tile (name,type,options,created,modified) VALUES(?,?,?,?,?)',[tile['tile-name'],tile['tile-type'],JSON.stringify(option),time,time],function(tx,results){
                    console.log(tx,results);
                    loadTiles(app);
                    $('body').toggleClass('overlay-open');
            })
        });
    }


    return false;
});


function setupDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)');
}

function init(){
    var $body = $('body');
    var $overlay = $('.overlay');
    var tileTypeTally = $('[data-type="tally"]');
    var tileTypeBinary = $('[data-type="binary"]');
    var tileTypeScale = $('[data-type="scale"]');

    var flashTile = function($element){
        $element.addClass('flash');
        setTimeout(function(){
            $element.removeClass('flash');
        }, 100);
    };

    var toggleOverlay = function(){
        $body.toggleClass('overlay-open');
    };

    tileTypeTally.each(function(index, element){
        var $e = $(element);
        var val = $e.data('value');
        var $display = $($e.find('.js-display'));

        $(element).on('click', function(event){
            var $me = $(this);
            val += 1;
            $display.text(val);
            $me.attr('data-value', val);
            $me.data('value', val);
            flashTile($me);
        });
    });

    tileTypeBinary.each(function(index, element){
        var $e = $(element);
        var val = $e.data('value');
        var $display = $($e.find('.js-display'));

        $(element).on('click', function(event){
            console.log(val);
        });
    });


    // overlay handlers
    $(document).on('click', '[toggle-overlay]', function(){
        var path = $(this).attr('toggle-overlay');
        var type = $(this).data('type');
        var $overlayBody = $overlay.find('section');
        // clean out overlay content
        $overlay.removeClass('binary tally scale new').addClass(type);
        $overlayBody.html('');

        // fill in overlay content
        if(path.length) {
            $overlayBody.load(path + '.html');
        }
        toggleOverlay();
    });
}

function loadTiles(app){
    var tiles = [];
    app.db.transaction(
        function(tx){tx.executeSql('SELECT * FROM tile', [],
            function(tx,results){
                var len = results.rows.length;
                for (var i=0; i<len; i++){
                    tiles.push(results.rows.item(i));
                }
                console.log(tiles);
                for(t in tiles){
                    var type = tiles[t].type;
                    var tile = $('<div class="item ' + type + '"></div>');
                    tile.attr('data-value', 0);
                    tile.attr('data-type', type);
                    tile.data('value', 0);
                    tile.data('type', type);
                    tile.append('<h2>' + tiles[t].name + '</h2>');
                    switch(type) {
                        case 'binary':
                            tile.append('<label class="js-display string">0</label>');
                            tile.attr('toggle-overlay', 'overlay/tile-binary');
                            break;
                        case 'tally':
                            tile.append('<label class="js-display string">0</label>');
                            break;
                        case 'scale':
                            tile.append('<label class="js-display string">0</label>');
                            tile.attr('toggle-overlay', 'overlay/tile-scale');
                            break;
                    }
                    $('#container').append(tile);
                }
                init();
            },
            function(tx,results){
                console.log('error',tx,results);
            }
        )}
    );
}

//function queryDB(tx, sql, params, successCB, errorCB) {
//    tx.executeSql(sql, params, successCB, errorCB);
//}
