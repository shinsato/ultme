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
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

console.log($('div.count'));

$(document).on("pagecreate","#pageone",function(){
  $("div").on("click",function(){
    console.log('heeeelp');
    // $(this).hide();
  });
});

$(function(){
    var $body = $('body');
    var $overlay = $('.overlay');
    var tileTypeCount = $('[data-type="count"]');
    var tileTypeBinary = $('[data-type="binary"]');
    var tileTypeScale = $('[data-type="scale"]');

    var flashTile = function($element){
        $element.addClass('flash');
        setTimeout(function(){
            $element.removeClass('flash');
        }, 100);
    };

    tileTypeCount.each(function(index, element){
        var $e = $(element);
        var val = $e.data('value');
        var $display = $($e.find('.js-display'));

        $(element).on('click', function(event){
            var $me = $(this);
            val += 1;
            $display.text(val)
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
        var $overlayBody = $overlay.find('section');
        // clean out overlay content
        $overlayBody.html('');

        // fill in overlay content
        if(path.length) {
            $overlayBody.load(path + '.html');
        }
        $body.toggleClass('overlay-open');
    });
});
