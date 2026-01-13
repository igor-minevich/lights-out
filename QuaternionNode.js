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
        const colors = {
            '1':  "rgb(255,255,255)",   //  1  → white
            '2':  "rgb(255,200,200)",   //  i  → light red
            '3':  "rgb(200,255,200)",   //  j  → light green
            '4':  "rgb(200,200,255)",   //  k  → light blue
    
            '-1': "rgb(230,230,230)",   // -1 → light gray
            '-2': "rgb(255,220,220)",   // -i → lighter red
            '-3': "rgb(220,255,220)",   // -j → lighter green
            '-4': "rgb(220,220,255)"    // -k → lighter blue
        };
    
        return colors[this.value.toString()];
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
