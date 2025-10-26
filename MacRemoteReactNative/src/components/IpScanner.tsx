import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  BarcodeScanner,
  CameraView,
} from '@pushpendersingh/react-native-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

type IpScannerProps = {
  onIpDetected: (ip: string) => void;
  onClose?: () => void;
};

export const IpScanner: React.FC<IpScannerProps> = ({
  onIpDetected,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const hasCameraPermission = await BarcodeScanner.hasCameraPermission();
        if (!hasCameraPermission) {
          const granted = await BarcodeScanner.requestCameraPermission();
          setHasPermission(granted);

          if (!granted) {
            Alert.alert(
              'Camera Permission Required',
              'Camera permission is required to scan QR codes. Please enable camera access in your device settings to use the scanner.',
              [
                { text: 'OK', style: 'default' },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    // On Android, we can't directly open settings, but we can guide the user
                    Alert.alert(
                      'Enable Camera Access',
                      'Go to Settings > Apps > MacRemote > Permissions and enable Camera access.',
                    );
                  },
                },
              ],
            );
          }
        } else {
          setHasPermission(true);
        }
      } catch (error) {
        console.error('Failed to initialize scanner:', error);
        Alert.alert(
          'Camera Error',
          'Failed to access camera. Please check if camera permissions are enabled and try again.',
        );
      }
    };

    initializeScanner();
  }, []);

  const startScanning = async () => {
    // Double-check permission before starting
    const currentPermission = await BarcodeScanner.hasCameraPermission();

    if (!currentPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Camera permission is required to scan QR codes. Please grant camera access to use the scanner.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await BarcodeScanner.requestCameraPermission();
              setHasPermission(granted);
              if (granted) {
                // Retry scanning after permission is granted
                setTimeout(startScanning, 500);
              } else {
                Alert.alert(
                  'Permission Denied',
                  'Camera permission is required to scan QR codes. You can enable it in your device settings.',
                );
              }
            },
          },
        ],
      );
      return;
    }

    try {
      setIsScanning(true);
      await BarcodeScanner.startScanning(result => {
        handleScan(result);
      });
    } catch (error) {
      console.error('Failed to start scanning:', error);
      Alert.alert(
        'Camera Error',
        'Failed to start camera. Please make sure no other app is using the camera and try again.',
      );
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      setIsScanning(false);
      await BarcodeScanner.stopScanning();
    } catch (error) {
      console.error('Failed to stop scanning:', error);
    }
  };

  const toggleFlash = async () => {
    try {
      if (flashEnabled) {
        await BarcodeScanner.disableFlashlight();
        setFlashEnabled(false);
      } else {
        await BarcodeScanner.enableFlashlight();
        setFlashEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle flashlight:', error);
    }
  };

  const handleScan = async (result: { data: string; type: string }) => {
    if (!result.data) return;

    try {
      const ipRegex = /(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/;
      const match = result.data.match(ipRegex);

      if (match) {
        await AsyncStorage.setItem('serverIp', result.data);
        await stopScanning();
        onIpDetected(result.data);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'Please scan a QR code containing a valid IP address',
        );
      }
    } catch (error) {
      console.error('Failed to process QR code:', error);
      Alert.alert('Error', 'Failed to process QR code');
    }
  };

  useEffect(() => {
    if (hasPermission) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Server QR Code</Text>
        <Text style={styles.description}>
          Scan the QR code from your Mac server to automatically detect the IP
          address
        </Text>
      </View>

      <View style={styles.scannerContainer}>
        {isScanning && hasPermission ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame}>
                <View style={styles.scannerCornerTopLeft} />
                <View style={styles.scannerCornerTopRight} />
                <View style={styles.scannerCornerBottomLeft} />
                <View style={styles.scannerCornerBottomRight} />
              </View>
              <Text style={styles.scannerText}>
                Position QR code within frame
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.scannerPlaceholder}>
            <Text style={styles.scannerText}>
              {hasPermission ? 'Ready to scan' : 'Camera permission required'}
            </Text>
            {!hasPermission && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={async () => {
                  const granted =
                    await BarcodeScanner.requestCameraPermission();
                  setHasPermission(granted);
                  if (!granted) {
                    Alert.alert(
                      'Permission Denied',
                      'Camera permission is required to scan QR codes. Please enable camera access in your device settings.',
                    );
                  }
                }}
              >
                <Text style={styles.permissionButtonText}>
                  Grant Camera Permission
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {!isScanning && hasPermission && (
          <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        )}

        {isScanning && hasPermission && (
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.flashButtonText}>
              {flashEnabled ? '🔦 Flash Off' : '🔦 Flash On'}
            </Text>
          </TouchableOpacity>
        )}

        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to get the QR code:</Text>
        <Text style={styles.instruction}>1. On your Mac, run the server</Text>
        <Text style={styles.instruction}>
          2. The server will display a QR code with the IP
        </Text>
        <Text style={styles.instruction}>
          3. Scan the QR code with this app
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scannerContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.background.tertiary,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    position: 'relative',
    marginBottom: spacing.lg,
  },
  scannerCornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.accent.primary,
  },
  scannerCornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.accent.primary,
  },
  scannerCornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.accent.primary,
  },
  scannerCornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.accent.primary,
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerText: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  scanButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  flashButton: {
    backgroundColor: colors.accent.secondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  flashButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  manualButton: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  manualButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  closeButton: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  closeButtonText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  instructions: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  instructionsTitle: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
});
