var tabNum, pageListnersSet = false
function addTabsSection(){
	tabNum = 0
	// Check if page has completely loaded + Check if the tabs tool has not been added to the page already
	if (document.readyState == "complete" && !$('#shopify-tabs').length) {
		// Get the product tabs html partial
		$.get(chrome.extension.getURL('/product-tabs.html'),function(data){
			addTabsToPage(data)
				.then(addPageEventListners())
					.then(addExistingTabs())
						.catch(function(){console.log('tabs tool encountered an error')})
		})	
	}
}	

document.onreadystatechange = function(){
	addTabsSection()
}

addTabsSection()



// Add Tabs to Shopify Page ----------------------------------------------------------------------------------------------------------------

var addTabsToPage = function(data){
	let promise = new Promise(function(resolve,reject){
		// Check again if tabs tool has not been added to the page already
		if(!$('.tabs').length){
				$('head').append('<link rel="stylesheet" href="//cdn.jsdelivr.net/medium-editor/4.11.1/css/medium-editor.min.css" type="text/css" media="screen" charset="utf-8">')
				// $.getScript('//cdn.jsdelivr.net/medium-editor/4.11.1/js/medium-editor.min.js')
				$('head').append('<script src="//cdn.jsdelivr.net/medium-editor/4.11.1/js/medium-editor.min.js"></script')

			$('.next-grid--outer-grid:first-child > .next-grid__cell:first-child > .next-card:first-child')
				.after(data)
			// Once the tool has been added to the page, resolve the promise
			$('#addTab').length ? resolve() : reject()
		}
	})

	return promise
}

// New-Tab Initialization ----------------------------------------------------------------------------------------------------------------

var	initNewTab = function(tabNum,tabTitle,tabText){
	$('.tablinks').removeClass('next-tab--is-active')
	$('#addTab').before("<li><span class='tablinks next-tab next-tab--is-active' name='"+tabTitle+"' id=tab-"+ tabNum +" style='cursor:pointer'>"+ tabTitle +"</span></li>")
	$('.tab').hide()

	_buildTab(tabNum,tabTitle,tabText).then(_addTabEventListners(tabNum))
}	

	var _buildTab = function(tabNum,tabTitle,tabText){
		tabText = !!tabText? tabText : '' 
		let promise = new Promise(function(res,rej){
			$('#tabsText').append("<div id='tab-"+ tabNum +"_container'></div>")
			let $tabContainer = $("#tab-"+ tabNum +"_container")
			$tabContainer.append("<input class='tab' id='tab-"+ tabNum +"_titleInput' size='15' type='text' style='margin-bottom: 5px; width: 50%;'>")
			
			// ----
			// $tabContainer.append("<textarea class='tab tabTextInput' id='tab-"+ tabNum +"_textInput' rows='6' cols='50'>"+ tabText +"</textarea>")
			$tabContainer.append("<div class='tab tabTextInput' id='tab-"+ tabNum +"_textInput'>"+ tabText +"</div>") 
			let editor = new MediumEditor('.tabTextInput', {toolbar: {
				static: true,
				buttons: ['bold', 'italic', 'underline', 'h2', 'h3', 'orderedlist', 'unorderedlist', 'indent', 'outdent', 'fontsize']
			}});
			// ----

			let $tabTitle = $('#tab-'+ tabNum +'_titleInput')
			$tabTitle.val(tabTitle)
			$tabTitle.after("<a class='tab' id='tab-"+ tabNum +"_delete' style='float: right; color: #4293c2'>Delete Tab</a>")
			$tabTitle.length && $("#tab-"+ tabNum +"_textInput").length ? res(tabNum) : rej()
		})
		return promise
	}

	var _addTabEventListners = function(tabNum){
			tabListnersSet = true
			// Use the tab name as the tab title
			$('#tab-'+tabNum+'_titleInput').on('focusout',function(){$("#tab-"+tabNum).text($('#tab-'+tabNum+'_titleInput').val())})	
			// Delete tab and clean up if user click on delete button
			$("#tab-"+ tabNum +"_delete").on('click',function(){
				$('#tab-'+tabNum).parent().remove()
				$("#tab-"+tabNum+"_container").remove()
				activateSaveButton()
				let nextTab = tabNum+1
				$("#tab-"+nextTab).length? $("#tab-"+nextTab).click() : $('.tablinks').length? $('.tablinks')[0].click() : null
			})
			// Open tab if user clicks on tab head
			$("#tab-"+tabNum).on('click',function(){
				$('.tablinks').removeClass('next-tab--is-active')
				$('.tab').hide()
				let name = $(this).attr('name')
				let id = $(this).attr('id')
				$(this).addClass('next-tab--is-active')
				$("#"+id+"_delete").show()
				$("#"+id+"_textInput").show()
				$("#"+id+"_titleInput").show()
			})
			// Enable page save if user clicks on tab text area
			$('.tabTextInput').on('focusin', function(){
				activateSaveButton()
			})
	}

	var activateSaveButton = function(){
		$('.header__primary-actions input').prop('disabled', false);
		$('.header__primary-actions input').removeClass('disabled')
		$('.header__primary-actions input').addClass('btn-primary')
	}

