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
//==============================================================================
//==============================================================================
// DATABASE SETUP
//==============================================================================
//==============================================================================

function setupDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)');
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.initDb();

        function testInit(){
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("Did you drink coffee?","binary")');});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("How many cups?","tally")');});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("Are you glad you did?","binary")');});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type) VALUES("How many red lights?","tally")');});
            app.db.transaction(function(tx){tx.executeSql('INSERT INTO tile (name,type,min,max) VALUES("How would you rate today?","scale",-5,5)');});
        }
        function resetDb(){
            app.db.transaction(function(tx){tx.executeSql('DROP TABLE user');});
            app.db.transaction(function(tx){tx.executeSql('DROP TABLE tile');});
            app.db.transaction(function(tx){tx.executeSql('DROP TABLE response');});
        }
        // testInit();
        // resetDb();
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

        window.console.log('Received Event: ' + id);
    },

    initDb: function(){
        app.db = window.openDatabase("ultme", "1.0", "Ultimately Me", 1000000);
        app.db.transaction(setupDB);
        this.createUserIfNotExists();
    },

    createUserIfNotExists: function(){
        app.db.transaction(function(tx){
            tx.executeSql('SELECT *,rowid FROM user', [], function(tx,results){
                var len = results.rows.length;
                if(len > 0){
                    app.userid = results.rows.item(0).rowid;
                } else {
                    app.db.transaction(function(tx){
                        new Date().getTime();
                        var time = Date.now();
                        tx.executeSql('INSERT INTO user (created) VALUES(?)',[time], function(tx,results){
                            app.userid = results.insertId;
                        });
                    });
                }
            });
        });
    }
};

//========================================================================
//===============================TALLY====================================
var saveTallyResponse = function(app,rowid){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            __saveTallyResponse(app,rowid,latitude,longitude);
        },
        function(){
            __saveTallyResponse(app,rowid,null,null);
        });
    } else{
        __saveTallyResponse(app,rowid,null,null);
    }
};

var __saveTallyResponse = function(app,rowid,latitude,longitude){
    new Date().getTime();
    var time = Date.now();
    var geo = '';
    if(latitude && longitude){
        geo = latitude + ',' + longitude;
    }
    app.db.transaction(
        function(tx){
            tx.executeSql('INSERT INTO response (tile_id,user_id,value,geolocation,created) VALUES (?,?,?,?,?)', [rowid,app.userid,1,geo,time], function(tx,results){
                updateTallyValue(app,rowid);
        });
    });
};

var updateTallyValue = function(app,rowid){
    app.db.transaction(
        function(tx){
            tx.executeSql('SELECT sum(value) as total FROM response WHERE tile_id = ?', [rowid], function(tx,results){
                var val = results.rows.item(0).total;
                val = val > 0 ? val : 0;
                var $tile = $("[data-rowid='" + rowid +"']");
                var $display = $($tile.find('.js-display'));
                $display.text(val);
                $tile.attr('data-value', val);
                $tile.data('value', val);
        });
    });
};
//========================================================================
//==============================BINARY====================================
var saveBinaryResponse = function(app,rowid,value){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            __saveBinaryResponse(app,rowid,value,latitude,longitude);
        },
        function(){
            __saveBinaryResponse(app,rowid,value,null,null);
        });
    } else{
        __saveBinaryResponse(app,rowid,value,null,null);
    }
};

var __saveBinaryResponse = function(app,rowid,value,latitude,longitude){
    new Date().getTime();
    var time = Date.now();
    var geo = '';
    if(latitude && longitude){
        geo = latitude + ',' + longitude;
    }

    app.db.transaction(
        function(tx){
            tx.executeSql('INSERT INTO response (tile_id,user_id,value,geolocation,created) VALUES (?,?,?,?,?)', [rowid,app.userid,value,geo,time], function(tx,results){
                    updateBinaryValue(app,rowid);
            });
    });
};

var updateBinaryValue = function(app,rowid){
    app.db.transaction(
        function(tx){
            //tx.executeSql('SELECT response.value, tile.options FROM response left join tile on response.tile_id = tile.id WHERE response.tile_id = ? ORDER BY response.id DESC LIMIT 1', [rowid], function(tx,results){
            tx.executeSql('SELECT * FROM response left join tile on response.tile_id = tile.rowid WHERE response.tile_id = ? ORDER BY response.id DESC LIMIT 1', [rowid], function(tx,results){
                var $tile = $("[data-rowid='" + rowid +"']");
                var $display = $($tile.find('.js-display'));

                if(results.rows.length > 0){
                    var val = results.rows.item(0).value;
                    var options = JSON.parse(results.rows.item(0).options);

                    var value = '';
                    if(val > 0){
                        value = options['label-b'];
                    } else {
                        value = options['label-a'];
                    }
                    $display.text(value);
                    $tile.attr('data-value', value);
                    $tile.data('value', value);
                } else {
                    $display.text('0');
                    $tile.attr('data-value', '0');
                    $tile.data('value', '0');
                }
        },function(tx,results){console.log(tx,results);});
    });
};

