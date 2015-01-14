var LF = function(){
	var self = this;
	this._leftSensor = 0;
	this._rightSensor = 0;
	this._leftSensorTag = "L";
	this._rightSensorTag = "R";
	this._motorTag = "M";

	this._loop = function() {
		//console.log(self._leftSensor + " | " + self._rightSensor);
		//update sensor;
		efb.readValue(self._leftSensorTag, "B", function(value){self._leftSensor = value;});
		efb.readValue(self._rightSensorTag, "B", function(value){self._rightSensor = value;});

	}

	this.getSensorValue = function(callback) {
		callback([self._leftSensor, self._rightSensor]);
	}

	setInterval(self._loop, 100);
};

