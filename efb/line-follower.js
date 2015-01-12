var serialportLib = require("serialport");
var SerialPort = serialportLib.SerialPort;



var DEFAULT_SERIAL_OPTION = {
	baudrate: 9600,
	databits: 8,
	parity: "none", 
	stopbits: 1,
	flowcontrol : false,
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
			sp.on("data", function(data){
				console.log(sp.path + " : receive data: " + data.toString());

			});
			
			console.log("serial port data parser setted");

			sp.on("open", function(err){
				if (err) {
					console.log(sp.path  + " " + err.toString());
				} else {
					console.log(sp.path + " opened, ready to write something to this port");
					
					setTimeout(function(){
						sp.write("?", function(err, results){
							if (err) {
								console.log(sp.path + " error: " + err);
							} else {
								console.log(sp.path + " results: " + results);
							}
						});
					}, 2000);	//wait for arduino autoreset
					

				}

			});

			sp.open(function(err){});
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

