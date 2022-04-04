#include <Servo.h>

Servo myservo;


void setup()
{
  myservo.attach(9);
  pinMode(13,OUTPUT);
  pinMode(3,INPUT);
  Serial.begin(9600);
}
void loop()
{
  if (digitalRead(3)== LOW)
  {
    digitalWrite(13,HIGH);
    
    delay(10);
  }
  else 
  {
    
    digitalWrite(13,LOW);
    delay(10);
    
  }
  
}
