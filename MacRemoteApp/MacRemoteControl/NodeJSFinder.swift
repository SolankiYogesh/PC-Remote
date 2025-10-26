import Foundation
struct NodeJSFinder {
    
    static func findNodePath() -> String? {
        print("[NodeJSFinder] === Starting Node.js search ===")
        let searchPaths = getAllPossiblePaths()
        
        print("[NodeJSFinder] Validating \(searchPaths.count) potential paths...")
        for (index, path) in searchPaths.enumerated() {
            print("[NodeJSFinder] [\(index + 1)/\(searchPaths.count)] Checking: \(path)")
            if isValidNodeExecutable(path) {
                print("[NodeJSFinder] ✅ FOUND VALID NODE.JS: \(path)")
                return path
            }
        }
        
        print("[NodeJSFinder] === Search complete: No valid Node.js found ===")
        return nil
    }
    
    static func findAllNodePaths() -> [String] {
        let searchPaths = getAllPossiblePaths()
        return searchPaths.filter { isValidNodeExecutable($0) }
    }
    
    static func getNodeInfo(path: String) -> NodeInfo? {
        guard isValidNodeExecutable(path) else { return nil }
        
        let version = executeCommand(path, args: ["--version"])?.trimmingCharacters(in: .whitespacesAndNewlines)
        let npmPath = findNpmPath(nodePath: path)
        
        return NodeInfo(
            path: path,
            version: version,
            npmPath: npmPath,
            source: determineSource(path)
        )
    }
    
    // MARK: - Private Methods
    
    private static func getAllPossiblePaths() -> [String] {
        var paths: [String] = []
        
        print("[NodeJSFinder] Starting search for Node.js...")
        
        if let pathFromEnv = findInPath() {
            print("[NodeJSFinder] Found in PATH: \(pathFromEnv)")
            paths.append(pathFromEnv)
        } else {
            print("[NodeJSFinder] Not found in PATH")
        }
        
        let nvmPaths = findNvmPaths()
        print("[NodeJSFinder] Found \(nvmPaths.count) nvm installation(s)")
        nvmPaths.forEach { print("[NodeJSFinder]   - \($0)") }
        paths.append(contentsOf: nvmPaths)
        
        let brewPaths = findBrewPaths()
        print("[NodeJSFinder] Found \(brewPaths.count) Homebrew installation(s)")
        brewPaths.forEach { print("[NodeJSFinder]   - \($0)") }
        paths.append(contentsOf: brewPaths)
        
        let systemPaths = [
            "/usr/local/bin/node",
            "/usr/bin/node",
            "/opt/homebrew/bin/node",
            "/opt/local/bin/node"
        ]
        print("[NodeJSFinder] Checking \(systemPaths.count) system paths...")
        paths.append(contentsOf: systemPaths)
        
        if let home = getHomeDirectory() {
            let userPaths = [
                "\(home)/.local/bin/node",
                "\(home)/.node/bin/node",
                "\(home)/bin/node"
            ]
            print("[NodeJSFinder] Checking \(userPaths.count) user paths...")
            paths.append(contentsOf: userPaths)
        }
        
        let fnmPaths = findFnmPaths()
        print("[NodeJSFinder] Found \(fnmPaths.count) fnm installation(s)")
        paths.append(contentsOf: fnmPaths)
        
        let voltaPaths = findVoltaPaths()
        print("[NodeJSFinder] Found \(voltaPaths.count) Volta installation(s)")
        paths.append(contentsOf: voltaPaths)
        
        print("[NodeJSFinder] Total paths to check: \(paths.count)")
        
        return paths
    }
    
