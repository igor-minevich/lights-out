// BELOW IS THE CODE FOR HISTORY FEATURE

const historyList = document.getElementById('historyList');

function addToHistory(label, groupMultiplier, leftRightMultiplier) {
    let historyItem = {
        label: label,
        groupMultiplier: groupMultiplier,
        selected: false,
    };

    if (groupType !== "freeabgroup" && groupType !== "cyclic") {
        historyItem.leftRightMultiplier = leftRightMultiplier;
    }

    historyData.push(historyItem);
    updateHistoryList();
}


function updateHistoryList() {
    historyList.innerHTML = '';

    historyData.forEach((item, index) => {
        const li = document.createElement('li');
        let itemText = `Node: [${item.label}], Multiplier: [${item.groupMultiplier}]`;

        if (item.leftRightMultiplier) {
            itemText += `, Side: [${item.leftRightMultiplier}]`;
        }

        li.textContent = itemText;
        li.addEventListener('click', () => {
            selectHistoryItem(index);
        });

        if (item.selected) {
            li.classList.add('selected');
        }

        historyList.appendChild(li);
    });
}


function selectHistoryItem(index) {
    historyData.forEach((item, idx) => {
        item.selected = idx === index;
    });

    updateHistoryList();
    deleteButton.disabled = false;

    applyHistory(index);

    // Populate the input elements with the selected event's data
    const nodeLabelInput = document.getElementById('nodeLabelInput');
    const multiplierInput = document.getElementById('multiplierInput');
    const sideRadioLeft = document.querySelector('input[name="sideRadio"][value="Left"]');
    const sideRadioRight = document.querySelector('input[name="sideRadio"][value="Right"]');

    const selectedItem = historyData[index];
    nodeLabelInput.value = selectedItem.label;
    if (groupType === "freegroup" || groupType === "freeabgroup") {
        multiplierInput.type = "text";
    } else {
        multiplierInput.type = "number";
    }
    multiplierInput.value = selectedItem.groupMultiplier;
    // Set the side radio buttons
    if (selectedItem.leftRightMultiplier === 'Left') {
        sideRadioLeft.checked = true;
    } else {
        sideRadioRight.checked = true;
    }

    draw();
}

function validateHistoryMultiplier(multiplier) {
    if (groupType === "freeabgroup" || groupType === "freegroup") {
        const regex = /^([a-zA-Z]\d*|1)*$/;
        if (!regex.test(multiplier)) {
            return false;
        }
    } else {
        if (isNaN(parseInt(multiplier))) {
            return false;
        }
    }
    return true;
}


function applyHistory(index) {
    // Reset all nodes to their initial states
    for (let node of nodes) {
        if (node.node instanceof QuaternionNode) {
            node.node.value = 1;
        } else if (node.node instanceof FreeGroupNode || node.node instanceof FreeAbelianNode) {
            node.node.value = '';
        } else {
            node.node.value = 0;
        }
        node.node.clicks = 0;
    }

    // Reapply the history up to the given index
    for (let i = 0; i <= index; i++) {
        const historyItem = historyData[i];
        const targetNode = nodes.find((node) => node.label === historyItem.label);

        if (targetNode) {
            let leftMultiply = historyItem.leftRightMultiplier === "Left";
            let multiplier = historyItem.groupMultiplier;
            if (groupType === "freegroup" || groupType === "freeabgroup") {
                if (targetNode.node instanceof FreeAbelianNode && multiplier === "a") {
                    multiplier = targetNode.node.defaultMultiplier();
                }
                targetNode.node.multiply(multiplier, leftMultiply, true);
            } else {
                const multiplierInt = parseInt(multiplier);
                targetNode.node.multiply(multiplierInt, leftMultiply, true);
            }

            for (let edge of edges) {
                let otherNode = undefined;

                if (edge.from === targetNode) {
                    otherNode = edge.to;
                } else if (edge.to === targetNode) {
                    otherNode = edge.from;
                }

                if (otherNode) {
                    if (groupType === "freegroup" || groupType === "freeabgroup") {
                        if (otherNode.node instanceof FreeAbelianNode && multiplier === "a") {
                            multiplier = otherNode.node.defaultMultiplier();
                        }
                        otherNode.node.multiply(multiplier, leftMultiply, false);
                    } else {
                        const multiplierInt = parseInt(multiplier);
                        otherNode.node.multiply(multiplierInt, leftMultiply, false);
                    }
                }
            }
        }
    }

    // Call draw() to update the canvas with the new node values
    draw();
}



