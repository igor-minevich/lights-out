class QuaternionNode {
    constructor() {
        this.selected = false;
        this.value = 1;
    }

    multiply(b, leftMultiply, clicked) {
        let a = this.value;
        let multTable = [
            [1, 2, 3, 4],
            [2, -1, 4, -3],
            [3, -4, -1, 2],
            [4, 3, -2, -1]
        ];


        const getIndex = val => {
            if (val < 0) {
                return (Math.abs(val) - 1 + 4) % 4;
            }
            return val - 1;
        };

        const getValue = index => {
            if (index >= 4) {
                return (index - 3) * -1;
            }
            return index + 1;
        };

        let aIndex = getIndex(a);
        let bIndex = getIndex(b);

        let result = (leftMultiply)
            ? multTable[aIndex][bIndex]
            : multTable[bIndex][aIndex];

        this.value = getValue((result + 8) % 8); // Add 8 before taking modulo to ensure positive result
    }


    color() {
        let colors = {
            '1': "rgb(255,255,255)",  // Identity: White
            '2': "rgb(255,0,0)",      // i: Red
            '3': "rgb(0,255,0)",      // j: Green
            '4': "rgb(0,0,255)",      // k: Blue
            '-1': "rgb(128,0,0)",     // -1: Dark Red
            '-2': "rgb(0,128,0)",     // -i: Dark Green
            '-3': "rgb(0,0,128)",     // -j: Dark Blue
            '-4': "rgb(128,128,255)"  // -k: Light Blue
        };

        return colors[this.value.toString()] || colors[(-this.value).toString()];
    }

    toString() {
        switch (this.value) {
            case 1:
                return "1";
            case 2:
                return "i";
            case 3:
                return "j";
            case 4:
                return "k";
            case -1:
                return "-1";
            case -2:
                return "-i";
            case -3:
                return "-j";
            case -4:
                return "-k";
            default:
                return "";
        }
    }
}
