var app={initialize:function(){this.bindEvents()},bindEvents:function(){document.addEventListener("deviceready",this.onDeviceReady,!1)},onDeviceReady:function(){app.receivedEvent("deviceready")},receivedEvent:function(e){var t=document.getElementById(e),n=t.querySelector(".listening"),o=t.querySelector(".received");n.setAttribute("style","display:none;"),o.setAttribute("style","display:block;"),console.log("Received Event: "+e)}};console.log($("div.count")),$(document).on("pagecreate","#pageone",function(){$("div").on("click",function(){console.log("heeeelp")})}),$(function(){var e=$("body"),t=$(".overlay"),n=$('[data-type="count"]'),o=$('[data-type="binary"]'),a=$('[data-type="scale"]'),i=function(e){e.addClass("flash"),setTimeout(function(){e.removeClass("flash")},100)};n.each(function(e,t){var n=$(t),o=n.data("value"),a=$(n.find(".js-display"));$(t).on("click",function(e){var t=$(this);o+=1,a.text(o),t.data("value",o),i(t)})}),o.each(function(e,t){var n=$(t),o=n.data("value"),a=$(n.find(".js-display"));$(t).on("click",function(e){console.log(o)})}),$(document).on("click","[toggle-overlay]",function(){var n=$(this).attr("toggle-overlay");n.length&&t.find("section").load(n+".html"),e.toggleClass("overlay-open")})});