function showMode(nextMode) {
    var activeTab = document.getElementById("nav-modes")
        .getElementsByClassName("is-active")[0];

    prevMode = activeTab.id.slice(4);

    var activePlays = document.getElementById("plays-" + prevMode);

    activeTab.classList.remove("is-active");
    activePlays.classList.add("is-hidden");

    var nextTab = document.getElementById("tab-" + nextMode);
    var nextPlays = document.getElementById("plays-" + nextMode);

    nextTab.classList.add("is-active");
    nextPlays.classList.remove("is-hidden");
}

function showEdit() {
    var editModal = document.getElementById("modal-edit");
    editModal.classList.add("is-active");
}

function closeEdit() {
    var editModal = document.getElementById("modal-edit");
    editModal.classList.remove("is-active");
}

function saveEdit() {
    var editForm = document.getElementById("modal-edit");
}

function closeResponse() {
    document.getElementById("response-box").classList.add("is-hidden");
}