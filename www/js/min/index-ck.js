function setupDB(e){e.executeSql("CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)"),e.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)'),e.executeSql("CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)")}function init(){var e=$("body"),t=$(".overlay"),a=$('[data-type="tally"]'),i=$('[data-type="binary"]'),n=$('[data-type="scale"]'),l=function(e){e.addClass("flash"),setTimeout(function(){e.removeClass("flash")},100)},o=function(){e.toggleClass("overlay-open")};a.each(function(e,t){var a=$(t),i=a.data("value"),n=$(a.find(".js-display"));$(t).on("click",function(e){var t=$(this);saveTallyResponse(app,t.data("rowid")),l(t)}),updateTallyCount(app,a.data("rowid"))}),i.each(function(e,t){var a=$(t),i=a.data("value"),n=$(a.find(".js-display"));$(t).on("click",function(e){console.log(i)}),console.log(a.data("rowid"))}),$(document).on("click","[toggle-overlay]",function(e){e.stopPropagation();var a=$(this).attr("toggle-overlay"),i=$(this).data("type"),n=t.find(".overlay-body");t.removeClass("binary tally scale new").addClass(i),n.html(""),a.length&&n.load(a+".html"),o()})}function saveTallyResponse(e,t){"geolocation"in navigator?navigator.geolocation.getCurrentPosition(function(a){var i=a.coords.latitude,n=a.coords.longitude;__saveTallyResponse(e,t,i,n)},function(){__saveTallyResponse(e,t,null,null)}):__saveTallyResponse(e,t,null,null)}function __saveTallyResponse(e,t,a,i){(new Date).getTime(),time=Date.now();var n="";a&&i&&(n=a+","+i),e.db.transaction(function(a){a.executeSql("INSERT INTO response (tile_id,value,geolocation,created) VALUES (?,?,?,?)",[t,1,n,time],function(a,i){updateTallyCount(e,t)})})}function updateTallyCount(e,t){e.db.transaction(function(e){e.executeSql("SELECT sum(value) as total FROM response WHERE tile_id = ?",[t],function(e,a){console.log(t,a.rows.item(0),e);var i=a.rows.item(0).total;i=i>0?i:0;var n=$("[data-rowid='"+t+"']"),l=$(n.find(".js-display"));l.text(i),n.attr("data-value",i),n.data("value",i)})})}function loadTiles(e){var a=[];e.db.transaction(function(e){e.executeSql("SELECT *,rowid FROM tile",[],function(e,i){for(var n=i.rows.length,l=0;n>l;l++)a.push(i.rows.item(l));console.log(a),$("#container").empty();for(t in a){var o=a[t].type,d=a[t].rowid,s=$('<div class="item '+o+'"></div>'),c=$('<div class="tile-actions"></div>');switch(s.attr("data-value",0),s.attr("data-type",o),s.attr("data-rowid",d),s.data("value",0),s.data("type",o),s.append("<h2>"+a[t].name+"</h2>"),o){case"binary":c.append('<div class="report-cue" data-type="binary" toggle-overlay="overlay/tile-log">&#9776;</div>'),c.append('<div class="edit-cue" data-type="binary" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(c),s.attr("toggle-overlay","overlay/tile-binary");break;case"tally":c.append('<div class="report-cue" data-type="tally" toggle-overlay="overlay/tile-log">&#9776;</div>'),c.append('<div class="edit-cue" data-type="tally" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(c);break;case"scale":c.append('<div class="report-cue" data-type="scale" toggle-overlay="overlay/tile-log">&#9776;</div>'),c.append('<div class="edit-cue" data-type="scale" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(c),s.attr("toggle-overlay","overlay/tile-scale")}$("#container").append(s)}init()},function(e,t){console.log("error",e,t)})})}var app={initialize:function(){function e(){app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Did you drink coffee?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many cups?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Are you glad you did?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many red lights?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type,min,max) VALUES("How would you rate today?","scale",-5,5)')})}this.bindEvents(),this.initDb()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1),document.addEventListener("documentready",this.onDeviceReady,!1)},onDeviceReady:function(){app.receivedEvent("deviceready"),this.initDb()},receivedEvent:function(e){var t=document.getElementById(e),a=t.querySelector(".listening"),i=t.querySelector(".received");a.setAttribute("style","display:none;"),i.setAttribute("style","display:block;"),console.log("Received Event: "+e)},initDb:function(){app.db=window.openDatabase("ultme","1.0","Ultimately Me",1e6),app.db.transaction(setupDB)}};app.initialize(),loadTiles(app),$(document).on("pagecreate","#pageone",function(){$("div").on("click",function(){console.log("heeeelp")})}).on("submit","#update-tile",function(){var e=$(this),t=[];return $.each(e.serializeArray(),function(e,a){t[a.name]=a.value}),t["tile-id"]>0||((new Date).getTime(),time=Date.now(),option={"label-a":t["label-a"],"label-b":t["label-b"],timebox:t["tile-timebox"]},app.db.transaction(function(e){e.executeSql("INSERT INTO tile (name,type,options,created,modified) VALUES(?,?,?,?,?)",[t["tile-name"],t["tile-type"],JSON.stringify(option),time,time],function(e,t){console.log(e,t),loadTiles(app),$("body").toggleClass("overlay-open")})})),!1});