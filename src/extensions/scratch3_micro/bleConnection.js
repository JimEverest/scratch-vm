//microbit.js
var ACCEL_SRV = 'e95d0753-251d-470a-a062-fa1922dfa9a8'
var ACCEL_DATA = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
var ACCEL_PERIOD = 'e95dfb24-251d-470a-a062-fa1922dfa9a8'

var MAGNETO_SRV = 'e95df2d8-251d-470a-a062-fa1922dfa9a8'
var MAGNETO_DATA = 'e95dfb11-251d-470a-a062-fa1922dfa9a8'
var MAGNETO_PERIOD = 'e95d386c-251d-470a-a062-fa1922dfa9a8'
var MAGNETO_BEARING = 'e95d9715-251d-470a-a062-fa1922dfa9a8'

var BTN_SRV = 'e95d9882-251d-470a-a062-fa1922dfa9a8'
var BTN_A_STATE = 'e95dda90-251d-470a-a062-fa1922dfa9a8'
var BTN_B_STATE = 'e95dda91-251d-470a-a062-fa1922dfa9a8'

var IO_PIN_SRV = 'e95d127b-251d-470a-a062-fa1922dfa9a8'
var IO_PIN_DATA = 'e95d8d00-251d-470a-a062-fa1922dfa9a8'
var IO_AD_CONFIG = 'e95d5899-251d-470a-a062-fa1922dfa9a8'
var IO_PIN_CONFIG = 'e95db9fe-251d-470a-a062-fa1922dfa9a8'
var IO_PIN_PWM = 'e95dd822-251d-470a-a062-fa1922dfa9a8'

var LED_SRV = 'e95dd91d-251d-470a-a062-fa1922dfa9a8'
var LED_STATE = 'e95d7b77-251d-470a-a062-fa1922dfa9a8'
var LED_TEXT = 'e95d93ee-251d-470a-a062-fa1922dfa9a8'
var LED_SCROLL = 'e95d0d2d-251d-470a-a062-fa1922dfa9a8'

var TEMP_SRV = 'e95d6100-251d-470a-a062-fa1922dfa9a8'
var TEMP_DATA = 'e95d9250-251d-470a-a062-fa1922dfa9a8'
var TEMP_PERIOD = 'e95d1b25-251d-470a-a062-fa1922dfa9a8'

var UART_SRV = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
var UART_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
var UART_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'



class bleConnection
{
    constructor( runtime) {
        this._runtime = runtime;
        // this.UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
        // // Allows the micro:bit to transmit a byte array
        // this.UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
        // // Allows a connected client to send a byte array
        // this.UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
        this.uBitDevice;
        this.rxCharacteristic;
        this.txCharacteristic;
        this._promiseResolves ={};
        this.writting = false;
        this.t0 = 0;
        this.t1 = 0;
        this.commandQueue=[];
        
        this.accelerometer = {
            x: 0,
            y: 0,
            z: 0
        };
      
        this.magnetometer_raw = {
        x: 0,
        y: 0,
        z: 0
        };
    
        this.magnetometer_bearing = 0;
        this.temperature = 0;
    
        this.buttonA = 0;
        this.buttonACallBack=function(){};
    
        this.buttonB = 0;
        this.buttonBCallBack=function(){};
    
        this.connected = false;
        //   this.onConnectCallback=function(){};
        //   this.onDisconnectCallback=function(){};
        this.onBLENotifyCallback=function(){};

        this.characteristic = {
          IO_PIN_DATA: {},
          IO_AD_CONFIG: {},
          IO_PIN_CONFIG: {},
          IO_PIN_PWM: {},
          LED_STATE: {},
          LED_TEXT: {},
          LED_SCROLL: {},
          UART_TX:{},
          UART_RX:{}
        }

        this.cmd_executor = setInterval(function(){
          if(this.commandQueue.length>0 && this.rxCharacteristic && !this.writting){
            try{
              cmd = this.commandQueue.shift()
              let encoder = new TextEncoder();
              this.writting=true;
              this.rxCharacteristic.writeValue(encoder.encode(cmd)).then(foo=>{
              this.writting=false;
            });
            }catch (error) {
              console.log(error);
          }
            
          }
         }.bind(this), 100);

    }
    //asyn
    microBitWriteString(string){
      this.commandQueue.push(string); 
    }

