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
            $display.text(val)
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
        var $overlayBody = $overlay.find('section');
        // clean out overlay content
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
