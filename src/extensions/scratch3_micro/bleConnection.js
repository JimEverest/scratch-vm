
class bleConnection
{
    constructor( runtime) {
        this._runtime = runtime;
        this.UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

        // Allows the micro:bit to transmit a byte array
        this.UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

        // Allows a connected client to send a byte array
        this.UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

        this.uBitDevice;
        this.rxCharacteristic;
        this.txCharacteristic;
    }
    //asyn
    microBitWriteString(string){
        if (!this.rxCharacteristic) {
            return;
        }
        try {
            let encoder = new TextEncoder();
            this.rxCharacteristic.writeValue(encoder.encode(string));
        } catch (error) {
            console.log(error);
        }
    }
    //async 
    microBitConnect() {
        options={
            filters: [{ namePrefix: "BBC micro:bit" }],
            optionalServices: [this.UART_SERVICE_UUID]
        };
        console.log("Requesting Bluetooth Device...");
        navigator.bluetooth.requestDevice(options)
        .then(device => {
    
          device.addEventListener('gattserverdisconnected', this.onDisconnectCallback);
          // Attempts to connect to remote GATT Server.
          return device.gatt.connect();
    
        })
        .then(server => {
          // Note that we could also get all services that match a specific UUID by
          // passing it to getPrimaryServices().
          this.onConnectCallback();
          console.log('Getting Services...:');
          console.log(this.UART_SERVICE_UUID)
          return server.getPrimaryService(this.UART_SERVICE_UUID);
        })
        .then(service => {
            console.log('Getting Characteristics...:');
            console.log(this.UART_TX_CHARACTERISTIC_UUID);
            return Promise.all([
                service.getCharacteristic(this.UART_TX_CHARACTERISTIC_UUID), 
                service.getCharacteristic(this.UART_RX_CHARACTERISTIC_UUID)
            ]);
        })
        .then(args => {
            this.txCharacteristic = args[0];
            this.rxCharacteristic = args[1];
            this.txCharacteristic.startNotifications();
            this.txCharacteristic.addEventListener("characteristicvaluechanged",this.onTxCharacteristicValueChanged.bind(this));
        })
        .catch(error => {
          console.log('Argh! ' + error);
        });
    }
    onConnectCallback(){
        console.log("Connected.")
    }
    onDisconnectCallback(){
        console.log("Disconnected.")
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


    onTxCharacteristicValueChanged(event) {
        let receivedData = [];
        for (var i = 0; i < event.target.value.byteLength; i++) {
            receivedData[i] = event.target.value.getUint8(i);
        }
        const receivedString = String.fromCharCode.apply(null, receivedData);
        
        console.log(this.microBitReceivedMessage)
        debugger

        if (typeof this.microBitReceivedMessage !== 'undefined'){
            this.microBitReceivedMessage(receivedString);
        }else{
            console.log("microBitReceivedMessage is not defined")
        }
        console.log(receivedString);
    }

    //Todo
    microBitReceivedMessage(msg)
    {
        console.log(msg)
    }


}



module.exports = bleConnection;
