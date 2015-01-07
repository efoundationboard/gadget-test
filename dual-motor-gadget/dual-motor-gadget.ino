void setup()
{
	pinMode(3, OUTPUT);
	pinMode(5, OUTPUT);
	pinMode(6, OUTPUT);
	pinMode(9, OUTPUT);

	Serial.begin(9600);

	digitalWrite(3, LOW);
	digitalWrite(5, LOW);
	digitalWrite(6, LOW);
	digitalWrite(9, LOW);
}

void loop()
{
	readSerial();
	delay(10);
}

void readSerial()
{
	char cmd;
	if (Serial.available() > 0)
	{
		cmd = Serial.read();
		switch (cmd)
		{
			case ('?'):
			{
				Serial.write('M');
				break;
			}
			case ('T'):
			{
				Serial.write('M');
				break;
			}
			case ('L'):
			{
				delay(2);//wait for the speed value
				unsigned char s = Serial.read();
				writeSpeed(true, s);
				break;
			}
			case ('R'):
			{
				delay(2);	//wait for speed value
				unsigned char s = Serial.read();
				writeSpeed(false, s);
				break;
			}
			default:
			{
				break;
			}
		}
	}
}

void writeSpeed(bool isLeft, unsigned char rawSpeed)
{
	int pinA, pinB;
	if (isLeft)
	{
		pinA = 3;
		pinB = 5;
	}
	else
	{
		pinA = 6;
		pinB = 9;
	}

	int speed;

	if (rawSpeed > 128)
	{
		speed = map(rawSpeed, 129, 255, 1, 255);
		constrain(speed, 0, 128);
		
		digitalWrite(pinB, LOW);
		analogWrite(pinA, speed);
	}
	else
	{
		if (rawSpeed < 128)
		{
			speed = map(rawSpeed, 0, 127, 255, 1);
			constrain(speed, 0, 128);
			digitalWrite(pinA, LOW);
			analogWrite(pinB, speed);
		}
		else
		{
			digitalWrite(pinA, LOW);
			digitalWrite(pinB, LOW);
		}
	}
}