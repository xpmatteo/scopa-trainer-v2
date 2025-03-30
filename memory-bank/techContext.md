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
  - **main.js**: Application initialization and event binding
- ES6 modules with import/export pattern
- Event-driven architecture for handling user interactions

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
- Manual testing across browsers
- Console-based debugging
- Snapshot testing of game state transitions

## Deployment

### Hosting Requirements
- Any static file server (no backend required)
- No build process needed
- Works offline once loaded in the browser

### Performance Considerations
- Minimal DOM operations to improve rendering performance
- Small asset footprint (under 100KB total)
- No external requests after initial page load
