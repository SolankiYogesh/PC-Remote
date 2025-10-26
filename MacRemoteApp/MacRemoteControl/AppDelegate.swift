//
//  AppDelegate.swift
//  MacRemoteControl
//
//  Created by Yogesh Solanki on 26/10/25.
//
import Cocoa
import CoreImage
import SystemConfiguration

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusBarItem: NSStatusItem?
    var nodeManager: NodeServerManager?
    var timer: Timer?
    var icon1: NSImage?
    var icon2: NSImage?
    var toggle = false
    var popover: NSPopover?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Load icons
        icon1 = resizeImage(named: "iconTemplate", width: 22, height: 22)
        icon2 = resizeImage(named: "iconActive", width: 22, height: 22)
        icon1?.isTemplate = false
        icon2?.isTemplate = false

        // Create status bar item
        statusBarItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusBarItem?.button?.image = icon1
        statusBarItem?.button?.target = self
        statusBarItem?.button?.action = #selector(togglePopover)

        // Start server
        nodeManager = NodeServerManager()
        nodeManager?.startServer()

        // Start icon animation
        startIconAnimation()
    }

    // MARK: - Popover

    @objc func togglePopover() {
        if popover == nil {
            let vc = NSViewController()
            let contentView = NSStackView(frame: NSRect(x: 0, y: 0, width: 220, height: 320))
            contentView.orientation = .vertical
            contentView.spacing = 10
            contentView.edgeInsets = NSEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)

            // IP Label
            let ipString = getLocalIPAddress() ?? "Unknown"
            let ipLabel = NSTextField(labelWithString: "IP: \(ipString)")
            ipLabel.alignment = .center
            contentView.addArrangedSubview(ipLabel)

            // QR Code
            if let qrImage = generateQRCode(from: "http://\(ipString):5001") {
                let imageView = NSImageView(image: qrImage)
                imageView.frame = NSRect(x: 0, y: 0, width: 200, height: 200)
                imageView.imageScaling = .scaleProportionallyUpOrDown
                contentView.addArrangedSubview(imageView)
            }

            // Buttons
            let restartBtn = NSButton(title: "Restart Server", target: self, action: #selector(restartServer))
            let permissionsBtn = NSButton(title: "Permissions", target: self, action: #selector(checkPermissions))
            let quitBtn = NSButton(title: "Quit", target: self, action: #selector(quitApp))
            contentView.addArrangedSubview(restartBtn)
            contentView.addArrangedSubview(permissionsBtn)
            contentView.addArrangedSubview(quitBtn)

            vc.view = contentView

            popover = NSPopover()
            popover?.contentViewController = vc
            popover?.behavior = .transient
        }

        if let button = statusBarItem?.button {
            popover?.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
        }
    }

    // MARK: - QR Code Generation

    private func generateQRCode(from string: String) -> NSImage? {
        guard let data = string.data(using: .utf8),
              let filter = CIFilter(name: "CIQRCodeGenerator") else { return nil }

        filter.setValue(data, forKey: "inputMessage")
        filter.setValue("Q", forKey: "inputCorrectionLevel")

        guard let output = filter.outputImage else { return nil }

        // Scale the CIImage
        let scaleX = 200 / output.extent.size.width
        let scaleY = 200 / output.extent.size.height
        let transformed = output.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

        let rep = NSCIImageRep(ciImage: transformed)
        let nsImage = NSImage(size: rep.size)
        nsImage.addRepresentation(rep)
        return nsImage
    }

    // MARK: - Icon Animation

    func startIconAnimation() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.8, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            self.statusBarItem?.button?.image = self.toggle ? self.icon1 : self.icon2
            self.toggle.toggle()
        }
    }

    func stopIconAnimation() {
        timer?.invalidate()
        timer = nil
    }

    // MARK: - Server Actions

    @objc func restartServer() { nodeManager?.restartServer() }
    @objc func checkPermissions() { nodeManager?.checkAccessibility() }
    @objc func quitApp() {
        nodeManager?.stopServer()
        stopIconAnimation()
        NSApp.terminate(nil)
    }

    // MARK: - Get Local IP

    private func getLocalIPAddress() -> String? {
        var address: String?
        var ifaddr: UnsafeMutablePointer<ifaddrs>? = nil
        if getifaddrs(&ifaddr) == 0 {
            var ptr = ifaddr
            while ptr != nil {
                defer { ptr = ptr?.pointee.ifa_next }
                guard let interface = ptr?.pointee,
                      let addr = interface.ifa_addr else { continue }

                let addrFamily = addr.pointee.sa_family
                if addrFamily == UInt8(AF_INET) {
                    let name = String(cString: interface.ifa_name)
                    if name != "lo0" { // skip loopback
                        var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                        
                        getnameinfo(addr,
                                    socklen_t(addr.pointee.sa_len),
                                    &hostname,
                                    socklen_t(hostname.count),
                                    nil,
                                    socklen_t(0),
                                    NI_NUMERICHOST)
                        address = String(cString: hostname)
                        break
                    }
                }
            }
            freeifaddrs(ifaddr)
        }
        return address
    }

    // MARK: - Image Helper

    private func resizeImage(named name: String, width: CGFloat, height: CGFloat) -> NSImage? {
        guard let image = NSImage(named: name) else { return nil }
        let newImage = NSImage(size: NSSize(width: width, height: height))
        newImage.lockFocus()
        image.draw(in: NSRect(x: 0, y: 0, width: width, height: height),
                   from: NSRect.zero,
                   operation: .copy,
                   fraction: 1.0)
        newImage.unlockFocus()
        return newImage
    }
}
