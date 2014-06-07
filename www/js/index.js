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
});

