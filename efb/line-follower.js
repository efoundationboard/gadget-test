var serialportLib = require("serialport");
var SerialPort = serialportLib.SerialPort;

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
			serialport = new SerialPort(portName, {baudrate:9600}, false);
			serialportList[serialportList.length] = serialport;
		});
		callback(null, serialportList);
	}, 

	setupSerialPort: function(serialportList, callback){
		serialportList.forEach(function(sp){
			sp.on("open", function(err){
				if (err) {
					console.log(sp.options.path  + " " + err.toString());
				} else {
					console.log(sp.options.path + " opened");
				}
			});

			sp.on("data", function(data){
					console.log(sp.options.path + " : receive data: " + data.toString());
			});

			sp.open(function(err){

			});
		});
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

<<<<<<< HEAD





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
=======
*/
>>>>>>> 22ca51c56c0b00dc729b2c0ccb48c38d72fe4fa6