// Page Event Listners ----------------------------------------------------------------------------------------------------------------

var addPageEventListners = function(){
	if (!pageListnersSet){
		pageListnersSet = true
		// When add tab is clicked, start the process of initializing a new tab
		$('#addTab').on('click',function(){
			$('#addTab').before("<li><input id='newTab' size='15' type='text' style='margin: 8px;'></li>")
			$('#tabsText').toggle()
			$('#addTab').toggle()
			$('#newTab').focus()
			$('#newTab').on('focusout keypress',function(e){
				if (e.type == 'focusout' || e.which == 13) {
					e.preventDefault()
					if($('#newTab').val()){ 
						initNewTab(tabNum,$('#newTab').val());
						tabNum++
					}
					$('#newTab').parent().remove()
					$('#tabsText').toggle()
					$('#addTab').toggle()
				}		
			})
		})

		// When user saves page --> embed the tabs to the main text entry section
		$('.header__primary-actions input').on('click',function(){
			$('#rte-show-editor').click()
			if($('.tablinks').length){
				let finalTabs = "<div id='tabs'><ul>"
				for(idx=0; idx<$('.tablinks').length; idx++){
					finalTabs = finalTabs.concat("<li><a href='#"+ $('.tablinks')[idx].id +"' style='text-transform:capitalize'>"+ $('.tablinks')[idx].innerHTML +"</a></li>")
				}
				finalTabs = finalTabs.concat("</ul>")
				for(idx=0; idx < $('.tabTextInput').length; idx++){
					finalTabs = finalTabs.concat("<div id='"+ $('.tabTextInput')[idx].id.split('_')[0] +"'>"+ $('.tabTextInput')[idx].innerHTML +"</div>")
				}
				finalTabs = finalTabs.concat("</div>")
				$('#product-description').val($('#product-description').val() + finalTabs)
			}
			$('#rte-show-editor').click()
			$(':focus').blur()	
		})
	}
}

// Parse existing tabs and use to initialize tabs section ----------------------------------------------------------------------------------------------------------------

var addExistingTabs = function(){
	var fullDesc, tabsSection, tabsSectionIdx, withoutTabs = "", tabTitles
	new Promise(function(res,rej){
		$('#rte-show-editor').click() //shows the html area
		let currentVal = $('#product-description').val()
		fullDesc = $.parseHTML(currentVal) // converts the current html into a string
		fullDesc.length ? res(fullDesc) : rej()
	})
	.then(function(fullDesc){
		// parse the current page for existing tabs, save those tabs in tabsSection resolve
		let idx = 0
		while (idx < fullDesc.length && !tabsSection) {
			if (!!fullDesc[idx] && !!fullDesc[idx].id && fullDesc[idx].id == 'tabs') { 
				tabsSection = fullDesc[idx]
				tabsSectionIdx = idx;
				break;
			}
			idx++
		}
		return tabsSectionIdx
	})
	.then(function(tabsSectionIdx){
		if(!tabsSectionIdx){ rej() }
		fullDesc.splice(tabsSectionIdx,1)
		for (let idx = 0; idx < fullDesc.length; idx++) {
			if (fullDesc[idx].outerHTML) { withoutTabs = withoutTabs.concat(fullDesc[idx].outerHTML)}
		}
		// remove the current tabs from the page to avoid duplication, tabs editing will be handled by the tabs tool
		// tabsSectionAdjusted = tabsSection.outerHTML.replace('<br>','<br />')
		// withoutTabs = currentVal.replace(tabsSectionAdjusted,'') 
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
			let tabHref = tabTitles.children[idx].firstElementChild.href.match(/#(.*)/g)[0].substr(1)
			let tabName = tabTitles.children[idx].firstElementChild.text
			for(i=0 ; i<tabsSection.children.length ; i++){
				let tabId = tabsSection.children[i].id
				if (tabId == tabHref) {
					initNewTab(tabNum,tabName,tabsSection.children[i].innerHTML)
					tabNum++
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
}
