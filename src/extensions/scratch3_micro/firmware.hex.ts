function motor_speed (target: string, speed: number) {
    target = target.toLowerCase( );
switch(target) { 
					case "1a": { 
						motor = 0x1;//["M1A"];
						break; 
					} 
					case "1b": { 
						motor = 0x2;//["M1B"];
						break; 
					} 
					case "2a": { 
						motor = 0x3;//["M2A"];
						break; 
					} 
					case "2b": { 
						motor = 0x4;//["M2B"];
						break; 
					} 
					default: { 
						//statements; 
						break; 
					} 
				}
robotbit.MotorRun(motor, speed)
}
function ping (mid: string, trig: number, echo: number) {
    dist = sonar.ping(
    100 + trig,
    100 + echo,
    PingUnit.Centimeters
    )
    bluetooth.uartWriteLine("" + mid + ",so," + convertToText(dist))
}

function get_servo_angle (mid: string, sid: number) {
    angle = servo_angs[sid+1]
    bluetooth.uartWriteLine("" + mid + ",sva," + convertToText(angle))
}

function set_servo_angle ( sid: number, ang: number) {
    servo_angs[sid-1] = ang
}


bluetooth.onBluetoothConnected(function () {
    isConnected = 1
    basic.showIcon(IconNames.Yes)
})
bluetooth.onBluetoothDisconnected(function () {
    isConnected = 0
    basic.showIcon(IconNames.No)
})
// input.onButtonPressed(Button.A, function () {
// ping(102, 101)
// })
function move2motor (target1: string, target2: string, speed1: number, speed2: number) {
    target1 = target1.toLowerCase();
target2 = target2.toLowerCase();
switch(target1) { 
					case "1a": { 
						m1 = 0x1;//["M1A"];
						break; 
					} 
					case "1b": { 
						m1 = 0x2;//["M1B"];
						break; 
					} 
					case "2a": { 
						m1 = 0x3;//["M2A"];
						break; 
					} 
					case "2b": { 
						m1 = 0x4;//["M2B"];
						break; 
					} 
					default: { 
						break; 
					} 
				}
switch(target2) { 
				case "1a": { 
					m2 = 0x1;//["M1A"];
					break; 
				} 
				case "1b": { 
					m2 = 0x2;//["M1B"];
					break; 
				} 
				case "2a": { 
					m2 = 0x3;//["M2A"];
					break; 
				} 
				case "2b": { 
					m2 = 0x4;//["M2B"];
					break; 
				} 
				default: { 
					break; 
				} 
			}
robotbit.MotorRunDual(m1,speed1,m2,speed2)
}
function move1motor_delay (target: string, speed: number, delay: number) {
    target = target.toLowerCase( );
switch(target) { 
					case "1a": { 
						motor = 0x1;//["M1A"];
						break; 
					} 
					case "1b": { 
						motor = 0x2;//["M1B"];
						break; 
					} 
					case "2a": { 
						motor = 0x3;//["M2A"];
						break; 
					} 
					case "2b": { 
						motor = 0x4;//["M2B"];
						break; 
					} 
					default: { 
						//statements; 
						break; 
					} 
	}
robotbit.MotorRunDelay(motor, speed,delay)
}
let cmd = ""
let uart = ""
let isConnected = 0
let servo_angs = [90, 90, 90, 90, 90, 90, 90, 90]
let angle = 0
let dist = 0
let m2 : robotbit.Motors = null
let m1 : robotbit.Motors = null
let motor : robotbit.Motors = null
let cmd_str_list: string[] = []
isConnected = 0
bluetooth.startUartService()
bluetooth.startLEDService()
bluetooth.startButtonService()
bluetooth.startIOPinService()
bluetooth.startMagnetometerService()
bluetooth.startAccelerometerService()
basic.showIcon(IconNames.SmallHeart)
basic.forever(function () {
    if (isConnected == 1) {
        uart = bluetooth.uartReadUntil(serial.delimiters(Delimiters.SemiColon))
        if (uart) {
            cmd_str_list = uart.split(",")
            cmd = cmd_str_list[0]
            if (cmd == "so") { // get sonar distance         # so,wew321,2,1 
                // msgID, trig, echo
                ping(cmd_str_list[1], parseFloat(cmd_str_list[2]), parseFloat(cmd_str_list[3]))
            } else if (cmd == "m") {
                move1motor_delay(cmd_str_list[1], parseFloat(cmd_str_list[2]), parseFloat(cmd_str_list[3]))
            } else if (cmd == "mm") {
                move2motor(cmd_str_list[1], cmd_str_list[2], parseFloat(cmd_str_list[3]), parseFloat(cmd_str_list[4]))
            } else if (cmd == "st") {
                robotbit.MotorStopAll()
            } else if (cmd == "ms") {  // motor speed        # ms, 255, 255
                motor_speed(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            } else if (cmd == "sv") { // move servos         # sv, 1, 90
                set_servo_angle(parseFloat(cmd_str_list[1]), parseFloat(cmd_str_list[2]))
                robotbit.Servo(parseFloat(cmd_str_list[1]), parseFloat(cmd_str_list[2]))
            } else if (cmd == "sva") { // get servo angles   # sva, wee321, 1
                get_servo_angle(cmd_str_list[1],parseFloat(cmd_str_list[2]))
            } else {
                bluetooth.uartWriteLine(cmd)
            }
        }
    }
})
