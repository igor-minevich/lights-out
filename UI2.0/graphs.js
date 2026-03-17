const ring = (count, radius, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
        const a = phase + (2 * Math.PI * i) / count;
        return [
            Math.round(radius * Math.cos(a)),
            Math.round(radius * Math.sin(a))
        ];
    });
    

function generateHypercubeLayers(d, spacingX, spacingY) {
    const layers = Array.from({ length: d + 1 }, () => []);
    const vertexCount = 1 << d;

    for (let i = 0; i < vertexCount; i++) {
        const weight = i.toString(2).split("1").length - 1;
        layers[weight].push(i);
    }

    const layout = new Array(vertexCount);

    const totalHeight = d * spacingY;
    const yOffset = totalHeight / 2;

    layers.forEach((layer, layerIndex) => {

        const width = (layer.length - 1) * spacingX;

        layer.forEach((vertex, i) => {

            const x = i * spacingX - width / 2;
            const y = layerIndex * spacingY - yOffset;

            layout[vertex] = [x, y];
        });

    });

    return layout;
}




function standardGraph(all_nodes, num_rows, num_cols, edgeLength) {

    all_nodes.length = 0;
    edges.length = 0;

    const edgeSet = new Set(); // prevents duplicates

    const spacing = edgeLength;

    const gridWidth = (num_cols - 1) * spacing;
    const gridHeight = (num_rows - 1) * spacing;

    const offsetX = canvas.width / 2 - gridWidth / 2;
    const offsetY = canvas.height / 2 - gridHeight / 2;

    // --- Create vertices ---
    for (let y = 0; y < num_rows; y++) {
        let nodeRow = [];
        for (let x = 0; x < num_cols; x++) {

            const node = create_node(
                offsetX + x * spacing,
                offsetY + y * spacing
            );

            node.gridRow = y;
            node.gridCol = x;

            nodeRow.push(node);
        }
        all_nodes.push(nodeRow);
    }

    // --- Move definitions ---

    const knightMoves = [
        [ 2, 1],[ 2,-1],[-2, 1],[-2,-1],
        [ 1, 2],[ 1,-2],[-1, 2],[-1,-2]
    ];

    const kingMoves = [
        [ 1,0],[-1,0],[0,1],[0,-1],
        [ 1,1],[ 1,-1],[-1,1],[-1,-1]
    ];

    const rookDirs = [
        [ 1,0],[-1,0],[0,1],[0,-1]
    ];

    const bishopDirs = [
        [ 1,1],[ 1,-1],[-1,1],[-1,-1]
    ];

    // --- checkbox state ---

    const knight = document.getElementById('knightMove').checked;
    const rook   = document.getElementById('rookMove').checked;
    const king   = document.getElementById('kingMove').checked;
    const queen  = document.getElementById('queenMove').checked;

    const bishop = queen;
    const rookLike = rook || queen;

    const noMoves = !(knight || rook || king || queen);

    // --- edge helper ---
    function addEdge(n1, n2) {

        const r1 = n1.gridRow;
        const c1 = n1.gridCol;
        const r2 = n2.gridRow;
        const c2 = n2.gridCol;

        const key =
            r1 < r2 || (r1 === r2 && c1 < c2)
            ? `${r1},${c1}-${r2},${c2}`
            : `${r2},${c2}-${r1},${c1}`;

        if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({from:n1,to:n2,round:false,dash:false});
        }
    }

    // --- Generate edges ---

    for (let r = 0; r < num_rows; r++) {
        for (let c = 0; c < num_cols; c++) {

            const fromNode = all_nodes[r][c];

            // standard grid if nothing selected
            if (noMoves) {

                if (c + 1 < num_cols)
                    addEdge(fromNode, all_nodes[r][c+1]);

                if (r + 1 < num_rows)
                    addEdge(fromNode, all_nodes[r+1][c]);
            }

            // knight
            if (knight) {
                for (let [dr,dc] of knightMoves) {

                    let nr = r + dr;
                    let nc = c + dc;

                    if (nr>=0 && nr<num_rows && nc>=0 && nc<num_cols)
                        addEdge(fromNode, all_nodes[nr][nc]);
                }
            }

            // king
            if (king) {
                for (let [dr,dc] of kingMoves) {

                    let nr = r + dr;
                    let nc = c + dc;

                    if (nr>=0 && nr<num_rows && nc>=0 && nc<num_cols)
                        addEdge(fromNode, all_nodes[nr][nc]);
                }
            }

            // rook / queen
            if (rookLike) {

                for (let [dr,dc] of rookDirs) {

                    let nr=r+dr;
                    let nc=c+dc;

                    while (nr>=0 && nr<num_rows && nc>=0 && nc<num_cols) {

                        addEdge(fromNode, all_nodes[nr][nc]);

                        nr+=dr;
                        nc+=dc;
                    }
                }
            }

            // bishop / queen
            if (bishop) {

                for (let [dr,dc] of bishopDirs) {

                    let nr=r+dr;
                    let nc=c+dc;

                    while (nr>=0 && nr<num_rows && nc>=0 && nc<num_cols) {

                        addEdge(fromNode, all_nodes[nr][nc]);

                        nr+=dr;
                        nc+=dc;
                    }
                }
            }
        }
    }

    // --- torus options still work ---
    if (document.getElementById("top_bottom").checked) {
        for (let i = 0; i < num_cols; i++) {
            addEdge(all_nodes[0][i], all_nodes[num_rows-1][i]);
        }
    }

    if (document.getElementById("sides").checked) {
        for (let i = 0; i < num_rows; i++) {
            addEdge(all_nodes[i][0], all_nodes[i][num_cols-1]);
        }
    }
}