//========================================================================
//===============================SCALE====================================
var saveScaleResponse = function(app,rowid,value){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            __saveScaleResponse(app,rowid,value,latitude,longitude);
        },
        function(){
            __saveScaleResponse(app,rowid,value,null,null);
        });
    } else{
        __saveScaleResponse(app,rowid,value,null,null);
    }
};

var __saveScaleResponse = function(app,rowid,value,latitude,longitude){
    new Date().getTime();
    var time = Date.now();
    var geo = '';
    if(latitude && longitude){
        geo = latitude + ',' + longitude;
    }
    app.db.transaction(
        function(tx){
            tx.executeSql('INSERT INTO response (tile_id,user_id,value,geolocation,created) VALUES (?,?,?,?,?)', [rowid,app.userid,value,geo,time], function(tx,results){
                updateScaleValue(app,rowid);
        });
    });
};

var updateScaleValue = function(app,rowid){
    app.db.transaction(
        function(tx){
            tx.executeSql('SELECT value FROM response WHERE tile_id = ?  ORDER BY id DESC LIMIT 1', [rowid], function(tx,results){
                var $tile = $("[data-rowid='" + rowid +"']");
                var $display = $($tile.find('.js-display'));

                if(results.rows.length > 0){
                    var val = results.rows.item(0).value;

                    $display.text(val);
                    $tile.attr('data-value', val);
                    $tile.data('value', val);
                } else {
                    $display.text('0');
                    $tile.attr('data-value', '0');
                    $tile.data('value', '0');
                }
        });
    });
};

var resetTile = function(app,tile_id){
    app.db.transaction(
        function(tx){
            tx.executeSql('DELETE FROM response WHERE tile_id = ?', [tile_id], function(tx,results){
                loadTiles(app);
        });
    });
}

var deleteTile = function(app,tile_id){
    app.db.transaction(
        function(tx){
            tx.executeSql('DELETE FROM response WHERE tile_id = ?', [tile_id], function(tx,results){
                tx.executeSql('DELETE FROM tile WHERE tile_id = ?', [tile_id], function(tx,results){
                    loadTiles(app);
                    updateTileOrder(app);
                });
        });
    });
}

function setupDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_order TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)');
}

var init = function(){
    var $body = $('body');
    var $overlay = $('.overlay');

    var flashTile = function($element){
        $element.addClass('flash');
        setTimeout(function(){
            $element.removeClass('flash');
        }, 100);
    };

    // -------------------------------------------------------------
    // DB: SEED TILE DATA
    $('[data-type="tally"]').each(function(index, element){
        updateTallyValue(app, $(element).data('rowid'));
    });

    $('[data-type="binary"]').each(function(index, element){
        updateBinaryValue(app, $(element).data('rowid'));
    });

    $('[data-type="scale"]').each(function(index, element){
        updateScaleValue(app, $(element).data('rowid'));
    });

    // -------------------------------------------------------------
    // QUO: TILE INTERACTIONS
    $$('[data-type="tally"]').tap(function(){
        var $me = $$(this);
        saveTallyResponse(app, $me.data('rowid'));
        flashTile($me);
    });

    $$('[data-type="binary"]').swipeRight(function(event){
        var $me = $$(this);
        saveBinaryResponse(app, $me.data('rowid'), 1);
    });
    $$('[data-type="binary"]').swipeLeft(function(event){
        var $me = $$(this);
        saveBinaryResponse(app, $me.data('rowid'), 0);
    });

    $$('[data-type="scale"]').swiping(function(event){
        var $me = $$(this);
        $me.data('swiping','true');
        var x = arguments[0].currentTouch.x;
        var win = window.innerWidth;
        var slice = win/11;
        x = x > win ? win - 1 : x;
        x = x < 0 ? 0 : x;
        var val = Math.floor(x/slice);

        val = val - 5; // force to use -5 to 5 scale

        $me.find('.js-display').text(val);
        $me.data('val', val);
    });
    $$('[data-type="scale"]').on('touchend', function(){
        var $me = $$(this);
        if($me.data('swiping') === 'true'){
            $me.data('swiping','false');
            var val = $me.data('val');
            var rowid = $me.data('rowid');
            saveScaleResponse(app, $me.data('rowid'), val);
        }
    });

    // -------------------------------------------------------------
    // overlay handlers
    $$('[toggle-overlay]').on('tap', function($event){
        $event.stopPropagation();

        var path = $(this).attr('toggle-overlay');
        var type = $(this).data('type');
        var $overlayBody = $overlay.find('.overlay-body');

        // clean out overlay content
        $overlay.removeClass('binary tally scale new').addClass(type);

        // fill in overlay content
        if(path.length) {
            $me = $(this).closest('.item');
            $.get(path + '.html',[],function(text){
                var options = JSON.parse($me.data('options'));
                var replacement = {
                                    'rowid':$me.data('rowid'),
                                    'name':$me.data('name'),
                                    'options':options
                                  };
                text = replace(text,replacement);
                $overlayBody.html(text);
                $body.toggleClass('overlay-open');
            });
        } else {
            $body.toggleClass('overlay-open',function(){
                $overlayBody.html('');
            });
        }
    });
};