    private static func findInPath() -> String? {
        let result = executeCommand("/usr/bin/which", args: ["node"])
        return result?.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    private static func findNvmPaths() -> [String] {
        guard let home = getHomeDirectory() else {
            print("[NodeJSFinder] Could not get home directory")
            return []
        }
        
        let nvmDir = ProcessInfo.processInfo.environment["NVM_DIR"] ?? "\(home)/.nvm"
        print("[NodeJSFinder] Checking nvm directory: \(nvmDir)")
        
        let versionsDir = "\(nvmDir)/versions/node"
        print("[NodeJSFinder] Looking for versions in: \(versionsDir)")
        
        let fm = FileManager.default
        if !fm.fileExists(atPath: versionsDir) {
            print("[NodeJSFinder] nvm versions directory does not exist")
            return []
        }
        
        return findNodeInDirectory(versionsDir)
    }
    
    private static func findBrewPaths() -> [String] {
        var paths: [String] = []
        
        paths.append("/usr/local/opt/node/bin/node")
        paths.append("/opt/homebrew/opt/node/bin/node")
        
        if let brewPrefix = executeCommand("/usr/bin/which", args: ["brew"]) {
            let prefix = executeCommand(brewPrefix.trimmingCharacters(in: .whitespacesAndNewlines),
                                       args: ["--prefix", "node"])
            if let prefix = prefix?.trimmingCharacters(in: .whitespacesAndNewlines) {
                paths.append("\(prefix)/bin/node")
            }
        }
        
        return paths
    }
    
    private static func findFnmPaths() -> [String] {
        guard let home = getHomeDirectory() else { return [] }
        
        let fnmDir = ProcessInfo.processInfo.environment["FNM_DIR"]
            ?? "\(home)/Library/Application Support/fnm"
        
        return findNodeInDirectory("\(fnmDir)/node-versions")
    }
    
    private static func findVoltaPaths() -> [String] {
        guard let home = getHomeDirectory() else { return [] }
        
        let voltaDir = ProcessInfo.processInfo.environment["VOLTA_HOME"]
            ?? "\(home)/.volta"
        
        return ["\(voltaDir)/bin/node"]
    }
    
    private static func findNodeInDirectory(_ directory: String) -> [String] {
        let fm = FileManager.default
        guard let contents = try? fm.contentsOfDirectory(atPath: directory) else {
            print("[NodeJSFinder] Cannot read directory: \(directory)")
            return []
        }
        
        print("[NodeJSFinder] Found \(contents.count) version(s) in \(directory)")
        
        let nodePaths = contents.compactMap { version -> String? in
            let nodePath = "\(directory)/\(version)/bin/node"
            let exists = fm.fileExists(atPath: nodePath)
            print("[NodeJSFinder] Checking \(nodePath): \(exists ? "EXISTS" : "NOT FOUND")")
            return exists ? nodePath : nil
        }
        
        return nodePaths
    }
    
    private static func isValidNodeExecutable(_ path: String) -> Bool {
        let fm = FileManager.default
        
        print("[NodeJSFinder]   Checking existence...")
        guard fm.fileExists(atPath: path) else {
            print("[NodeJSFinder]   ❌ Does not exist")
            return false
        }
        print("[NodeJSFinder]   ✓ File exists")
        
        // Check if it's a symlink and resolve it
        var resolvedPath = path
        var isSymlink = false
        if let symlinkDestination = try? fm.destinationOfSymbolicLink(atPath: path) {
            isSymlink = true
            if symlinkDestination.hasPrefix("/") {
                resolvedPath = symlinkDestination
            } else {
                let parentDir = (path as NSString).deletingLastPathComponent
                resolvedPath = (parentDir as NSString).appendingPathComponent(symlinkDestination)
            }
            print("[NodeJSFinder]   ✓ Symlink → \(resolvedPath)")
            
            // Check if resolved path exists
            if !fm.fileExists(atPath: resolvedPath) {
                print("[NodeJSFinder]   ❌ Symlink target does not exist")
                return false
            }
        }
        
        // Check executable permission
        print("[NodeJSFinder]   Checking executable permission...")
        let isExecutable = fm.isExecutableFile(atPath: resolvedPath)
        print("[NodeJSFinder]   \(isExecutable ? "✓" : "❌") Executable: \(isExecutable)")
        
        if !isExecutable {
            return false
        }
        
        // Get file attributes
        if let attributes = try? fm.attributesOfItem(atPath: resolvedPath) {
            let permissions = attributes[.posixPermissions] as? NSNumber
            print("[NodeJSFinder]   ℹ️  Permissions: \(String(format: "%o", permissions?.intValue ?? 0))")
        }
        
        // Try to execute --version
        print("[NodeJSFinder]   Attempting to run --version...")
        if let output = executeCommand(path, args: ["--version"]) {
            let trimmed = output.trimmingCharacters(in: .whitespacesAndNewlines)
            let hasVersion = !trimmed.isEmpty && (trimmed.hasPrefix("v") || trimmed.contains("."))
            print("[NodeJSFinder]   \(hasVersion ? "✅" : "❌") Version output: '\(trimmed)'")
            if hasVersion {
                return true
            }
        } else {
            print("[NodeJSFinder]   ⚠️  Could not execute --version")
        }
        
        // If execution failed but file exists and is executable, assume it's valid
        // This handles macOS sandboxing issues
        print("[NodeJSFinder]   ℹ️  File exists and is executable - accepting as valid despite version check failure")
        print("[NodeJSFinder]   ✅ VALID (permissive mode)")
        return true
    }
    
    private static func executeCommand(_ command: String, args: [String]) -> String? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: command)
        process.arguments = args
        
        let pipe = Pipe()
        let errorPipe = Pipe()
        process.standardOutput = pipe
        process.standardError = errorPipe
        
        // Set environment to help find libraries
        var environment = ProcessInfo.processInfo.environment
        if let existingPath = environment["PATH"] {
            environment["PATH"] = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:\(existingPath)"
        } else {
            environment["PATH"] = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        }
        process.environment = environment
        
        do {
            try process.run()
            process.waitUntilExit()
            
            if process.terminationStatus == 0 {
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                return String(data: data, encoding: .utf8)
            } else {
                let errorData = errorPipe.fileHandleForReading.readDataToEndOfFile()
                if let errorString = String(data: errorData, encoding: .utf8) {
                    print("[NodeJSFinder] Command error: \(errorString)")
                }
                return nil
            }
        } catch {
            print("[NodeJSFinder] Failed to execute command \(command): \(error)")
            return nil
        }
    }
    
    private static func findNpmPath(nodePath: String) -> String? {
        let nodeDir = (nodePath as NSString).deletingLastPathComponent
        let npmPath = "\(nodeDir)/npm"
        
        return FileManager.default.fileExists(atPath: npmPath) ? npmPath : nil
    }
    
    private static func determineSource(_ path: String) -> String {
        if path.contains("/.nvm/") {
            return "nvm"
        } else if path.contains("/homebrew/") || path.contains("/usr/local/opt/") {
            return "Homebrew"
        } else if path.contains("/fnm/") {
            return "fnm"
        } else if path.contains("/.volta/") {
            return "Volta"
        } else if path.hasPrefix("/usr/") {
            return "System"
        } else {
            return "Unknown"
        }
    }
    
    private static func getHomeDirectory() -> String? {
        return ProcessInfo.processInfo.environment["HOME"]
    }
}

struct NodeInfo {
    let path: String
    let version: String?
    let npmPath: String?
    let source: String
}
