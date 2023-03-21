const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

var nodes = [];
var edges = [];
var clicks = 1;

let groupType = "cyclic";
let groupOrder = 2;
let groupMultiplier = 1;

const colors = ['#FFFFFF', "#ffc800", '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0',
  '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#ffe119', '#9a6324', '#fffac8',
  '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];
const colors_dict = {
  '#FFFFFF': 'white', "#ffc800": 'dark yellow', '#e6194b': 'dark pink', '#3cb44b': 'green',
  '#4363d8': 'blue', '#f58231': 'orange', '#911eb4': 'purple', '#46f0f0': 'light blue',
  '#f032e6': 'pink', '#bcf60c': 'light green', '#fabebe': 'light pink', '#008080': 'cyan',
  '#e6beff': 'light purple', '#ffe119': 'yellow', '#9a6324': 'brown', '#fffac8': 'lemon',
  '#800000': 'red', '#aaffc3': 'mint', '#808000': 'olive', '#ffd8b1': 'light brown', '#000075': 'dark blue',
  '#808080': 'grey'
}

const EDGE = '#009999';
const SELECTED = '#88aaaa';
const btn_mode = document.getElementById('play_button');
const btn_clear = document.getElementById('clear');

var text = document.createTextNode('');
var child = document.getElementById('play_button');
child.parentNode.insertBefore(text, child);

const modeLabel = document.getElementById("mode_label");
const modeSlider = document.getElementById("mode_slider");

//selects "instruction" button and adds an event listener that displays an alert when clicked
document.getElementById("instructions_button").addEventListener("click", function () {
  alert("Instructions for using the canvas go here.");
});

// Code for the Editing/Playing mode button
btn_mode.addEventListener('click', function handleClick() {
  // Get the selected group type from the dropdown menu
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupType = groupTypeSelect.value;

  const variation = document.getElementById("choose_variation").value;
  const rowLabel = document.getElementById("row_label");
  const colLabel = document.getElementById("col_label");
  const rowInput = document.getElementById("row_input");
  const colInput = document.getElementById("col_input");
  const verticesDiv = document.getElementById("verticesDiv");



  if (btn_mode.textContent === 'Editing') {
    for (const vertex of nodes) {
      switch (groupType) {
        case "cyclic":
          vertex.node = new CyclicNode(groupOrder);
          break;
        case "dihedral":
          vertex.node = new DihedralNode(groupOrder);
          break;
        default:
          alert("Something went wrong setting the group modes.");
          break;
      }
    }
    btn_mode.textContent = 'Playing';
    btn_clear.textContent = 'Reset Puzzle';
    draw(); // Displays default values of nodes when editing mode is clicked.
    addLegend();
  }
  else {
    btn_mode.textContent = 'Editing';
    btn_clear.textContent = 'Clear Puzzle';
    for (i = 0; i < nodes.length; i++)
      nodes[i].node.value = 0;
    draw();
    addLegend();

    // Update visibility of rows, columns, and vertices elements based on the current graph
    if (variation === "complete" || variation === "wheel" || variation === "star" || variation === "cycle") {
      verticesDiv.style.display = "block";
      rowLabel.style.display = "none";
      colLabel.style.display = "none";
      rowInput.style.display = "none";
      colInput.style.display = "none";
    } else if (variation === "peterson") {
      verticesDiv.style.display = "none";
      rowLabel.style.display = "none";
      colLabel.style.display = "none";
      rowInput.style.display = "none";
      colInput.style.display = "none";
    } else {
      verticesDiv.style.display = "none";
      rowLabel.style.display = "block";
      colLabel.style.display = "block";
      rowInput.style.display = "block";
      colInput.style.display = "block";
    }
  }



  // Call the toggleEditingPlayingMode function
  toggleEditingPlayingMode();

});


var set_num_clicks = function (c) {
  clicks = c;
};

function addLegend() {
  if (document.getElementById("legend") != null)
    document.getElementById("legend").remove();
  var newDiv = document.createElement("div");
  newDiv.setAttribute("id", "legend");
  var title = document.createTextNode("Legend: ");
  newDiv.style.fontSize = "15px";
  newDiv.appendChild(title);
  var num_colors = parseInt(document.getElementById('groupOrder').value);
  for (var c = 1; c < num_colors; c++) {
    var content = document.createElement("span");
    const inner_str = "<button value =" + c + " style='color:" + colors[c] + "; font-weight:bold; font-size:15px' onclick = set_num_clicks(" + c + ")>" + c.toString() + "</button>";
    content.innerHTML = inner_str;
    newDiv.appendChild(content);
  }
  const currentDiv = document.getElementById("d1");
}

function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}

