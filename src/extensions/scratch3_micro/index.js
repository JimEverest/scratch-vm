/**
 * Created by Jim on 2020/12/25.
 */
const RegeneratorRuntime = require('regenerator-runtime/runtime');
const cast = require('../../util/cast');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const log = require('../../util/log');
const ble = require('./bleConnection.js');

// eslint-disable-next-line max-len
const blockIconURI =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTkycHQiIGhlaWdodD0iMTczcHQiIHZpZXdCb3g9IjAgMCAxOTIgMTczIiB2ZXJzaW9uPSIxLjEiPgo8ZyBpZD0ic3VyZmFjZTEiPgo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6cmdiKDEwMCUsNzIuMTU2ODYzJSwxMS43NjQ3MDYlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gMTEyLjgwNDY4OCAxMzYuMzE2NDA2IEMgODMuNTQ2ODc1IDExNi41MzEyNSA3Ni4yMTQ4NDQgOTQuMzYzMjgxIDkwLjgwODU5NCA2OS44MDg1OTQgQyAxMTIuNjk1MzEyIDMyLjk4MDQ2OSAxMjQuMTEzMjgxIDE5LjI0MjE4OCAxMjAuNDQ5MjE5IDAuMTg3NSBDIDEzNC44NzUgMTYuOTIxODc1IDE3Ni40MTc5NjkgNjIuNTAzOTA2IDEzMS43ODkwNjIgMTE1LjQwNjI1IEMgMTMxLjc4OTA2MiA5NC44NjMyODEgMTI3LjA5Mzc1IDgzLjI0NjA5NCAxMTcuNjk5MjE5IDgwLjU0Njg3NSBDIDExMS4yNDIxODggODguMjg5MDYyIDEwOC4wMTE3MTkgOTguMTg3NSAxMDguMDExNzE5IDExMC4yMzgyODEgQyAxMDguMDExNzE5IDEyMi4yOTI5NjkgMTA5LjYwOTM3NSAxMzAuOTg0Mzc1IDExMi44MDQ2ODggMTM2LjMxNjQwNiBaIE0gMTEyLjgwNDY4OCAxMzYuMzE2NDA2ICIvPgo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6cmdiKDIzLjEzNzI1NSUsMjQuNzA1ODgyJSwyNi42NjY2NjclKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gMC40MTAxNTYgMTU1LjEzNjcxOSBDIDEuMjIyNjU2IDE1MC4yNDIxODggMy4yOTY4NzUgMTQ2LjQ3NjU2MiA2LjU1ODU5NCAxNDMuNTM5MDYyIEMgMTAuNjMyODEyIDEzOS44NTE1NjIgMTUuODk0NTMxIDEzNC40MjU3ODEgMjEuNTI3MzQ0IDEzNi45ODgyODEgQyAyMi40MTc5NjkgMTM3LjM2MzI4MSAyMy4wMDc4MTIgMTM4LjM0Mzc1IDIyLjQ5MjE4OCAxMzkuOTI1NzgxIEMgMjAuOTMzNTk0IDE0NC41MTk1MzEgMTYuNzg1MTU2IDE0NC4yMTg3NSAxMy4yMjY1NjIgMTQ2Ljg1MTU2MiBDIDEwLjI2NTYyNSAxNDkuMTg3NSA3LjY3MTg3NSAxNTIuMTk5MjE5IDcuNDQ5MjE5IDE1NS44OTA2MjUgQyA3LjMwMDc4MSAxNTggNy42NzE4NzUgMTYwLjg1OTM3NSA5LjAwMzkwNiAxNjIuODk0NTMxIEMgMTAuNTU4NTk0IDE2NS4zNzg5MDYgMTMuMjI2NTYyIDE2NS42Nzk2ODggMTUuODIwMzEyIDE2Ni42NjAxNTYgQyAxOS43NSAxNjguMTY0MDYyIDIyLjM0Mzc1IDE2Mi43NDIxODggMjUuNjAxNTYyIDE2Mi41OTM3NSBDIDI4Ljg2MzI4MSAxNjIuMzY3MTg4IDI2Ljc4OTA2MiAxNjcuMTA5Mzc1IDI2LjA0Njg3NSAxNjguMzE2NDA2IEMgMjIuMzQzNzUgMTc0LjExMzI4MSAxNS40NDkyMTkgMTczLjI4NTE1NiA5Ljc0NjA5NCAxNzEuNjI4OTA2IEMgMi44NTU0NjkgMTY5LjU5NzY1NiAtMC43NzczNDQgMTYyLjU5Mzc1IDAuNDEwMTU2IDE1NS4xMzY3MTkgWiBNIDM1LjA1ODU5NCAxNjguNjc5Njg4IEMgMzAuMDE5NTMxIDE2NS42Njc5NjkgMjcuODcxMDk0IDE1OS4zMzk4NDQgMjkuNSAxNTMuNjE3MTg4IEMgMzAuNjg3NSAxNDkuNDAyMzQ0IDMzLjM1NTQ2OSAxNDcuMjE0ODQ0IDM0LjI0MjE4OCAxNDUuMTA5Mzc1IEMgMzYuMDIzNDM4IDE0MS4wNDI5NjkgNDEuMjEwOTM4IDE0Mi4yNDYwOTQgNDQuMDIzNDM4IDE0NS40MTAxNTYgQyA0NS45NTMxMjUgMTQ3LjY2Nzk2OSA0Ni45ODgyODEgMTUwLjIzMDQ2OSA0Ny42NTYyNSAxNTIuNzg5MDYyIEMgNDkuMjEwOTM4IDE1OC43MzgyODEgNDYuNDcyNjU2IDE2My43ODUxNTYgNDIuNTQyOTY5IDE2OCBDIDQwLjkxNDA2MiAxNjkuNzM0Mzc1IDM3LjA1ODU5NCAxNjkuODA4NTk0IDM1LjA1ODU5NCAxNjguNjc5Njg4IFogTSAzNy40Mjk2ODggMTYxLjIyMjY1NiBDIDQyLjc2NTYyNSAxNjIuNDI5Njg4IDQzLjI4NTE1NiAxNTUuMTk5MjE5IDM5LjI4MTI1IDE1MC43NTc4MTIgQyAzNy42NTIzNDQgMTQ5LjAyMzQzOCAyOS42NDg0MzggMTU5LjQxNzk2OSAzNy40Mjk2ODggMTYxLjIyMjY1NiBaIE0gNTQuMzYzMjgxIDE1Ni4wMjczNDQgQyA1NC4zNjMyODEgMTQ2LjYxMzI4MSA2NS43NzM0MzggMTQ1LjE4MzU5NCA3MS40ODA0NjkgMTQwLjUxNTYyNSBDIDczLjI1NzgxMiAxMzkuMDA3ODEyIDcyLjUxNTYyNSAxMzUuMDkzNzUgNzMuNjI4OTA2IDEzMi41MzEyNSBDIDc0LjY2Nzk2OSAxMzAuNzIyNjU2IDc2LjgxNjQwNiAxMjkuMjE4NzUgNzguNTkzNzUgMTI5Ljk3MjY1NiBDIDc5LjMzNTkzOCAxMzAuMzQ3NjU2IDgxLjAzOTA2MiAxMzEuNDc2NTYyIDgwLjc0MjE4OCAxMzIuOTA2MjUgQyA3Ni40NDUzMTIgMTQ0LjgwODU5NCA3Ni44MTY0MDYgMTU3LjgzNTkzOCA3OC45NjQ4NDQgMTcwLjU2MjUgQyA3OC45NjQ4NDQgMTcxLjIzODI4MSA3Ny4xODc1IDE3Mi4zNzEwOTQgNzYuMDc0MjE5IDE3Mi4zNzEwOTQgQyA3Mi44ODY3MTkgMTcyLjc0NjA5NCA3Mi44ODY3MTkgMTY4IDcxLjEwOTM3NSAxNjcuNjI1IEMgNjguMjE4NzUgMTY3LjYyNSA2NS4zMjgxMjUgMTY4LjQ1MzEyNSA2Mi41ODU5MzggMTY2LjU3MDMxMiBDIDU4Ljk1NzAzMSAxNjQuMDg1OTM4IDU0LjM2MzI4MSAxNjEuNTIzNDM4IDU0LjM2MzI4MSAxNTYuMDI3MzQ0IFogTSA2MS44NDc2NTYgMTU0Ljk3MjY1NiBDIDYyLjM2NzE4OCAxNTguNTg5ODQ0IDY2LjQ0MTQwNiAxNjIuMjAzMTI1IDcwLjM2NzE4OCAxNjAuNzczNDM4IEMgNjkuNzAzMTI1IDE1Ni40MDIzNDQgNzEuMTA5Mzc1IDE1Mi40MTQwNjIgNzEuMTA5Mzc1IDE0OC4xMjEwOTQgQyA2Ny4xODM1OTQgMTQ4LjEyMTA5NCA2MS4xMDU0NjkgMTUwLjMwNDY4OCA2MS44NDc2NTYgMTU0Ljk3MjY1NiBaIE0gODUuNzQ2MDk0IDE1MS42NjAxNTYgQyA4NS41OTc2NTYgMTQ0LjIwMzEyNSA5MS4wMDM5MDYgMTM4Ljc4MTI1IDk4LjI2NTYyNSAxMzkuODM1OTM4IEMgMTA0LjA0Njg3NSAxNDAuNjY0MDYyIDEwOS4zMDg1OTQgMTQ2LjMxMjUgMTA5LjIzNDM3NSAxNTIuNjQwNjI1IEMgMTA4LjA1MDc4MSAxNTYuMjUzOTA2IDk5Ljc1IDE1OS4zMzk4NDQgOTYuOTMzNTk0IDE2Mi4wNTA3ODEgQyA5Ni42MzY3MTkgMTYyLjEyODkwNiA5NS4zMDQ2ODggMTYyLjg3ODkwNiA5NS43NSAxNjMuNjMyODEyIEMgOTguMzM5ODQ0IDE2OC4yMjY1NjIgMTAzLjA4NTkzOCAxNjYuMTk1MzEyIDEwNy4yMzQzNzUgMTY0LjAxMTcxOSBDIDEwOS45MDIzNDQgMTY1Ljk2ODc1IDEwOC40OTIxODggMTcwLjQ4ODI4MSAxMDUuNDU3MDMxIDE3MC45Mzc1IEMgMTAyLjEyMTA5NCAxNzEuNDY0ODQ0IDk4LjQ4ODI4MSAxNzIuMzcxMDk0IDk0LjkzMzU5NCAxNzAuNzg5MDYyIEMgODcuNTIzNDM4IDE2Ny4zOTg0MzggODUuODk0NTMxIDE1OC44OTA2MjUgODUuNzQ2MDk0IDE1MS42NjAxNTYgWiBNIDkzLjgyMDMxMiAxNTUuNSBDIDk3LjMwNDY4OCAxNTUuMzUxNTYyIDEwMC43MTQ4NDQgMTU0LjM3MTA5NCAxMDEuODI0MjE5IDE1MC43NTc4MTIgQyAxMDMuNDUzMTI1IDE0Ni45OTIxODggOTcuMzA0Njg4IDE0NS4wMzEyNSA5NC4zMzk4NDQgMTQ2LjYxMzI4MSBDIDkxLjA3ODEyNSAxNDguMzQ3NjU2IDkyLjA0Mjk2OSAxNTUuMzUxNTYyIDkzLjgyMDMxMiAxNTUuNSBaIE0gMTQ5LjgzMjAzMSAxNzEuOTQxNDA2IEMgMTQ4LjQ5MjE4OCAxNzEuMjUgMTQ4LjIyMjY1NiAxNjkuMzg2NzE5IDE0Ny4xOTE0MDYgMTY5LjQ5NjA5NCBDIDE0MS44NTU0NjkgMTY5LjA3MDMxMiAxMzUuOTkyMTg4IDE2OS45OTIxODggMTMyLjUxOTUzMSAxNjUuMjg1MTU2IEMgMTMwLjI0NjA5NCAxNjIuODAwNzgxIDEzMC41IDE1Ny4zOTQ1MzEgMTMyLjA4MjAzMSAxNTQuNzMwNDY5IEMgMTM3LjE5NTMxMiAxNDUuOTM3NSAxNDcuODU1NDY5IDE0Ny4zOTA2MjUgMTQ3Ljk4MDQ2OSAxNDcuMTQ4NDM4IEMgMTQ4LjUzMTI1IDE0Ni4wMzEyNSAxNDguNjIxMDk0IDE0Mi42MTMyODEgMTQ2Ljk2ODc1IDE0Mi40ODQzNzUgQyAxNDIuNTE5NTMxIDE0MS45Njg3NSAxNDAuMDAzOTA2IDE0NC4yNzczNDQgMTM2LjIzODI4MSAxNDYuMDM5MDYyIEMgMTMzLjQwMjM0NCAxNDcuMzk4NDM4IDEzMi4xMDE1NjIgMTQxLjQwMjM0NCAxMzIuNjk1MzEyIDE0MC42NTYyNSBDIDEzNy42MTcxODggMTM2LjQyOTY4OCAxNDguMzc1IDEzMy4xNzU3ODEgMTUyLjQyOTY4OCAxMzkuODYzMjgxIEMgMTU2LjA0Njg3NSAxNDUuOTE3OTY5IDE1My4xNzU3ODEgMTUyLjY2MDE1NiAxNTMuMzkwNjI1IDE1OS42Nzk2ODggQyAxNTMuNTc0MjE5IDE2NC4yNzczNDQgMTU0LjE3NTc4MSAxNzQuMjg1MTU2IDE0OS44MzIwMzEgMTcxLjk0MTQwNiBaIE0gMTQ2LjY2MDE1NiAxNjMuNDg0Mzc1IEMgMTQ3LjMyODEyNSAxNTkuNjQwNjI1IDE0OS4yNTM5MDYgMTU3LjA4MjAzMSAxNDcuNjI1IDE1My4wODk4NDQgQyAxNDMuMzI0MjE5IDE1NC43NDYwOTQgMTM1LjgzOTg0NCAxNTMuNDY4NzUgMTM1LjY5MTQwNiAxNTkuOTQ1MzEyIEMgMTM1LjYxNzE4OCAxNjMuMjU3ODEyIDE0Ni4wNjY0MDYgMTY0LjkxNDA2MiAxNDYuNjYwMTU2IDE2My40ODQzNzUgWiBNIDE2Ny43MzgyODEgMTcwLjc4OTA2MiBDIDE2Ni45OTYwOTQgMTcwLjYzNjcxOSAxNjYuMTc5Njg4IDE2OS4yMDcwMzEgMTY1LjgxMjUgMTY4LjM3ODkwNiBDIDE2NC45OTYwOTQgMTYxLjMwMDc4MSAxNjUuODEyNSAxNTQuNTk3NjU2IDE2NC4yNTM5MDYgMTQ3LjUxOTUzMSBDIDE2My44MDg1OTQgMTQ2LjMxMjUgMTYyLjY5OTIxOSAxNDQuNzMwNDY5IDE2My4wNzAzMTIgMTQzLjE0ODQzOCBDIDE2My40NDE0MDYgMTQyLjM5ODQzOCAxNjQuMjUzOTA2IDE0MS45NDUzMTIgMTY0LjYyNSAxNDEuMTkxNDA2IEMgMTY0Ljk5NjA5NCAxMzYuNDQ5MjE5IDE2My45NTcwMzEgMTMxLjc3NzM0NCAxNjQuOTk2MDk0IDEyNi45NTcwMzEgQyAxNjUuNTE1NjI1IDEyNC42MjUgMTY4LjkyMTg3NSAxMjEuMDg1OTM4IDE3MC44NTE1NjIgMTIzLjc5Njg3NSBDIDE3NS4wNzQyMTkgMTI4LjE2NDA2MiAxNjguOTIxODc1IDEzNC40ODgyODEgMTcxLjk2MDkzOCAxMzkuOTg4MjgxIEMgMTgwLjE4NzUgMTQwLjM2MzI4MSAxODguNzA3MDMxIDE0My41MjczNDQgMTkxLjM3NSAxNTEuNDMzNTk0IEMgMTkzLjAwNzgxMiAxNTYuMTc5Njg4IDE4OS44MjAzMTIgMTYxLjY3NTc4MSAxODUuOTY0ODQ0IDE2NC40NjA5MzggQyAxODAuNTU4NTk0IDE2OC4zNzg5MDYgMTc0LjMzMjAzMSAxNzEuOTkyMTg4IDE2Ny43MzgyODEgMTcwLjc4OTA2MiBaIE0gMTczLjE0ODQzOCAxNjMuMjU3ODEyIEMgMTcxLjIxODc1IDE1Ny43NTc4MTIgMTcxLjIxODc1IDE1MS44MDg1OTQgMTcxLjIxODc1IDE0Ni4zMTI1IEMgMTc2LjYyODkwNiAxNDUuNTU4NTk0IDE4NC42MzI4MTIgMTQ5LjA5NzY1NiAxODQuNzgxMjUgMTU0LjIxODc1IEMgMTg1LjAwMzkwNiAxNTkuNzE4NzUgMTc4LjE4NzUgMTYyLjg3ODkwNiAxNzMuMTQ4NDM4IDE2My4yNTc4MTIgWiBNIDEyMC42ODc1IDE3MS4yMzQzNzUgQyAxMTguMDM1MTU2IDE3MS4yMzQzNzUgMTE1LjIyNjU2MiAxNjguOTQ5MjE5IDExNS44MTY0MDYgMTYzLjk2MDkzOCBDIDExNi40MTAxNTYgMTU4Ljk3NjU2MiAxMTYuNjgzNTk0IDE2MS41IDExNy4yOTI5NjkgMTUyLjI3NzM0NCBDIDExNy44OTg0MzggMTQzLjA1NDY4OCAxMTcuMjkyOTY5IDEzNC44OTQ1MzEgMTE3LjI5Mjk2OSAxMjguNjI4OTA2IEMgMTE3LjI5Mjk2OSAxMjIuMzYzMjgxIDEwOC4yODkwNjIgMTA0Ljc4NTE1NiAxMjAuNzE0ODQ0IDEwNC43ODUxNTYgQyAxMjYuNDAyMzQ0IDEwNy4wNTg1OTQgMTIzLjU1MDc4MSAxMTMuMDQ2ODc1IDEyMy41NTA3ODEgMTE4LjUzMTI1IEMgMTIzLjU1MDc4MSAxMjQuODAwNzgxIDEyMy41NTA3ODEgMTI3LjQxMDE1NiAxMjMuNTUwNzgxIDEzMC43OTY4NzUgQyAxMjMuNTUwNzgxIDEzNC4xODc1IDEyMy41NTA3ODEgMTQ2LjYwNTQ2OSAxMjMuNTUwNzgxIDE1NS40ODA0NjkgQyAxMjMuNTUwNzgxIDE2NC4zNTU0NjkgMTIzLjM0Mzc1IDE3MS4yMzQzNzUgMTIwLjY4NzUgMTcxLjIzNDM3NSBaIE0gMTIwLjY4NzUgMTcxLjIzNDM3NSAiLz4KPC9nPgo8L3N2Zz4K';
const menuIconURI = blockIconURI;
const NODE_ID = 'micro';

