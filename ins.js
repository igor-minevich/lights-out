let currentView;
let previousView;
let currentBtn;
let previousBtn;

function changeView(clicked) {
    currentBtn.classList.toggle('clicked');
    currentBtn = document.getElementById(clicked);
    currentBtn.classList.toggle('clicked');
    document.getElementById(currentView).style.display = 'none';
    currentView = clicked + '_view';
    document.getElementById(currentView).style.display = 'flex';
}

function setView() {
    currentBtn = document.getElementById('overE');
    currentBtn.classList.toggle('clicked');
    currentView = 'overE_view';
}

