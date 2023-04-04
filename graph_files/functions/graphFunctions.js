function standardGraph(all_nodes, num_rows, num_cols) {
    for (let y = 50; y <= num_rows * 50; y += 50) {
        var nodeRow = [];
        for (let x = 50; x <= num_cols * 50; x += 50) {
            nodeRow.push(create_node(x, y));
        }
        all_nodes.push(nodeRow);
    }
    // horizontal edges
    for (let i = 0; i <= num_rows - 1; i++) {
        for (let k = 0; k < num_cols - 1; k++) {
            edges.push({ from: all_nodes[i][k], to: all_nodes[i][k + 1], round: false, dash: false });
        }
    }
    // vertical edges
    for (let i = 0; i < num_rows - 1; i++) {
        for (let k = 0; k <= num_cols - 1; k++) {
            edges.push({ from: all_nodes[i][k], to: all_nodes[i + 1][k], round: false, dash: false });
        }
    }
    if (document.getElementById("top_bottom").checked) {

        // connecting top and bottom edges
        for (let i = 0; i <= num_cols - 1; i++) {
            edges.push({ from: all_nodes[0][i], to: all_nodes[num_rows - 1][i], round: true, dash: false });
        }
    }
    if (document.getElementById("sides").checked) {
        // connecting left and right edges
        for (let i = 0; i <= num_rows - 1; i++) {
            edges.push({ from: all_nodes[i][0], to: all_nodes[i][num_cols - 1], round: true, dash: false });
        }
    }
}


function cycleGraph(all_nodes) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / vertices;

    // Create the nodes
    const cycleNodes = [];
    for (let i = 0; i < vertices; i++) {
        const x = 400 + 200 * Math.cos(angle * i);
        const y = 250 + 200 * Math.sin(angle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        cycleNodes.push(newNode);
    }

    // Connect the nodes in a cycle
    for (let i = 0; i < cycleNodes.length; i++) {
        const fromNode = cycleNodes[i];
        const toNode = cycleNodes[(i + 1) % cycleNodes.length];
        if (!edgeExists(fromNode, toNode)) {
            edges.push({ from: fromNode, to: toNode, round: false, dash: false });
        }
    }
}

function starGraph(all_nodes) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / (vertices - 1);

    // Create the central node
    const centralNode = create_node(400, 250);
    all_nodes.push(centralNode);

    // Create the surrounding nodes and connect them to the central node
    for (let i = 0; i < vertices - 1; i++) {
        const x = 400 + 200 * Math.cos(angle * i);
        const y = 250 + 200 * Math.sin(angle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        edges.push({ from: centralNode, to: newNode, round: false, dash: false });
    }
}

function wheelGraph(all_nodes) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / (vertices - 1);

    // Create the central node
    const centralNode = create_node(400, 250);
    all_nodes.push(centralNode);

    // Create the surrounding nodes and connect them to the central node and their neighbors
    const surroundingNodes = [];
    for (let i = 0; i < vertices - 1; i++) {
        const x = 400 + 200 * Math.cos(angle * i);
        const y = 250 + 200 * Math.sin(angle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        surroundingNodes.push(newNode);
        edges.push({ from: centralNode, to: newNode, round: false, dash: false });
    }

    // Connect the surrounding nodes in a cycle
    for (let i = 0; i < surroundingNodes.length; i++) {
        const fromNode = surroundingNodes[i];
        const toNode = surroundingNodes[(i + 1) % surroundingNodes.length];
        edges.push({ from: fromNode, to: toNode, round: false, dash: false });
    }
}

function completeGraph(all_nodes) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / vertices;

    for (let i = 0; i < vertices; i++) {
        const x = 400 + 200 * Math.cos(angle * i);
        const y = 250 + 200 * Math.sin(angle * i);
        all_nodes.push(create_node(x, y));
    }

    // Connect each node to every other node
    for (let i = 0; i < vertices; i++) {
        for (let j = i + 1; j < vertices; j++) {
            edges.push({ from: all_nodes[i], to: all_nodes[j], round: false, dash: false });
        }
    }
}

