import Cocoa
import ApplicationServices

class NodeServerManager {
    private var process: Process?

    // MARK: - Public methods

    func startServer() {
        guard process == nil else {
            print("[NodeServerManager] Server already running, skipping start.")
            return
        }

        // Locate the bundled server binary
        guard let serverBinaryURL = Bundle.main.url(forResource: "MacRemoteServer", withExtension: nil) else {
            print("[NodeServerManager] Bundled server binary not found")
            showServerFileMissingAlert(serverPath: "MacRemoteServer")
            return
        }

        print("[NodeServerManager] Starting bundled Node server at path: \(serverBinaryURL.path)")

        process = Process()
        process?.executableURL = serverBinaryURL
        process?.arguments = [] // No extra args needed
        process?.environment = ProcessInfo.processInfo.environment

        // Capture stdout/stderr for logging
        let outputPipe = Pipe()
        process?.standardOutput = outputPipe
        process?.standardError = outputPipe

        outputPipe.fileHandleForReading.readabilityHandler = { fileHandle in
            if let line = String(data: fileHandle.availableData, encoding: .utf8),
               !line.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                print("[NodeServer] \(line.trimmingCharacters(in: .whitespacesAndNewlines))")
            }
        }

        do {
            try process?.run()
            print("[NodeServerManager] Node server started successfully.")
        } catch {
            print("[NodeServerManager] Failed to start server:", error)
            showServerStartFailedAlert(error: error)
        }
    }

    func stopServer() {
        guard process != nil else {
            print("[NodeServerManager] Server is not running, nothing to stop.")
            return
        }
        print("[NodeServerManager] Stopping Node server...")
        process?.terminate()
        process = nil
        print("[NodeServerManager] Node server stopped.")
    }

    func restartServer() {
        print("[NodeServerManager] Restarting Node server...")
        stopServer()
        startServer()
    }

    func checkAccessibility() {
        print("[NodeServerManager] Checking Accessibility permission...")
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        let trusted = AXIsProcessTrustedWithOptions(options)
        if trusted {
            print("[NodeServerManager] Accessibility permission granted ✅")
        } else {
            print("[NodeServerManager] Accessibility permission NOT granted. User must allow it in System Settings → Privacy & Security → Accessibility.")
        }
    }

    // MARK: - Alerts

    private func showServerFileMissingAlert(serverPath: String) {
        print("[NodeServerManager] Showing alert: Server file not found")
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
            print("[NodeServerManager] Quitting app due to missing server binary.")
            NSApp.terminate(nil)
        }
    }

    private func showServerStartFailedAlert(error: Error) {
        print("[NodeServerManager] Showing alert: Server start failed")
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