var selection = undefined;

var node_dragged = undefined;

function within(x, y) {
  return nodes.find(n => {
    return (x - n.x) ** 2 + (y - n.y) ** 2 <= n.radius ** 2;
  });
}

window.onmousemove = move;
window.onmousedown = down;
window.onmouseup = up;
window.onkeyup = key_up;

function create_node(x, y) {
  let node;
  node = new GraphicalNode(x, y, 12);
  nodes.push(node);
  draw();
  return node;
}


function create_edge(fromNode, toNode, round, dash) {
  if (dash)
    context.setLineDash([5, 3]);
  else
    context.setLineDash([]);
  if (round) {
    context.beginPath();
    var a = fromNode.x;
    var b = fromNode.y;
    var c = toNode.x;
    var d = toNode.y;
    var dist = Math.sqrt((d - b) ** 2 + (a - c) ** 2);
    context.moveTo(a, b);
    context.quadraticCurveTo((a + c) / 2 + 40 * (d - b) / dist, (b + d) / 2 + 40 * (a - c) / dist, c, d);
    context.stroke();
  }
  else {
    context.beginPath();

    context.moveTo(fromNode.x, fromNode.y);
    context.lineTo(toNode.x, toNode.y);
    context.stroke();
  }
}

function draw() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < edges.length; i++)
    create_edge(edges[i].from, edges[i].to, edges[i].round, edges[i].dash);
  if (btn_mode.textContent == 'Editing') {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      context.setLineDash([]);
      context.beginPath();
      if (node.selected) {
        context.fillStyle = SELECTED;
      } else {
        context.fillStyle = colors[node.node ? node.node.value : 0];
      }
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
      context.fill();
      context.stroke();
    }
  }
  else {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      context.setLineDash([]);
      context.beginPath();
      context.fillStyle = colors[node.node ? node.node.value : 0];
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
      context.fill();
      context.stroke();
      context.font = "12px Verdana";
      context.beginPath();
      context.fillStyle = "#000000";
      let string = node.node.toString();
      if (string.length > 1) {
        context.fillText(string, node.x - 8, node.y + 4);
      }
      else
        context.fillText(string, node.x - 3, node.y + 4);
      context.fill();
    }
  }
}

function move(e) {
  if (node_dragged && e.buttons) {
    var pos = getMousePos(e);
    if (pos.x > 0 && pos.x <= canvas.width && pos.y > 0 && pos.y <= canvas.height) {
      node_dragged.x = e.offsetX;
      node_dragged.y = e.offsetY;
      node_dragged.moving = true;
      draw();
    }
  }
}

function find_edge(fromNode, toNode) {
  return edges.find(e => {
    return (e.from == fromNode && e.to == toNode) || (e.from == toNode && e.to == fromNode);
  });
}

function down(e) {
  let target = within(e.offsetX, e.offsetY);
  if (target) {
    node_dragged = target;
    node_dragged.moving = false;
  }
}