function replace(str,data){
    for(i in data){
        var temp = new RegExp('{{'+i+'}}',"g");
        str = str.replace(temp,data[i]);
    }
    return str;
}

function updateTileOrder(app){
    $('#container .item').each(function(index, element){
        order = []
        $e = $(element);
        if($e.data('rowid') != ''){
            order.push($e.data('rowid'));
        }
    });
}

var loadTiles = function(app){
    var tiles = [];
    app.db.transaction(
        function(tx){tx.executeSql('SELECT *,rowid FROM tile', [],
            function(tx,results){
                var len = results.rows.length;
                for (var i=0; i<len; i++){
                    tiles.push(results.rows.item(i));
                }

                $('#container').empty();
                for(var t in tiles){
                    var type = tiles[t].type;
                    var rowid = tiles[t].rowid;
                    var options = tiles[t].options;
                    var name = tiles[t].name;
                    var tile = $('<div class="item ' + type + '"></div>');
                    var tileActions = $('<div class="tile-actions"></div>');
                    tile.attr('data-value', 0);
                    tile.attr('data-type', type);
                    tile.attr('data-rowid', rowid);
                    tile.data('options', options);
                    tile.data('name', name);
                    tile.data('value', 0);
                    tile.data('type', type);
                    tile.append('<h2>' + name + '</h2>');
                    switch(type) {
                        case 'binary':
                            tileActions.append('<div class="report-cue" data-type="binary" toggle-overlay="overlay/tile-log">&#9776;</div>');
                            tileActions.append('<div class="edit-cue" data-type="binary" toggle-overlay="overlay/edit">\u2B21</div>');
                            tile.append('<label class="js-display string">---</label>');
                            tile.append(tileActions);
                            break;
                        case 'tally':
                            tileActions.append('<div class="report-cue" data-type="tally" toggle-overlay="overlay/tile-log">&#9776;</div>');
                            tileActions.append('<div class="edit-cue" data-type="tally" toggle-overlay="overlay/edit">\u2B21</div>');
                            tile.append('<label class="js-display string">---</label>');
                            tile.append(tileActions);
                            break;
                        case 'scale':
                            tileActions.append('<div class="report-cue" data-type="scale" toggle-overlay="overlay/tile-log">&#9776;</div>');
                            tileActions.append('<div class="edit-cue" data-type="scale" toggle-overlay="overlay/edit">\u2B21</div>');
                            tile.append('<label class="js-display string">---</label>');
                            tile.append(tileActions);
                            break;
                    }
                    $('#container').append(tile);
                }
                init();
            },
            function(tx,results){
                window.console.log('error',tx,results);
            });
        });
};

app.initialize();
loadTiles(app);

$(document).on("pagecreate","#pageone",function(){
  $("div").on("click",function(){
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
        var time = Date.now();
        var option = {
            'label-a':tile['label-a'],
            'label-b':tile['label-b'],
            'timebox':tile['tile-timebox']
        };
        app.db.transaction(function(tx){
            tx.executeSql('INSERT INTO tile (name,user_id,type,options,created,modified) VALUES(?,?,?,?,?,?)',[tile['tile-name'],app.userid,tile['tile-type'],JSON.stringify(option),time,time],function(tx,results){
                    loadTiles(app);
                    $('body').toggleClass('overlay-open');
                    updateTileOrder(app);
            });
        });
    }
    return false;
});

//function queryDB(tx, sql, params, successCB, errorCB) {
//    tx.executeSql(sql, params, successCB, errorCB);
//}
