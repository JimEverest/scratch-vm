/**
 * Created by Jim on 2021/02/08.
 */
const RegeneratorRuntime = require('regenerator-runtime/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const log = require('../../util/log');
const AdapterBaseClient = require("../scratch3_eim/codelab_adapter_base.js");

//#region  blockIconURI
const blockIconURI = 'data:image/png;base64,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';
const menuIconURI = blockIconURI; 
//#endregion



const NODE_ID = "aim";
const HELP_URL = "https://www.wildkids.fun";


class autoAIM {

    // Listen fn to get msgs from Adapter.
    // Only ADAPTER_TOPIC type topic ("adapter/nodes/data") will triger follow handler.
    onAdapterPluginMessage(msg) {
        this.adapter_node_content_hat = msg.message.payload.content; // todo topic
        this.adapter_node_content_reporter = msg.message.payload.content;
        this.node_id = msg.message.payload.node_id;
    }
    
    
    // Handle base64-img and offsets here. 
    // Check both Topic and Timestamp.
    onMessage(msg) {
        //debugger
        //console.log("==========================")
        //console.log("TOPIC-----> ", msg.message.payload.topic);
        //console.log("PAYLOAD----->", msg.message.payload);
        //console.log("Time----->  ", msg.message.payload.timestamp);


        if (msg.message.payload.topic == "aim_offsets"){
            console.log(msg.message.payload.content); 
            var offsets = msg.message.payload.content.split(",");
            this.x_offset = offsets[0];
            this.y_offset = offsets[1];
            this.offsets_ts = msg.message.payload.timestamp;
        }
        else if (msg.message.payload.topic == "aim_label_img"){
            this.label_img = msg.message.payload.content
            this.label_img_ts = msg.message.payload.timestamp;
        }

    }


    constructor (runtime) {
        this.runtime = runtime;
        this.exts_statu = {};
        this.nodes_statu = {};
        this.emit_timeout = 5000; //ms
        this.adapter_base_client = new AdapterBaseClient(
            null, // onConnect,
            null, // onDisconnect,
            this.onMessage.bind(this), // onMessage,   // ******* ALL MESSAGE *******
            this.onAdapterPluginMessage.bind(this), // onAdapterPluginMessage,
            null, // update_nodes_status              this.update_nodes_status.bind(this),
            null, // node_statu_change_callback       this.node_statu_change_callback.bind(this) 
            null, // notify_callback,          NOTIFICATION_TOPIC {core/notification}
            null, // error_message_callback,
            null, // update_adapter_status
            100 ,//SendRateMax // EIM没有可以发送100条消息
            runtime,
        );
    }
    static get STATE_KEY () {
        return 'Scratch.autoAIM';
    }
    getInfo () {
        return {
            id: 'autoAIM',
            name: formatMessage({
                id: 'autoAIM.categoryName',
                default: 'Auto AIM',
                description: 'help robot to auto aim targets'
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'getStream',
                    blockType: BlockType.COMMAND,
                    text: 'Get Stream [url]',
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: "http://192.168.50.186/capture",
                        },
                    }
                },
                {
                    opcode: 'shutStream',
                    blockType: BlockType.COMMAND,
                    text: 'Shut down Stream'
                },

                {
                    opcode: 'openDet',
                    blockType: BlockType.COMMAND,
                    text: 'Switch Detect [det_fn]',
                    arguments: {
                        det_fn: {
                            type: ArgumentType.STRING,
                            defaultValue: "None",
                            menu: "det_fn"
                        }
                    }
                },
                {
                    opcode: 'closeDet',
                    blockType: BlockType.COMMAND,
                    text: 'Switch Detect [det_fn]',
                    arguments: {
                        det_fn: {
                            type: ArgumentType.STRING,
                            defaultValue: "None",
                            menu: "det_fn"
                        }
                    }
                },
                
                {
                    opcode: 'getOffsets',
                    blockType: BlockType.REPORTER,
                    text: 'get offset [axis]',
                    arguments: {
                        axis: {
                            type: ArgumentType.STRING,
                            defaultValue: "x",
                            menu: "offset_axis"
                        }
                    }
                },

                {
                    opcode: 'getLabelImg',
                    blockType: BlockType.REPORTER,
                    text: 'get Label Img',
                    arguments: {
                    }
                },

                {
                    opcode: 'S',
                    blockType: BlockType.COMMAND,
                    text: 'Show [src] on Canvas ',
                    arguments: {
                        src: {
                            type: ArgumentType.STRING,
                            defaultValue: "",
                        }
                    }
                },


                {
                    opcode: 'ShowFPV',
                    blockType: BlockType.COMMAND,
                    text: 'FPV [src] ',
                    arguments: {
                        src: {
                            type: ArgumentType.STRING,
                            defaultValue: "",
                        }
                    }
                },
                {
                    opcode: 'cleanFPV',
                    blockType: BlockType.COMMAND,
                    text: 'Clean FPV Canvas ',
                    arguments: {
                    }
                },
                


                {
                    opcode: 'getStageImg',
                    blockType: BlockType.REPORTER,
                    text: 'get Stage Img',
                    arguments: {
                    }
                },
                {
                    opcode: 'sendImg2Adapter',
                    blockType: BlockType.COMMAND,
                    text: 'send [img_str_b64] to Adapter',
                    arguments: {
                        img_str_b64: {
                            type: ArgumentType.STRING,
                            defaultValue: "Image(base64 string)",
                        },
                    }
                },
                {
                    opcode: 'showImg_NewCanvas',
                    blockType: BlockType.COMMAND,
                    text: 'Show [new_str_b64] in New Canvas',
                    arguments: {
                        new_str_b64: {
                            type: ArgumentType.STRING,
                            defaultValue: "New Image(base64 string)",
                        },
                    },
                }

            ],
            menus: {
                det_fn: {
                    acceptReporters: true,
                    items: ["None","Aruco", "Ball", "Face", "Number"],
                },
                offset_axis:{
                    acceptReporters: true,
                    items: ["x","y"],
                }
            },
        };
    }


    getStream(args) {
        const url = args.url;
        const content = {};
        content.url = url;
        content.command = "getStream";
        return this.adapter_base_client.emit_with_messageid(NODE_ID,content)
    }

    shutStream(args) {
        const content = {};
        content.command = "shutStream";
        return this.adapter_base_client.emit_with_messageid(NODE_ID,content)
    }

    openDet(args) {
        const content = {};
        content.command = "openDet";
        content.detFN = args.det_fn;
        return this.adapter_base_client.emit_with_messageid(NODE_ID,content)
    }

    closeDet(args) {
        const content = {};
        content.command = "closeDet";
        return this.adapter_base_client.emit_with_messageid(NODE_ID,content)
    }




    getStageImg (args, util) {
        // Get base64 image from stage canvas.
        this.runtime.renderer.draw();
        const stage_img = this.runtime.renderer._gl.canvas.toDataURL('image/png');
        //console.log(stage_img);
        return stage_img;
        //this.runtime.emit('SAY', util.target, 'say', message);
    }

  
    sendImg2Adapter(args, util) {
        const img = args.img_str_b64;
        console.log(message);
        const content = {};
        content.img64 = img;
        content.command = "aim";
        return this.adapter_base_client.emit_with_messageid(NODE_ID, content, this.emit_timeout)
    }

    getLabelImg(args){
        return this.label_img;
    }

    getOffsets(args){
        var axis = args.axis;
        if (axis == "x"){
            return this.x_offset
        }
        else{
            return this.y_offset
        }
    }
    cleanFPV(args){
        var canv = document.getElementById('canvas_Lbl_Img');
        if (canv != null){
            canv.remove();
        }
    }

    
    
    ShowFPV(args){
        var img  = new Image();
        img.src = args.src;
        var canv = document.getElementById('canvas_Lbl_Img');
        if (canv == null){
            const originCanvas = this.runtime.renderer._gl.canvas;
            canv = document.createElement('canvas');
            canv.id = 'canvas_Lbl_Img';
            canv.width = 480
            canv.height = 360
            // 将绘制的canvas覆盖于原canvas之上
            originCanvas.parentElement.style.position = 'relative'
            canv.style.position = 'absolute'
            canv.style.top = '0'
            canv.style.left = '0'
            originCanvas.parentElement.append(canv)
        }
        var ctx = canv.getContext("2d");
        
        img.onload = function() {
            // Resize image with javascript canvas (smoothly) 
            // https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
            createImageBitmap( img, { resizeWidth: 480, resizeHeight: 360, resizeQuality: 'high' })
            .then(imageBitmap => ctx.drawImage(imageBitmap, 0, 0));
            // ctx.drawImage(img, 0, 0);
        };

    }



    Canvas_cover_Origin(args){
        var img  = new Image();
        img.src = args.src;
        var canv = document.getElementById('canvas_Lbl_Img');
        if (canv == null){
            const originCanvas = this.runtime.renderer._gl.canvas;
            canv = document.createElement('canvas');
            canv.id = 'canvas_Lbl_Img';
            canv.width = 480
            canv.height = 360
            // 将绘制的canvas覆盖于原canvas之上
            originCanvas.parentElement.style.position = 'relative'
            canv.style.position = 'absolute'
            canv.style.top = '0'
            canv.style.left = '0'
            originCanvas.parentElement.append(canv)
        }
        var ctx = canv.getContext("2d");
        
        img.onload = function() {
            // Resize image with javascript canvas (smoothly) 
            // https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
            createImageBitmap( img, { resizeWidth: 480, resizeHeight: 360, resizeQuality: 'high' })
            .then(imageBitmap => ctx.drawImage(imageBitmap, 0, 0));
            // ctx.drawImage(img, 0, 0);
        };

    }

    showImg_NewCanvas(args, util){
        var img  = new Image();
        //#region img src (base64)
        img.src = args.new_str_b64;
        //#endregion
        var canv = document.getElementById('canvasFPV');
        if (canv == null){
            //Inject Draggable Div
            //https://www.w3schools.com/howto/howto_js_draggable.asp
            let str = '<div id="fpvdiv"><div id="fpvdivheader"></div><div id="fpvBox"></div></div>'
            document.body.insertAdjacentHTML( 'beforeend', str );
            //Inject Draggable CSS
            this.addStyle(`
            #fpvdiv {
                position: absolute;
                top:50%;
                z-index: 9;
                background-color: #f1f1f1;
                border: 1px solid #d3d3d3;
                text-align: center;
              }
              
              #fpvdivheader {
                padding: 10px;
                cursor: move;
                z-index: 10;
                background-color: #2196F3;
                color: #fff;
              }
    
              #fpvBox{
                  width:600px;
                  height:400px;
              }
            `);
            this.dragElement(document.getElementById("fpvdiv"));

            canv = document.createElement('canvas');
            canv.id = 'canvasFPV';
            canv.height = 400;
            canv.width = 600;
            //document.body.appendChild(canv);
            document.getElementById('fpvBox').appendChild(canv); 
        }

        var ctx = canv.getContext("2d");

        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
    }


    read_stream_trans_2_new_stream(){
        // read from raw stream
        // trans to scratch 
    }





    // Utils
    addStyle(styleString) {
        const style = document.createElement('style');
        style.textContent = styleString;
        document.head.append(style);
    }

    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
          // if present, the header is where you move the DIV from:
          document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          elmnt.onmousedown = dragMouseDown;
        }
      
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
          elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
      
        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
        }
    }
}

module.exports = autoAIM;