const updateButton = document.getElementById("updateButton");

updateButton.addEventListener("click", function () {
    updateSelectedHistoryItem();
});

function updateSelectedHistoryItem() {
    const nodeLabelInput = document.getElementById("nodeLabelInput");
    const multiplierInput = document.getElementById("multiplierInput");
    const sideRadioLeft = document.querySelector('input[name="sideRadio"][value="Left"]');

    const newLabel = nodeLabelInput.value;
    const newMultiplier = multiplierInput.value;

    if (!validateHistoryMultiplier(newMultiplier)) {
        alert("Invalid input for multiplier.");
        return;
    }
    const newLeftRightMultiplier = sideRadioLeft.checked ? "Left" : "Right";

    const selectedIndex = historyData.findIndex(item => item.selected);

    if (selectedIndex >= 0) {
        const selectedItem = historyData[selectedIndex];
        selectedItem.label = newLabel;
        selectedItem.groupMultiplier = newMultiplier;

        if (groupType !== "freeabgroup" && groupType !== "cyclic") {
            selectedItem.leftRightMultiplier = newLeftRightMultiplier;
        } else {
            selectedItem.leftRightMultiplier = undefined;
        }

        applyHistory(selectedIndex);
        updateHistoryList();
    }
}

// Add event listener for insert button
insertButton.addEventListener("click", function () {
    const nodeLabelInput = document.getElementById("nodeLabelInput");
    const multiplierInput = document.getElementById("multiplierInput");
    const sideRadioLeft = document.querySelector('input[name="sideRadio"][value="Left"]');

    const newLabel = nodeLabelInput.value;
    let newMultiplier;

    if (groupType === "freegroup" || groupType === "freeabgroup") {
        newMultiplier = multiplierInput.value;
    } else {
        newMultiplier = parseInt(multiplierInput.value);
    }

    const newLeftRightMultiplier = sideRadioLeft.checked ? "Left" : "Right";

    if (groupType !== "freeabgroup" && groupType !== "cyclic") {
        insertToHistory(newLabel, newMultiplier, newLeftRightMultiplier);
    } else {
        insertToHistory(newLabel, newMultiplier);
    }
});



function insertToHistory(label, groupMultiplier, leftRightMultiplier) {
    if (!validateHistoryMultiplier(groupMultiplier)) {
        alert("Invalid input for multiplier.");
        return;
    }
    let historyItem = {
        label: label,
        groupMultiplier: groupMultiplier,
        selected: false,
    };
    const selectedIndex = historyData.findIndex(item => item.selected);
    if (selectedIndex >= 0) {
        historyData.splice(selectedIndex + 1, 0, historyItem);
    } else {
        historyData.push(historyItem);
    }

    updateHistoryList();
}


// Add event listener for delete button
const deleteButton = document.getElementById("deleteButton");
deleteButton.addEventListener("click", function () {
    deleteSelectedHistoryItem();
});

function deleteSelectedHistoryItem() {
    const selectedIndex = historyData.findIndex(item => item.selected);

    if (selectedIndex >= 0) {
        historyData.splice(selectedIndex, 1);

        // Select the item before the deleted item
        if (selectedIndex > 0) {
            historyData[selectedIndex - 1].selected = true;
            selectHistoryItem(selectedIndex - 1);
        } else if (historyData.length > 0) {
            historyData[0].selected = true;
            selectHistoryItem(0);
        } else {
            deleteButton.disabled = true;

            // Clear input elements
            const nodeLabelInput = document.getElementById("nodeLabelInput");
            const multiplierInput = document.getElementById("multiplierInput");
            const sideRadioLeft = document.querySelector('input[name="sideRadio"][value="Left"]');
            const sideRadioRight = document.querySelector('input[name="sideRadio"][value="Right"]');

            nodeLabelInput.value = "";
            multiplierInput.value = "";
            sideRadioLeft.checked = false;
            sideRadioRight.checked = false;

            // Reset the nodes and redraw
            applyHistory(-1);
        }

        updateHistoryList();
    }
}

