//
//  NodeServerManager.swift
//
//  Created by Yogesh Solanki on 26/10/25.
//

import Cocoa
import ApplicationServices

class NodeServerManager {
    private var process: Process?

    func startServer() {
        guard process == nil else { return }

        guard let serverBinaryURL = Bundle.main.url(forResource: "MacRemoteServer", withExtension: nil) else {
            showServerFileMissingAlert(serverPath: "MacRemoteServer")
            return
        }

        process = Process()
        process?.executableURL = serverBinaryURL
        process?.arguments = []
        process?.environment = ProcessInfo.processInfo.environment

        let outputPipe = Pipe()
        process?.standardOutput = outputPipe
        process?.standardError = outputPipe

        outputPipe.fileHandleForReading.readabilityHandler = { fileHandle in
            if let line = String(data: fileHandle.availableData, encoding: .utf8),
               !line.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                print(line.trimmingCharacters(in: .whitespacesAndNewlines))
            }
        }

        do {
            try process?.run()
        } catch {
            showServerStartFailedAlert(error: error)
        }
    }

    func stopServer() {
        guard process != nil else { return }
        process?.terminate()
        process = nil
    }

    func restartServer() {
        stopServer()
        startServer()
    }

    func checkAccessibility() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
    }

    private func showServerFileMissingAlert(serverPath: String) {
        DispatchQueue.main.async {
            let alert = NSAlert()
            alert.messageText = "Server File Not Found"
            alert.informativeText = """
            The Mac Control Server binary is missing from the application bundle.

            Expected location: \(serverPath)

            Please reinstall the application.
            """
            alert.alertStyle = .critical
            alert.addButton(withTitle: "Quit")
            alert.runModal()
            NSApp.terminate(nil)
        }
    }

    private func showServerStartFailedAlert(error: Error) {
        DispatchQueue.main.async {
            let alert = NSAlert()
            alert.messageText = "Failed to Start Server"
            alert.informativeText = """
            The Mac Control Server failed to start.

            Error: \(error.localizedDescription)

            Please check the console logs for more details.
            """
            alert.alertStyle = .warning
            alert.addButton(withTitle: "OK")
            alert.runModal()
        }
    }
}
