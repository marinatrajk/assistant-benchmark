import AppKit
import ApplicationServices
import Foundation

func output(_ object: [String: Any]) {
    let data = try! JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
    print(String(data: data, encoding: .utf8)!)
}
func fail(_ text: String) -> Never { output(["error": text]); exit(1) }
let input = FileHandle.standardInput.readDataToEndOfFile()
guard let a = try? JSONSerialization.jsonObject(with: input) as? [String: Any], let action = a["action"] as? String else { fail("Expected a JSON action on stdin") }
let display = CGMainDisplayID()
let bounds = CGDisplayBounds(display)
if action == "status" {
    output(["accessibility": AXIsProcessTrusted(), "screenRecording": CGPreflightScreenCaptureAccess(),
            "width": bounds.width, "height": bounds.height, "displayId": display,
            "app": NSWorkspace.shared.frontmostApplication?.localizedName ?? "Unknown"])
    exit(0)
}
guard AXIsProcessTrusted() else { fail("Enable Accessibility for the terminal or app running Paces in System Settings → Privacy & Security.") }
func number(_ key: String) -> Double { (a[key] as? NSNumber)?.doubleValue ?? 0 }
func point(_ x: String, _ y: String) -> CGPoint {
    let px = number(x), py = number(y)
    guard px >= 0 && py >= 0 && px < bounds.width && py < bounds.height else { fail("Coordinates are outside the primary display") }
    return CGPoint(x: px + bounds.minX, y: py + bounds.minY)
}
func mouse(_ type: CGEventType, _ p: CGPoint, _ button: CGMouseButton = .left, _ count: Int64 = 1) {
    guard let event = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: p, mouseButton: button) else { fail("Cannot create mouse event") }
    event.setIntegerValueField(.mouseEventClickState, value: count)
    event.post(tap: .cghidEventTap)
}
switch action {
case "click":
    let p = point("x", "y")
    let right = (a["button"] as? String) == "right"
    let count = min(2, max(1, Int(number("count"))))
    for i in 1...count {
        mouse(right ? .rightMouseDown : .leftMouseDown, p, right ? .right : .left, Int64(i))
        mouse(right ? .rightMouseUp : .leftMouseUp, p, right ? .right : .left, Int64(i))
        usleep(60000)
    }
case "drag":
    let start = point("x", "y"), end = point("toX", "toY")
    mouse(.leftMouseDown, start)
    for i in 1...20 {
        let t = Double(i) / 20
        mouse(.leftMouseDragged, CGPoint(x: start.x + (end.x-start.x)*t, y: start.y + (end.y-start.y)*t))
        usleep(15000)
    }
    mouse(.leftMouseUp, end)
case "type":
    let units = Array((a["text"] as? String ?? "").utf16)
    for offset in stride(from: 0, to: units.count, by: 20) {
        let chunk = Array(units[offset..<min(offset+20, units.count)])
        for down in [true, false] {
            let event = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: down)!
            chunk.withUnsafeBufferPointer { buffer in event.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: buffer.baseAddress!) }
            event.post(tap: .cghidEventTap)
        }
    }
case "key":
    let parts = (a["key"] as? String ?? "").lowercased().split(separator: "+").map(String.init)
    let keys: [String: CGKeyCode] = ["a":0,"s":1,"d":2,"f":3,"h":4,"g":5,"z":6,"x":7,"c":8,"v":9,"b":11,"q":12,"w":13,"e":14,"r":15,"y":16,"t":17,"1":18,"2":19,"3":20,"4":21,"6":22,"5":23,"9":25,"7":26,"8":28,"0":29,"o":31,"u":32,"i":34,"p":35,"enter":36,"return":36,"l":37,"j":38,"k":40,"n":45,"m":46,"tab":48,"space":49,"backspace":51,"escape":53,"delete":117,"home":115,"end":119,"pageup":116,"pagedown":121,"left":123,"right":124,"down":125,"up":126]
    guard let last = parts.last, let code = keys[last] else { fail("Unsupported key; use text entry for arbitrary text") }
    var flags = CGEventFlags()
    for part in parts.dropLast() {
        switch part {
        case "cmd", "command", "meta": flags.insert(.maskCommand)
        case "ctrl", "control": flags.insert(.maskControl)
        case "alt", "option": flags.insert(.maskAlternate)
        case "shift": flags.insert(.maskShift)
        default: fail("Unknown modifier: \(part)")
        }
    }
    for down in [true, false] {
        let event = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: down)!
        event.flags = flags; event.post(tap: .cghidEventTap)
    }
case "scroll":
    let amount = Int32(max(-2000, min(2000, number("pixels"))))
    CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 1, wheel1: -amount, wheel2: 0, wheel3: 0)?.post(tap: .cghidEventTap)
default: fail("Unknown desktop action")
}
output(["ok": true])
