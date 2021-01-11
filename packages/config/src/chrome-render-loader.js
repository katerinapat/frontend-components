function chromeRenderLoader(source) {
    return `var isChrome2 = window.insights && window.insights.chrome && window.insights.chrome.isChrome2 || false; if(!isChrome2){${source}}`;
}

module.exports = chromeRenderLoader;
