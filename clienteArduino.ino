#include <UIPEthernet.h>

EthernetClient client;
signed long next;
volatile int instruccion=1; 
volatile int activada=0;
const int buzzer = 8;
const int push = 2;

void setup() {
  
  pinMode(buzzer, OUTPUT);
  
  attachInterrupt(digitalPinToInterrupt(push), apagar, HIGH);

  Serial.begin(9600);

  uint8_t mac[6] = {0x00,0x01,0x02,0x03,0x04,0x05};
  Ethernet.begin(mac);
  
  delay(1000);

  Serial.print("localIP: ");
  Serial.println(Ethernet.localIP());
  Serial.print("subnetMask: ");
  Serial.println(Ethernet.subnetMask());
  Serial.print("gatewayIP: ");
  Serial.println(Ethernet.gatewayIP());
  Serial.print("dnsServerIP: ");
  Serial.println(Ethernet.dnsServerIP());
  Serial.println("Conecting...");
  
    
  delay(1500);
}

void apagar (){
  instruccion=2;
};

void loop() {  
  client.stop();  
  if(client.connect(IPAddress(192,168,100,32),8080)){
    //HTTP Request
    if(instruccion==1)
      client.println("GET /alarma/estado");
    else{
      client.println("GET /alarma/apagar");
      instruccion=1;
    }
    client.println();
    
    Serial.println("Conected!!");
        
    if (client.connected()) {
      while(client.available()==0){
      }
      while(client.available())
      {
        char c = client.read();
        if(client.available()<1){
          if(c=='1')
            activada=1;
          else
            activada=0;
        }
      }
    }
  }
  else
    Serial.println("Can't connect");

  Serial.print("Valor: ");
  Serial.println(activada);
  if(activada==1)
  {
   tone(buzzer, 4978, 300); 
  }
}