function edgesIntersect(a, b, c, d) {
    function ccw(p, q, r) {
        return (r.y - p.y) * (q.x - p.x) > (q.y - p.y) * (r.x - p.x);
    }
    return (
        ccw(a, c, d) !== ccw(b, c, d) &&
        ccw(a, b, c) !== ccw(a, b, d)
    );
}


function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;

    if (dx === 0 && dy === 0) {
        return Math.hypot(px - ax, py - ay);
    }

    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(0, Math.min(1, t));

    const closestX = ax + clamped * dx;
    const closestY = ay + clamped * dy;

    return Math.hypot(px - closestX, py - closestY);
}

function randomGraph(all_nodes, vertexCount, edgeProbability) {
    const vertices = vertexCount ??
        parseInt(document.getElementById("vertices").value);

    const p = edgeProbability ??
        parseFloat(document.getElementById("edge_prob").value);

    const width = 700;
    const height = 500;
    const margin = 60;

    const nodeDiameter = 60;
    const nodeRadius = nodeDiameter / 2;
    const minDistance = nodeDiameter * 1.25;

    const nodes = [];

    function isFarEnough(x, y) {
        for (const node of nodes) {
            if (Math.hypot(node.x - x, node.y - y) < minDistance) {
                return false;
            }
        }
        return true;
    }

    // 🔹 Create nodes
    for (let i = 0; i < vertices; i++) {
        let x, y, attempts = 0;
        do {
            x = margin + Math.random() * (width - 2 * margin);
            y = margin + Math.random() * (height - 2 * margin);
            attempts++;
            if (attempts > 500) break;
        } while (!isFarEnough(x, y));

        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        nodes.push(newNode);
    }

    // 🔹 Edge intersection test
    function edgesIntersect(a, b, c, d) {
        function ccw(p, q, r) {
            return (r.y - p.y) * (q.x - p.x) > (q.y - p.y) * (r.x - p.x);
        }
        return (
            ccw(a, c, d) !== ccw(b, c, d) &&
            ccw(a, b, c) !== ccw(a, b, d)
        );
    }

    // 🔹 Check if edge passes too close to another node
    function edgeHitsOtherNode(a, b) {
        for (const node of nodes) {
            if (node === a || node === b) continue;

            const dist = pointToSegmentDistance(
                node.x, node.y,
                a.x, a.y,
                b.x, b.y
            );

            if (dist < nodeRadius * 1.2) {
                return true; // overlaps a node
            }
        }
        return false;
    }

    // 🔹 Add edges with geometric constraints
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() >= p) continue;

            const fromNode = nodes[i];
            const toNode = nodes[j];

            let wouldCross = false;

            for (const e of edges) {
                if (edgesIntersect(fromNode, toNode, e.from, e.to)) {
                    wouldCross = true;
                    break;
                }
            }

            if (wouldCross) continue;
            if (edgeHitsOtherNode(fromNode, toNode)) continue;

            edges.push({
                from: fromNode,
                to: toNode,
                round: false,
                dash: false
            });
        }
    }
}








