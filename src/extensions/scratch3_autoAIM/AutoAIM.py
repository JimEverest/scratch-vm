import time
from codelab_adapter.core_extension import Extension
from serial.tools import list_ports
import cv2

class AutoAIMExtension(Extension):
    NODE_ID = 'AutoAIM'
    device={}

    #region dobot controls
    def connect(self,content):
        port = content['port']
        self.device = Dobot(port=port, verbose=True)
        self.logger.info(f"Dobot connected on port: {port}")
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

    def NotImp(self):
        raiseNotImplementedError("my test: not implemented!")
        pass


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

            elif (command == "_connecting"):
                output = self.isConnecting()
            elif (command == "getPose"):
                output = self.getPose(content)
            elif (command == "suction"):
                output = self.suction(content)

            else:
                output = self.NotImp()
            # self.send_message_to_scratch(payload,output)
            payload["content"] = str(output)
            message = {"payload": payload}  # 无论是否有message_id都返回
            self.publish(message)

    def run(self):
        while self._running:
            time.sleep(1)

export = AutoAIMExtension