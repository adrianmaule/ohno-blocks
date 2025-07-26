# OhNo Blocks - Android Game

This project contains a block puzzle game similar to Tetris with additional block types.

## App Icons
The project includes placeholder app icons. To create proper icons:
1. Create a 512x512 pixel icon image with your game design
2. Use Android Studio's Image Asset Studio to generate all required densities
3. Replace the placeholder icons in the mipmap folders

## Current icon files needed:
- ic_launcher.png (in each mipmap density folder)
- ic_launcher_round.png (in each mipmap density folder)

For now, you can copy any existing Android app icon to these locations as placeholders.

## Building the APK

1. Install Android Studio
2. Open this project
3. Connect your device or use an emulator
4. Click "Run" or use: `./gradlew assembleDebug`
5. The APK will be in `app/build/outputs/apk/debug/`

## Game Features
- Tetris-like pieces plus custom blocks (single, 2x2, 1x4, 1x5, 3x3)
- Touch controls for mobile
- No rotation mechanics
- Horizontal and vertical line clearing
- Score system (1 point per cleared square)
- Game over when no moves possible
