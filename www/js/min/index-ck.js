function setupDB(e){e.executeSql("CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)"),e.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)'),e.executeSql("CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)")}var app={initialize:function(){function e(){app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Did you drink coffee?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many cups?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("Are you glad you did?","binary")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type) VALUES("How many red lights?","tally")')}),app.db.transaction(function(e){e.executeSql('INSERT INTO tile (name,type,min,max) VALUES("How would you rate today?","scale",-5,5)')})}function a(){app.db.transaction(function(e){e.executeSql("DROP TABLE user")}),app.db.transaction(function(e){e.executeSql("DROP TABLE tile")}),app.db.transaction(function(e){e.executeSql("DROP TABLE response")})}this.bindEvents(),this.initDb()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1),document.addEventListener("documentready",this.onDeviceReady,!1)},onDeviceReady:function(){app.receivedEvent("deviceready"),this.initDb()},receivedEvent:function(e){var a=document.getElementById(e),t=a.querySelector(".listening"),n=a.querySelector(".received");t.setAttribute("style","display:none;"),n.setAttribute("style","display:block;"),window.console.log("Received Event: "+e)},initDb:function(){app.db=window.openDatabase("ultme","1.0","Ultimately Me",1e6),app.db.transaction(setupDB),this.createUserIfNotExists()},createUserIfNotExists:function(){app.db.transaction(function(e){e.executeSql("SELECT *,rowid FROM user",[],function(e,a){var t=a.rows.length;t>0?app.userid=a.rows.item(0).rowid:app.db.transaction(function(e){(new Date).getTime();var a=Date.now();e.executeSql("INSERT INTO user (created) VALUES(?)",[a],function(e,a){app.userid=a.insertId})})})})}},updateTallyValue=function(e,a){e.db.transaction(function(e){e.executeSql("SELECT sum(value) as total FROM response WHERE tile_id = ?",[a],function(e,t){var n=t.rows.item(0).total;n=n>0?n:0;var i=$("[data-rowid='"+a+"']"),l=$(i.find(".js-display"));l.text(n),i.attr("data-value",n),i.data("value",n)})})},updateBinaryValue=function(e,a){},updateScaleValue=function(e,a){},__saveTallyResponse=function(e,a,t,n){(new Date).getTime();var i=Date.now(),l="";t&&n&&(l=t+","+n),e.db.transaction(function(t){t.executeSql("INSERT INTO response (tile_id,user_id,value,geolocation,created) VALUES (?,?,?,?,?)",[a,e.userid,1,l,i],function(t,n){updateTallyValue(e,a)})})},saveTallyResponse=function(e,a){"geolocation"in navigator?navigator.geolocation.getCurrentPosition(function(t){var n=t.coords.latitude,i=t.coords.longitude;__saveTallyResponse(e,a,n,i)},function(){__saveTallyResponse(e,a,null,null)}):__saveTallyResponse(e,a,null,null)},init=function(){var e=$("body"),a=$(".overlay"),t=function(e){e.addClass("flash"),setTimeout(function(){e.removeClass("flash")},100)};$('[data-type="tally"]').each(function(e,a){updateTallyValue(app,$(a).data("rowid"))}),$('[data-type="binary"]').each(function(e,a){updateBinaryValue(app,$(a).data("rowid"))}),$('[data-type="scale"]').each(function(e,a){updateScaleValue(app,$(a).data("rowid"))}),$$('[data-type="tally"]').tap(function(){var e=$(this);saveTallyResponse(app,e.data("rowid")),t(e)}),$$('[data-type="binary"]').tap(function(){}),$$('[data-type="scale"]').tap(function(){}),$$("[toggle-overlay]").on("tap",function(t){t.stopPropagation(),e.toggleClass("overlay-open");var n=$(this).attr("toggle-overlay"),i=$(this).data("type"),l=a.find(".overlay-body");a.removeClass("binary tally scale new").addClass(i),e.hasClass("overlay-open")&&l.html(""),n.length&&l.load(n+".html")})},loadTiles=function(e){var a=[];e.db.transaction(function(e){e.executeSql("SELECT *,rowid FROM tile",[],function(e,t){for(var n=t.rows.length,i=0;n>i;i++)a.push(t.rows.item(i));$("#container").empty();for(var l in a){var o=a[l].type,d=a[l].rowid,s=$('<div class="item '+o+'"></div>'),r=$('<div class="tile-actions"></div>');switch(s.attr("data-value",0),s.attr("data-type",o),s.attr("data-rowid",d),s.data("value",0),s.data("type",o),s.append("<h2>"+a[l].name+"</h2>"),o){case"binary":r.append('<div class="report-cue" data-type="binary" toggle-overlay="overlay/tile-log">&#9776;</div>'),r.append('<div class="edit-cue" data-type="binary" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(r),s.attr("toggle-overlay","overlay/tile-binary");break;case"tally":r.append('<div class="report-cue" data-type="tally" toggle-overlay="overlay/tile-log">&#9776;</div>'),r.append('<div class="edit-cue" data-type="tally" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(r);break;case"scale":r.append('<div class="report-cue" data-type="scale" toggle-overlay="overlay/tile-log">&#9776;</div>'),r.append('<div class="edit-cue" data-type="scale" toggle-overlay="overlay/edit">⬡</div>'),s.append('<label class="js-display string">0</label>'),s.append(r),s.attr("toggle-overlay","overlay/tile-scale")}$("#container").append(s)}init()},function(e,a){window.console.log("error",e,a)})})};app.initialize(),loadTiles(app),$(document).on("pagecreate","#pageone",function(){$("div").on("click",function(){})}).on("submit","#update-tile",function(){var e=$(this),a=[];if($.each(e.serializeArray(),function(e,t){a[t.name]=t.value}),a["tile-id"]>0);else{(new Date).getTime();var t=Date.now(),n={"label-a":a["label-a"],"label-b":a["label-b"],timebox:a["tile-timebox"]};app.db.transaction(function(e){e.executeSql("INSERT INTO tile (name,user_id,type,options,created,modified) VALUES(?,?,?,?,?,?)",[a["tile-name"],app.userid,a["tile-type"],JSON.stringify(n),t,t],function(e,a){$("body").toggleClass("overlay-open"),loadTiles(app)})})}return!1});