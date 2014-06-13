function setupDB(e){e.executeSql("CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)"),e.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)'),e.executeSql("CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)")}function init(){var e=$("body"),t=$(".overlay"),a=$('[data-type="tally"]'),n=$('[data-type="binary"]'),i=$('[data-type="scale"]'),l=function(e){e.addClass("flash"),setTimeout(function(){e.removeClass("flash")},100)},o=function(){e.toggleClass("overlay-open")};a.each(function(e,t){var a=$(t),n=a.data("value"),i=$(a.find(".js-display"));$(t).on("click",function(e){var t=$(this);n+=1,i.text(n),t.attr("data-value",n),t.data("value",n),l(t)})}),n.each(function(e,t){var a=$(t),n=a.data("value"),i=$(a.find(".js-display"));$(t).on("click",function(e){console.log(n)})}),$(document).on("click","[toggle-overlay]",function(){var e=$(this).attr("toggle-overlay"),a=$(this).data("type"),n=t.find("section");t.removeClass("binary tally scale new").addClass(a),n.html(""),e.length&&n.load(e+".html"),o()})}function loadTiles(e){var a=[];e.db.transaction(function(e){e.executeSql("SELECT * FROM tile",[],function(e,n){for(var i=n.rows.length,l=0;i>l;l++)a.push(n.rows.item(l));console.log(a);for(t in a){var o=a[t].type,c=$('<div class="item '+o+'"></div>');switch(c.attr("data-value",0),c.attr("data-type",o),c.data("value",0),c.data("type",o),c.append("<h2>"+a[t].name+"</h2>"),o){case"binary":c.append('<label class="js-display string">0</label>'),c.attr("toggle-overlay","overlay/tile-binary");break;case"tally":c.append('<label class="js-display string">0</label>');break;case"scale":c.append('<label class="js-display string">0</label>'),c.attr("toggle-overlay","overlay/tile-scale")}$("#container").append(c)}init()},function(e,t){console.log("error",e,t)})})}var app={initialize:function(){function e(){app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Did you drink coffee?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many cups?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Are you glad you did?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many red lights?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type,min,max) VALUES("How would you rate today?","scale",-5,5)')})}this.bindEvents(),this.initDb()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1),document.addEventListener("documentready",this.onDeviceReady,!1)},onDeviceReady:function(){app.receivedEvent("deviceready"),this.initDb()},receivedEvent:function(e){var t=document.getElementById(e),a=t.querySelector(".listening"),n=t.querySelector(".received");a.setAttribute("style","display:none;"),n.setAttribute("style","display:block;"),console.log("Received Event: "+e)},initDb:function(){app.db=window.openDatabase("ultme","1.0","Ultimately Me",1e6),app.db.transaction(setupDB)}};app.initialize(),loadTiles(app),$(document).on("pagecreate","#pageone",function(){$("div").on("click",function(){console.log("heeeelp")})}).on("submit","#update-tile",function(){var e=$(this);console.log(e.serialize())});