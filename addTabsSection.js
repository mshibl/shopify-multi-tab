var addTabsSection = function(){
	// Check if page has completely loaded + Check if the tabs tool has not been added to the page already
	if (document.readyState == "complete" && !$('#shopify-tabs').length) {
		// Get the product tabs html partial
		$.get(chrome.extension.getURL('/product-tabs.html'),function(data){
			var tabsSection, tabTitles, initNewTab, currentVal, fullDesc, withoutTabs, finalTabs, tabNum = 0 , tabNames = [], idx = 0
			// Add tabs tool to the page
			var addTabsTool = new Promise(function(resolve,reject){
				// Check again if tabs tool has not been added to the page already
				if(!$('.tabs').length){
					$('.next-grid--outer-grid:first-child > .next-grid__cell:first-child > .next-card:first-child')
						.after(data)
					// Once the tool has been added to the page, resolve the promise
					$('#addTab').length ? resolve() : reject()
				}
			})
			.then(function(){
				// Declare the function (initNewTab), that initializes a new tab section in the tabs tool
		   		initNewTab = function(tabTitle,tabText){
		   			$('.tablinks').removeClass('next-tab--is-active')
		   			tabNum++
					$('#addTab').before("<li><a class='tablinks next-tab next-tab--is-active' name='"+tabTitle+"' id=tab-"+ tabNum +">"+ tabTitle +"</a></li>")
					$('.tab').hide()
					tabText = !!tabText? tabText : '' 
					new Promise(function(res,rej){
						$('#tabsText').append("<input class='tab' id='tab-"+ tabNum +"_titleInput' size='15' type='text' style='margin-bottom: 5px; width: 50%;'>")
						$('#tabsText').append("<textarea class='tab tabTextInput' id='tab-"+ tabNum +"_textInput' rows='6' cols='50'>"+ tabText +"</textarea>")
						$("#tab-"+ tabNum +"_titleInput").length && $("#tab-"+ tabNum +"_textInput").length ? res(tabNum) : rej()
					})
					.then(function(tabNum){
						$('#tab-'+tabNum+'_titleInput').val(tabTitle)
						$('#tab-'+tabNum+'_titleInput').on('focusout',function(){$("#tab-"+tabNum).text($('#tab-'+tabNum+'_titleInput').val())})
					})
					$("#tab-"+tabNum).on('click',function(){
						$('.tablinks').removeClass('next-tab--is-active')
						$('.tab').hide()
						name = $(this).attr('name')
						id = $(this).attr('id')
						$(this).addClass('next-tab--is-active')
						$("#"+id+"_textInput").show()
						$("#"+id+"_titleInput").show()
					})
				}	

				// If the user clicks save, embed the tabs to the main text entry section
				$('.header__primary-actions input').on('click',function(){
					$('#rte-show-editor').click()
					if($('.tablinks').length){
						finalTabs = "<div id='tabs'><ul>"
						for(idx=0; idx<$('.tablinks').length; idx++){
							finalTabs = finalTabs.concat("<li><a href='#"+ $('.tablinks')[idx].id +"' style='text-transform:capitalize'>"+ $('.tablinks')[idx].text +"</a></li>")
						}
						finalTabs = finalTabs.concat("</ul>")
						for(idx=0; idx < $('.tabTextInput').length; idx++){
							finalTabs = finalTabs.concat("<div id='"+ $('.tabTextInput')[idx].id.split('_')[0] +"'>"+ $('textarea#'+$('.tabTextInput')[idx].id).val() +"</div>")
						}
						finalTabs = finalTabs.concat("</div>")
						$('#product-description').val($('#product-description').val() + finalTabs)
					}
					$('#rte-show-editor').click()
					$(':focus').blur()	
				})

				// When add tab is clicked, start the process of initializing a new tab
				$('#addTab').on('click',function(){
					$('#addTab').before("<li><input id='newTab' size='15' type='text' style='margin: 4px;'></li>")
					$('#addTab').toggle()
					$('#newTab').focus()
					$('#newTab').on('focusout keypress',function(e){
						if (e.type == 'focusout' || e.which == 13) {
							e.preventDefault()
							// TODO special characters as tab names
							if($('#newTab').val()){ initNewTab($('#newTab').val()) }
							$('#newTab').parent().remove()
							$('#addTab').toggle()
						}		
					})
				})

				$('#rte-show-editor').click() //shows the html area
				currentVal = $('#product-description').val()
				fullDesc = $.parseHTML(currentVal) // converts the current html into a string
				return fullDesc
			})
			.then(function(fullDesc){
				// parse the current page for existing tabs, save those tabs in tabsSection resolve
				while (idx < fullDesc.length && !tabsSection) {
					if (!!fullDesc[idx] && !!fullDesc[idx].id && fullDesc[idx].id == 'tabs') { tabsSection = fullDesc[idx]}
					idx++
				}
				return tabsSection
			})
			.then(function(tabsSection){
				// remove the current tabs from the page to avoid duplication, tabs editing will be handled by the tabs tool
				withoutTabs = currentVal.replace(tabsSection.outerHTML,'') 
				$('#product-description').val(withoutTabs)
				// close the html view
				$('#rte-show-editor').click()
				$(':focus').blur()
				// Parse the tabsSection to find the tab Titles
				idx = 0
				while (idx < tabsSection.children.length || !tabTitles) {
					if (tabsSection.children[idx].tagName == 'UL') {tabTitles = tabsSection.children[idx]}
					idx++
				}
				return tabTitles
			})
			.then(function(tabTitles){
				// Find the text associated with each tab, once found --> initiate a new tab using the tab title and text
				for(idx=0 ; idx<tabTitles.children.length ; idx++){
					tabHref = tabTitles.children[idx].firstElementChild.href.match(/#(.*)/g)[0].substr(1)
					tabName = tabTitles.children[idx].firstElementChild.text
					for(i=0 ; i<tabsSection.children.length ; i++){
						tabId = tabsSection.children[i].id
						if (tabId == tabHref) {
							initNewTab(tabName,tabsSection.children[i].innerHTML)
							break;
						}
					}
				}
			})
			.then(function(){
				$('.tabs')[0].children[0].children[0].click()
			})
			.catch(function(){
				if ($('#product-description').is(":visible")){
					$('#rte-show-editor').click()
					$(':focus').blur()	
				}
				console.log('product has no description tabs')
			})
		})	
	}
}	

document.onreadystatechange = function(){
	addTabsSection()
}

addTabsSection()