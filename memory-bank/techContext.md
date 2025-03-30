# Technical Context: Scopa Trainer

## Technology Stack

### Frontend
- **HTML5**: Structure and content
- **CSS3**: Styling with responsive design principles
- **JavaScript (ES6+)**: Core application logic
- **No external JS frameworks**: Pure vanilla JavaScript implementation

### Storage
- **LocalStorage API**: For persisting game state between sessions

## Implementation Details

### Browser Requirements
- Modern browsers with ES6+ support
- LocalStorage API support
- Flexbox layout support

### Code Organization
- HTML file with embedded CSS and separate JavaScript modules
- MVC architecture with proper separation of concerns:
  - **model.js**: Game state and business logic
  - **controller.js**: UI handling and DOM manipulation
  - **ai.js**: Pure functions for AI decision making
  - **main.js**: Application initialization and event binding
- ES6 modules with import/export pattern
- Event-driven architecture for handling user interactions
- Centralized legal moves system for consistent rule enforcement

### Game Logic Implementation
- **findAllLegalMoves function**: Central logic for determining valid moves
- **Model-Controller separation**: Model contains game rules, Controller handles UI interaction
- **State-based validation**: All gameplay validation based on current game state

### AI Implementation
- **Pure Function Pattern**: AI implemented as pure functions with no access to global state
- **Limited Information Principle**: AI only receives information a real player would know
- **makeAIDecision**: Takes legal moves and AI's view of game state, returns a decision
- **recommendMove**: Provides analysis for player moves (for post-game review)

### Rendering Approach
- DOM manipulation for UI updates
- CSS classes for visual state (selected, highlighted)
- CSS transitions for animation effects

## Dependencies

### External Libraries
- None - completely self-contained application

### Browser APIs
- **DOM API**: For manipulating the document structure
- **LocalStorage API**: For saving game state
- **Math.random()**: For card shuffling and AI non-deterministic behavior

## Development Tools

### Recommended Editor
- VSCode with HTML/CSS/JavaScript extensions

### Testing Approach
- Jasmine testing framework (via CDN)
- Dedicated test suite for legal moves functionality
- HTML-based test runner with visual results
- Console-based debugging
- Snapshot testing of game state transitions
- General test runner (tests.html) for all test suites

## Development Environment

### Local Server
- HTTP server running on port 8000
- Project files accessible at http://localhost:8000/web/
- No need to start the server manually as it's always running

## Deployment

### Hosting Requirements
- Any static file server (no backend required)
- No build process needed
- Works offline once loaded in the browser

### Performance Considerations
- Minimal DOM operations to improve rendering performance
- Small asset footprint (under 100KB total)
- No external requests after initial page load
