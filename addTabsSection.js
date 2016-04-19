var addTabsSection = function(){
	if (document.readyState == "complete") {
			if (!$('#shopify-tabs').length){
				$.get(chrome.extension.getURL('/product-tabs.html'),function(data){
					var addTabsTool = new Promise(function(resolve,reject){
						$('.next-grid--outer-grid:first-child > .next-grid__cell:first-child > .next-card:first-child')
							.after(data)
						$('#addTab').length ? resolve() : reject()
					})

					addTabsTool.then(function(){
						var tabsSection, mainTabs, tabNames = [], idx = 0
				   		var initNewTab = function(tabTitle,tabText){
							$('#addTab').before("<li><a class='tablinks next-tab' name='#"+tabTitle+"' id="+ tabTitle +"-tab>"+ tabTitle +"</a></li>")
							$('.tab').hide()
							tabText = !!tabText? tabText : '' 
							$('#tabsText').append("<textarea class='tab' id='"+ tabTitle +"-textarea' rows='4' cols='50'>"+ tabText +"</textarea>")
							$("#"+tabTitle+"-tab").on('click',function(){
								$('.tablinks').removeClass('next-tab--is-active')
								$('.tab').hide()
								name = $(this).attr('name')
								$(this).addClass('next-tab--is-active')
								$(name+"-textarea").show()
							})
						}

						var parseDesc = new Promise(function(resolve,reject){
									$('#rte-show-editor').click()
									var currentVal = $('#product-description').val()
									var fullDesc = $.parseHTML(currentVal)		
									!!fullDesc ? resolve(fullDesc) : reject();	
								})

								parseDesc.then(function(fullDesc){
									$('#rte-show-editor').click()
									$(':focus').blur()	
									var getTabsSection = new Promise(function(resolve,reject){
										while (idx < fullDesc.length && !tabsSection) {
											if (!!fullDesc[idx] && !!fullDesc[idx].id && fullDesc[idx].id == 'tabs') { tabsSection = fullDesc[idx]}
											idx++
										} 
										!!tabsSection ? resolve(tabsSection) : reject();
									})

									getTabsSection.then(function(tabsSection){
										var getMainTabs = new Promise(function(resolve,reject){
											idx = 0
											while (idx < tabsSection.children.length || !mainTabs) {
												if (tabsSection.children[idx].tagName == 'UL') {mainTabs = tabsSection.children[idx]}
												idx++
											}
											!!mainTabs ? resolve(mainTabs) : reject();
										})

										getMainTabs.then(function(mainTabs){
											for(idx=0 ; idx<mainTabs.children.length ; idx++){
												tabName = mainTabs.children[idx].firstElementChild.text.toLowerCase()
												for(i=0 ; i<tabsSection.children.length ; i++){
													if (tabsSection.children[i].id == tabName) {
														initNewTab(tabName,tabsSection.children[i].innerHTML)
													}
												}
											}
										})
									}, function(){
										console.log('product has no tabs')
									})

								})

						$('#addTab').on('click',function(){
							$('#addTab').before("<li><input id='newTab' size='15' type='text'></li>")
							$('#addTab').toggle()
							$('#newTab').focus()
							$('#newTab').on('focusout keypress',function(e){
							  if (e.type == 'focusout' || e.which == 13) {
								e.preventDefault()
								// TODO special characters as tab names
								if($('#newTab').val()){ initNewTab($('#newTab').val()) }
								$('#newTab').remove()
								$('#addTab').toggle()
							  }		
							})
						})
					})
				})
			}	
	}
}	

document.onreadystatechange = function(){
	addTabsSection()
}

addTabsSection()
