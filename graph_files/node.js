class GraphicalNode {
    constructor(x, y, radius, label) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.selected = false;

        // original label (used in gameplay)
        this.label = label;

        // NEW: custom edit-mode properties
        this.customLabel = "";
        this.customColor = null;

        // existing group node object
        this.node = null;
    }
}