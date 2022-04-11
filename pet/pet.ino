#include <Servo.h>

Servo servo_test;        //initialize a servo object for the connected servo            
int angle = 0;  
#define ledtest 13
#define infra1 3
boolean liberar = true;


void setup() 
{ 
  
  Serial.begin(9600);
  pinMode(ledtest, OUTPUT);
  pinMode(infra1,INPUT);
  servo_test.attach(9);      // attach the signal pin of servo to pin9 of arduino
} 
  
void loop() 
{ 
  
  if (digitalRead(infra1)== HIGH){
    abrirPorta();
    
  }
  
  digitalWrite(ledtest,LOW);
}

void abrirPorta()
{
  
  digitalWrite(ledtest,HIGH);
  servo_test.write(0); 
  for(angle = 0; angle < 180; angle += 1)    // command to move from 0 degrees to 180 degrees 
  {                                  
    servo_test.write(angle);                 //command to rotate the servo to the specified angle
    delay(15);                       
  } 
 
  delay(5000);                             // TEMPO PARADO PARA A LIBERAÇÂO DE COMIDA
  
  for(angle = 180; angle>=1; angle-=5)     // command to move from 180 degrees to 0 degrees 
  {                                
    servo_test.write(angle);              //command to rotate the servo to the specified angle
    delay(5);                       
  }
  
}