    getReplyMsg(msgID, timeout=5000){
      return new Promise((resolve, reject) => {
        // console.log(this._promiseResolves)
        this._promiseResolves[msgID] = resolve;
        // this._promiseResolves["test"] = "hahaha";
        setTimeout(()=>{
          // debugger
          // console.log(this._promiseResolves)
          if(this._promiseResolves[msgID]){
            console.error(msgID + `: timeout (${timeout/1000}s)`)
            this.runtime.emit('PUSH_NOTIFICATION', {content: `timeout(${timeout/1000}s)`, type: 'error'})
            resolve(`timeout(${timeout/1000}s)`);
          }
        },timeout)
      })
    }


    //async 
    microBitConnect() {
        options={
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [ACCEL_SRV, MAGNETO_SRV, BTN_SRV, IO_PIN_SRV, LED_SRV, TEMP_SRV, UART_SRV]
        };
        console.log("Requesting Bluetooth Device...");
        navigator.bluetooth.requestDevice(options)
        .then(device => {
            console.log('> Name:             ' + device.name);
            console.log('> Id:               ' + device.id);
            device.addEventListener('gattserverdisconnected', this.onDisconnectCallback);
            // Attempts to connect to remote GATT Server.
            return device.gatt.connect();
    
        })
        .then(server => {
          // Note that we could also get all services that match a specific UUID by
          // passing it to getPrimaryServices().
          this.onConnectCallback();
          console.log('Getting Services...:');
          //return server.getPrimaryService(this.UART_SERVICE_UUID);
          return server.getPrimaryServices();
        })
        .then(services => {
            console.log('Getting Characteristics...');
            let queue = Promise.resolve();
            services.forEach(service => {
              console.log("Service: ", service);
              queue = queue.then(_ => service.getCharacteristics()
              
                .then(characteristics => {
                    console.log('> Service: ' + service.uuid);
                    characteristics.forEach(characteristic => {

                        console.log('>>    Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
            
                        //need to store all the characteristic I want to write to be able to access them later.
                        switch (characteristic.uuid) {
                            case IO_PIN_DATA:
                            this.characteristic.IO_PIN_DATA = characteristic;
                            break;
            
                            case IO_AD_CONFIG:
                            this.characteristic.IO_AD_CONFIG = characteristic;
                            break;
            
                            case IO_PIN_CONFIG:
                            this.characteristic.IO_PIN_CONFIG = characteristic;
                            break;
            
                            case IO_PIN_PWM:
                            this.characteristic.IO_PIN_PWM = characteristic;
                            break;
            
                            case LED_STATE:
                            this.characteristic.LED_STATE = characteristic;
                            this.connected = true;
                            break;
            
                            case LED_TEXT:
                            this.characteristic.LED_TEXT = characteristic;
                            break;
            
                            case LED_SCROLL:
                            this.characteristic.LED_SCROLL = characteristic;
                            break;

                            //added:
                            case UART_TX:
                            this.characteristic.UART_TX = characteristic;
                            this.txCharacteristic = characteristic;
                            this.txCharacteristic.startNotifications();
                            this.txCharacteristic.addEventListener("characteristicvaluechanged",this.onTxCharacteristicValueChanged.bind(this));

                            break;

                            case UART_RX:
                            this.characteristic.UART_RX = characteristic;
                            this.rxCharacteristic = characteristic;
                            break;
            
                            default:
            
                        }
            
            
                        if (getSupportedProperties(characteristic).includes('NOTIFY')) {
                            characteristic.startNotifications().catch(err => console.log('startNotifications', err));
                            characteristic.addEventListener('characteristicvaluechanged',  this.characteristic_updated.bind(this));
                        }
                        });
                }));
            });
            return queue;
          }
        )
        .catch(error => {
            console.log('Argh! ' + error);
        });

    }





    characteristic_updated(event) {

        this.onBLENotifyCallback();
        //BUTTON CHARACTERISTIC
        if (event.target.uuid == BTN_A_STATE) {
          //console.log("BTN_A_STATE", event.target.value.getInt8());
          this.buttonA = event.target.value.getInt8();
          if (this.buttonA){
            this.onButtonA();
          }
        }
    
        if (event.target.uuid == BTN_B_STATE) {
          //console.log("BTN_B_STATE", event.target.value.getInt8());
          this.buttonB = event.target.value.getInt8();
          if (this.buttonB){
            this.onButtonB();
          }
        }
    
        //ACCELEROMETER CHARACTERISTIC
        if (event.target.uuid == ACCEL_DATA) {
          //true is for reading the bits as little-endian
          //console.log("ACCEL_DATA_X", event.target.value.getInt16(0,true));
          //console.log("ACCEL_DATA_Y", event.target.value.getInt16(2,true));
          //console.log("ACCEL_DATA_Z", event.target.value.getInt16(4,true));
          this.accelerometer.x = event.target.value.getInt16(0, true);
          this.accelerometer.y = event.target.value.getInt16(2, true);
          this.accelerometer.z = event.target.value.getInt16(4, true);
        }
    
        // MAGNETOMETER CHARACTERISTIC (raw data)
        if (event.target.uuid == MAGNETO_DATA) {
          //  console.log("MAGNETO_DATA_X", event.target.value.getInt16(0,true));
          //  console.log("MAGNETO_DATA_Y", event.target.value.getInt16(2,true));
          //  console.log("MAGNETO_DATA_Z", event.target.value.getInt16(4,true));
          this.magnetometer_raw.x = event.target.value.getInt16(0, true);
          this.magnetometer_raw.y = event.target.value.getInt16(2, true);
          this.magnetometer_raw.z = event.target.value.getInt16(4, true);
        }
    
        // MAGNETOMETER CHARACTERISTIC (bearing)
        if (event.target.uuid == MAGNETO_BEARING) {
          //console.log("BEARING", event.target.value.getInt16(0,true));
          this.magnetometer_bearing = event.target.value.getInt16(0, true);
        }
    
        // TEMPERATURE CHARACTERISTIC
        if (event.target.uuid == TEMP_DATA) {
          //console.log("TEMP_DATA", event.target.value.getInt8());
          this.temperature = event.target.value.getInt8();
          console.log( "TEMP_DATA got linked......")
        }

        if (event.target.uuid == UART_TX) {
          console.log( "UART_TX_CHARACTERISTIC got linked......")
            this.onTxCharacteristicValueChanged(event);
          }


      }



    onConnectCallback(){
        this.connected = true;
        console.log("Connected.")
    }
    onDisconnectCallback(){
        this.connected = false;
        console.log("Disconnected.")
    }





    onTxCharacteristicValueChanged(event) {
        let receivedData = [];
        for (var i = 0; i < event.target.value.byteLength; i++) {
            receivedData[i] = event.target.value.getUint8(i);
        }
        const receivedString = String.fromCharCode.apply(null, receivedData);
        if (typeof this.listenMicrobit !== 'undefined'){
            this.listenMicrobit(receivedString);
        }else{
            console.log("listenMicrobit is not defined")
        }
        //console.log(receivedString);
    }


    //Handle Message from BLE-UART-Cha
    listenMicrobit(msg){
      var message_id = msg.split(",")[0];
      //var srv_cmd = msg.split(",")[1];
      var message_content = msg.split(",")[2];

      if (typeof message_id !== "undefined") {
        //console.log(this._promiseResolves)
          if (this._promiseResolves[message_id]){
              this._promiseResolves[message_id](message_content);
              delete this._promiseResolves[message_id];
              //for test
              this.t1=performance.now();
              console.log("Call to doSomething took " + (this.t1 - this.t0) + " milliseconds.")
              //console.log({message_id:this._promiseResolves[message_id]});
          }
      }
      else{
        console.log("Microbit msg w/o id: ", msg);
      }
      // switch(srv_cmd) {
      //     case "so":
      //         //this.runtime.startHats('micro_onSonar', {});
      //         break;
      //     default:
      //         break;
      //   }
  }
        
    microBitDisconnect() {
        if (!uBitDevice) {
            return;
        }
        if (uBitDevice.gatt.connected) {
            uBitDevice.gatt.disconnect();
            console.log("Disconnected");
        }
    }





//#region new from microbit.js
    getTemperature() {
        return this.temperature;
      }
    
      getAccelerometer() {
        return this.accelerometer;
      }
    
      getBearing() {
        return this.magnetometer_bearing;
      }
    
      getButtonA() {
        return this.buttonA;
      }
    
      setButtonACallback(callbackFunction){
        this.buttonACallBack=callbackFunction;
      }
    
      getButtonB() {
        return this.buttonB;
      }
    
      setButtonBCallback(callbackFunction){
        this.buttonBCallBack=callbackFunction;
      }
    
      onConnect(callbackFunction){
        this.onConnectCallback=callbackFunction;
      }
    
      onDisconnect(callbackFunction){
        this.onDisconnectCallback=callbackFunction;
      }
    
      onBleNotify(callbackFunction){
        this.onBLENotifyCallback=callbackFunction;
      }
    
      writePin(pin) {
        //something like this should work, but we need to create the correct buffer
        //this.characteristic.IO_PIN_DATA.writeValue(data);
      }
    
      readPin(pin) {
    
      }
    
      writeMatrixIcon(icon) {
        var ledMatrix = new Int8Array(5);
        var buffer = [
          ['0', '0', '0', '0', '0', '0', '0', '0'],
          ['0', '0', '0', '0', '0', '0', '0', '0'],
          ['0', '0', '0', '0', '0', '0', '0', '0'],
          ['0', '0', '0', '0', '0', '0', '0', '0'],
          ['0', '0', '0', '0', '0', '0', '0', '0']
        ]
        for (var i = 0; i < 5; i++) {
          for (var j = 0; j < 5; j++) {
            buffer[i][7-j] = icon[i][4 - j]
          }
        }
        for (var i = 0; i < 5; i++) {
          var string = buffer[i].join("");
          ledMatrix[i]=parseInt(string,2)
        }
        if(this.connected){
          this.characteristic.LED_STATE.writeValue(ledMatrix)
          .then(_ => {
          })
          .catch(error => {
            console.log(error);
          });
        }
      }
    
      writeMatrixTextSpeed(speed){
        var buffer= new Uint8Array(speed);
        if(this.connected){
          this.characteristic.LED_TEXT.writeValue(buffer)
          .then(_ => {
          })
          .catch(error => {
            console.log(error);
          });
        }
      }
    
      writeMatrixText(str){
        var buffer= new Uint8Array(toUTF8Array(str));
        if(this.connected){
          this.characteristic.LED_TEXT.writeValue(buffer)
          .then(_ => {
          })
          .catch(error => {
            console.log(error);
          });
        }
      }
    
      onButtonA(){
        this.buttonACallBack();
      }
    
      onButtonB(){
        this.buttonBCallBack();
      }
    //#endregion

}



module.exports = bleConnection;







/* Utils */

function isWebBluetoothEnabled() {
    if (navigator.bluetooth) {
      return true;
    } else {
      ChromeSamples.setStatus('Web Bluetooth API is not available.\n' +
        'Please make sure the "Experimental Web Platform features" flag is enabled.');
      return false;
    }
  }
  
  
  function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
  }
  
  function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
          var charcode = str.charCodeAt(i);
          if (charcode < 0x80) utf8.push(charcode);
          else if (charcode < 0x800) {
              utf8.push(0xc0 | (charcode >> 6),
                        0x80 | (charcode & 0x3f));
          }
          else if (charcode < 0xd800 || charcode >= 0xe000) {
              utf8.push(0xe0 | (charcode >> 12),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
          }
          // surrogate pair
          else {
              i++;
              // UTF-16 encodes 0x10000-0x10FFFF by
              // subtracting 0x10000 and splitting the
              // 20 bits of 0x0-0xFFFFF into two halves
              charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                        | (str.charCodeAt(i) & 0x3ff));
              utf8.push(0xf0 | (charcode >>18),
                        0x80 | ((charcode>>12) & 0x3f),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
          }
      }
      return utf8;
  }
//todo: 

//1. connected Indecator on scratch
//2. json parse