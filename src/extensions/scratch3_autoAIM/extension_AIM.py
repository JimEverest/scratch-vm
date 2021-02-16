import time
from codelab_adapter.core_extension import Extension
import cv2
import numpy as np
import cv2.aruco as aruco
import glob
import math
import urllib.request
import urllib
from enum import Enum 
import base64
import threading
from datetime import datetime

class Det_typ(Enum):
    No = 0
    Aruco = 1
    Ball = 2
    Face = 3
    Number = 4


class AimExtension(Extension):
    NODE_ID = 'aim'
    device={}
    cap=None
    stream_url=None
    isStreaming = False
    current_det_fn=Det_typ.Aruco  # Aruco, Ball, Face, Number, etc,...
    frame_cnt = 0


    lock = threading.Lock()
    # def request():
    #     while self._running:
    #         lock.acquire()
    #         self.scratch3_message = self.read()
    #         lock.release()



    mtx = np.array([[4.15845643e+03,0.00000000e+00,3.33008619e+02],[0.00000000e+00,1.23733590e+03,2.05509175e+02],[0.00000000e+00,0.00000000e+00,1.00000000e+00]])
    dist = np.array([[ 1.63379075e+01,-9.50776979e+01,  7.79669069e-01, -2.38161003e-01, 4.77286163e+03]])    
    font = cv2.FONT_HERSHEY_SIMPLEX

#region aruco_handle
    def aruco_handle(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        aruco_dict = aruco.Dictionary_get(aruco.DICT_6X6_250)
        parameters = aruco.DetectorParameters_create()
        parameters.adaptiveThreshConstant = 10
        corners, ids, rejectedImgPoints = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)
        off_x,off_y = self.get_centers_from_conners(frame,corners,ids)
        # send offsets to scratch 
        # with topic and timestamp
        self.send_message_to_scratch(str(off_x) + "," + str(off_y),"aim_offsets", datetime.now().timestamp() )

        #draw label text on frame
        label_frame = self.put_test_estimatePose(frame,corners,ids)

        # convert cv img --> base64
        retval, buffer_img= cv2.imencode('.jpg', label_frame)
        base64_img = base64.b64encode(buffer_img)
        src = "data:image/{ext};base64,{data}".format(ext="jpg", data=repr(base64_img)[2:-1])

        # send img to scratch 
        # with topic and timestamp 
        self.send_message_to_scratch(src,"aim_label_img", datetime.now().timestamp())

        return label_frame

    def get_centers_from_conners(self,frame,corners,ids):
        if np.all(ids != None):
            #Center points
            x_sum = corners[0][0][0][0]+ corners[0][0][1][0]+ corners[0][0][2][0]+ corners[0][0][3][0]
            y_sum = corners[0][0][0][1]+ corners[0][0][1][1]+ corners[0][0][2][1]+ corners[0][0][3][1] 
            x_centerPixel = x_sum*.25
            y_centerPixel = y_sum*.25
            # H : frame.shape[0] / 2    240
            # W : frame.shape[1] / 2    320
            x_offset = x_centerPixel - (frame.shape[1] / 2)
            y_offset = (y_centerPixel) - (frame.shape[0] / 2)
        else:
            x_offset = 0
            y_offset = 0
        return x_offset,y_offset
        
    def put_test_estimatePose(self,frame,corners,ids):
        if np.all(ids != None):
            #cv2.putText(frame, "Ox,Oy: " + str(x_offset) + "--  " + str(y_offset) , (0,20), self.font, 0.5, (0,0,255),1,cv2.LINE_AA)
            rvec, tvec ,_ = aruco.estimatePoseSingleMarkers(corners, 0.0965, self.mtx, self.dist)
            tvec = np.around(tvec, decimals=1)
            # for i in range(0, ids.size):
            #     aruco.drawAxis(frame, mtx, dist, rvec[i], tvec[i], 0.1)
            aruco.drawDetectedMarkers(frame, corners)
            n=30
            m=0
            t_lst = tvec.tolist()
            r_lst = rvec.tolist()
            for i in t_lst:
                d = np.linalg.norm(np.array([i[0][0],i[0][2]]) - np.array([0,0]))
                d = np.around( d, decimals=1)
                cv2.putText(frame, "id:{},x,y,z: ".format(str(ids[t_lst.index(i)][0])) + str(i[0]), (0,50+n*m), self.font, 0.5, (0,0,255),1,cv2.LINE_AA)
                m+=1
            m=0
            for i in r_lst:
                x,y,z = self.rotationMatrixToEulerAngles(np.array(i[0]))
                x = np.around( x, decimals=1)
                y = np.around( y, decimals=1)
                z = np.around( z, decimals=1)
                cv2.putText(frame, "id:{},P-Y-R: ".format(str(ids[r_lst.index(i)][0])) + str(x)+' '+str(y)+' '+str(z), (0,100+n*m), self.font, 0.5, (0,255,0),1,cv2.LINE_AA)
                m+=1
            strg = ''
            for i in range(0, ids.size):
                strg += str(ids[i][0])+', '
            cv2.putText(frame, "Id: " + strg, (0,200), self.font, 0.5, (0,255,0),2,cv2.LINE_AA)
        else:
            cv2.putText(frame, "No Ids: " + str(frame.shape[0]) +" x "+ str(frame.shape[1]), (0,200), self.font, 0.5, (0,255,0),2,cv2.LINE_AA)
        return frame

    def rotationMatrixToEulerAngles(self,rvecs):
        R = np.zeros((3, 3), dtype=np.float64)
        cv2.Rodrigues(rvecs, R)
        sy = math.sqrt(R[0,0] * R[0,0] +  R[1,0] * R[1,0])
        singular = sy < 1e-6
        if  not singular:
            x = math.atan2(R[2,1] , R[2,2])
            y = math.atan2(-R[2,0], sy)
            z = math.atan2(R[1,0], R[0,0])
        else :
            x = math.atan2(-R[1,2], R[1,1])
            y = math.atan2(-R[2,0], sy)
            z = 0
        #print('dst:', R)
        x = x*180.0/3.141592653589793
        y = y*180.0/3.141592653589793
        z = z*180.0/3.141592653589793
        return x,y,z