function cycleGraph(all_nodes, spacing) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / vertices;

    // Create the nodes
    const cycleNodes = [];
    for (let i = 0; i < vertices; i++) {
        const x = 350 + spacing * Math.cos(angle * i);
        const y = 250 + spacing * Math.sin(angle * i);
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

function starGraph(all_nodes, spacing) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / (vertices - 1);

    // Create the central node
    const centralNode = create_node(350, 250);
    all_nodes.push(centralNode);

    // Create the surrounding nodes and connect them to the central node
    for (let i = 0; i < vertices - 1; i++) {
        const x = 350 + spacing * Math.cos(angle * i);
        const y = 250 + spacing * Math.sin(angle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        edges.push({ from: centralNode, to: newNode, round: false, dash: false });
    }
}

function wheelGraph(all_nodes, spacing) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / (vertices - 1);

    // Create the central node
    const centralNode = create_node(350, 250);
    all_nodes.push(centralNode);

    // Create the surrounding nodes and connect them to the central node and their neighbors
    const surroundingNodes = [];
    for (let i = 0; i < vertices - 1; i++) {
        const x = 350 + spacing * Math.cos(angle * i);
        const y = 250 + spacing * Math.sin(angle * i);
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

function completeGraph(all_nodes, spacing) {
    const vertices = parseInt(document.getElementById("vertices").value);
    const angle = 2 * Math.PI / vertices;

    for (let i = 0; i < vertices; i++) {
        const x = 350 + spacing * Math.cos(angle * i);
        const y = 250 + spacing * Math.sin(angle * i);
        all_nodes.push(create_node(x, y));
    }

    // Connect each node to every other node
    for (let i = 0; i < vertices; i++) {
        for (let j = i + 1; j < vertices; j++) {
            edges.push({ from: all_nodes[i], to: all_nodes[j], round: false, dash: false });
        }
    }
}

function petersonGraph(all_nodes, spacing) {
    const outerAngle = 2 * Math.PI / 5;
    const innerAngle = 2 * Math.PI / 5;

    // Create the outer nodes (pentagon)
    const outerNodes = [];
    for (let i = 0; i < 5; i++) {
        const x = 350 + spacing * Math.cos(outerAngle * i);
        const y = 250 + spacing * Math.sin(outerAngle * i);
        const newNode = create_node(x, y);
        all_nodes.push(newNode);
        outerNodes.push(newNode);
    }

    // Create the inner nodes (star)
    const innerNodes = [];
    for (let i = 0; i < 5; i++) {
        const x = 350 + (spacing/2) * Math.cos(innerAngle * i + innerAngle / 2);
        const y = 250 + (spacing/2) * Math.sin(innerAngle * i + innerAngle / 2);
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

function circulantGraph(all_nodes, spacing) {
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
        const x = 350 + spacing * Math.cos(angle * i);
        const y = 250 + spacing * Math.sin(angle * i);
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


function cubeGraph(all_nodes, edgeLength) {

    const d = parseInt(document.getElementById("dim_input").value);
    if (isNaN(d) || d < 1 || d > 5) return;

    nodes.length = 0;
    edges.length = 0;

    const canvas = context.canvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const layout = generateHypercubeLayers(d, edgeLength, edgeLength);
    const vertexCount = layout.length;
    const vertexNodes = [];

    for (const [x, y] of layout) {
        const node = create_node(cx + x, cy + y);
        nodes.push(node);
        vertexNodes.push(node);
    }

    for (let i = 0; i < vertexCount; i++) {
        for (let j = i + 1; j < vertexCount; j++) {

            const diff = i ^ j;

            if ((diff & (diff - 1)) === 0) {
                edges.push({
                    from: vertexNodes[i],
                    to: vertexNodes[j],
                    round: false,
                    dash: false
                });
            }
        }
    }

    draw();
}





function foldedCubeGraph(all_nodes, edgeLength) {

    const d = parseInt(document.getElementById("dim_input").value);
    if (isNaN(d) || d < 1 || d > 5) return;

    nodes.length = 0;
    edges.length = 0;

    const canvas = context.canvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const layout = generateHypercubeLayers(d, edgeLength, edgeLength);
    const vertexCount = 1 << d;
    const vertexNodes = [];

    // --- create vertices ---
    for (const [x, y] of layout) {

        const node = create_node(cx + x, cy + y);
        nodes.push(node);
        vertexNodes.push(node);

    }

    // --- standard hypercube edges ---
    for (let i = 0; i < vertexCount; i++) {

        for (let j = i + 1; j < vertexCount; j++) {

            const diff = i ^ j;

            if ((diff & (diff - 1)) === 0) {

                edges.push({
                    from: vertexNodes[i],
                    to: vertexNodes[j],
                    round: false,
                    dash: false
                });

            }
        }
    }

    if (d === 1) {
        draw();
    } else {
        // --- folded edges (connect complements) ---
        const mask = (1 << d) - 1;

        for (let i = 0; i < vertexCount; i++) {

            const j = i ^ mask;

            if (i < j) {
                edges.push({
                    from: vertexNodes[i],
                    to: vertexNodes[j],
                    round: false,
                    dash: true   // dashed to distinguish fold edges
                });
            }
        }

        draw();
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

function crownGraph(all_nodes) {
    const set1Size = parseInt(document.getElementById("set1").value);
    const set2Size = parseInt(document.getElementById("set1").value);

    const yPos1 = 150;
    const yPos2 = 350;
    const set1Spacing = canvas.width / (set1Size + 1);
    const set2Spacing = canvas.width / (set2Size + 1);

    const set1Nodes = [];
    const set2Nodes = [];

    // --- Create nodes ---
    for (let i = 0; i < set1Size; i++) {
        set1Nodes.push(create_node((i + 1) * set1Spacing, yPos1));
    }

    for (let i = 0; i < set2Size; i++) {
        set2Nodes.push(create_node((i + 1) * set2Spacing, yPos2));
    }

    // --- Create crown edges ---
    const matchingSize = Math.min(set1Size, set2Size);

    for (let i = 0; i < set1Size; i++) {
        for (let j = 0; j < set2Size; j++) {

            // Remove the perfect matching
            if (i < matchingSize && i === j) continue;

            edges.push({
                from: set1Nodes[i],
                to: set2Nodes[j],
                round: false,
                dash: null
            });
        }
    }
}


function diagonalGraph(all_nodes, num_rows, num_cols, edgeLength) {
    const spacing = edgeLength;

    const gridWidth = (num_cols - 1) * spacing;
    const gridHeight = (num_rows - 1) * spacing;

    const offsetX = canvas.width / 2 - gridWidth / 2;
    const offsetY = canvas.height / 2 - gridHeight / 2;

    // Create nodes (centered)
    for (let y = 0; y < num_rows; y++) {
        var nodeRow = [];
        for (let x = 0; x < num_cols; x++) {
            nodeRow.push(
                create_node(
                    offsetX + x * spacing,
                    offsetY + y * spacing
                )
            );
        }
        all_nodes.push(nodeRow);
    }

    // diagonal edges (↘)
    for (let i = 0; i <= num_rows - 2; i++) {
        for (let k = 0; k < num_cols - 1; k++) {
            edges.push({
                from: all_nodes[i][k],
                to: all_nodes[i + 1][k + 1],
                round: false,
                dash: false
            });
        }
    }

    // diagonal edges (↗)
    for (let i = 0; i < num_rows - 1; i++) {
        for (let k = 0; k <= num_cols - 2; k++) {
            edges.push({
                from: all_nodes[i + 1][k],
                to: all_nodes[i][k + 1],
                round: false,
                dash: false
            });
        }
    }

    if (document.getElementById("sides").checked) {
        // connecting sides
        for (let i = 0; i < num_rows - 1; i++) {
            edges.push({
                from: all_nodes[i][0],
                to: all_nodes[i + 1][num_cols - 1],
                round: false,
                dash: false
            });
            edges.push({
                from: all_nodes[i][num_cols - 1],
                to: all_nodes[i + 1][0],
                round: false,
                dash: false
            });
        }
    }

    if (document.getElementById("top_bottom").checked) {
        // connecting top and bottom edges
        for (let i = 0; i < num_cols - 1; i++) {
            edges.push({
                from: all_nodes[0][i],
                to: all_nodes[num_rows - 1][i + 1],
                round: false,
                dash: false
            });
            edges.push({
                from: all_nodes[num_rows - 1][i],
                to: all_nodes[0][i + 1],
                round: false,
                dash: false
            });
        }
    }

    if (document.getElementById("top_bottom").checked &&
        document.getElementById("sides").checked) {

        edges.push({
            from: all_nodes[0][0],
            to: all_nodes[num_rows - 1][num_cols - 1],
            round: true,
            dash: true
        });
        edges.push({
            from: all_nodes[num_rows - 1][0],
            to: all_nodes[0][num_cols - 1],
            round: true,
            dash: true
        });
    }

    draw();
}


