//
//  AppDelegate.swift
//  MacRemoteControl
//
//  Created by Yogesh Solanki on 26/10/25.
//
import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusBarItem: NSStatusItem?
    var nodeManager: NodeServerManager?
    var timer: Timer?
    
    var icon1: NSImage?
    var icon2: NSImage?
    var toggle = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        icon1 = resizeImage(named: "iconTemplate", width: 22, height: 22)
        icon2 = resizeImage(named: "iconActive", width: 22, height: 22)
        
        icon1?.isTemplate = false
        icon2?.isTemplate = false

        statusBarItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusBarItem?.button?.image = icon1

        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "Restart Server", action: #selector(restartServer), keyEquivalent: "r"))
        menu.addItem(NSMenuItem(title: "Permissions", action: #selector(checkPermissions), keyEquivalent: "p"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q"))
        statusBarItem?.menu = menu

        nodeManager = NodeServerManager()
        nodeManager?.startServer()
        startIconAnimation()
    }

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

    @objc func restartServer() {
        nodeManager?.restartServer()
    }

    @objc func checkPermissions() {
        nodeManager?.checkAccessibility()
    }

    @objc func quitApp() {
        nodeManager?.stopServer()
        stopIconAnimation()
        NSApp.terminate(nil)
    }

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
