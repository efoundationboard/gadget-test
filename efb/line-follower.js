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
    var candidate = {
    	spObj: sp,
    	isGadget: false,
    	gadgetType: GADGET_TYPE_NOT_GADGET, 
    };
    sp.on("open", function(){
      console.log(sp.path + " opened");
      
      var writeRequest = function(){
        sp.write("?");
      };
      var checkResponsePacket = function(data) {
      	var dataStr = data.toString();
      	if (dataStr.length === 1) {
      		if (dataStr === "L") {
      			candidate.isGadget = true;
      			candidate.gadgetType = GADGET_TYPE_LDR;
      		} else {
      			if (dataStr === "M") {
      				candidate.isGadget = true;
      				candidate.gadgetType = GADGET_TYPE_DUAL_MOTOR;
      			}
      		}
      	}
      };

      sp.on("data", function(data){
        checkResponsePacket(data);
      });

      setTimeout(writeRequest, 2000);

      var checkGadget = function()
      {
      	if (candidate.isGadget) {
      		console.log(candidate.spObj.path + " is gadget : " + GADGET_TYPE_STR[candidate.gadgetType]);
      	}
      	else
      	{
      		candidate.spObj.close();
      	}
      };

      setTimeout(checkGadget, 3000);

    });
    sp.open();
  })
});