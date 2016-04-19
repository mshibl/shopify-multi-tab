// window.addTab = function(){console.log('tab added')}

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	console.log(details)
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		if (!!tabs.length && tabs[0].url.match(/.*:\/\/.*\.myshopify.com\/admin\/products\/.*/g)){
		    		// setTimeout(function(){
		    			// console.log('message sent')
		    			// chrome.tabs.sendMessage(tabs[0].id, {action: "ExecuteScript"}, function(response) {});
					    chrome.tabs.executeScript(null,{file:"jquery-2.2.3.min.js"},function(){
					    	chrome.tabs.executeScript(null,{file:"script.js"});
					    	chrome.tabs.executeScript(null,{file:"addTabsSection.js"});
					    })
		    		// }, 3000);
		}
	});
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
// 	chrome.tabs.query({currentWindow: true, active: true, status: 'complete'}, function(tabs){
// 		if (!!tabs.length && tabs[0].url.match(/.*:\/\/.*\.myshopify.com\/admin\/products\/.*/g)){
// 			// console.log(tab)
// 		    if (changeInfo.status == 'complete') {
// 		    		console.log(tabId)
// 		    		console.log(tabs[0].id)

// 		    		setTimeout(function(){
// 		    			console.log('message sent')
// 		    			chrome.tabs.sendMessage(tabId, {action: "ExecuteScript"}, function(response) {});
// 		    		}, 3000);
// 				  //   chrome.tabs.executeScript(null,{file:"jquery-2.2.3.min.js"},function(){
// 				  //   	chrome.tabs.executeScript(null,{file:"addTabsSection.js"});
// 				  //   })
// 		     }
// 		}
// 	});
// });