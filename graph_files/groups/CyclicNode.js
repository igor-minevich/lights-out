class CyclicNode {
    constructor(n) {
        this.n = n; // n is group order
        this.selected = false;
        this.value = 0; // node value: how many times the node has been switched
        this.clicks = 0; // number of a times the node has been clicked
    }
    // This function handles the event that it or an adjacent node was clicked and modifies this node's value and clicks.
    // multiplier is the value of the multiplier with which it was clicked.
    // leftMultiply tells us what side it was multiplied on.
    // clicked tells us if this node was clicked. If some other node was clicked that affects this node, then clicked is false.
    multiply(multiplier, leftMultiply, clicked) { // we are not using leftMultiply, this is only for non-abelian groups.
        if (this.n === 0)
            this.value += multiplier;
        else
            this.value = (this.value + multiplier) % this.n;

        if (clicked) {
            if (this.n === 0)
                this.clicks += multiplier;
            else
                this.clicks = (this.clicks + multiplier) % this.n;
        }

    }

    color() {
        if (this.n === 0) // if Z then return white, otherwise return a color gradient.
            return "rgb(255, 255, 255)";
        else //if value is 0 return white, if value is n - 1 return red. exp for green and blue: 255 - value * 255 / (n-1). 
            return "rgb(255," + (255 - this.value * 255 / (this.n - 1)) + "," + (255 - this.value * 255 / (this.n - 1)) + ")";
    }

    toString() {
        return this.clicks.toString();
    }
}