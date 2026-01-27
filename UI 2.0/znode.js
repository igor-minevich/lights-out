class ZNode {
    constructor() {
        this.selected = false;
        this.value = 0;
        this.clicks = 0;
    }

    multiply(b, leftMultiply) { // we are not using leftMultiply, this is only for non-abelian groups.
        let a = this.value;

        this.value = (a + b);
        this.clicks = (this.clicks + b);

        // if (clicked) {
        //     this.clicks = --this.clicks < 0 ? n - 1 : this.clicks;
        // }
    }

    toString() {
        return this.clicks.toString();
    }
}