function up(e) {
  var num_colors = parseInt(document.getElementById('groupOrder').value);
  var pos = getMousePos(e);
  if (btn_mode.textContent == 'Editing') {
    let target = within(e.offsetX, e.offsetY);
    // deselect selected node
    if (target && selection == target && !node_dragged.moving)
      selection = undefined;

    // if there is nothing selected, then select the node
    else if (target && !selection && !node_dragged.moving)
      selection = target;

    // create node where you clicked and select it (if clicked away from existing nodes, i.e. no target)
    if (!target) {
      if (pos.x > 0 && pos.x <= canvas.width && pos.y > 0 && pos.y <= canvas.height) {
        create_node(e.offsetX, e.offsetY);
        selection = within(e.offsetX, e.offsetY);
        // Add the following condition to connect the new node to all existing nodes
        if (document.getElementById("choose_variation").value == "complete") {
          connect_to_all();
        }
      }
    }

    // create or remove an edge 
    if (target && selection && selection !== target && !node_dragged.moving) {
      var edge = find_edge(target, selection);
      if (!edge) { // make the edge
        edges.push({ from: selection, to: target, round: false, dash: false });
      }
      else { // remove the edge
        for (let j = 0; j < edges.length; j++) {
          if (edges[j] == edge) {
            edges.splice(j, 1);
            j = j - 1;
          }
        }
      }
      selection = undefined;
    }
    draw();
    //added this code to fix the fillstyle of 'selected' nodes when in editing mode.
    //previously encountered a bug when merging Alejandro's code where the nodes in editing mode were selected, but not filled with a color.
    if (btn_mode.textContent == 'Editing') {
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.selected) {
          node.selected = false;
          if (within(node.x, node.y) !== selection) {
            context.beginPath();
            context.fillStyle = colors[node.node ? node.node.value : 0];
            context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
            context.fill();
            context.stroke();
          }
        }
      }
      if (selection) {
        selection.selected = true;
        context.beginPath();
        context.fillStyle = SELECTED;
        context.arc(selection.x, selection.y, selection.radius, 0, Math.PI * 2, true);
        context.fill();
        context.stroke();
      }
    }
  }
  else { // if Playing mode selected
    let target = within(e.offsetX, e.offsetY);
    if (target) {
      //alert(target.node);
      target.node.multiply(groupMultiplier, true);
      if (groupType === "dihedral") {
        let index;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === target) {
            index = i;
            break;
          }
        }
        //console.log("Node: " + index + " clicked with " + groupMultiplier + ", new value: " + target.value);
      }
      for (let i = 0; i < edges.length; i++) {
        var other = undefined;
        if (edges[i].from == target)
          other = edges[i].to;
        else if (edges[i].to == target)
          other = edges[i].from;
        if (other) {
          other.node.multiply(groupMultiplier, false);
        }
      }
      draw();
      //The current implementation of the congratulate function displays a message each time a node is clicked, which is not desirable.
      //congratulate();

    }

  }
  node_dragged = undefined;
}

function key_up(e) {
  if (btn_mode.textContent == 'Editing') {
    if (e.code == 'Backspace' || e.code == 'Delete') {
      if (selection) {
        for (let j = 0; j < edges.length; j++) {
          if (edges[j].from == selection || edges[j].to == selection) {
            edges.splice(j, 1);
            j = j - 1;
          }
        }
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] == selection) {

            nodes.splice(i, 1);
            break;
          }
        }
        selection = undefined;
        draw();
      }
    }
  }
}

function clear_puzzle() {
  if (btn_mode.textContent == 'Editing') {
    nodes = [];
    edges = [];
    selection = undefined; // Unselect the selected node
  } else {
    for (i = 0; i < nodes.length; i++) {
      nodes[i].node.value = 0;
      nodes[i].node.clicks = 0;
    }
  }
  draw();
}


function congratulate() {
  if (document.getElementById("congratulate").checked) {
    var val = nodes[0].value;
    var solved = true;
    var nontrivial = false;
    var message = ""

    for (i = 1; i < nodes.length; i++) {
      if (nodes[i].value != val)
        solved = false;
      if (nodes[i].clicks != 0)
        nontrivial = true;
    }

    if (solved) {
      if (val == 0 && nontrivial) {
        message = "Congratulations, you've found a nontrivial quiet pattern!";
      }
      else
        message = "Congratulations, you've found a solution for " + colors_dict[colors[val]] + "!";
      alert(message);

    }
  }
}

