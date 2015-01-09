var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var efb = {
	getAllSerialPortName: function(callback){
		serialport.list(function(err, ports){
			var serialPortNameList = [];
			ports.forEach(function(port){
				serialPortNameList[serialPortNameList.length] = port.comName;
			});

			callback(err, serialPortNameList);
		});
	}, 

	
};


efb.getAllSerialPortName(function(err, namelist){
	console.log(namelist.length + " serial port(s) found.");

	console.log(namelist);
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

*/