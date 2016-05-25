chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		if (!!tabs.length && tabs[0].url.match(/.*:\/\/.*\.myshopify.com\/admin\/products\/.*/g)){
		    chrome.tabs.executeScript(null,{file:"jquery-2.2.3.min.js"},function(){
		    	chrome.tabs.executeScript(null,{file:"medium-editor.min.js"});
	    		chrome.tabs.executeScript(null,{file:"script.js"});
		    })
		}
	});
});