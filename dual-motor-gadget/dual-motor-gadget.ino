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
	digitalWrite(3, HIGH);
	digitalWrite(6, HIGH);
}