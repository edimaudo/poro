# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Poro

### 1.2 Application Description
A Pomodoro Timer web application called Poro built with Flask and Jinja templates, featuring customizable timer intervals, integrated music player with multiple genres, theme switching, and full WCAG 2.1 AA accessibility compliance. The application uses Jinja templating for all frontend rendering without React or React-based frameworks.  It should follow a respnosive design.  The user interface should follow (https://www.toptal.com/project-managers/tomato-timer) exactly then add the music player at the bottom of the screen or as the footer.  Music should be taken from royalty free sites that are valid

## 2. Users and Usage Scenarios

### 2.1 Target Users
Individuals seeking to improve productivity and focus through the Pomodoro Technique, including students, remote workers, and professionals.

### 2.2 Core Usage Scenarios
- Managing work sessions with timed intervals
- Taking structured breaks between focus periods
- Listening to background music during work or break sessions
- Switching between light and dark themes based on preference or environment
- Accessing the application across different devices (desktop, tablet, mobile)

## 3. Page Structure and Functionality

### 3.1 Page Structure
```
Poro Application
└── Main Timer Page
    ├── Timer Display Section
    ├── Timer Control Section
    ├── Settings Section
    ├── Music Player Section
    └── Theme Toggle
```

### 3.2 Main Timer Page

#### 3.2.1 Timer Display Section
- Display current timer mode (Work, Short Break, Long Break)
- Display remaining time in MM:SS format
- Visual progress indicator

#### 3.2.2 Timer Control Section
- Start button: Initiates the current timer session
- Pause button: Pauses the running timer
- Reset button: Resets the current timer to initial duration
- Skip button: Moves to the next session type

#### 3.2.3 Settings Section
- Work duration input field (default: 25 minutes)
- Short break duration input field (default: 5 minutes)
- Long break duration input field (default: 15 minutes)
- Long break interval setting (number of work sessions before long break)
- Save settings button

#### 3.2.4 Music Player Section
- Genre selector dropdown (Rain, Lofi, Nature, Electronic)
- Current track name display
- Play/Pause button
- Previous track button
- Next track button
- Volume control slider
- Track list for selected genre (4 tracks per genre)

#### 3.2.5 Theme Toggle
- Toggle switch for Light Theme and Dark Theme
- Persistent theme selection across sessions

## 4. Business Rules and Logic

### 4.1 Pomodoro Cycle Logic
- Default sequence: Work → Short Break → Work → Short Break → Work → Short Break → Work → Long Break
- After completing a long break, the cycle restarts
- User can customize the number of work sessions before a long break
- Timer automatically transitions to the next session type upon completion

### 4.2 Notification Logic
- Visual notification: Display on-screen message when timer completes
- Audio notification: Play distinct sound alert when timer completes
- Notifications trigger for all session types (work, short break, long break)

### 4.3 Music Player Logic
- Music continues playing across timer transitions
- Genre selection loads corresponding 4-track playlist
- Track advances automatically when current track ends
- Previous/Next buttons navigate within current genre playlist
- Volume setting persists across sessions
- Music player state (playing/paused) is independent of timer state

### 4.4 Theme Persistence
- Selected theme (Light/Dark) is saved and restored on subsequent visits
- Theme switch applies immediately without page reload

### 4.5 Settings Persistence
- Custom timer durations are saved and restored on subsequent visits
- Long break interval setting is saved and restored

### 4.6 Jinja Template Structure
- Base template (base.html) contains common layout structure, navigation, and theme toggle
- Main timer page extends base template and includes timer, settings, and music player sections
- Template blocks for head, content, and scripts allow modular content injection
- CSS variables define blue color scheme for both light and dark themes

### 4.7 Blue Color Scheme Specification

#### Light Theme
- Primary Blue: #2563EB
- Secondary Blue: #3B82F6
- Light Blue Background: #EFF6FF
- Blue Accent: #1D4ED8
- Text on Blue: #FFFFFF

#### Dark Theme
- Primary Blue: #3B82F6
- Secondary Blue: #60A5FA
- Dark Blue Background: #1E3A8A
- Blue Accent: #93C5FD
- Text on Blue: #F0F9FF

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| User closes browser during active timer | Timer state is lost; application resets to default state on next visit |
| User adjusts settings during active timer | Changes apply to next timer session, not current session |
| Audio file fails to load | Display error message; allow user to continue without music |
| User navigates away from page | Timer continues in background if browser tab remains open |
| Volume set to 0 | Music player continues visual playback but produces no sound |
| User clicks Next on last track in genre | Loops back to first track in current genre |
| User clicks Previous on first track in genre | Loops to last track in current genre |
| Jinja template rendering fails | Display error page with fallback styling |

## 6. Acceptance Criteria

1. Application is built using Flask with Jinja templates for all frontend rendering
2. No React or React-based frameworks are used in the implementation
3. Blue color scheme is implemented using specified hex codes for both light and dark themes
4. Timer accurately counts down from set duration and displays time in MM:SS format
5. Timer transitions automatically between work, short break, and long break sessions according to configured cycle
6. Visual and audio notifications trigger at the end of each timer session
7. All timer controls (Start, Pause, Reset, Skip) function correctly
8. Settings can be customized and persist across browser sessions
9. Music player loads and plays 4 instrumental tracks for each of the 4 genres (Rain, Lofi, Nature, Electronic)
10. Music player controls (Play/Pause, Previous, Next, Volume) function correctly
11. Genre selector switches between playlists without interrupting playback state
12. Current track name displays correctly
13. Light and Dark themes can be toggled and persist across sessions
14. Application is fully keyboard navigable
15. All interactive elements have proper ARIA labels
16. Color contrast ratios meet WCAG 2.1 AA standards for both themes
17. Application layout adapts responsively to desktop, tablet, and mobile screen sizes
18. Primary font Inter and secondary font Century Schoolbook are applied correctly
19. Jinja template structure includes base template with reusable blocks and components

## 7. Features Not Included in This Release

1. User account system with login and registration
2. Statistics tracking (completed sessions, total focus time, productivity trends)
3. Task list integration or to-do list functionality
4. Custom audio file upload capability
5. Social features (sharing progress, collaborative timers)
6. Browser extension or desktop application version
7. Integration with third-party productivity tools
8. Advanced notification customization (custom sounds, notification timing)
9. Multiple timer profiles or presets
10. Data export functionality
11. Server-side session management for timer state persistence
12. API endpoints for external integrations