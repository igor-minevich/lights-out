const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

let ADJ_MATRIX = [];
let NODE_LABELS = [];
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
let isOpen = false;


const colors = [
  '#FFFFFF',  // white
  '#ffe066',  // dark yellow → light yellow
  '#ffb3c1',  // dark pink → pastel pink
  '#b7e4c7',  // green → pastel green
  '#c7d2fe',  // blue → pastel blue
  '#ffd6a5',  // orange → light orange
  '#e0bbff',  // purple → light purple
  '#ccf7f7',  // light blue (already OK, slightly softened)
  '#fbc4ff',  // pink → pastel pink
  '#e9fbcf',  // light green (already OK)
  '#fabebe',  // light pink
  '#b2dfdb',  // cyan → pastel cyan
  '#e6beff',  // light purple
  '#fff3b0',  // yellow → softer yellow
  '#d7b899',  // brown → light brown
  '#fffac8',  // lemon
  '#f4c2c2',  // red → pastel red
  '#aaffc3',  // mint
  '#e6e8b4',  // olive → pastel olive
  '#ffd8b1',  // light brown
  '#c7d2fe',  // dark blue → pastel blue
  '#e0e0e0'   // grey → light grey
];

const colors_dict = {
  '#FFFFFF': 'white',
  '#ffe066': 'dark yellow',
  '#ffb3c1': 'dark pink',
  '#b7e4c7': 'green',
  '#c7d2fe': 'blue',
  '#ffd6a5': 'orange',
  '#e0bbff': 'purple',
  '#ccf7f7': 'light blue',
  '#fbc4ff': 'pink',
  '#e9fbcf': 'light green',
  '#fabebe': 'light pink',
  '#b2dfdb': 'cyan',
  '#e6beff': 'light purple',
  '#fff3b0': 'yellow',
  '#d7b899': 'brown',
  '#fffac8': 'lemon',
  '#f4c2c2': 'red',
  '#aaffc3': 'mint',
  '#e6e8b4': 'olive',
  '#ffd8b1': 'light brown',
  '#c7d2fe': 'dark blue',
  '#e0e0e0': 'grey'
};

const left_contents = document.getElementById('left_contents');
const right_contents = document.getElementById('right_contents');
const left_arrow = document.getElementById('left_arrow');
const right_arrow = document.getElementById('right_arrow');
const editCanvas = document.getElementById("myCanvas");
const left_close = document.getElementById('left_close');
const right_close = document.getElementById('right_close');

const EDGE = '#009999';
const SELECTED = '#88aaaa';
const btn_mode = document.getElementById('play_button');
const btn_clear = document.getElementById('clear');
const btn_clear2 = document.getElementById('clear2');
const btn_reset = document.getElementById('reset');
const btn_matrix = document.getElementById('adjacency_matrix');
const dihedralMultDisplay = document.getElementById("dihedralMultDisplay");

var text = document.createTextNode('');
var child = document.getElementById('play_button');
child.parentNode.insertBefore(text, child);
let nodeCounter = 0;
let uNodeCounter = 0;

const groupOrderInput2 = document.getElementById("groupOrder2");
groupOrderInput2.disabled = true;

console.log('test');


left_arrow.addEventListener("click", () => {
  if (btn_mode.textContent === 'Playing') {
    return;
  }
    left_arrow.style.display = 'none';
    left_contents.style.display = 'flex';
    document.getElementById('myCanvas').style.opacity = '0.5'
    isOpen = true;
    left_close.style.display = 'block';
});

left_close.addEventListener("click", () => {
    left_arrow.style.display = 'flex';
    left_contents.style.display = 'none';
    document.getElementById('myCanvas').style.opacity = '1'
    isOpen = false;
    left_close.style.display = 'none';
});


right_arrow.addEventListener("click", () => {
  if (btn_mode.textContent === 'Editing') {
    return;
  }
    right_arrow.style.display = 'none';
    right_contents.style.display = 'flex';
    document.getElementById('myCanvas').style.opacity = '0.5'
    isOpen = true;
    right_close.style.display = 'block';
});

right_close.addEventListener("click", () => {
    right_arrow.style.display = 'flex';
    right_contents.style.display = 'none';
    document.getElementById('myCanvas').style.opacity = '1'
    isOpen = false;
    right_close.style.display = 'none';
});