#endregion

    def getStream(self,content):
        self.stream_url = content['url']
        self.logger.info(f"Stream openning at: {self.stream_url}")

        def streamIN():
            while (self.isStreaming):
                imgResp=urllib.request.urlopen(self.stream_url)
                imgNp=np.array(bytearray(imgResp.read()),dtype=np.uint8)
                frame=cv2.imdecode(imgNp,-1)

                self.frame_cnt=self.frame_cnt +1
                if (self.frame_cnt%10==0):
                    self.logger.info ( str(self.frame_cnt) + " frames got.........................." )
                # time.sleep(0.3)
                if(self.current_det_fn == Det_typ.Aruco):
                    frame=self.aruco_handle(frame)     

                # cv2.imshow('frame1',frame)
                # if cv2.waitKey(1) & 0xFF ==ord('q'):
                #     break
            cv2.destroyAllWindows()
            self.logger.info("Stream successfully closed.")
        
        stm_task = threading.Thread(target=streamIN)
        self.logger.info("stream thread start")
        stm_task.daemon = True
        stm_task.start()


    def openDet(self,content):
        #fn_id : No = 0 / Aruco = 1/ Ball = 2 / Face = 3/ Number = 4
        fn_id = content['detFN']
        self.current_det_fn = Det_typ(fn_id)
    def closeDet(self):
        #fn_id : No = 0 / Aruco = 1/ Ball = 2 / Face = 3/ Number = 4
        fn_id = 0
        self.current_det_fn = Det_typ(fn_id)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.logger.info('Extension AIM gets started..........................................................................')

    def send_message_to_scratch(self,content,topic=None, timestamp=None):
        message = self.message_template()
        message["payload"]["content"] = content
        if topic is not None:
            message["payload"]["topic"] = topic
        if timestamp is not None:
            message["payload"]["timestamp"] = timestamp
        self.publish(message)

    def extension_message_handle(self,topic,payload):
        self.logger.info("Hola AIM..................................................")
        self.logger.info(f'the msg payload from scratch: {payload}')
        content = payload["content"]
        if type(content) == dict:
            command=content['command']
            self.logger.info(f'the command from scratch: {command}')

            #In: stream capture url
            #out: ok/ keep send frames to scratch?
            if (command == "getStream"):
                self.isStreaming = True
                output = self.getStream(content)
                

            #
            elif (command == "shutStream"):
                self.isStreaming = False
                self.logger.info("Shutting down the stream")
                output = "Closed."

            # capture current frame
            # detect target (aruco-marker / red-ball / faces etc,.) 
            # & calculate center point (x,y) offset.
            elif (command == "openDet"):
                output = self.openDet(content)
            elif (command == "closeDet"):
                output = self.closeDet()
            

            else:
                output = self.NotImp()
            # self.send_message_to_scratch(payload,output)
            payload["content"] = str(output)
            message = {"payload": payload}  # 无论是否有message_id都返回
            self.publish(message)

    def run(self):
        while self._running:
            time.sleep(1)

export = AimExtension