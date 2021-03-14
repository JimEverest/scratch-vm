import time
from codelab_adapter.core_extension import Extension
from serial.tools import list_ports
from pydobot import Dobot


class DobotExtension(Extension):
    NODE_ID = 'dobot'
    device={}

    def switch(self,cmd):
        return {
            'connect': self.connect,
            'move': self.move,
            "move_door":self.move_door
        }.get(cmd, self.NotImp) 

    #region dobot controls
    def connect(self,content):
        port = content['port']
        self.device = Dobot(port=port, verbose=True)
        self.logger.info(f"Dobot connected on port: {port}")
        return True
    #region dobot controls
    def auto_connect(self):
        port = self.getPossiblePorts() 
        try:
            if not port:
                self.logger.info(f"Dobot connected on port: {port}")
                return False
            else:
                self.device = Dobot(port=port, verbose=True)
                self.logger.info(f"Dobot connected on port: {port}")
                return True
        except:
            self.logger.info(f"Already connected on port: {port}?")

    def move(self,content):
        self.logger.info("Hello-Move")
        x = float(content['x'])
        y = float(content['y'])
        z = float(content['z'])
        r = 10.0
        #self.logger.info(x,y,z)
        self.logger.info("About-To-Move")
        self.device.move_to(x, y, z, r, wait=True) 
        self.logger.info(f"Dobot moved to {x} {y} {z} {r}")
        return True

    def suction(self,content):
        self.logger.info("Hello-Suction")
        onoff = content['onoff']
        _on = False
        if(onoff == 'ON'):
            _on = True
        self.device.suck(_on) 
        self.logger.info(f"Dobot suction {onoff} ")
    #region dobot controls


    def disconnect(self):
        self.device.close()
        self.device = {}
        return True

    def getPose(self,content):
        #time.sleep(1)
        # self.logger.info("get pose returned..........")
        # return 100.01
        keywords = content['keyWord']
        self.logger.info(f"get pose key: {keywords} ")
        pose = self.device.pose() #(x, y, z, r, j1, j2, j3, j4)
        pose = pose[:4] 
        keys = ["x","y","z","r"]
        pose = dict(zip(keys,pose))
        res = pose.get(keywords)
        self.logger.info(f"get pose res: {res} ")
        return res

    def getAllPose(self,content):

        pose = self.device.pose() #(x, y, z, r, j1, j2, j3, j4)
        pose = pose[:3] 
        keys = ["x","y","z"]
        pose = dict(zip(keys,pose))
        res = str(pose)
        self.logger.info(f"get all pose res: {res} ")
        return res

    def getPossiblePorts(self):
        dps=""
        ports = list(list_ports.comports())
        for p in ports:
            print (p)
            if "CH340" in p[1]: # Looks for "CH340" and "COM#"
                print ("Found Dobot  on : " + p[0] )
                dps = dps + p[0] + ","
        dps = dps[0:-1]
        self.logger.info(f"all potential ports: {dps}")
        return dps 
    def isRunning(self):
        return True

    def isConnecting(self):
        if not self.device:
            return False
        else :
            return True
    
    def NotImp(self):
        # raiseNotImplementedError("my test: not implemented!")
        pass
    #endregion
    def home(self):
        self.device._home() 
        self.logger.info("Dobot going to HOME ZERO. ")
    def clear(self):
        self.device._clear_alarm() 
        self.logger.info("Dobot clear all aralm. ")
    def close(self):
        self.device.close() 
        self.logger.info("Dobot closed. ")
        

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def send_message_to_scratch(self,content):
        message = self.message_template()
        message["payload"]["content"] = content
        self.publish(message)

    def extension_message_handle(self,topic,payload):
        self.logger.info(f'the msg payload from scratch: {payload}')
        content = payload["content"]
        if type(content) == dict:
            command=content['command']
            self.logger.info(f'the dobot command from scratch: {command}')
            if (command == "connect"):
                output = self.connect(content)
            elif (command == "move"):
                self.move(content)
                output = self.connect(content)
            elif (command == "disconnect"):
                output = self.disconnect()
            elif (command == "_running"):
                output = self.isRunning()
            elif (command == "_connecting"):
                output = self.isConnecting()
            elif (command == "auto_connect"):
                output = self.auto_connect()
            elif (command == "getPose"):
                output = self.getPose(content)
            elif (command == "getAllPose"):
                output = self.getAllPose(content)
            elif (command == "getPossiblePorts"):
                output = self.getPossiblePorts()
            
            elif (command == "suction"):
                output = self.suction(content)

            elif (command == "home"):
                output = self.home()
            elif (command == "clear"):
                output = self.clear()
            elif (command == "close"):
                output = self.close()
            else:
                output = self.NotImp()
            # self.send_message_to_scratch(payload,output)
            payload["content"] = str(output)
            message = {"payload": payload}  # 无论是否有message_id都返回
            self.publish(message)

    def run(self):
        while self._running:
            time.sleep(1)

export = DobotExtension
