var LF = function(){

	console.log("dummy");
 	
 	setTimeout(function(){
 		setInterval(function(){
 			efb.writeBinary("L", "A", 1);
 		}, 2000);
 	}, 1000);

 	setInterval(function(){
 		efb.writeBinary("L", "A", 0);
 	}, 2000);
};

