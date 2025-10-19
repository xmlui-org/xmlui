function showNav() {
    return posts.length > showNavPanelThreshold;
}

function toggleThreshold() {
    if (showNavPanelThreshold> 0) {
        showNavPanelThreshold = 0
    } else {
        showNavPanelThreshold = 6
    }
}