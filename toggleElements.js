// Updates grouptype when choosing in dropdown menu
function updateGroupType() {
    let groupTypeDropdown = document.getElementById("groupTypeSelect");
    groupType = groupTypeDropdown.value;
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
        "group_type_label",
        "groupTypeSelect",
        "save",
        "load",
        "load_selector_label",
        "loadSelector",
        "delete",
        "verticesDiv",
        "set1div",
        "set2div",
        "connectionsDiv"
    ];

    const graphControls = document.getElementById("graphcontrols");
    const groupControls = document.getElementById("groupcontrols");


    if (mode === "Editing") {
        playButton.value = "Playing";
        playButton.textContent = "Playing";
        hideShowElements(elementsToHide, "none");
        // Move the graph controls above group controls
        groupControls.insertAdjacentElement("beforebegin", graphControls);
    } else {
        playButton.value = "Editing";
        playButton.textContent = "Editing";
        hideShowElements(elementsToHide, "inline-block");
        updateLayout();
        // Move the graph controls back to its original position
        const controlsWrapper = document.querySelector(".controls-wrapper");
        controlsWrapper.insertBefore(graphControls, controlsWrapper.firstChild);
    }
}



document.getElementById("choose_variation").addEventListener("change", updateLayout);

function hideShowElements(ids, displayStyle) {
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = displayStyle;
        }
    });
}

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

// Function to show elements when playing
document.getElementById("play_button").addEventListener("click", function () {
    const multiplierLabel = document.getElementById("groupMultiplier_label");
    const multiplierInput = document.getElementById("groupMultiplier");
    const sideMultiplier = document.getElementById("multiplicationOptions");
    const congratulate = document.getElementById("congratdiv")
    const nodeLabel = document.getElementById("nodeLabels")
    const historyList = document.getElementById("history")


    if (this.value === "Playing") {
        multiplierLabel.style.display = "inline-block";
        multiplierInput.style.display = "inline-block";
        sideMultiplier.style.display = "inline-block";
        congratulate.style.display = "inline-block";
        nodeLabel.style.display = "block";
        historyList.style.display = "block"
    } else {
        multiplierLabel.style.display = "none";
        multiplierInput.style.display = "none";
        sideMultiplier.style.display = "none";
        congratulate.style.display = "none";
        nodeLabel.style.display = "none";
        historyList.style.display = "none"
    }
});