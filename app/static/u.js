function switchMode(event) {
    let prevTab = $('li.is-active [id^="tab-"]');
    let prevMode = prevTab.attr('id').slice(4);
    let prevPlays = $(`#plays-${prevMode}`);

    let nextMode = event.target.id.slice(4);
    let nextTab = $(`#tab-${nextMode}`);
    let nextPlays = $(`#plays-${nextMode}`);

    if (nextTab === null || nextMode === prevMode) {
        return;
    }

    prevTab.parent().removeClass('is-active');
    prevPlays.addClass('is-hidden');

    nextTab.parent().addClass('is-active');
    nextPlays.removeClass('is-hidden');
}

$(document).ready(() => {
    $('[id^="tab-"]').click(switchMode);

    $('#show-edit').click(() => {
        $('#modal-edit').addClass('is-active');
    });

    $('#close-edit').click(() => {
        $('#modal-edit').removeClass('is-active');
    });

    $('#close_response').click(() => {
        $('#response-box').addClass('is-hidden');
    });
});
