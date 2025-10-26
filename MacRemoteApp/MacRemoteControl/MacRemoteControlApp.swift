//
//  MacRemoteControlApp.swift
//  MacRemoteControl
//
//  Created by Yogesh Solanki on 26/10/25.
//

import SwiftUI

@main
struct MacRemoteControlApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}
