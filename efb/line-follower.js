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
		var portBeanList = [];

		serialportList.forEach(function(sp){
			var portBean = {
				serialport: sp, 
				isGadget: false,
				portName: sp.path, 


				onData: function(data){
					console.log(this.portName + " got data: " + data.toString());
				},

				writeRequestPacket: function(){
					this.serialport.write("?", function(err, bytesSent){
						if (err) {
							console.log(this.portName + " send failure");
						} else {
							console.log(this.portName + " bytes sent");
						}
					});
				}, 

				onOpen: function(err){
					if (err) {
						console.log(this.portName + " open failed");
					} else {
						console.log(this.portName + " opened");
						setTimeout(this.writeRequestPacket, 2000);
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

