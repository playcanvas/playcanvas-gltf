init_overlay = function () {
    var overlay = document.getElementById("overlay");
    // give scripts the ability to determine if the event should be ignored
    overlay.onmousedown = function(event) {
        event.isOverlayEvent = true;
    };
    overlay.onmousemove = function(event) {
        event.isOverlayEvent = true;
    };
    return overlay;
}
