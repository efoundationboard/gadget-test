/*jslint node: true */
"use strict";


var serialportLib = require("serialport");
var SerialPort = serialportLib.SerialPort;

var efbParser = function (emitter, buffer) {
	//console.log(emitter);
	emitter.emit("data", buffer);
}

var DEFAULT_EFB_DATA_CALLBACK = function(data) {
	console.log("here is default data callback");
	console.log(data);
}


var DEFAULT_SERIAL_OPTION = {
	baudrate: 9600,
	databits: 8,
	parity: "none", 
	stopbits: 1,
	flowcontrol : false,
	parser: efbParser,
	//dataCallback: DEFAULT_EFB_DATA_CALLBACK, 
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
		var serialportList = [];
		serialPortNameList.forEach(function(portName){
			var serialport = new SerialPort(portName, DEFAULT_SERIAL_OPTION, false);
			serialportList[serialportList.length] = serialport;
		});
		callback(null, serialportList);
	}, 

	setupSerialPort: function(serialportList, callback){
		var portBeanList = [];

		serialportList.forEach(function(sp){
			var portBean = {
				serialport: sp, 
				isGadget: false,
				portName: sp.path, 


				onData: function(data){
					var self = portBean;
					//console.log(this);
					console.log(self.portName + " got data: " + data.toString());
				},

				writeRequestPacket: function(){
					var self = portBean;
					self.serialport.write("?", function(err, bytesSent){
						if (err) {
							console.log(self.portName + " send failure");
						} else {
							console.log(self.portName + " " + bytesSent + " bytes sent");
						}
					});
				}, 

				onOpen: function(err){
					var self = portBean;
					if (err) {
						console.log(this.path + " open failed");
					} else {
						console.log(this.path + " opened");
						setTimeout(self.writeRequestPacket, 2000);
					}
				}, 

				openPort: function(){
					console.log(this.portName + " ready to open");
					this.serialport.on("data", this.onData);
					this.serialport.on("open", this.onOpen);
					this.serialport.open(function(err) {

					});
				}, 
			};

			portBeanList[portBeanList.length] = portBean;
			portBean.openPort();
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

