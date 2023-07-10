var defaultMode = "osu!"

function getActiveTab() {
    return document.getElementById("nav-modes")
        .getElementsByClassName("is-active")[0];
}

function showModeAnchor() {
    var url = window.location.href;
    activeTab = getActiveTab();

    if (url.indexOf("#") > 0) {
        var nextMode = url.substring(url.indexOf("#") + 1);
    } else {
        var nextMode = defaultMode;
    }

    prevMode = activeTab.id.slice(4);
    var nextTab = document.getElementById("tab-" + nextMode);
    var nextPlays = document.getElementById("plays-" + nextMode);

    if (nextTab == null || nextMode == prevMode) {
        return;
    }

    var activePlays = document.getElementById("plays-" + prevMode);

    activeTab.classList.remove("is-active");
    activePlays.classList.add("is-hidden");

    nextTab.classList.add("is-active");
    nextPlays.classList.remove("is-hidden");
}

window.addEventListener('hashchange', showModeAnchor);
window.onload = function() {
    defaultMode = getActiveTab().id.slice(4);
    showModeAnchor();
};

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