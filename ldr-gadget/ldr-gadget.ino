/*

Hardware:
Mcu:	nano 328
BOM List see tower.im
ldr pin: A0
Led pin: D9

*/

void setup()
{
	pinMode(9, OUTPUT);
	Serial.begin(9600);
}

void loop()
{
	/*
	digitalWrite(9, HIGH);
	delay(500);
	digitalWrite(9, LOW);
	delay(500);
	*/
	digitalWrite(9, HIGH);
	int l = analogRead(A0);
	Serial.println(l);
	delay(100);

}