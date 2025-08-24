# GitHub Copilot Instructions for OhNo Blocks Android Game

## Project Context
OhNo Blocks is an Android puzzle game similar to Tetris with custom block types. The game uses a WebView to run HTML5/JavaScript game logic within a native Android wrapper. Follow responsible AI development practices while maintaining game performance and user experience.

## Core Development Principles

### Code Quality Standards
- **Single Responsibility**: Each function handles one game mechanic or UI element
- **DRY Principle**: Reuse game logic components and UI patterns
- **Performance First**: Optimize for smooth 60fps gameplay on mobile devices
- **Mobile-Optimized**: Design for touch interfaces and various screen sizes
- **Battery Conscious**: Implement efficient algorithms to preserve device battery

### Technology Stack Preferences
1. **Java** (Android native code, WebView management)
2. **JavaScript** (Game logic, HTML5 Canvas rendering)
3. **HTML5/CSS3** (Game UI, responsive design)
4. **Gradle** (Build automation, dependency management)

## AI-Assisted Development Standards

### Game Development Documentation
Document significant AI-assisted game development in `AI_SESSIONS/` directory:

```
AI_SESSIONS/
├── YYYY-MM-DD_[feature-name].md
└── README.md
```

### Session Documentation Template
```markdown
# AI Game Development Session

**Date**: YYYY-MM-DD  
**Feature**: [game feature or bugfix]  
**AI Assistant**: GitHub Copilot  
**Developer**: [name]

## Changes Made
- [file]: [game mechanic changes]
- [file]: [UI/UX improvements]

## Game Logic Changes
- [AI suggestion for game mechanics]
- [Performance optimizations]
- [Bug fixes implemented]

## Review Status
- [ ] Game tested on device
- [ ] Performance acceptable (60fps)
- [ ] Touch controls responsive
- [ ] Code reviewed
```

## Game-Specific Security & Safety

### Mobile Game Security
- **No Hardcoded Secrets**: Use Android Keystore for sensitive data
- **WebView Security**: Sanitize any external content loaded in WebView
- **Permission Minimization**: Only request necessary Android permissions
- **Data Validation**: Validate all game state and user input
- **Safe WebView Configuration**: Disable unnecessary WebView features

### Game Safety Guidelines
- **Bounds Checking**: Validate all game grid coordinates and array access
- **State Validation**: Ensure game state consistency after each move
- **Memory Management**: Prevent memory leaks in long game sessions
- **Touch Input Validation**: Handle rapid/invalid touch inputs gracefully
- **Frame Rate Protection**: Prevent infinite loops that could freeze the game

## Value Alignment for Gaming

### Player-Centered Design
- **Respect Player Time**: Design fair, skill-based challenges without artificial frustration
- **Accessibility**: Support players with different abilities and device types
- **Cultural Sensitivity**: Avoid culturally insensitive game content or mechanics
- **Inclusive Gaming**: Design for diverse players and play styles

### Healthy Gaming Patterns
- **Natural Play Rhythms**: Allow natural breaks and don't pressure continuous play
- **Balanced Challenge**: Provide achievable goals that build confidence
- **Non-Addictive Design**: Avoid dark patterns that exploit psychological vulnerabilities
- **Positive Feedback**: Celebrate achievements without creating dependency

### Community and Wellbeing
- **Family-Friendly**: Keep content appropriate for all ages
- **Stress Relief**: Design calming, meditative gameplay rather than anxiety-inducing
- **Offline Play**: Support gameplay without requiring constant connectivity
- **Device Respect**: Optimize for older devices and conserve battery life

## Android Development Guidelines

### Project Structure
```
app/
├── src/main/
│   ├── java/com/adrianmaule/ohnoblocks/
│   │   └── MainActivity.java           # WebView management
│   ├── assets/
│   │   ├── game.html                   # Game interface
│   │   └── game.js                     # Game logic
│   └── res/                            # Android resources
├── build.gradle                        # App dependencies
└── proguard-rules.pro                  # Code obfuscation
```

### WebView Best Practices
- **JavaScript Bridge**: Implement secure communication between Java and JavaScript
- **Asset Loading**: Optimize game asset loading for fast startup
- **Memory Management**: Handle WebView lifecycle properly to prevent leaks
- **Error Handling**: Gracefully handle WebView errors and fallbacks

### Game Performance Guidelines
- **Canvas Optimization**: Use efficient HTML5 Canvas drawing techniques
- **Animation Smoothness**: Implement consistent frame timing using requestAnimationFrame
- **Touch Responsiveness**: Minimize touch-to-response latency
- **Memory Efficiency**: Reuse objects and minimize garbage collection
- **Battery Optimization**: Use efficient algorithms and pause when backgrounded

## Testing and Quality Assurance

### Game Testing Requirements
- **Device Testing**: Test on multiple Android devices and screen sizes
- **Performance Testing**: Validate 60fps gameplay under various conditions
- **Touch Testing**: Verify touch controls work reliably across devices
- **Gameplay Testing**: Ensure game rules work correctly in all scenarios
- **Battery Testing**: Monitor power consumption during extended play

### Android-Specific Testing
- **Orientation Changes**: Handle device rotation gracefully
- **Background/Foreground**: Properly pause/resume game state
- **Memory Pressure**: Test behavior under low memory conditions
- **Network Interruption**: Handle connectivity changes smoothly
- **WebView Updates**: Test compatibility with different WebView versions

## Build and Deployment

### Gradle Configuration
- **Dependency Management**: Keep Android dependencies up to date
- **Build Optimization**: Configure ProGuard for release builds
- **Signing Configuration**: Secure keystore management
- **Version Management**: Semantic versioning for releases

### Release Preparation
- **APK Optimization**: Minimize APK size through asset optimization
- **Icon Generation**: Create proper app icons for all densities
- **Store Preparation**: Optimize for Google Play Store requirements
- **Testing Pipeline**: Automated testing before release

## Human Oversight Requirements

### Game Design Review
- **Player Experience**: Verify AI suggestions enhance rather than detract from fun
- **Gameplay Balance**: Ensure AI-generated mechanics maintain fair challenge
- **Performance Impact**: Review performance implications of suggested code
- **User Interface**: Validate UI changes work well on mobile devices

### Code Review Standards
- **Android Best Practices**: Ensure suggestions follow Android development guidelines
- **Game Logic Validation**: Verify game rules remain consistent and fair
- **Security Assessment**: Review WebView and Android security implications
- **Performance Analysis**: Check frame rate and memory usage impact

## Risk Management

### Game Development Risk Levels

#### Low Risk
- UI styling and layout adjustments
- Asset optimization and compression
- Documentation and comment updates
- Non-critical feature additions

#### Medium Risk
- Game logic modifications
- Touch control system changes
- Performance optimization code
- WebView configuration updates

#### High Risk
- Core game engine changes
- Android security model modifications
- Player data handling code
- Release build configuration changes

---

**Remember**: Gaming should be enjoyable, accessible, and respectful of players' time and wellbeing. All AI suggestions should enhance the player experience while maintaining technical excellence and security standards.
