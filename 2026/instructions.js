const editingDiv = document.getElementById('editing_ins');
const groupDiv = document.getElementById('group_ins');
const playingDiv = document.getElementById('playing_ins');
const title = document.getElementById('title_change');

editingDiv.addEventListener('mouseenter', () => {
    document.getElementById('editShow').style.display = 'block';
});
editingDiv.addEventListener('mouseleave', () => {
    document.getElementById('editShow').style.display = 'none';
});

groupDiv.addEventListener('mouseenter', () => {
    document.getElementById('groupShow').style.display = 'block';
});
groupDiv.addEventListener('mouseleave', () => {
    document.getElementById('groupShow').style.display = 'none';
});

playingDiv.addEventListener('mouseenter', () => {
    document.getElementById('playShow').style.display = 'block';
});
playingDiv.addEventListener('mouseleave', () => {
    document.getElementById('playShow').style.display = 'none';
});



editingDiv.addEventListener('click', () => {
    document.getElementById('group_items').style.display = 'none';
    document.getElementById('more_editing').style.display = 'block';
    title.textContent = 'Editing Instructions';
});

groupDiv.addEventListener('click', () => {
    document.getElementById('group_items').style.display = 'none';
    document.getElementById('more_groups').style.display = 'block';
    title.textContent = 'Group Instructions';
});

playingDiv.addEventListener('click', () => {
    document.getElementById('group_items').style.display = 'none';
    document.getElementById('more_playing').style.display = 'block';
    title.textContent = 'Playing Instructions';
});

document.getElementById('btn1').addEventListener('click', () => {
    document.getElementById('more_editing').style.display = 'none';
    document.getElementById('more_groups').style.display = 'none';
    document.getElementById('more_playing').style.display = 'none';
    title.textContent = 'Navigating the Lights Out Puzzle';
    document.getElementById('group_items').style.display = 'flex';
});

document.getElementById('btn2').addEventListener('click', () => {
    document.getElementById('more_editing').style.display = 'none';
    document.getElementById('more_groups').style.display = 'none';
    document.getElementById('more_playing').style.display = 'none';
    title.textContent = 'Navigating the Lights Out Puzzle';
    document.getElementById('group_items').style.display = 'flex';
});

document.getElementById('btn3').addEventListener('click', () => {
    document.getElementById('more_editing').style.display = 'none';
    document.getElementById('more_groups').style.display = 'none';
    document.getElementById('more_playing').style.display = 'none';
    title.textContent = 'Navigating the Lights Out Puzzle';
    document.getElementById('group_items').style.display = 'flex';
});