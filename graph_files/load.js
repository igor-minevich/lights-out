const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');


var nodes = [];
var edges = [];
var clicks = 1;

let groupType = "cyclic";
let groupOrder = 2;
let groupMultiplier = 1;
let historyData = [];
let relations = [];
let selectedRelationIndex = -1;
let selectedNode = null;


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
let nodeCounter = 0;
let uNodeCounter = 0;

//selects "instruction" button and adds an event listener that displays an alert when clicked
document.getElementById("instructions_button").addEventListener("click", function () {
  alert("Instructions for using the canvas go here.");
});


groupTypeSelect.addEventListener('change', function () {
  const groupOrderInput1 = document.getElementById("groupOrder1");
  const groupOrderInput2 = document.getElementById("groupOrder2");
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupType = groupTypeSelect.value;
  updateGroupTypeDisplay();
  if (groupType === "quaternion") {
    groupOrderInput1.value = 8;
    groupOrderInput2.value = 8;
    groupOrderInput1.disabled = true;
    groupOrderInput2.disabled = true;
  } else if (groupType === "freeabgroup" || groupType === "freegroup") {
    groupOrderInput1.disabled = true;
    groupOrderInput2.disabled = true;
  }
  else {
    groupOrderInput1.disabled = false;
    groupOrderInput2.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  updateGroupTypeDisplay();
});



function updateGroupTypeDisplay() {
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupTypeDisplay = document.getElementById('groupTypeDisplay');
  const groupType = groupTypeSelect.value;
  groupTypeDisplay.innerText = 'Group Type: ' + groupType.charAt(0).toUpperCase() + groupType.slice(1);
}


// Code for the Editing/Playing mode button

btn_mode.addEventListener('click', function handleClick() {

  document.getElementById("displayValues").checked = true;
  // Get the selected group type from the dropdown menu
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupType = groupTypeSelect.value;
  set_group_order();

  if (btn_mode.textContent === 'Editing') {
    for (const vertex of nodes) {
      switch (groupType) {
        case "cyclic":
          vertex.node = new CyclicNode(groupOrder);
          break;
        case "dihedral":
          vertex.node = new DihedralNode(groupOrder);
          break;
        case "quaternion":
          vertex.node = new QuaternionNode(groupOrder);
          break;
        case "freeabgroup":
          vertex.node = new FreeAbelianNode();
          break;
        case "freegroup":
          vertex.node = new FreeGroupNode();
          break;
        default:
          alert("Something went wrong setting the group modes.");
          break;
      }
    }
    btn_mode.textContent = 'Playing';
    btn_clear.textContent = 'Reset Puzzle';
    clear_puzzle();
    draw(); // Displays default values of nodes when editing mode is clicked.
    addLegend();
    document.getElementById("right").checked = true;
  }
  else {
    btn_mode.textContent = 'Editing';
    btn_clear.textContent = 'Clear Puzzle';
    for (let i = 0; i < nodes.length; i++)
      nodes[i].node.value = 0;
    draw();
    addLegend();
  }
  // Call the toggleVisuals function to display/hide elements based on "playing" or "editing" mode.
  toggleVisuals();
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
  var num_colors = parseInt(document.getElementById('groupOrder1').value);
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

function create_node(x, y, labelType) {
  let node;
  let label;

  if (labelType === "uNode") {
    label = "u" + uNodeCounter;
    uNodeCounter++;
  }
  else {
    label = "" + nodeCounter;
    nodeCounter++;
  }

  node = new GraphicalNode(x, y, 20, label);
  nodes.push(node);
  draw();
  return node;
}

function create_edge(fromNode, toNode, round, dash) { //check if an edge already exists, if it exist do not create another edge. check fromnode to tonode and vice versa.
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

const displayOptions = document.getElementsByName("displayOption");
for (const option of displayOptions) {
  option.addEventListener("change", draw);
}


function draw() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // Reset the stroke style before drawing the edges
  context.strokeStyle = "black";
  context.lineWidth = 1;
  for (let i = 0; i < edges.length; i++)
    create_edge(edges[i].from, edges[i].to, edges[i].round, edges[i].dash);
  let showOption = "";
  for (const option of displayOptions) {
    if (option.checked) {
      showOption = option.value;
      break;
    }
  }


  if (btn_mode.textContent == 'Editing') {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      context.setLineDash([]);
      context.beginPath();
      if (node.selected) {
        context.fillStyle = SELECTED;
      } else {
        context.fillStyle = colors[0];
      }
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
      context.fill();
      context.stroke();
    }
  }
  else { // playing mode
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      context.setLineDash([]);
      context.beginPath();
      context.fillStyle = node.node ? node.node.color() : colors[0];
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
      context.fill();
      if (node.clicked) {
        context.lineWidth = 5;
        context.strokeStyle = "rgba(0, 255, 0, 0.5)";
      } else {
        context.lineWidth = 1;
        context.strokeStyle = "black";
      }
      context.stroke();

      if (showOption === "clicks" && (groupType === "cyclic" || groupType === "freeabgroup" || groupType === "freegroup")) {

        drawClicks(node, true);
      } else {
        if (showOption === "labels") {
          drawLabel(node, true);
        } else if (showOption === "values") {
          drawLabel(node, false);
        }

      }
    }

  }
}

function move(e) {
  // Get the bounding rectangles of the canvas
  const canvasRect = canvas.getBoundingClientRect();



  if (node_dragged && e.buttons) {
    var pos = getMousePos(e);
    if (pos.x > 0 && pos.x <= canvas.width && pos.y > 0 && pos.y <= canvas.height) {
      node_dragged.x = e.offsetX;
      node_dragged.y = e.offsetY;
      node_dragged.moving = true;
      draw();
    }
  } else {
    const target = within(e.offsetX, e.offsetY);
    draw();
    if (target && btn_mode.textContent === "Playing" && e.clientX >= canvasRect.left && e.clientX <= canvasRect.right
      && e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom) {
      const groupTypeSelect = document.getElementById('groupTypeSelect');
      const groupType = groupTypeSelect.value;
      let showOption = "";
      for (const option of displayOptions) {
        if (option.checked) {
          showOption = option.value;
          break;
        }
      }

      let tooltipText = "";

      if (groupType === "cyclic" || groupType === "freeabgroup") {
        if (showOption === "labels") {
          tooltipText = "Value: " + target.node.toString() + " | Clicks: " + target.node.clicks;
        } else if (showOption === "values") {
          tooltipText = "Label: " + target.label + " | Clicks: " + target.node.clicks;
        } else if (showOption === "clicks") {
          tooltipText = "Label: " + target.label + " | Value: " + target.node.toString();
        }
      } else {
        if (showOption === "labels") {
          tooltipText = "Value: " + target.node.toString();
        } else if (showOption === "values") {
          tooltipText = "Label: " + target.label;
        }
      }

      drawTooltip(target, tooltipText);
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
  if (btn_mode.textContent == 'Editing' && target) {
    node_dragged = target;
    node_dragged.moving = false;
  }
}

function up(e) {
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
        create_node(e.offsetX, e.offsetY, "uNode");
        selection = within(e.offsetX, e.offsetY);
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
            context.fillStyle = node.node ? node.node.color() : colors[0];
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

    // Get the selected radio button value
    const selectedMultiplication = getSelectedMultiplication();
    let leftMultiply = selectedMultiplication === "left";


    if (selectedNode) {
      selectedNode.clicked = false;
    }

    if (target) {
      if (selectedNode !== target) {
        if (selectedNode) {
          selectedNode.clicked = false;
        }
        selectedNode = target;
        selectedNode.clicked = true;
      }
      // Update group multiplier validation when a node is clicked
      const isValidInput = set_group_multiplier(true);

      if (isValidInput) {
        target.node.multiply(groupMultiplier, leftMultiply, true);

        // find other nodes connected to the clicked node and multiply them by the group element.
        for (let i = 0; i < edges.length; i++) {
          var other = undefined;
          if (edges[i].from == target)
            other = edges[i].to;
          else if (edges[i].to == target)
            other = edges[i].from;
          if (other) {
            other.node.multiply(groupMultiplier, leftMultiply, false);
          }
        }
        draw();

        // Add the new event to the history list
        const label = target.label;
        const groupMultiplierUsed = groupMultiplier;
        const leftRightMultiplierUsed = leftMultiply ? "Left" : "Right";
        addToHistory(label, groupMultiplierUsed, leftRightMultiplierUsed);

        //The current implementation of the congratulate function displays a message each time a node is clicked, which is not desirable.
        //congratulate();
      }
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
  nodeCounter = 0;
  uNodeCounter = 0;
  historyData = [];
  updateHistoryList();

  if (btn_mode.textContent == 'Editing') {
    nodes = [];
    edges = [];
    selection = undefined; // Unselect the selected node
  } else {
    // Update group order and set nodes' group type
    const groupTypeSelect = document.getElementById('groupTypeSelect');
    const groupType = groupTypeSelect.value;
    set_group_order();

    for (const vertex of nodes) {
      switch (groupType) {
        case "cyclic":
          vertex.node = new CyclicNode(groupOrder);
          break;
        case "dihedral":
          vertex.node = new DihedralNode(groupOrder);
          break;
        case "quaternion":
          vertex.node = new QuaternionNode(groupOrder);
          break;
        case "freeabgroup":
          vertex.node = new FreeAbelianNode();
          break;
        case "freegroup":
          vertex.node = new FreeGroupNode();
          break;

        default:
          alert("Something went wrong setting the group modes.");
          break;
      }
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
  nodeCounter = 0;
  uNodeCounter = 0;
  if (document.getElementById("legend") != null) {
    document.getElementById("legend").remove();
  }
  addLegend();
  nodes = [];
  edges = [];
  var all_nodes = [];
  var variation = document.getElementById("choose_variation").value;
  var num_rows = parseInt(document.getElementById("row_input").value);
  var num_cols = parseInt(document.getElementById("col_input").value);

  switch (variation) {
    case "standard":
      standardGraph(all_nodes, num_rows, num_cols);
      break;
    case "cycle":
      cycleGraph(all_nodes);
      break;
    case "star":
      starGraph(all_nodes);
      break;
    case "wheel":
      wheelGraph(all_nodes);
      break;
    case "complete":
      completeGraph(all_nodes);
      break;
    case "peterson":
      petersonGraph(all_nodes);
      break;
    case "circulant":
      circulantGraph(all_nodes);
      break;
    case "bipartite":
      bipartiteGraph(all_nodes);
      break;
    case "diagonal":
      diagonalGraph(all_nodes, num_rows, num_cols);
      break;
    default:
      alert("Invalid graph variation.");
      break;
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
  if (btn_mode.textContent === 'Editing') {
    groupOrder = parseInt(document.getElementById("groupOrder1").value);
    document.getElementById("groupOrder2").value = groupOrder;
  }
  else {
    groupOrder = parseInt(document.getElementById("groupOrder2").value);
  }
}


function set_group_multiplier(validateInput = true) {
  const groupMultiplierInput = document.getElementById("groupMultiplier").value;

  if (groupType === "freeabgroup" || groupType === "freegroup") {
    const regex = /^([a-zA-Z]\d*|1)*$/;
    if (validateInput && !regex.test(groupMultiplierInput)) {
      alert("Invalid input. Please enter a combination of letters and numbers or the identity element '1'.");
      return false;
    }
    groupMultiplier = groupMultiplierInput;
  } else {
    if (validateInput && isNaN(parseInt(groupMultiplierInput))) {
      alert("Invalid input. Please enter a numeric value.");
      return false;
    }
    groupMultiplier = parseInt(groupMultiplierInput);
  }
  return true;
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

// BELOW ARE THE FUNCTIONS THAT DEAL WITH ELEMENTS BECOMING VISIBLE/INVISIBLE DEPENDING ON MODE.

// Updates grouptype when choosing in dropdown menu
function updateGroupType() {
  let groupTypeDropdown = document.getElementById("groupTypeSelect");
  groupType = groupTypeDropdown.value;

  const groupMultiplierInput = document.getElementById("groupMultiplier");
  if (groupType === "freeabgroup" || groupType === "freegroup") {
    groupMultiplierInput.placeholder = "Enter a combination of letters (e.g. aB3bC4)";
  } else {
    groupMultiplierInput.placeholder = "Enter a number";
  }
}


updateGroupType();

document.getElementById("play_button").addEventListener("click", toggleVisuals);

function toggleVisuals() {
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
    "row_input",
    "row_label",
    "col_input",
    "col_label",
    "choose_variation",
    "choose_variation_label",
    "save",
    "load",
    "load_selector_label",
    "loadSelector",
    "delete",
    "verticesDiv",
    "set1div",
    "set2div",
    "connectionsDiv",
    "graphcontrols",
    "groupcontrols"
  ];


  if (mode === "Editing") {
    playButton.value = "Playing";
    playButton.textContent = "Playing";
    hideShowElements(elementsToHide, "none");
    // Move the graph controls inside group controls
    // groupControls.prepend(graphControls);

  } else {
    playButton.value = "Editing";
    playButton.textContent = "Editing";
    hideShowElements(elementsToHide, "inline-block");
    updateLayout();
    // Move the graph controls back to its original position
    // const controlsWrapper = document.querySelector(".controls-wrapper");
    // controlsWrapper.insertBefore(graphControls, controlsWrapper.firstChild);

  }
}

function hideShowElements(ids, displayStyle) {
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = displayStyle;
    }
  });
}




document.getElementById("choose_variation").addEventListener("change", updateLayout);
function updateLayout() {
  const variation = document.getElementById("choose_variation").value;
  const elementsToHide = [
    "verticesDiv",
    "connectionsDiv",
    "set1div",
    "set2div",
    "row_label",
    "col_label",
    "row_input",
    "col_input",
    "top_bottom",
    "top_bottom_label",
    "sides",
    "sides_label"
  ];

  hideShowElements(elementsToHide, "none");

  if (variation === "complete" || variation === "wheel" || variation === "star" || variation === "cycle") {
    showElements(["verticesDiv"]);
  } else if (variation === "peterson") {
    // Nothing to show
  } else if (variation === "bipartite") {
    showElements(["set1div", "set2div"]);
  } else if (variation === "circulant") {
    showElements(["verticesDiv", "connectionsDiv"]);
  } else if (variation === "standard" || variation === "diagonal") {
    showElements([
      "row_label",
      "col_label",
      "row_input",
      "col_input",
      "top_bottom",
      "top_bottom_label",
      "sides",
      "sides_label"
    ]);
  }
}

function showElements(ids) {
  hideShowElements(ids, "inline-block");
}

function getSelectedMultiplication() {
  const radioButtons = document.getElementsByName("multiplication");
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      return radioButton.value;
    }
  }
}

function drawLabel(node, showLabels) {
  context.font = "12px Verdana";
  context.beginPath();
  context.fillStyle = "#000000";
  let string = showLabels ? node.label.toString() : node.node.toString();

  // Center the text
  const textMetrics = context.measureText(string);
  const textWidth = textMetrics.width;
  const xPos = node.x - textWidth / 2;
  const yPos = node.y + 4;

  context.fillText(string, xPos, yPos);
  context.fill();
}

function drawClicks(node, showClicks) {
  context.font = "12px Verdana";
  context.beginPath();
  context.fillStyle = "#000000";
  let string = showClicks ? node.node.clicks.toString() : node.node.toString();

  // Center the text
  const textMetrics = context.measureText(string);
  const textWidth = textMetrics.width;
  const xPos = node.x - textWidth / 2;
  const yPos = node.y + 4;

  context.fillText(string, xPos, yPos);
  context.fill();
}

// Function to show elements when playing
document.getElementById("play_button").addEventListener("click", function () {
  const multiplierLabel = document.getElementById("groupMultiplier_label");
  const multiplierInput = document.getElementById("groupMultiplier");
  const sideMultiplier = document.getElementById("multiplicationOptions");
  const congratulate = document.getElementById("congratdiv");
  const historyList = document.getElementById("history");
  const mergedContent = document.getElementById("mergedcontrols");
  const groupTypeDisplay = document.getElementById("groupTypeDisplay");
  const nodeClick = document.getElementById("displayClicks");
  const nodeLabel = document.getElementById("displayLabels");
  const nodeClickInput = document.getElementById("displayClicksInput");
  const nodeLabelInput = document.getElementById("displayLabelsInput");
  const nodeDisplay = document.getElementById("nodeDisplayOptions");
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const historySide = document.getElementById("historySide");
  const relationsContainer = document.getElementById("relationsContainer");
  const groupType = groupTypeSelect.value;

  if (this.value === "Playing") {
    multiplierLabel.style.display = "inline-block";
    multiplierInput.style.display = "inline-block";
    sideMultiplier.style.display = "inline-block";
    congratulate.style.display = "inline-block";
    nodeDisplay.style.display = "block";
    historyList.style.display = "block";
    mergedContent.style.display = "inline-block";
    groupTypeDisplay.style.display = "inline-block";
    if (groupType === "cyclic") {
      sideMultiplier.style.display = "none";
      nodeLabel.style.display = "inline-block";
      nodeClick.style.display = "inline-block";
      nodeClickInput.style.display = "inline-block";
      historySide.style.display = "none"
    }

    if (groupType === "freeabgroup") {
      sideMultiplier.style.display = "none";
      nodeLabel.style.display = "inline-block";
      nodeClick.style.display = "inline-block";
      nodeClickInput.style.display = "inline-block";
      historySide.style.display = "none"
      relationsContainer.style.display = "inline-block"
    }

    if (groupType === "freegroup") {
      nodeLabel.style.display = "inline-block";
      nodeLabelInput.style.display = "inline-block";
      nodeClick.style.display = "none";
      nodeClickInput.style.display = "none";
      historySide.style.display = "inline-block"
      relationsContainer.style.display = "inline-block"
    }
    if (groupType === "dihedral") {
      nodeLabel.style.display = "inline-block";
      nodeLabelInput.style.display = "inline-block";
      nodeClick.style.display = "none";
      nodeClickInput.style.display = "none";
    }
    if (groupType === "quaternion") {
      nodeLabel.style.display = "inline-block";
      nodeLabelInput.style.display = "inline-block";
      nodeClick.style.display = "none";
      nodeClickInput.style.display = "none";
      historySide.style.display = "inline-block"
    }
  }
  else {
    multiplierLabel.style.display = "none";
    multiplierInput.style.display = "none";
    sideMultiplier.style.display = "none";
    congratulate.style.display = "none";
    nodeLabel.style.display = "none";
    historyList.style.display = "none";
    mergedContent.style.display = "none";
    groupTypeDisplay.style.display = "none";
    nodeDisplay.style.display = "none";
    relationsContainer.style.display = "none"
  }
});


// Helper function to check if the edge already exists in the edges array
function edgeExists(fromNode, toNode) {
  return edges.some(edge => (edge.from === fromNode && edge.to === toNode) || (edge.from === toNode && edge.to === fromNode));
}

// function to draw tooltips
function drawTooltip(node, text) {
  context.save();
  const offsetX = 10;
  const offsetY = 10;
  const padding = 5;
  const tooltipWidth = context.measureText(text).width + 2 * padding;
  const tooltipHeight = 20;

  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fillRect(node.x + offsetX, node.y - offsetY - tooltipHeight, tooltipWidth, tooltipHeight);
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";
  context.fillText(text, node.x + offsetX + padding, node.y - offsetY - tooltipHeight / 2);
  context.restore();
}

// functions for relations
function storeRelation() {
  const relationInput = document.getElementById('relationInput');
  const relation = relationInput.value.trim();

  if (relation) {
    relations.push(relation);
    relationInput.value = '';
    updateRelationsList();
  }
}

function toggleEditMode() {
  const editButton = document.getElementById('editRelation');
  const backButton = document.getElementById('backButton');
  const deleteButton = document.getElementById('deleteRelation');
  const isEditMode = editButton.textContent === 'Update';

  if (isEditMode) {
    editRelation();
  }

  editButton.textContent = isEditMode ? 'Edit' : 'Update';
  backButton.style.display = isEditMode ? 'none' : 'inline';
  deleteButton.style.display = isEditMode ? 'none' : 'inline';
  updateRelationsList();
}

function editRelation() {
  const relationInput = document.getElementById('relationInput');
  const relation = relationInput.value.trim();

  if (relation && selectedRelationIndex > -1) {
    relations[selectedRelationIndex] = relation;
    relationInput.value = '';
    selectedRelationIndex = -1;
  }
}

function deleteRelation() {
  const relationInput = document.getElementById('relationInput');
  const relation = relationInput.value.trim();

  if (relation) {
    const index = relations.indexOf(relation);
    if (index > -1) {
      relations.splice(index, 1);
      relationInput.value = '';
      updateRelationsList();
    }
  }
}

function updateRelationsList() {
  const relationsList = document.getElementById('relationsList');
  relationsList.innerHTML = '';

  const editButton = document.getElementById('editRelation');
  const isEditMode = editButton.textContent === 'Update';

  relations.forEach((relation, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = relation;

    if (isEditMode) {
      listItem.style.cursor = 'pointer';
      listItem.onclick = function () {
        document.getElementById('relationInput').value = relation;
        if (selectedRelationIndex > -1) {
          relationsList.children[selectedRelationIndex].classList.remove('selected');
        }
        selectedRelationIndex = index;
        listItem.classList.add('selected');
      };
    } else {
      listItem.style.cursor = 'default';
      listItem.onclick = null;
    }

    relationsList.appendChild(listItem);
  });
}

