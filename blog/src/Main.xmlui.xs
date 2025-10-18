function showNav() {
    return posts.length > showNavPanelThreshold && mediaSize.sizeIndex > 2;
}

function toggleThreshold() {
    if (showNavPanelThreshold> 0) {
        showNavPanelThreshold = 0
    } else {
        showNavPanelThreshold = 6
    }
}