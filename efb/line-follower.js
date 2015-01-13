/*jslint node: true */
"use strict";

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var async = require("async");

var GADGET_TYPE_NOT_GADGET = 0;
var GADGET_TYPE_LDR = 1;
var GADGET_TYPE_DUAL_MOTOR = 2;

var GADGET_TYPE_STR = [];
GADGET_TYPE_STR[GADGET_TYPE_NOT_GADGET] = "not a gadget";
GADGET_TYPE_STR[GADGET_TYPE_LDR] = "LDR gadget";
GADGET_TYPE_STR[GADGET_TYPE_DUAL_MOTOR] = "dual motor gadget";

var DEFAULT_SERIAL_OPTION = {
	baudrate: 9600,
	databits: 8,
	parity: "none", 
	stopbits: 1,
	flowcontrol : false,
};

serialport.list(function(err, ports){
  ports.forEach(function(port){
    var sp = new SerialPort(port.comName, {baudrate:9600}, false);

    sp.on("open", function(){
      console.log(sp.path + " opened");
      sp.on("data", function(data){
        console.log(sp.path + " received " + data);
      });
      var writeRequest = function(){
        sp.write("?");
      }
      //setInterval(function(){sp.write("?");}, 1000);
      setTimeout(writeRequest, 2000);
    });
    sp.open();
  })
});