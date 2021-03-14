function servo_smooth_move (sid: number, angle: number) {
    robotbit.Servo(sid, angle)
	set_servo_angle(sid, angle)
}
bluetooth.onBluetoothConnected(function () {
    isConnected = 1
    basic.showIcon(IconNames.Yes)
})
bluetooth.onBluetoothDisconnected(function () {
    isConnected = 0
    basic.showIcon(IconNames.No)
})
function walk (steps: number, direction: number) {
    if (direction == 1) {
        // Move forward
        for (let index = 0; index < steps; index++) {
            robotbit.Servo(2, 130)
			robotbit.Servo(4, 110)
			basic.pause(200)
            robotbit.Servo(3, 75)
			robotbit.Servo(1, 75)
			basic.pause(200)
            robotbit.Servo(2, 100)
			robotbit.Servo(4, 90)
			basic.pause(200)
            robotbit.Servo(2, 80)
			robotbit.Servo(4, 70)
			basic.pause(200)
            robotbit.Servo(3, 115)
			robotbit.Servo(1, 115)
			basic.pause(200)
            robotbit.Servo(2, 100)
			robotbit.Servo(4, 90)
			basic.pause(1000)
        }
    } else {
        // Move backward
        for (let index = 0; index < steps; index++) {
            robotbit.Servo(2, 80)
			robotbit.Servo(4, 75)
			basic.pause(200)
            robotbit.Servo(3, 75)
			robotbit.Servo(1, 75)
			basic.pause(200)
            robotbit.Servo(2, 100)
			robotbit.Servo(4, 90)
			basic.pause(200)
            robotbit.Servo(2, 115)
			robotbit.Servo(4, 115)
			basic.pause(200)
            robotbit.Servo(3, 115)
			robotbit.Servo(1, 115)
			basic.pause(200)
            robotbit.Servo(2, 100)
			robotbit.Servo(4, 90)
			basic.pause(1000)
        }
    }
}
function otto_home () {
    robotbit.Servo(1, 90)
	robotbit.Servo(2, 90)
	robotbit.Servo(3, 90)
	robotbit.Servo(4, 90)
	robotbit.Servo(5, 90)
	robotbit.Servo(6, 90)
	robotbit.Servo(7, 90)
	robotbit.Servo(8, 90)
}
function set_servo_angle (sid: number, ang: number) {
    servo_angs[sid - 1] = ang
}
function servo_move (sid: number, angle: number) {
    robotbit.Servo(sid, angle)
set_servo_angle(sid, angle)
}
function get_servo_angle (mid: string, sid: number) {
    angle = servo_angs[sid - 1]
    bluetooth.uartWriteLine("" + mid + ",sva," + convertToText(angle))
}
let cmd = ""
let uart = ""
let isConnected = 0
let servo_angs: number[] = []
let angle = 0
let cmd_str_list: string[] = []
servo_angs = [90, 90, 90, 90, 90, 90, 90, 90]
isConnected = 0
bluetooth.startUartService()
bluetooth.startLEDService()
bluetooth.startButtonService()
bluetooth.startIOPinService()
bluetooth.startMagnetometerService()
bluetooth.startAccelerometerService()
basic.showIcon(IconNames.Sad)
basic.forever(function () {
    if (isConnected == 1) {
        uart = bluetooth.uartReadUntil(serial.delimiters(Delimiters.SemiColon))
        if (uart) {
            cmd_str_list = uart.split(",")
            cmd = cmd_str_list[0]
            // FOR OTTO Robot.
            // get servo angles
            // walk(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            if (cmd == "sv") {
                // move servos         # sv, 1, 90
                set_servo_angle(parseFloat(cmd_str_list[1]), parseFloat(cmd_str_list[2]))
                robotbit.Servo(parseFloat(cmd_str_list[1]), parseFloat(cmd_str_list[2]))
            } else if (cmd == "sva") {
                // get servo angles   # sva, wee321, 1
                get_servo_angle(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            } else if (cmd == "oto_hom") {
                // get servo angles   # sva, wee321, 1
                otto_home()
            } else if (cmd == "oto_wlk") {
                // WALK  # oto_wlk, steps(1-10), direction(1:forward,  -1:backward)
                walk(parseFloat(cmd_str_list[1]), parseFloat(cmd_str_list[2]))
            } else if (cmd == "oto_mon") {
                // get servo angles   # sva, wee321, 1
                get_servo_angle(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            } else if (cmd == "otto_led") {
                // get servo angles   # sva, wee321, 1
                get_servo_angle(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            } else if (cmd == "oto_trn") {
                // get servo angles   # sva, wee321, 1(-1)
                get_servo_angle(cmd_str_list[1], parseFloat(cmd_str_list[2]))
            } else {
                bluetooth.uartWriteLine(cmd)
            }
        }
    }
})