class micro{                                                                                                                  
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.ble = new ble(runtime);
        this.ble.microBitReceivedMessage = this.microBitReceivedMessage.bind(this);

        this.hat_num = 0;
    }

    static get STATE_KEY() {
        return 'Scratch.micro';
    }

    microBitReceivedMessage(msg){
        console.log("Server: ", msg);
        var srv_cmd = msg.split(",")[0];
        switch(srv_cmd) {
            case "so":
                this.runtime.startHats('micro_onSonar', {});
                break;
            default:
                1+1;
          }
    }

    getInfo() {
        return {
            id: NODE_ID,
            name: 'micro',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                
                {
                    opcode: 'connect',            
                    blockType: BlockType.COMMAND, 
                    arguments: {
                    },
                    text: 'Connect Micro:bit'
                },
                {   // display heart on LED.
                    opcode: 'test',                // Todo: return list-string splited by comma.
                    blockType: BlockType.COMMAND, 
                    arguments: {
                    },
                    text: 'Test Micro:bit'
                },
                {   // display heart on LED.
                    opcode: 'testLED',                // Todo: return list-string splited by comma.
                    blockType: BlockType.COMMAND, 
                    arguments: {
                    },
                    text: 'OFF LED'
                },
                {  
                    opcode: 'move_single_motor',             
                    blockType: BlockType.COMMAND, 
                    arguments: {
                        Target: {
                            type: ArgumentType.STRING,
                            defaultValue: "1A",
                        },
                        Speed: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 150,
                        },
                        Delay:{
                            type: ArgumentType.NUMBER,
                            defaultValue: 2,
                        }
                    },
                    text: 'move motor [Target] speed:[Speed] delay:[Delay]'
                },
                
                { 
                    opcode: 'move_double_motor',        
                    blockType: BlockType.COMMAND, 
                    arguments: {
                        Target1: {
                            type: ArgumentType.STRING,
                            defaultValue: "1A",
                        },
                        Speed1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 150,
                        },
                        Target2: {
                            type: ArgumentType.STRING,
                            defaultValue: "2B",
                        },
                        Speed2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 150,
                        }
                    },
                    text: 'move motor [Target1] speed:[Speed1] & [Target2] speed:[Speed2]'
                },
                { 
                    opcode: 'stop_motors',              
                    blockType: BlockType.COMMAND, 
                    arguments: {
                    },
                    text: 'Stop DC motors'
                },  
                

                {  
                    opcode: 'move_servo',             
                    blockType: BlockType.COMMAND, 
                    arguments: {
                        Target: {
                            type: ArgumentType.STRING,
                            defaultValue: "1",
                        },
                        Angle: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        }
                    },
                    text: 'move servo [Target] angle:[Angle]'
                },


                {
                    opcode: 'displaySymbol',
                    text: formatMessage({
                        id: 'microbit.displaySymbol',
                        default: 'display [MATRIX]',
                        description: 'display a pattern on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                            defaultValue: '0101010101100010101000100'
                        }
                    }
                },
                {
                    opcode: "getSonar",                // Todo
                    blockType: BlockType.REPORTER, 
                    arguments: {
                    },
                    text: "Get Sonar"
                },
                {
                    opcode: 'onSonar',
                    blockType: BlockType.HAT,
                    isEdgeActivated: false,
                    text: '当Sonar返回'
                },
                {
                    opcode: 'onHat',
                    blockType: BlockType.HAT,
                    isEdgeActivated: false,
                    text: 'Hat test'
                },
                { 
                    opcode: 'trigHat', 
                    blockType: BlockType.COMMAND, 
                    arguments: {
                    },
                    text: 'Trig-Hat'
                }
            ]
        };
    }


    // broadcast connect message
    connect(args) {
        //const _port = args.port;
        //return this.dobot_client.connect_dobot(NODE_ID,_port); //await.
        this.ble.microBitConnect();
    }
    onSonar(args,util)
    {
        return true;
    }

    //test
    onHat(args,util)
    {
        this.hat_num +=1;
        console.log("on hat cnt: " , this.hat_num)
        return true;
    }
    trigHat(args){
        this.runtime.startHats('micro_onHat', {});
    }


    test(args){

        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
          }


        let led_cmd = {
            cmd_id:'9980',
            cmd:'led',
            cmd_payload: '..#....#.................'
        }
        //cmd_str = JSON.stringify(led_cmd) + '\n'
        //cmd_str = cmd_str.replaceAll("\"","\'");
        //Warrning: 16bytes may cause a 020 Error (if sending too fast.)
        // Max:20  up to a maximum of 20 octets at a time by writing to the RX Characteristic
        //https://lancaster-university.github.io/microbit-docs/ble/uart-service/
        //cmd_str = "1234567890"+"1234" + getRandomInt(10) + ";"
        cmd_str = "aaa,bbb,aa;"
        //debugger 
        this.ble.microBitWriteString(cmd_str)
    }

    getSonar(args){
        cmd_str = "so,,;"
        //debugger 
        this.ble.microBitWriteString(cmd_str)

    }
    testLED(){
        var ledMatrix = [
            ['0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0']
          ]
        this.ble.writeMatrixIcon(ledMatrix);
    }
    move_single_motor(args) {
        const target = args.Target;
        const speed = args.Speed;
        const delay = args.Delay;
        cmd_str = "m,"+target+","+speed+","+delay+";";
        debugger
        this.ble.microBitWriteString(cmd_str)
    }

    move_double_motor(args) {
        const target1 = args.Target1;
        const speed1 = args.Speed1;
        const target2 = args.Target2;
        const speed2 = args.Speed2;
        cmd_str = "mm,"+target1+","+target2+","+speed1+","+speed2+";";
        this.ble.microBitWriteString(cmd_str)
    }

    //new
    stop_motors(args) {
        cmd_str = "st;";
        this.ble.microBitWriteString(cmd_str)
    }

    move_servo(args) {
        const target = args.Target;
        const angle = args.Angle;
        cmd_str = "sv,"+target+","+angle+";";
        this.ble.microBitWriteString(cmd_str)
    }


    displaySymbol (args) {
        const symbol = cast.toString(args.MATRIX).replace(/\s/g, '');
        // "0101010101100010101000100"
        const arr = symbol.split("");
        // (25) ["0", "1", "0", "1", "0", "1", "0", "1", "0", "1", "1", "0", "0", "0", "1", "0", "1", "0", "1", "0", "0", "0", "1", "0", "0"]

        newArr = [];
        while(arr.length)
            newArr.push(arr.splice(0,5));

        this.ble.writeMatrixIcon(newArr);
    }


}

module.exports = micro;



// todo
// 1. isConnected?
// 2. Dynamic device list.
// 3. Connect try catch.
// 4. Get Pose.
// 5. is_adapter_running
// 6. is_dobot_connecting
// 7. disconnect.
// 8. 分布式Adapter.