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
var GADGET_EXECUTING_READ_BYTE = 2;

var Gadget = function(sp, gadgetType, callback) {

	this._sp = sp;
	this._gadgetType = gadgetType;
	this._tag = undefined;
	this._executing = GADGET_EXECUTING_IDLE;
	this._callback = callback;

	var self = this;

	this.parseData = function(data) {
		switch (self._executing) {
			case GADGET_EXECUTING_IDLE:
				break;
			case GADGET_EXECUTING_REQUEST_TAG:
				self._tag = data.toString();
				if (self._callback) {
					self._callback();
				}
				gadgetList[self._tag] = self;
				gadgetList[gadgetList.length] = self;
				break;
			case GADGET_EXECUTING_READ_BYTE:
				var value = data[0];
				self._callback("ok", value);
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

	this._writeBinary = function(channel, value, callback) {
		switch (self._gadgetType) {
			case GADGET_TYPE_LDR:
				if (channel === "A") {
					if (Number(value) === 0) {
						self._sp.write("F", function(err, result) {callback("ok");});
					} else {
						self._sp.write("N", function(err, result) {callback("ok");});
					}
				} else {
					callback("gadget has no channel " + channel);
				}
				break;
			case GADGET_TYPE_DUAL_MOTOR:
				var buf = new Buffer(2);
				buf[1] = Number(value);
				var valueStr = String.fromCharCode(value);
				if (channel === "A") {
					buf[0] = 'L'.charCodeAt(0);
					self._sp.write(buf, function(err, result) {callback("ok");});
				} else {
					if (channel === "B") {
						buf[0] = 'R'.charCodeAt(0);
						self._sp.write(buf, function(err, result) {callback("ok");});
					} else {
						callback("gadget has not channel " + channel);
					}
				}
				break;
			default:
				callback("gadget not support");
				break;
		}
	};

	this._readValue = function(channel, callback) {
		switch (self._gadgetType) {
			case GADGET_TYPE_LDR:
				if (channel === "B")
				{
					self._executing = GADGET_EXECUTING_READ_BYTE;
					self._callback = callback;
					self._sp.write("L");
				} else {
					callback("gadget has no channel " + channel);
				}

				break;
			default:
				callback("gadget not support");
				break;
		}
	}

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

	resp.writeHead(200, { 
		'Content-Type': 'application/json',
		"Access-Control-Allow-Origin" : "*", 
	});
	if (pathname === "/list_all_gadgets") {
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

	} else {
		if (pathname === "/write_value") {
			var channel = urlObj.query.channel;
			var value = Number(urlObj.query.value);
			var gadgetTag = urlObj.query.tag;

			var g = gadgetList[gadgetTag];
			var respObj = {
				tag: urlObj.query.tag, 
				value	: Number(urlObj.query.value), 
				channel: urlObj.query.channel, 
				message: undefined, 
			};
			if (g == undefined) {
				respObj.message = "cannot find this gadget";

				resp.write(JSON.stringify(respObj));
				resp.end();
			} else {
				g._writeBinary(channel, value, function(message){
					respObj.message = message;
					resp.write(JSON.stringify(respObj));
					resp.end();
				});
			}

		} else {
			if (pathname === "/read_value") {
				var channel = urlObj.query.channel;
				var gadgetTag = urlObj.query.tag;

				var g = gadgetList[gadgetTag];
				var respObj = {
					tag: urlObj.query.tag, 
					channel: urlObj.query.channel, 
					message: undefined, 
					value: undefined, 
				};
				if (g == undefined) {
					respObj.message = "cannot find this gadget";

					resp.write(JSON.stringify(respObj));
					resp.end();
				} else {
					g._readValue(channel, function(message, value){
						respObj.message = message;
						respObj.value = value;
						resp.write(JSON.stringify(respObj));
						resp.end();
					});
				}
			}
		}
	}
});

server.listen(8080);


/*-------------------
test urls
http://127.0.0.1:8080/list_all_gadgets
http://127.0.0.1:8080/write_binary?tag=L&channel=A&value=1
http://127.0.0.1:8080/read_value?tag=L&channel=B
---------------------*/