groupTypeSelect.addEventListener('change', function () {
  const groupOrderInput1 = document.getElementById("groupOrder1");
  const groupOrderInput2 = document.getElementById("groupOrder2");
  groupOrderInput2.disabled = true;
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupType = groupTypeSelect.value;
  const numVert = document.getElementById("editing_dihedral");
  const dihedralMult = document.getElementById("groupMultiplier");
  updateGroupTypeDisplay();

  if (groupType === "quaternion") {
    numVert.textContent = "Group order:"
    groupOrderInput1.value = 8;
    groupOrderInput2.value = 8;
    groupOrderInput1.disabled = true;
    document.getElementById("divMultiply").style.display = 'none';
    document.getElementById("divMultiply_dihedral").style.display = 'block';

  } else if (groupType === "freeabgroup" || groupType === "freegroup") {
    numVert.textContent = "Group order:"
    groupOrderInput1.disabled = true;
    document.getElementById("divMultiply").style.display = 'block';
    document.getElementById("free_break").style.display = 'block';
    document.getElementById("divMultiply_dihedral").style.display = 'none';

  } else if (groupType === "dihedral"){
    numVert.textContent = "Number of vertices:"
    document.getElementById("divMultiply_dihedral").style.display = 'block';
    groupOrderInput1.value = 4;
    groupOrderInput1.disabled = false;
    document.getElementById("divMultiply").style.display = 'none';
  }
  else {
    groupOrderInput1.value = 2;
    groupOrderInput1.disabled = false;
    numVert.textContent = "Group order:"
    document.getElementById("divMultiply").style.display = 'block';
    document.getElementById("divMultiply_dihedral").style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  updateGroupTypeDisplay();
});




function updateGroupTypeDisplay() {
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupTypeDisplay = document.getElementById('groupTypeDisplay');
  groupTypeDisplay.style.fontWeight = 'normal';
  const groupType = groupTypeSelect.value;
  groupTypeDisplay.innerText = 'Group Type: ' + groupType.charAt(0).toUpperCase() + groupType.slice(1);
}

let checkCount = 0;
function checkGenerate() {
  if (btn_mode.textContent === 'Editing' && !hasBeenGenerated) {
    alert("Please generate a graph before entering playing mode.");
    checkCount = 1;
    btn_mode.click();
  }
}
// Code for the Editing/Playing mode button

btn_mode.addEventListener('mouseenter', () => {
  btn_mode.style.backgroundColor = '#FED766';
  btn_mode.style.color = 'black';
});

btn_mode.addEventListener('mouseleave', () => {
  if (btn_mode.textContent === 'Playing'){
    btn_mode.style.backgroundColor = '#880D1E';
    btn_mode.style.color = '#EFF1F3';
  } else {
    btn_mode.style.backgroundColor = '#009FB7';
    btn_mode.style.color = '#EFF1F3';
  }
})

btn_mode.addEventListener('click', function handleClick() {
  btn_mode.style.color = '#EFF1F3';
  if (checkCount === 0){
    checkGenerate();
  } else {
    checkCount = 0;
  }
  if (currentMode === 'editing'){
    edit_state.click();
  }

  document.getElementById("displayValues").checked = true;
  // Get the selected group type from the dropdown menu
  const groupTypeSelect = document.getElementById('groupTypeSelect');
  const groupType = groupTypeSelect.value;
  const groupOrderLabel = document.getElementById("dihedralChange");
  const displayWhenPlaying = document.getElementById("displayWhenPlaying");
  const editingGroup = document.getElementById("editing_group");

  if (groupType === "dihedral") {
    groupOrderLabel.textContent = "Number of Vertices:";
    dihedralMultDisplay.value = 'e'
  } else if (groupType === "quaternion"){
    dihedralMultDisplay.value = '1'
  } else {
    groupOrderLabel.textContent = "Group order:";
    document.getElementById("groupMultiplier").value = '1';
  }

  set_group_order();


  left_arrow.style.display = "flex";
  right_arrow.style.display = "flex";
  left_contents.style.display = "none";
  right_contents.style.display = "none";
  right_arrow.style.cursor = 'pointer';
  left_arrow.style.cursor = 'default';
  editCanvas.style.opacity = "1";
  right_arrow.addEventListener('mouseenter', () => {
    right_arrow.style.opacity = '1';
    right_arrow.style.backgroundColor = '#FED766';
  });
  right_arrow.addEventListener('mouseleave', () => {
    right_arrow.style.opacity = '1';
    right_arrow.style.backgroundColor = '#EFF1F3';
  });
  left_arrow.addEventListener('mouseenter', () => {
    left_arrow.style.opacity = '0.5';
    left_arrow.style.backgroundColor = '#EFF1F3';
  });
  left_arrow.addEventListener('mouseleave', () => {
    left_arrow.style.opacity = '0.5';
    left_arrow.style.backgroundColor = '#EFF1F3';
  });

  if (btn_mode.textContent === 'Editing') {
    right_arrow.style.opacity = '1';
    left_arrow.style.opacity = '0.5';
    left_arrow.style.animation = 'none';
    right_arrow.style.animation = 'idlePulse 2.5s ease-in-out infinite';

    document.getElementById('play_button').style.backgroundColor = '#880D1E';
    document.getElementById('back_clr').style.background = 'linear-gradient(340deg,rgba(136, 13, 30, 1) 0%, rgba(15, 26, 32, 1) 59%)';
    document.getElementById('playing_toggle').style.display = 'block';
    btn_clear.style.display = 'none';
    btn_clear2.style.display = 'none';
    btn_reset.style.display = 'block';
    btn_matrix.style.display = 'block';
    editingGroup.style.display = 'none';
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
    clear_puzzle();
    draw(); // Displays default values of nodes when editing mode is clicked.
    addLegend();
    document.getElementById("right").checked = true;
  }
  else {
    document.getElementById('back_clr').style.background = 'linear-gradient(20deg,rgba(0, 159, 183, 1) 0%, rgba(15, 26, 32, 1) 59%)';
    right_arrow.style.opacity = '0.5';
    left_arrow.style.opacity = '1';
    left_arrow.style.cursor = 'pointer';
    right_arrow.style.cursor = 'default';
    right_arrow.style.animation = 'none';
    left_arrow.style.animation = 'idlePulse 2.5s ease-in-out infinite';
    left_arrow.addEventListener('mouseenter', () => {
      left_arrow.style.opacity = '1';
      left_arrow.style.backgroundColor = '#FED766';
    });
    left_arrow.addEventListener('mouseleave', () => {
      left_arrow.style.opacity = '1';
      left_arrow.style.backgroundColor = '#EFF1F3';
    });
    right_arrow.addEventListener('mouseenter', () => {
      right_arrow.style.opacity = '0.5';
      right_arrow.style.backgroundColor = '#EFF1F3';
    });
    right_arrow.addEventListener('mouseleave', () => {
      right_arrow.style.opacity = '0.5';
      right_arrow.style.backgroundColor = '#EFF1F3';
    });

    document.getElementById('playing_toggle').style.display = 'none';
    btn_clear.style.display = 'block';
    btn_clear2.style.display = 'block';
    btn_reset.style.display = 'none';
    btn_matrix.style.display = 'none';
    document.getElementById('play_button').style.backgroundColor = '#009FB7';
    editingGroup.style.display = 'block';
    btn_mode.textContent = 'Editing';
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
      if (pos.x > 0 && pos.x <= canvas.width && pos.y > 0 && pos.y <= canvas.height && isOpen === false) {
        create_node(e.offsetX, e.offsetY, "uNode");
        selection = within(e.offsetX, e.offsetY);
        hasBeenGenerated = true;
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
        // find other nodes connected to the clicked node and multiply them by the group element.
        if (currentMode === 'playing'){
          if (groupType === 'dihedral' || groupType === 'quaternion'){
            simplifyBtn.click();
            groupMultiplier = document.getElementById('dihedralMultDisplay').value;
          }
          target.node.multiply(groupMultiplier, leftMultiply, true);
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
        } else if (currentMode === 'editing'){
          if (groupType === 'dihedral' || groupType === 'quaternion'){
            simplifyBtn.click();
            groupMultiplier = document.getElementById('dihedralMultDisplay').value;
          }
          target.node.value = groupMultiplier;
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


let hasBeenGenerated = false;

document.getElementById('generate').addEventListener("click", () => {
  hasBeenGenerated = true;
})

document.getElementById('graph6_btn').addEventListener("click", () => {
  hasBeenGenerated = true;
})

document.getElementById('clear').addEventListener("click", () => {
  hasBeenGenerated = false;
})

document.getElementById('clear2').addEventListener("click", () => {
  hasBeenGenerated = false;
})


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
    case "cube":
      cubeGraph(all_nodes);
      break;
    case "folded":
      foldedGraph(all_nodes);
      break;
    case "crown":
        crownGraph(all_nodes);
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

// Passes group order from editing mode over to playing
function set_group_order() {
  if (btn_mode.textContent === 'Editing') {
    groupOrder = parseInt(document.getElementById("groupOrder1").value);
    document.getElementById("groupOrder2").value = groupOrder;
  }
  else {
    groupOrder = parseInt(document.getElementById("groupOrder2").value);
  }
}







// The following functions deal with simplifying user input for the dihedral mode
function simplifyDihedralWord(word, n) {
  if (!word || word === "e") return "e";
  if (!Number.isInteger(n) || n <= 0) {
      console.error("Invalid dihedral group order n:", n);
      return word;
  }

  const tempNode = new DihedralNode(n);
  tempNode.value = "e";

  word = word.replace(/\s+/g, "");

  // Capture: s, s2, s-1, r, r3, R2, etc.
  const tokens = word.match(/s\d*|[rR]-?\d*/g);

  if (!tokens) return "e";

  for (let token of tokens) {
      // Expand s^k as s r^0 (k times mod 2)
      if (token.startsWith("s")) {
          let power = token.length > 1 ? parseInt(token.slice(1)) : 1;
          power = Math.abs(power) % 2;

          for (let i = 0; i < power; i++) {
              tempNode.multiply("s", false, false);
          }
      } else {
          tempNode.multiply(token, false, false);
      }
  }

  return tempNode.value;
}

function simplifyQuaternionWord(word) {
  if (!word) return "1";

  const tempNode = new QuaternionNode();
  tempNode.value = "1";

  word = word.replace(/\s+/g, "");

  // Match: i, i2, i^2, i-3, -j, k^4, 1, -1
  const tokens = word.match(/-?(?:[ijk])(?:\^?-?\d+)?|-?1/g);
  if (!tokens) return "1";

  for (let token of tokens) {
    // Handle ±1
    if (token === "1" || token === "-1") {
      tempNode.multiply(token, false, false);
      continue;
    }

    // Extract sign, base, exponent
    const match = token.match(/^(-)?([ijk])(?:\^?(-?\d+))?$/);
    if (!match) continue;

    const sign = match[1] ? -1 : 1;
    const base = match[2];
    let exp = match[3] ? parseInt(match[3]) : 1;

    // Account for leading minus
    if (sign === -1) {
      tempNode.multiply("-1", false, false);
    }

    // Quaternion generators have order 4
    exp = ((exp % 4) + 4) % 4;

    for (let i = 0; i < exp; i++) {
      tempNode.multiply(base, false, false);
    }
  }

  return tempNode.value;
}



const simplifyBtn = document.getElementById("dihedral_simplify");
const resetBtn = document.getElementById("dihedral_reset");

simplifyBtn.addEventListener("click", () => {
  const input = dihedralMultDisplay.value;
  const groupType = document.getElementById("groupTypeSelect").value;

  let simplified;

  switch (groupType) {
    case "dihedral":
      simplified = simplifyDihedralWord(input, groupOrder);
      break;

    case "quaternion":
      simplified = simplifyQuaternionWord(input);
      break;

    default:
      simplified = input; // no-op fallback
  }

  dihedralMultDisplay.value = simplified;
});

resetBtn.addEventListener("click", () => {
  const groupType = document.getElementById("groupTypeSelect").value;
  dihedralMultDisplay.value =
    groupType === "quaternion" ? "1" : "e";
});



// Validates multiplier inputs for all group types
function set_group_multiplier(validateInput = true) {
  const groupMultiplierInput = document.getElementById("groupMultiplier").value;

  if (groupType === "freeabgroup" || groupType === "freegroup") {
    const regex = /^([a-zA-Z]\d*|1)*$/;
    if (validateInput && !regex.test(groupMultiplierInput)) {
      alert("Invalid input. Please enter a combination of letters and numbers or the identity element '1'.");
      return false;
    }
    groupMultiplier = groupMultiplierInput;
  } else if (groupType === "dihedral" || groupType === 'quaternion'){
    groupMultiplier = document.getElementById('dihedralMultDisplay').value;
  }
  else {
    if (validateInput && isNaN(parseInt(groupMultiplierInput))) {
      alert("Invalid input. Please enter a numeric value.");
      return false;
    }
    groupMultiplier = parseInt(groupMultiplierInput);
  }
  return true;
}






//Functions for the edit state mode in playing
const edit_state = document.getElementById('editState');
let currentMode = 'playing';

edit_state.addEventListener("click", () => {
    const isEditing = edit_state.classList.toggle('editing');

    currentMode = isEditing ? "editing" : "playing";

    edit_state.setAttribute("aria-pressed", isEditing);

    console.log("Current mode:", currentMode);

    if (currentMode === 'editing') {
      document.getElementById('dihedralMultLabel').textContent = 'New state:';
      document.getElementById('groupMultiplier_label').textContent = 'New state:';
    } else{
      document.getElementById('dihedralMultLabel').textContent = 'Multiplier:';
      document.getElementById('groupMultiplier_label').textContent = 'Multiplier:';
    }
});






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
    "groupcontrols",
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
    "dimensionDiv",
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
  } else if (variation === "bipartite" || variation === "crown") {
    showElements(["set1div", "set2div"]);
  } else if (variation === "cube" || variation === "folded") {
    showElements(["dimensionDiv"]);
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
      relationsContainer.style.display = "flex"
    }

    if (groupType === "freegroup") {
      nodeLabel.style.display = "inline-block";
      nodeLabelInput.style.display = "inline-block";
      nodeClick.style.display = "none";
      nodeClickInput.style.display = "none";
      historySide.style.display = "inline-block"
      relationsContainer.style.display = "flex"
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


function adjacencyMatrix(nodes, edges) {
  const indexMap = new Map();
  nodes.forEach((n, i) => indexMap.set(n.label, i));

  const size = nodes.length;
  const matrix = Array.from({ length: size }, () =>
      Array(size).fill(0)
  );

  for (let edge of edges) {
      const i = indexMap.get(edge.from.label);
      const j = indexMap.get(edge.to.label);
      matrix[i][j] = 1;
      matrix[j][i] = 1;
  }
  
  console.log("Node order:", nodes.map(n => n.label));
  console.table(matrix);
  return matrix;
}

function graphFromAdjacencyMatrix() {
  nodes.length = 0;
  edges.length = 0;

  if (!ADJ_MATRIX || ADJ_MATRIX.length === 0) {
    console.error("Adjacency matrix is empty.");
    return;
  }

  const n = ADJ_MATRIX.length;

  const canvas = context.canvas;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const layoutRadius = Math.min(centerX, centerY) * 0.7;

  // --- Create nodes ---
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;

    nodes.push({
      label: NODE_LABELS[i] ?? `${i}`,
      x: centerX + layoutRadius * Math.cos(angle),
      y: centerY + layoutRadius * Math.sin(angle),
      radius: 18,
      selected: false,
      clicked: false,
      node: null
    });
  }

  // --- Create edges ---
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (ADJ_MATRIX[i][j] === 1) {
        edges.push({
          from: nodes[i],
          to: nodes[j]
        });
      }
    }
  }

  redraw();
}


function graph6ToAdjacencyMatrix(g6) {
  let index = 0;

  // --- Decode number of vertices ---
  let n = g6.charCodeAt(index++) - 63;

  // (Extended formats not handled here; standard graph6 only)
  if (n < 0 || n > 62) {
    throw new Error("Only standard graph6 (n ≤ 62) is supported.");
  }

  // --- Decode edge bits ---
  const neededBits = (n * (n - 1)) / 2;
  let bits = [];

  while (bits.length < neededBits) {
    const value = g6.charCodeAt(index++) - 63;
    for (let i = 5; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
  }

  // --- Build adjacency matrix ---
  const adjMatrix = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  let bitIndex = 0;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const bit = bits[bitIndex++];
      adjMatrix[i][j] = bit;
      adjMatrix[j][i] = bit;
    }
  }

  // --- Node labels (A, B, C, ...) ---
  const nodeLabels = Array.from({ length: n }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return { adjMatrix, nodeLabels };
}


function graphFromGraph6() {
  const input = document.getElementById("graph6");
  const g6 = input.value.trim();

  if (!g6) {
    console.error("Graph6 string is empty.");
    return;
  }

  const result = graph6ToAdjacencyMatrix(g6);

  ADJ_MATRIX = result.adjMatrix;
  NODE_LABELS = result.nodeLabels;

  console.log("ADJ_MATRIX =", ADJ_MATRIX);
  console.log("NODE_LABELS =", NODE_LABELS);

  graphFromAdjacencyMatrix();
}

