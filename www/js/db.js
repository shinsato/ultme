function setupDB(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id INTEGER UNIQUE,account_id INTEGER,name TEXT,email TEXT,password TEXT,tile_list TEXT, created NUMERIC, modified NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS tile (id INTEGER UNIQUE,user_id INTEGER,account_id INTEGER,name TEXT,type TEXT NOT NULL DEFAULT "tally",status TEXT NOT NULL DEFAULT "active",options TEXT,min INTEGER,max INTEGER,created NUMERIC,modified NUMERIC,archived NUMERIC,deleted NUMERIC)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS response (id INTEGER UNIQUE,account_id INTEGER,user_id INTEGER,tile_id INTEGER,value INTEGER,geolocation TEXT,created NUMERIC)');
}

function loadTiles(app){
	var tiles = [];
	app.db.transaction(
        function(tx){tx.executeSql('SELECT * FROM tile', [],
            function(tx,results){
                var len = results.rows.length;
                for (var i=0; i<len; i++){
                    tiles.push(results.rows.item(i));
                }console.log(tiles);
                for(t in tiles){
			    	$('#container').append('<div class="item ' + tiles[t].type + '"><h2>' + tiles[t].name + '</h2><label class="string">Yes</label></div>');
			    }
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