function petersonGraph(all_nodes) {
    const outerAngle = 2 * Math.PI / 5;
    const innerAngle = 2 * Math.PI / 5;

    // Create the outer nodes (pentagon)
    const outerNodes = [];
    for (let i = 0; i < 5; i++) {
        const x = 400 + 200 * Math.cos(outerAngle * i);
        const y = 250 + 200 * Math.sin(outerAngle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        outerNodes.push(newNode);
    }

    // Create the inner nodes (star)
    const innerNodes = [];
    for (let i = 0; i < 5; i++) {
        const x = 400 + 100 * Math.cos(innerAngle * i + innerAngle / 2);
        const y = 250 + 100 * Math.sin(innerAngle * i + innerAngle / 2);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        innerNodes.push(newNode);
    }

    // Connect the outer nodes in a cycle (pentagon)
    for (let i = 0; i < outerNodes.length; i++) {
        const fromNode = outerNodes[i];
        const toNode = outerNodes[(i + 1) % outerNodes.length];
        edges.push({ from: fromNode, to: toNode, round: false, dash: false });
    }

    // Connect the inner nodes in a star pattern
    for (let i = 0; i < innerNodes.length; i++) {
        const fromNode = innerNodes[i];
        const toNode = innerNodes[(i + 2) % innerNodes.length];
        edges.push({ from: fromNode, to: toNode, round: false, dash: false });
    }

    // Connect the outer nodes to the inner nodes
    for (let i = 0; i < outerNodes.length; i++) {
        const fromNode = outerNodes[i];
        const toNode = innerNodes[i];
        edges.push({ from: fromNode, to: toNode, round: false, dash: false });
    }
}

function circulantGraph(all_nodes) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const connectionsInput = document.getElementById("connections").value;
    const connectionsArray = connectionsInput.split(",");

    // Validate the connections input
    let invalidInput = false;
    const connections = connectionsArray.map(x => {
        const num = parseInt(x.trim());
        if (isNaN(num) || num < 1 || num >= vertices || num > vertices / 2) {
            invalidInput = true;
        }
        return num;
    });

    if (invalidInput) {
        alert("Invalid connections input. Please provide a comma-separated list of integers greater than 0, and at most n/2.");
        return;
    }
    const angle = 2 * Math.PI / vertices;

    for (let i = 0; i < vertices; i++) {
        const x = 400 + 200 * Math.cos(angle * i);
        const y = 250 + 200 * Math.sin(angle * i);
        all_nodes.push(create_node(x, y));
    }

    for (let i = 0; i < vertices; i++) {
        for (const connection of connections) {
            const fromNode = all_nodes[i];
            const toNode = all_nodes[(i + connection) % vertices];
            if (!edgeExists(fromNode, toNode)) {
                edges.push({ from: fromNode, to: toNode, round: false, dash: false });
            }
        }
    }

}


function bipartiteGraph(all_nodes) {
    const set1Size = parseInt(document.getElementById("set1").value);
    const set2Size = parseInt(document.getElementById("set2").value);

    const yPos1 = 150;
    const yPos2 = 350;
    const set1Spacing = canvas.width / (set1Size + 1);
    const set2Spacing = canvas.width / (set2Size + 1);

    const set1Nodes = [];
    const set2Nodes = [];

    for (let i = 0; i < set1Size; i++) {
        set1Nodes.push(create_node((i + 1) * set1Spacing, yPos1));
    }

    for (let i = 0; i < set2Size; i++) {
        set2Nodes.push(create_node((i + 1) * set2Spacing, yPos2));
    }

    for (let i = 0; i < set1Size; i++) {
        for (let j = 0; j < set2Size; j++) {
            edges.push({ from: set1Nodes[i], to: set2Nodes[j], round: false, dash: false });
        }
    }
}

function diagonalGraph(all_nodes, num_rows, num_cols) {
    for (let y = 50; y <= num_rows * 50; y += 50) {
        var nodeRow = [];
        for (let x = 50; x <= num_cols * 50; x += 50) {
            nodeRow.push(create_node(x, y));
        }
        all_nodes.push(nodeRow);
    }
    // horizontal edges
    for (let i = 0; i <= num_rows - 2; i++) {
        for (let k = 0; k < num_cols - 1; k++) {
            edges.push({ from: all_nodes[i][k], to: all_nodes[i + 1][k + 1], round: false, dash: false });
        }
    }
    // vertical edges
    for (let i = 0; i < num_rows - 1; i++) {
        for (let k = 0; k <= num_cols - 2; k++) {
            edges.push({ from: all_nodes[i + 1][k], to: all_nodes[i][k + 1], round: false, dash: false });
        }
    }
    if (document.getElementById("sides").checked) {
        //connecting sides
        for (let i = 0; i < num_rows - 1; i++) {
            edges.push({ from: all_nodes[i][0], to: all_nodes[i + 1][num_cols - 1], round: false, dash: false });
            edges.push({ from: all_nodes[i][num_cols - 1], to: all_nodes[i + 1][0], round: false, dash: false });
            console.log(i);
        }
    }
    if (document.getElementById("top_bottom").checked) {
        //connecting top and bottom edges
        for (let i = 0; i < num_cols - 1; i++) {
            edges.push({ from: all_nodes[0][i], to: all_nodes[num_rows - 1][i + 1], round: false, dash: false });
            edges.push({ from: all_nodes[num_rows - 1][i], to: all_nodes[0][i + 1], round: false, dash: false });
        }
    }
    if (document.getElementById("top_bottom").checked && document.getElementById("sides").checked) {
        edges.push({ from: all_nodes[0][0], to: all_nodes[num_rows - 1][num_cols - 1], round: true, dash: true });
        edges.push({ from: all_nodes[num_rows - 1][0], to: all_nodes[0][num_cols - 1], round: true, dash: true });
    }
    draw();
}

