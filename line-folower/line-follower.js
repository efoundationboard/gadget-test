var LF = function(){
	var self = this;
	this._leftSensor = 0;
	this._rightSensor = 0;
	this._leftSensorTag = "L";
	this._rightSensorTag = "R";
	this._motorTag = "M";
	this._leftSpeed = 0;
	this._rightSpeed = 0;
	this._leftLight = true;
	this._rightLight = true;

	this.stopMotor = false;

	efb.writeValue(self._leftSensorTag, "A", self._leftLight?1:0);
	efb.writeValue(self._rightSensorTag, "A", self._rightLight?1:0);

	this._loop = function() {
		//console.log(self._leftSensor + " | " + self._rightSensor);

		if (self._leftSensor < 100) {
			self._leftSpeed = -80;
		} else {
			self._leftSpeed = 127;
		}
		if (self._rightSensor < 100) {
			self._rightSpeed = -80;
		} else {
			self._rightSpeed = 127;
		}

		if (self.stopMotor) {
			self._leftSpeed = 0;
			self._rightSpeed = 0;
		}

		//update sensor;
		efb.writeValue(self._motorTag, "B", 128 - self._leftSpeed);
		efb.writeValue(self._motorTag, "A", 128 - self._rightSpeed);



		efb.readValue(self._leftSensorTag, "B", function(value){self._leftSensor = value;});
		efb.readValue(self._rightSensorTag, "B", function(value){self._rightSensor = value;});

	};

	this.getSensorValue = function(callback) {
		callback([self._leftSensor, self._rightSensor]);
	};

	this.getSpeed = function(callback) {
		callback([self._leftSpeed, self._rightSpeed]);
	};

	this.setLeftLight = function(value) {
		self._leftLight = value;
	};

	this.setRightLight = function(value) {
		self._rightLight = value;
	};

	this.getLeftLight = function() {
		return self._leftLight;
	};

	this.getRightLight = function() {
		return self._rightLight;
	};

	this.flushLightStatus = function() {
		efb.writeValue(self._leftSensorTag, "A", self._leftLight?1:0);
		efb.writeValue(self._rightSensorTag, "A", self._rightLight?1:0);
	};

	setInterval(self._loop, 100);
};