function generate_puzzle() {
  if (document.getElementById("legend") != null)
    document.getElementById("legend").remove();
  addLegend();
  nodes = [];
  edges = [];
  var all_nodes = [];
  var variation = document.getElementById("choose_variation").value;
  var num_rows = parseInt(document.getElementById("row_input").value);
  var num_cols = parseInt(document.getElementById("col_input").value);
  if (variation == "standard") {
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

  // Conditional statement for cycle graphs
  else if (variation == "cycle") {
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
      edges.push({ from: fromNode, to: toNode, round: false, dash: false });
    }
  }

  // Conditional statement for the star graph
  else if (variation == "star") {
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

  // Conditional statement for wheel graph
  else if (variation == "wheel") {
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
  // Conditional statement for the complete graph.
  else if (variation == "complete") {
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
  // Conditional statement for peterson graph
  else if (variation == "peterson") {
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
  else if (variation == "diagonal") {
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
  }
  draw();
}

function save_puzzle() {
  // When a puzzle is being saved, user will be prompted to enter a name.
  let graphName = prompt("Enter a name for the puzzle:");
  if (graphName) {
    save(graphName, groupType);
    updateSavedPuzzles();
    alert("Successfully saved puzzle!");
  } else {
    // if user cancels the naming prompt, puzzle will not be saved.
    alert("Saving cancelled.");
  }
}


function updateSavedPuzzles() {
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  let selector = document.getElementById("loadSelector");
  selector.innerHTML = "";
  for (let i = 0; graphStorage && i < graphStorage.length; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = graphStorage[i].name + " (" + graphStorage[i].groupType + ")";
    selector.appendChild(option);
  }
}

function load_puzzle() {
  let selector = document.getElementById("loadSelector");
  let graph = load(selector.value);
  if (graph) {
    nodes = graph.nodes;
    edges = graph.edges;

    //Re-establish edge connections (bug fix)
    edges.forEach(edge => {
      edge.from = nodes.find(node => node.x === edge.from.x && node.y === edge.from.y);
      edge.to = nodes.find(node => node.x === edge.to.x && node.y === edge.to.y);
    });

    draw();
    // Update the groupType variable and dropdown menu (bug fix)
    if (graph.groupType) {
      groupType = graph.groupType;
      let groupTypeDropdown = document.getElementById("groupTypeSelect");
      groupTypeDropdown.value = groupType;
    }
  }
}


function save(graphName, groupType) {
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  if (!graphStorage) {
    graphStorage = [];
  }
  graphStorage.push({
    name: graphName,
    groupType: groupType,
    nodes: nodes,
    edges: edges
  });
  localStorage.setItem("graphStorage", JSON.stringify(graphStorage));
}

function load(index) {
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  if (graphStorage[index]) {
    return graphStorage[index];
  } else {
    return null;
  }
}

function delete_puzzle() {
  let selector = document.getElementById("loadSelector");
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  if (!graphStorage) {
    return;
  }
  graphStorage.splice(selector.value, 1);
  localStorage.setItem("graphStorage", JSON.stringify(graphStorage));
  updateSavedPuzzles();
}

function set_group_order() {
  // todo: add input validation
  groupOrder = parseInt(document.getElementById("groupOrder").value);
}

function set_group_multiplier() {
  // todo: add input validation
  groupMultiplier = parseInt(document.getElementById("groupMultiplier").value);
}

// Connects all existing vertices to the selected vertex
function connect_to_all() {
  console.log(selection)
  if (btn_mode.textContent == 'Editing' && selection) {
    nodes.forEach(node => {
      if (node !== selection) {
        edges.push({ from: selection, to: node, round: false, dash: false });
      }
    });
    draw();
  }
}

// Disconnects all existing vertices from the selected vertex
function disconnect_from_all() {
  if (btn_mode.textContent == 'Editing' && selection) {
    edges = edges.filter(edge => edge.from !== selection && edge.to !== selection);
    draw();
  }
}

// Updates grouptype when choosing in dropdown menu
function updateGroupType() {
  let groupTypeDropdown = document.getElementById("groupTypeSelect");
  groupType = groupTypeDropdown.value;
}

updateGroupType();

document.getElementById("play_button").addEventListener("click", toggleEditingPlayingMode);
function toggleEditingPlayingMode() {
  const playButton = document.getElementById("play_button");
  const mode = btn_mode.textContent;

  const elementsToHide = [
    "generate",
    "connect_all_btn",
    "disconnect_all_btn",
    "top_bottom",
    "top_bottom_label",
    "sides",
    "sides_label",
    "congratulate",
    "congratulate_label",
    "row_input",
    "row_label",
    "col_input",
    "col_label",
    "choose_variation",
    "choose_variation_label",
    "group_type_label",
    "groupTypeSelect",
    "save",
    "load",
    "load_selector_label",
    "loadSelector",
    "delete",
    "verticesDiv"
  ];

  if (mode === "Editing") {
    playButton.value = "Playing";
    playButton.textContent = "Playing";
    hideShowElements(elementsToHide, "none");
  } else {
    playButton.value = "Editing";
    playButton.textContent = "Editing";
    hideShowElements(elementsToHide, "inline-block");

    const variation = document.getElementById("choose_variation").value;
    const rowLabel = document.getElementById("row_label");
    const colLabel = document.getElementById("col_label");
    const rowInput = document.getElementById("row_input");
    const colInput = document.getElementById("col_input");
    const verticesDiv = document.getElementById("verticesDiv");

    // Update visibility of rows, columns, and vertices elements based on the current graph
    if (variation === "complete" || variation === "wheel" || variation === "star" || variation === "cycle") {
      verticesDiv.style.display = "block";
      rowLabel.style.display = "none";
      colLabel.style.display = "none";
      rowInput.style.display = "none";
      colInput.style.display = "none";
    } else if (variation === "peterson") {
      verticesDiv.style.display = "none";
      rowLabel.style.display = "none";
      colLabel.style.display = "none";
      rowInput.style.display = "none";
      colInput.style.display = "none";
    } else {
      verticesDiv.style.display = "none";
      rowLabel.style.display = "inline-block";
      colLabel.style.display = "inline-block";
      rowInput.style.display = "inline-block";
      colInput.style.display = "inline-block";
    }
  }
}


document.getElementById("play_button").addEventListener("click", function () {
  const multiplierLabel = document.getElementById("groupMultiplier_label");
  const multiplierInput = document.getElementById("groupMultiplier");

  if (this.value === "Playing") {
    multiplierLabel.style.display = "inline-block";
    multiplierInput.style.display = "inline-block";
  } else {
    multiplierLabel.style.display = "none";
    multiplierInput.style.display = "none";
  }
});


function hideShowElements(elementIds, displayStyle) {
  elementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = displayStyle;
    }
  });
}

document.getElementById("choose_variation").addEventListener("change", function () {
  const variation = document.getElementById("choose_variation").value;

  const rowLabel = document.getElementById("row_label");
  const colLabel = document.getElementById("col_label");
  const rowInput = document.getElementById("row_input");
  const colInput = document.getElementById("col_input");

  if (variation === "complete" || variation === "wheel" || variation === "star" || variation === "cycle") {
    document.getElementById("verticesDiv").style.display = "block";
    rowLabel.style.display = "none";
    colLabel.style.display = "none";
    rowInput.style.display = "none";
    colInput.style.display = "none";
  }
  else if (variation === "peterson") {
    document.getElementById("verticesDiv").style.display = "none";
    rowLabel.style.display = "none";
    colLabel.style.display = "none";
    rowInput.style.display = "none";
    colInput.style.display = "none";
  }
  else {
    document.getElementById("verticesDiv").style.display = "none";
    rowLabel.style.display = "block";
    colLabel.style.display = "block";
    rowInput.style.display = "block";
    colInput.style.display = "block";
  }
});











