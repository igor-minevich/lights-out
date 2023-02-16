const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

var nodes = [];
var edges = [];
var clicks = 1;

let groupType = "cyclical";
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

var text = document.createTextNode('Mode: ');
var child = document.getElementById('play_button');
child.parentNode.insertBefore(text, child);

//selects "instruction" button and adds an event listener that displays an alert when clicked
document.getElementById("instructions_button").addEventListener("click", function () {
  alert("Instructions for using the canvas go here.");
});

// Code for the Editing/Playing mode button
btn_mode.addEventListener('click', function handleClick() {
  if (btn_mode.textContent === 'Editing') {
    for (i = 0; i < nodes.length; i++)
      nodes[i].value = 0;
    btn_mode.textContent = 'Playing';
    btn_clear.textContent = 'Reset Puzzle';
    draw();
    addLegend();
  }
  else {
    btn_mode.textContent = 'Editing';
    btn_clear.textContent = 'Clear Puzzle';
    for (i = 0; i < nodes.length; i++)
      nodes[i].value = 0;
    draw();
    addLegend();
  }
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
  var num_colors = parseInt(document.getElementById('num_colors_input').value);
  for (var c = 1; c < num_colors; c++) {
    var content = document.createElement("span");
    const inner_str = "<button value =" + c + " style='color:" + colors[c] + "; font-weight:bold; font-size:15px' onclick = set_num_clicks(" + c + ")>" + c.toString() + "</button>";
    content.innerHTML = inner_str;
    newDiv.appendChild(content);
  }
  const currentDiv = document.getElementById("d1");
  document.body.insertBefore(newDiv, currentDiv);
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
function create_node(x_0, y_0) {
  let node = {
    x: x_0,
    y: y_0,
    radius: 12,
    selected: false,
    value: 0,
    clicks: 0
  };
  nodes.push(node);
  draw();
  return node;
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
      if (node == selection)
        context.fillStyle = SELECTED;
      else
        context.fillStyle = colors[node.value];
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
      context.fillStyle = colors[node.value];
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
      context.fill();
      context.stroke();
      context.font = "12px Verdana";
      context.beginPath();
      context.fillStyle = "#000000";
      if (node.clicks.toString().length > 1) {
        context.fillText(node.clicks.toString(), node.x - 8, node.y + 4);
      }
      else
        context.fillText(node.clicks.toString(), node.x - 3, node.y + 4);
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
  var num_colors = parseInt(document.getElementById('num_colors_input').value);
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
  }
  else {
    let target = within(e.offsetX, e.offsetY);
    if (target) {
      target.value = (target.value + clicks) % num_colors;
      target.clicks = (target.clicks + clicks) % num_colors;
      for (let i = 0; i < edges.length; i++) {
        var other = undefined;
        if (edges[i].from == target)
          other = edges[i].to;
        else if (edges[i].to == target)
          other = edges[i].from;
        if (other)
          other.value = (other.value + clicks) % num_colors;
      }
      draw();
      congratulate();

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
  }
  else {
    for (i = 0; i < nodes.length; i++) {
      nodes[i].value = 0;
      nodes[i].clicks = 0;
    }
  }
  draw();
}
function congratulate() {
  if (document.getElementById("congratulate").checked) {
    var val = nodes[0].value;
    var solved = true;
    var message = ""
    for (i = 1; i < nodes.length; i++) {
      if (nodes[i].value != val)
        solved = false;
    }
    if (solved) {
      if (val == 0) {
        message = "Congratulations, you've found a quiet pattern!";
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
  addElement();
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
  save();
  updateSavedPuzzles();
  alert("Successfully saved puzzle!");
}

function updateSavedPuzzles() {
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  let selector = document.getElementById("loadSelector");
  selector.innerHTML = "";
  for (let i = 0; i < graphStorage.length; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = "Graph " + i;
    selector.appendChild(option);
  }
}

function load_puzzle() {
  let selector = document.getElementById("loadSelector");
  let graph = load(selector.value);
  if (graph) {
    nodes = graph.nodes;
    edges = graph.edges;
    draw();
  }
}

function save() {
  let graphStorage = JSON.parse(localStorage.getItem("graphStorage"));
  if (!graphStorage) {
    graphStorage = [];
  }
  graphStorage.push({
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

function puzzle_type() {
  let buttons = document.querySelectorAll("input[name='groupType']");
  for (const button of buttons) {
    if (button.checked) {
      groupType = button.value;
      break;
    }
  }
}

function group_order() {
  // todo: add input validation
  groupOrder = parseInt(document.getElementById("groupOrder").value);
}

function group_multiplier() {
  // todo: add input validation
  groupMultiplier = parseInt(document.getElementById("groupMultiplier").value);
}

