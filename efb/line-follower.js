/*jslint node: true */
"use strict";

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var async = require("async");
var http = require("http");
var url = require("url");

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

var gadgetList = [];

var GADGET_EXECUTING_IDLE = 0;
var GADGET_EXECUTING_REQUEST_TAG = 1;

var Gadget = function(sp, gadgetType, callback) {

	this._sp = sp;
	this._gadgetType = gadgetType;
	this._tag = undefined;
	this._executing = GADGET_EXECUTING_IDLE;
	this._setupDoneCallback = callback;

	var self = this;

	this.parseData = function(data) {
		switch (self._executing) {
			case GADGET_EXECUTING_IDLE:
				break;
			case GADGET_EXECUTING_REQUEST_TAG:
				self._tag = data.toString();
				if (self._setupDoneCallback) {
          self._setupDoneCallback();
        }
        gadgetList[self._tag] = self;
        gadgetList[gadgetList.length] = self;
				break;
			default:
				break;
		}
		self._executing = GADGET_EXECUTING_IDLE;
	};

	self._sp.on("data", self.parseData);

	this._requestTag = function() {
		self._executing = GADGET_EXECUTING_REQUEST_TAG;
		self._sp.write("T");
	}
	
	self._requestTag();

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
			//wait auto restart
			setTimeout(writeRequest, 2000);

			var checkGadget = function()
			{
				if (candidate.isGadget) {
					console.log(candidate.spObj.path + " is gadget : " + GADGET_TYPE_STR[candidate.gadgetType]);
					var g = new Gadget(candidate.spObj, candidate.gadgetType);
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


var server = http.createServer(function(req, resp) {
	var urlObj = url.parse(req.url, true);
	var pathname = urlObj.pathname;

	resp.writeHead(200, { 'Content-Type': 'application/json' });
	if (pathname === "/list_all_gadgets")
	{
		var respList = [];
		gadgetList.forEach(function(gadget) {
			var respObj = {
				dev: gadget._sp.path, 
				gadgetType: gadget._gadgetType, 
				gadgetTypeStr: GADGET_TYPE_STR[gadget._gadgetType], 
				tag: gadget._tag, 
			};
			respList[respList.length] = respObj;
		});
		resp.write(JSON.stringify(respList));
		resp.end();

	}
});

server.listen(8080);