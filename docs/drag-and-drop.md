# Drag-and-Drop Functionality in Vanilla Chess

This document explains the implementation and behavior of the drag-and-drop functionality for moving chess pieces in the application.

## Overview

The Chess App implements an intuitive drag-and-drop interface that allows players to naturally move pieces by dragging them across the board. This functionality:

- Works seamlessly on both desktop (mouse) and mobile (touch) devices
- Provides visual feedback during the dragging process
- Highlights valid move destinations
- Differentiates between clicks and drags using a movement threshold
- Falls back gracefully to click-based interaction when needed

## Implementation Details

### 1. Detecting Drag Operations

The system distinguishes between simple clicks and drag operations:

1. **Initial Contact Detection**:
   - When a user presses down on a piece (mousedown/touchstart), the system doesn't immediately start dragging
   - Instead, it marks the piece as a "potential drag" and records the starting position
   - A drag threshold (5 pixels) determines whether the user intended to drag or click

```javascript
// How the system detects the start of a potential drag
this.isPotentialDrag = true;
this.mouseDownPosition = { x: clientX, y: clientY };
this.dragStartPosition = { row: actualRow, col: actualCol };
```

2. **Threshold-Based Drag Initiation**:
   - As the user moves the cursor/finger, the movement distance is compared to the threshold
   - If movement exceeds the threshold, a proper drag operation begins
   - If the user releases without exceeding the threshold, it's treated as a click

```javascript
// Threshold check in the move handler
const deltaX = Math.abs(clientX - this.mouseDownPosition.x);
const deltaY = Math.abs(clientY - this.mouseDownPosition.y);

// If movement is significant, start actual dragging
if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
    this.startDragging(clientX, clientY);
}
```

### 2. Visual Feedback During Dragging

When a drag operation is active, the system provides visual feedback:

1. **Drag Visual Creation**:
   - A visual representation of the dragged piece is created and follows the cursor
   - The original piece is partially faded to indicate it's being moved
   - The visual has the same appearance as the original piece but positioned at the cursor

```javascript
createDragVisual(pieceElement, clientX, clientY) {
    // Create a clone of the piece element
    const dragVisual = document.createElement('div');
    dragVisual.id = 'drag-piece-visual';
    dragVisual.className = 'piece dragging';
    dragVisual.style.backgroundImage = pieceElement.style.backgroundImage;
    // ...existing code...
}
```

2. **Valid Move Highlighting**:
   - When dragging starts, the system shows valid moves just like in click-based selection
   - This guides the user to appropriate drop targets
   - Different highlighting for regular moves vs. captures

3. **Cursor Styles**:
   - During dragging, the cursor changes to a "grabbing" style
   - This provides additional visual feedback about the drag state

```css
.chessboard .piece {
    cursor: grab; /* Default cursor for pieces */
}

.chessboard .piece:active {
    cursor: grabbing; /* Cursor during active dragging */
}
```

### 3. Cross-Platform Support

The implementation works across different devices and input methods:

1. **Mouse Support** (Desktop):
   - Uses standard mouse events (mousedown, mousemove, mouseup)
   - Follows the cursor precisely during dragging

2. **Touch Support** (Mobile/Tablets):
   - Uses touch events (touchstart, touchmove, touchend)
   - Follows the finger precisely during dragging
   - Prevents default scrolling behavior when dragging pieces
   - Shows valid moves immediately on touchstart for better mobile UX

```javascript
// Event listeners for both mouse and touch
setupDragAndDrop() {
    const squaresContainer = this.container.querySelector('.squares-container');
    
    // Mouse events for desktop
    squaresContainer.addEventListener('mousedown', this.handleDragStart.bind(this));
    document.addEventListener('mousemove', this.handleDragMove.bind(this));
    document.addEventListener('mouseup', this.handleDragEnd.bind(this));
    
    // Touch events for mobile devices
    squaresContainer.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleDragEnd.bind(this));
    
    // Prevent default drag behavior of images
    squaresContainer.addEventListener('dragstart', (e) => e.preventDefault());
}
```

### 4. Drop Logic

When the user releases the piece (ends the drag), the system processes the drop operation:

1. **Target Detection**:
   - The system finds the square under the cursor/finger when the piece is released
   - The element is identified using `document.elementFromPoint()`
   - This works across both mouse and touch interfaces

2. **Move Validation**:
   - The drop target is checked against the valid moves list
   - If it's a valid move, the move is processed
   - If it's invalid, the piece returns to its original position

3. **Special Case Handling**:
   - Pawn promotion is detected and the promotion dialog is shown when applicable
   - Last move highlighting is updated
   - Dragged element visuals are cleaned up regardless of move validity

```javascript
// Excerpt from drop handling logic
if (isValidMove) {
    const from = this.dragStartPosition;
    const to = { row: actualTargetRow, col: actualTargetCol };
    
    // Update last move for highlighting
    this.lastMove = {
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col }
    };
    
    // Check for pawn promotion
    if (this.gameRef.isPromotion && this.gameRef.isPromotion(from, to)) {
        this.showPromotionDialog(from, to, this.gameRef.getCurrentPlayer());
    } else {
        // Execute the move
        if (this.callbacks.onMove) {
            this.callbacks.onMove({ from, to });
        }
    }
}
```

### 5. State Management

The system carefully manages state during drag operations:

1. **Drag State Variables**:
   - `isDragging`: Whether an active drag is in progress
   - `isPotentialDrag`: Whether a mousedown/touchstart has occurred but movement hasn't exceeded threshold
   - `draggedPiece`: Reference to the DOM element being dragged
   - `dragStartPosition`: The board position where dragging began
   - `mouseDownPosition`: The screen coordinates where mousedown/touchstart occurred

2. **State Cleanup**:
   - All drag state is reset after each operation
   - Visual elements are properly removed
   - Original piece opacity is restored
   - Event handlers continue to function correctly for the next operation

```javascript
// Reset drag state after operation
resetDragState() {
    if (this.draggedPiece) {
        this.draggedPiece.style.opacity = '1';
    }
    this.isDragging = false;
    this.isPotentialDrag = false;
    this.draggedPiece = null;
    this.dragStartPosition = null;
    this.mouseDownPosition = null;
}
```

## Performance Considerations

The drag-and-drop implementation incorporates several performance optimizations:

1. **Efficient DOM Updates**:
   - The drag visual is only created once per drag operation
   - Position updates use CSS transforms for better performance
   - The visual has `will-change: transform` to hint the browser to optimize rendering

2. **Debounced Event Handling**:
   - The system doesn't process every mousemove/touchmove event if not needed
   - Events are only processed when a potential or active drag is in progress

3. **Passive Event Listeners**:
   - Touch events use the passive option where appropriate to improve scrolling performance
   - Non-passive is used only where `preventDefault()` is required

4. **Cleanup**:
   - All temporary DOM elements are removed after drag completion
   - Event listeners are managed to prevent memory leaks

## Interaction with Click Selection

The drag-and-drop system coexists and integrates with the traditional click-based piece selection:

1. **Unified Move Processing**:
   - Both drag-and-drop and click-based selection use the same move validation and execution path
   - This ensures consistent behavior regardless of input method

2. **Seamless Transitions**:
   - Users can freely mix both interaction styles
   - Starting a drag will apply the same highlight effects as clicking a piece
   - If a user clicks and drags, the system transitions smoothly to drag mode

3. **Accessibility**:
   - Click-based selection remains fully functional for users who prefer or require it
   - This provides redundant interaction methods for better accessibility

## Mobile-Specific Optimizations

For touch devices, the implementation includes specific optimizations:

1. **Immediate Feedback**:
   - Valid moves are shown immediately on `touchstart` without waiting for movement
   - This provides better feedback on mobile where hovering is not possible

2. **Prevent Scrolling**:
   - When dragging a piece, page scrolling is prevented
   - This keeps the board in view during the drag operation

3. **Larger Touch Targets**:
   - The drag threshold is tuned to work well with touch interaction
   - Pieces can be accurately placed even on smaller screens

This comprehensive drag-and-drop implementation provides an intuitive, responsive chess experience across all devices while maintaining high performance and accessibility.