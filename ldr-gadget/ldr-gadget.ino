/*

Hardware:
Mcu:	nano 328
BOM List see tower.im
ldr pin: A0
Led pin: D9


wire reg
RED 	5V
BROWN	Gound
YELLOW	LDR Sensor
ORANGE	LED Control

*/

void setup()
{
	pinMode(9, OUTPUT);
	Serial.begin(9600);
}

void loop()
{
	readSerial();
}

void readSerial()
{
	if (Serial.available() > 0)
	{
		char cmd = Serial.read();

		switch (cmd)
		{
			case ('?'):
			{
				Serial.write('L');
				break;
			}
			case ('T'):
			{
				Serial.write('R');
				break;
			}
			case ('N'):
			{
				digitalWrite(9, HIGH);
				break;
			}
			case ('F'):
			{
				digitalWrite(9, LOW);
				break;
			}
			case ('L'):
			{
				int a = analogRead(A0);
				a /= 4;
				Serial.write(a);
				break;
			}
			default:
			{
				break;
			}
		}
	}
}

void ledTest()
{
	digitalWrite(9, HIGH);
	delay(500);
	digitalWrite(9, LOW);
	delay(500);
}

void ldrTest()
{
	digitalWrite(9, HIGH);
	int l = analogRead(A0);
	Serial.println(l);
	delay(100);
}