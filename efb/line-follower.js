var serialportLib = require("serialport");
var SerialPort = serialportLib.SerialPort;


var myParser = function(emitter, buffer) {
  // Inspect buffer, emit on emitter:
  console.log(buffer);
  if(buffer.toString("utf8", 0, 3) === "foo")
    emitter.emit("data", buffer);
  else
    emitter.emit("data", buffer);
};

var DEFAULT_SERIAL_OPTION = {
	baudrate: 9600,
	databits: 8,
	parity: "none", 
	stopbits: 1,
	flowcontrol : false,
	parser: myParser, 
};

var efb = {
	getAllSerialPortName: function(callback){
		serialportLib.list(function(err, ports){
			if (err)
			{
				callback(err, null);
				return ;
			}
			var serialPortNameList = [];
			ports.forEach(function(port){
				serialPortNameList[serialPortNameList.length] = port.comName;
			});

			callback(null, serialPortNameList);
		});
	}, 

	openSerialPort: function(serialPortNameList, callback){
		serialportList = [];
		serialPortNameList.forEach(function(portName){
			serialport = new SerialPort(portName, DEFAULT_SERIAL_OPTION, false);
			serialportList[serialportList.length] = serialport;
		});
		callback(null, serialportList);
	}, 

	setupSerialPort: function(serialportList, callback){
		var tmpSpList = [];

		serialportList.forEach(function(sp){

			

			sp.on("open", function(err){
				if (err) {
					console.log(sp.path  + " " + err.toString());
				} else {
					console.log(sp.path + " opened, ready to write something to this port");
					sp.on("data", function(data){
						console.log("rrrr");
						console.log(sp.path + " : receive data: " + data.toString());

					});
					sp.write("?", function(err, results){
						if (err) {
							console.log(sp.path + " error: " + err);
						} else {
							console.log(sp.path + " results: " + results);
						}
						
						
					});

				}

			});



			sp.open(function(err){

			});

		});



/*		
			
		});
*/

	}, 
};


efb.getAllSerialPortName(function(err, namelist){
	console.log(namelist.length + " serial port(s) found.");

	efb.openSerialPort(namelist, function(err, serialportList){
		//console.log(serialportList);
		efb.setupSerialPort(serialportList, null);
	});
});



/*
var s0 = new SerialPort("/dev/ttyUSB0", {baudrate: 9600}, true);
s0.open(function(err){
	if (err) {
		console.log("failed to open ");
	} else {
		console.log("usb0 opened");
	}
});







			serialport.on("open", function(){
				console.log(portName + " opened");
				serialport.on("data", function(data){
					console.log(portName + " : receive data: " + data.toString());
				});
				serialport.write("???????", function(err, results){
					console.log(portName + " error: " + err);
					console.log(portName + " results: " + results);
				});
			});
*/
