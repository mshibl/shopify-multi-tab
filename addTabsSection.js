var addTabsSection = function(){
	// Check if page has completely loaded + Check if the tabs area has not been added to the page already
	if (document.readyState == "complete" && !$('#shopify-tabs').length) {
		// Get the product tabs html partial
		$.get(chrome.extension.getURL('/product-tabs.html'),function(data){
			var tabsSection, mainTabs, initNewTab, currentVal, fullDesc, withoutTabs, finalTabs, tabNames = [], idx = 0
			var addTabsTool = new Promise(function(resolve,reject){
				if(!$('.tabs').length){
					$('.next-grid--outer-grid:first-child > .next-grid__cell:first-child > .next-card:first-child')
						.after(data)
					$('#addTab').length ? resolve() : reject()
				}
			})
			.then(function(){
		   		initNewTab = function(tabTitle,tabText){
		   			$('.tablinks').removeClass('next-tab--is-active')
					$('#addTab').before("<li><a class='tablinks next-tab next-tab--is-active' name='#"+tabTitle+"' id="+ tabTitle +"-tab style='text-transform:capitalize'>"+ tabTitle +"</a></li>")
					$('.tab').hide()
					tabText = !!tabText? tabText : '' 
					$('#tabsText').append("<input class='tab' id='"+ tabTitle +"-input' size='15' type='text' style='margin-bottom: 5px; width: 50%;'>")
					$('#'+tabTitle+'-input').val(tabTitle)
					$('#'+tabTitle+'-input').on('focusout',function(){$("#"+tabTitle+"-tab").text($('#'+tabTitle+'-input').val())})
					$('#tabsText').append("<textarea class='tab' id='"+ tabTitle +"-textarea' rows='4' cols='50'>"+ tabText +"</textarea>")
					$("#"+tabTitle+"-tab").on('click',function(){
						$('.tablinks').removeClass('next-tab--is-active')
						$('.tab').hide()
						name = $(this).attr('name')
						$(this).addClass('next-tab--is-active')
						// $(name+"-textarea").before("<input class='tab' id='"+ tabTitle +"-input' size='15' type='text' style='margin-bottom: 5px; width: 50%;'>")
						// $('#'+tabTitle+'-input').val(this.text)
						$(name+"-textarea").show()
						$(name+"-input").show()
					})					
				}	

				$('.header__primary-actions input').on('click',function(){
					$('#rte-show-editor').click()
					if($('.tablinks').length){
						finalTabs = "<div id='tabs'><ul>"
						for(idx=0; idx<$('.tablinks').length; idx++){
							finalTabs = finalTabs.concat("<li><a href="+ $('.tablinks')[idx].name +" style='text-transform:capitalize'>"+ $('.tablinks')[idx].text +"</a></li>")
						}
						finalTabs = finalTabs.concat("</ul>")
						for(idx=0; idx<$('#tabsText')[0].children.length; idx++){
							finalTabs = finalTabs.concat("<div id='"+ $('#tabsText')[0].children[idx].id.split('-')[0] +"'>"+ $('textarea#'+$('#tabsText')[0].children[idx].id).val() +"</div>")
						}
						finalTabs = finalTabs.concat("</div>")
					}
					console.log(finalTabs)
					$('#product-description').val($('#product-description').val() + finalTabs)
					$('#rte-show-editor').click()
					$(':focus').blur()	
				})
							
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

				$('#rte-show-editor').click()
				currentVal = $('#product-description').val()
				fullDesc = $.parseHTML(currentVal)		
				return fullDesc
			})
			.then(function(fullDesc){
				while (idx < fullDesc.length && !tabsSection) {
					if (!!fullDesc[idx] && !!fullDesc[idx].id && fullDesc[idx].id == 'tabs') { tabsSection = fullDesc[idx]}
					idx++
				}
				return tabsSection
			})
			.then(function(tabsSection){
				withoutTabs = currentVal.replace(tabsSection.outerHTML,'')
				console.log(tabsSection)
				$('#product-description').val(withoutTabs)
				$('#rte-show-editor').click()
				$(':focus').blur()	
				idx = 0
				while (idx < tabsSection.children.length || !mainTabs) {
					if (tabsSection.children[idx].tagName == 'UL') {mainTabs = tabsSection.children[idx]}
					idx++
				}
				return mainTabs
			})
			.then(function(mainTabs){
				for(idx=0 ; idx<mainTabs.children.length ; idx++){
					tabName = mainTabs.children[idx].firstElementChild.text.toLowerCase()
					for(i=0 ; i<tabsSection.children.length ; i++){
						if (tabsSection.children[i].id == tabName) {
							initNewTab(tabName,tabsSection.children[i].innerHTML)
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
