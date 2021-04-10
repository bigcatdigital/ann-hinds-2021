(function bcAppJS() {
	/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^bc" }]*/
	/* global Flickity */
	const debug = true; 

	console.log('WP Base Theme here');
	if (debug) {	
		console.log('Debug is go');
		console.log('===========');
		console.log('...');
	}
	
	/*** AJAX functions **/
	function bcAJAX(url, options) {
		if (options !== undefined) {
			return fetch(url, options);	
		} else {
			return fetch(url);
		}
	}
	function bcGetJSON(url, opts) {
		let options = {
			headers: {
				'Content-Type': 'application/json'
			}
		};
		if (opts) {
			options = Object.assign(options, opts);
		}
		return bcAJAX(url, options).then((data) => {
			return Promise.resolve(data);
		}).catch((err) => {
			return Promise.reject(err);
		});
	}
	
	/*** Utils */
	/*
		Use getBoundingClientRect to get the top and left offsets for an element - used with lerp scroll for the target argument value
		$el: the element whose offsets are required
	*/
	function bcGetOffset($el = document.querySelector('body')) {
		if (debug) {
			console.log(`bcGetOffset()`);	
			console.log(`-------------`);	
			console.log(`$el: ${$el}`);	
		}
		const elRect = $el.getBoundingClientRect();
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		
		return { top: elRect.top + scrollTop, left: elRect.left + scrollLeft };
	} 
	
	/*** Animation functions **/
	
	/*
		bcLerpScroll - scroll an element (usually the window) to some target target using linear interpolation
			en.wikipedia.org/wiki/Linear_interpolation
			
		return: null
		$el: and element to scroll
		pos: start position
		target: target position
		[speed]: scroll speed 
	*/
	//Liner interpolation
	if (debug) {
		var i = 0;	
	}
	function bcLerpScroll($el, pos, target, speed = 0.1) {
		if (debug) {
			console.log(`Lerp ${i}`); 
			console.log(`---------`);
			console.log(`$el: ${$el.classList} pos: ${pos} target: ${target} speed: ${speed}`);
		}
		let scrollOpts = {};
		//Scroll up
		if (Math.floor(target) > Math.floor(pos)) {
			if (debug) {
				console.log(`Scroll down`);
				console.log(`Pos: ${pos} Target: ${target}`);
				console.log(`Rounded Pos: ${Math.floor(pos)} Rounded Target: ${Math.floor(target)}`);
				console.log(`Pos - Target: ${(pos - target)}`);
			}
			pos += (target - pos) * speed; 
			if (debug) { 
				console.log(`${pos} ${target}`);
			}
			scrollOpts = {
				top: pos,
				left: 0,
				behavior: 'auto'
			};
			$el.scroll(scrollOpts);
			if (debug) {
				console.log(`${$el.scrollY}`); 
				i++;
			}
			requestAnimationFrame(() => {
				bcLerpScroll($el, pos, target); 
			});
		//Scroll up
		} else if (Math.floor(pos) > Math.floor(target)) {
			if (debug) {
				console.log(`Scroll up`);
				console.log(`${pos} ${target}`);
				console.log(`${(pos - target)}`);
			}
			pos -= (pos - target) * speed; 
			if (debug) {
				console.log(`${pos} ${target}`);	
			}
			scrollOpts = {
				top: pos,
				left: 0,
				behavior: 'auto'
			};
			$el.scroll(scrollOpts);
			if (debug) {
				console.log(`${$el.scrollY}`);
				i++;	
			}
			requestAnimationFrame(() => {
				bcLerpScroll($el, pos, target);
			});
		} else {
			if (debug) {
				console.log('Snap to target');
			}
			scrollOpts = {
				top: target,
				left: 0,
				behavior: 'auto'
			};
			$el.scroll(scrollOpts);
			if (debug) {
				console.log(`Target: ${target} Final position: ${$el.scrollY}`);
			}
			return;
		} 
	}//Lerp scroll
	/*
		bcAdjustHeight - adjust the height of an element to some target target using linear interpolation
		It is a show/hide function with a callback
		Wrapper for bcLearpHeight
			en.wikipedia.org/wiki/Linear_interpolation
			
		return: null
		[$el]: and element to show/hide
		[target]: target height
		[speed]: animation speed 
		[cb]: callback function
	*/
	function bcAdjustHeight($el, target, speed = 0.1, cb = null) {
		bcLerpHeight($el, target, speed) ;	
		function bcLerpHeight($el, target, speed = 0.1) {
			if (debug) {
				console.log(`$el height: ${$el.style.height}`); 
			}
			//the currrent el height
			let h = ($el.style.height !== '' && $el.style.height !== undefined ) ? parseFloat($el.style.height) : $el.clientHeight;
			if (debug) {
				if (i > 500) {
					return;
				}
				console.log(`Lerp ${i}`); 
				console.log(`---------`);
				console.log(`Height: ${h} Target: ${target}`);
				console.log(`Difference: ${(h - target)}`);
			}
			if (Math.floor(target) > Math.floor(h)) {
				if (debug) {
					console.log(`Target > Height`);
					console.log(`Raw height to add: ${(target - h) * speed}`); 
				}
				h += (target - h) * speed; 
				if (debug) { 
					console.log(`New height: ${h} Target: ${target}`);
				}
				$el.style.height = h + 'px';
				if (debug) {
					console.log(`Element style.height: ${$el.style.height}`);
					i++;
				}
				requestAnimationFrame(() => {
					bcLerpHeight($el, target, speed); 
				});
			} else if (Math.floor(h) > Math.floor(target)) {
				if (debug) {
					console.log(`Height > Target`);
					console.log(`Raw height to subtract: ${(h - target) * speed}`); 
				}
				h -= (h - target) * speed; 
				if (debug) {
					console.log(`New height: ${h} Target: ${target}`);	
				}
				$el.style.height = h + 'px';
				if (debug) {
					console.log(`${$el.style.height}`);
					i++;	
				}
				requestAnimationFrame(() => {
					bcLerpHeight($el, target, speed);
				});
			} else {
				//Snap to target height
				$el.style.height = target + 'px';
				return;
			} 
		}//Lerp scroll
		if (typeof cb === 'function') {
			cb();	
		}
		return;
	}//bcAdjustHeight
	
	
	/* 
		Scroll links
		For on page vertical scrolling
	*/
	if (debug) {
		console.log('Scroll links');
		console.log('------------');
	}
	const scrollLinks = Array.from(document.querySelectorAll('.bc-scroll-link'));
	if (debug) {
		console.log(`scrollLinks length: ${scrollLinks.length}`);
	}
	
	scrollLinks.forEach(($link) => {
		if (debug) {
			console.log($link);
		}
		if (document.getElementById($link.getAttribute('href').substr(1))) {
			$link.addEventListener('click', (evt) => {
				evt.preventDefault();
				const $scrollTargetEl = document.getElementById($link.getAttribute('href').substr(1));
				const scrollTarget = bcGetOffset($scrollTargetEl).top;
				bcLerpScroll(document.documentElement, document.documentElement.scrollTop, scrollTarget);		
			});
		}
		
	});
	/* Show/hide (accordion) components
	 * $el: element to show or hide
	 * target: element target height as an integer
	 * cb: a callback
	*/
	function bcShowHide($el, target, cb) {
		if (debug) {
			console.log('bcShowHide function, target height:');	
			console.log(target);	
		}
		target = Number.parseInt(target);
		$el.style.height = target + 'px';
		if (typeof cb === 'function') {
			$el.addEventListener('transitionend', () => {
				requestAnimationFrame(() => {
					cb();
				});	
				$el.removeEventListener('transitionend', arguments.callee);
			});	
		}
	}//bcShowHide()
	const showHideComponents = Array.from(document.querySelectorAll('.bc-show-hide'));
	if (debug){
		console.log(`Show/hide accordion components`);
		console.log(`--------------------`);
		console.log(`Length: ${showHideComponents.length}`);
	}
	showHideComponents.forEach(($showHideComponent, idx) => {
		if (debug) {
			console.log(`Accordion component #${idx + 1}:`);
			console.log($showHideComponent.classList);	
		}
		//Show hide toggles
		const showHideToggles = Array.from($showHideComponent.querySelectorAll('.bc-show-hide__toggle'));
		showHideToggles.forEach(($showHideToggle) => {
			const $showHideBody = $showHideToggle.nextElementSibling;
			//Accordion closer in the accordion body - always closes the body if it is open
			const $showHideBodyClose = $showHideBody.querySelector('.bc-show-hide__hide');
			$showHideBodyClose.addEventListener('click', () => {
				if ($showHideToggle.classList.contains('bc-is-active')) { 
					bcShowHide($showHideBody, 0);
					$showHideToggle.classList.remove('bc-is-active');
				}
			});
			if (debug) {
				console.log('Accordion body scrollHeight: ');
				console.log($showHideBody.scrollHeight);
				console.log('Accordion toggle classlist: ');
				console.log($showHideToggle.classList);
			}
			$showHideToggle.addEventListener('click', (evt) => {
				evt.preventDefault();
				if ($showHideToggle.classList.contains('bc-is-active')) {
					if (debug) {
						console.log('This accordion body is active.');
					}
					bcShowHide($showHideBody,  0);
					$showHideToggle.classList.remove('bc-is-active');
				} else {
					if (debug) {
						console.log('This accordion body is inactive.');
					}
					bcShowHide($showHideBody, $showHideBody.scrollHeight);	
					$showHideToggle.classList.add('bc-is-active');	
				}
			});
		});
	});
	
	/* Main site navigation */
	function mainNavigationSetup() {
		if (window.outerWidth >= 1024 ) {
			return true;
		}
		const $siteHeader = document.querySelector('.bc-site-header');
		const $siteHeaderMenuLink = document.querySelector('.bc-site-header__menu-link');
		const $siteHeaderMainNav = document.querySelector('.bc-site-header__main-navigation');
		if (($siteHeader && $siteHeader !== undefined) && ($siteHeaderMenuLink && $siteHeaderMenuLink !== undefined) && ($siteHeaderMainNav && $siteHeaderMainNav !== undefined)) {
			if (debug) {
				console.log(`Main navigation set up`);
				console.log(`----------------------`);
				
				console.log(`window.outerWidth is ${window.outerWidth}`);
			}
		}
		$siteHeaderMenuLink.addEventListener('click', (evt) => {
			evt.preventDefault();
			$siteHeader.classList.toggle('bc-is-active'); 
		});
		
	}//mainNavigationSetup()
	mainNavigationSetup();
	
	/* Flickity Sliders */
	const $bcFlkSliders = document.querySelectorAll('.bc-flickity');
	function setUpSliders (sliders) {
		Array.from(sliders).forEach(($bcFlkSlider, idx) => {
			if (debug) {
				console.log(`Sliders foreach`);
				console.log(`Sliders idx: ${idx}`);
			}
			const sliderType = ($bcFlkSlider.classList.contains('bc-flickity--text-slider')) ? 'text-slider' : ($bcFlkSlider.classList.contains('bc-flickity--card-slider')) ? 'card-slider' : 'video-slider'; 
			if (debug) {
				console.log(`Slider type: ${sliderType}`);
			}
			
			const flkSlider = new Flickity($bcFlkSlider, {
				adaptiveHeight: (sliderType === 'text-slider' ) ? true : false,
				cellAlign: (sliderType === 'card-slider' ) ? 'left' : 'center',
				groupCells: true
			});
			flkSlider.select(0);
			//const $button = $bcFlkSlider.querySelector('.flickity-button');
			
			flkSlider.on('change', () => {
				
				const videoSlides = $bcFlkSlider.querySelectorAll('.bc-flickity__slide--video');
				
				if (videoSlides && videoSlides.length > 0) {
					Array.from(videoSlides).forEach((slide) => {
						slide.querySelector('iframe').stopVideo();
					});
				}
			});
		});//end foreach bcFlkSliders
	}//end setUpSliders()
	if ($bcFlkSliders &&  $bcFlkSliders.length > 0) {
		if (debug) {
			console.log('Flickity slider set up.');
			console.log('-----------------------');
			console.log(`$bcFlkSliders length is ${$bcFlkSliders.length}`);
		}
		setUpSliders($bcFlkSliders);
		
		window.addEventListener('resize', () => {
			setUpSliders($bcFlkSliders);
		});
		
	}//end if $bcFlkSliders
	
	/* Custom -- services - corporate/individual - homepage */
	if (debug) {
		console.log('');
		console.log('Services component');
		console.log('------------------');
	}
	const $ahServices = Array.from(document.querySelectorAll('.ah-corporate-individual'));
	if ($ahServices.length > 0) {
		$ahServices.forEach(($ahService) => {
			/* Set up the images - array and current active image ID */
			const serviceImages = Array.from($ahService.querySelectorAll('.ah-corporate-individual__image'));
			if (debug) {
				console.log(`Services images array length: ${serviceImages.length}`); 
			}
			if (serviceImages <= 0) {
				return;
			}
			
			function _getNewServiceImage(serviceId) {
				if (debug) {
					console.log(`Get new service image function. Service image id: ${serviceId}`); 
				}
				return serviceImages.find(($serviceImage) => {
					return $serviceImage.getAttribute('id') === serviceId && $serviceImage.classList.contains('is-active') === false;	
				});	
			}
			/* The service triggers - on hover */
			if (debug) {
				console.log(`Set up image change triggers`); 
			}
			const serviceTriggers = Array.from($ahService.querySelectorAll('.ah-corporate-individual__trigger'));
			if (debug) {
				console.log(`Service triggers length: ${serviceTriggers.length}`); 
			}
			if (serviceTriggers.length > 0) {
				let $activeServiceTrigger = null;
				let $activeServiceImage = null;
				let $servicesNextSibling = null;
				let $servicesPrevSibling = null;
				
				serviceTriggers.forEach(($serviceTrigger, idx) => {
					if (idx < 1) {
						$servicesNextSibling = $serviceTrigger.closest('.bc-container').nextElementSibling;
						$servicesPrevSibling = $serviceTrigger.closest('.bc-container').previousElementSibling;	
						if (debug) {
							console.log('Next, prev siblings:');
							console.log($servicesNextSibling);
							console.log($servicesPrevSibling);	
						}
					}
					$serviceTrigger.addEventListener('mouseover', (evt) => { 
						evt.stopPropagation();
						if (debug) {
							console.log('-- Trigger mouseover handler');
						}
						const $thisTrigger = evt.currentTarget;
						const serviceID = $thisTrigger.dataset.service;
						if (debug) {
							console.log('This trigger: '+$thisTrigger);
						}
						if ($thisTrigger.classList.contains('is-active')) {
							if (debug) {
								console.log('Trigger is active, return script.');
							}
							return;
						}
						$activeServiceImage = serviceImages.find(($serviceImage) => {
							return $serviceImage.classList.contains('is-active') && $serviceImage.getAttribute('id') !== serviceID;	
						});	
						if (debug) {
							console.log(`Find currently active service image in serviceImages array:`);
							console.log($activeServiceImage);
						}
						if ($activeServiceImage === undefined) {
							return;
						}
						$activeServiceImage.classList.remove('is-active');	
						if ($activeServiceTrigger) {
							if (debug) {
								console.log(`If there's an active service trigger remove the active class.`);
							}
							$activeServiceTrigger.classList.remove('is-active');
							if (debug) {
								console.log(`Active trigger classList: ${$activeServiceTrigger.classList}`);
							}
						}
						const $newServiceImage = _getNewServiceImage(serviceID);
						if (debug) {
							console.log(`Get the new active image:`);
							console.log($newServiceImage);
						}
						
						$newServiceImage.classList.add('is-active');
						if (debug) {
							console.log(`Add active class to new active image: ${$newServiceImage.classList}`);
						}
						$thisTrigger.classList.add('is-active');
						if (debug) {
							console.log(`Add active class to new active trigger. Class list: ${$thisTrigger.classList}`);
						}
						$activeServiceImage = $newServiceImage;
						$activeServiceTrigger = $thisTrigger;
						if (debug) {
							console.log(`Set new active trigger as the current active trigger: ${$activeServiceTrigger}`);
							console.log($activeServiceTrigger);
							console.log(`Set new active image as the current active image:`);
							console.log($activeServiceImage);
						}
					});// This $serviceTrigger mouseover
					function _clearActiveFilter() {
						if ($activeServiceTrigger) {
							if (debug) {
								console.log(`Clear active trigger:`);
								console.log(`${$activeServiceTrigger}`);
							}
							$activeServiceTrigger.classList.remove('is-active');
						}
					}
					$servicesNextSibling.addEventListener('mouseover', (evt) => {
						evt.stopPropagation();
						_clearActiveFilter();
					});
					$servicesPrevSibling.addEventListener('mouseover', (evt) => {
						evt.stopPropagation();
						_clearActiveFilter();
					});
					//$servicesPrevSibling
					
				});// serviceTriggers for each
			}// end if serviceTriggers
		});// end $ahServices for each
	}//end if $ahServices is > 0
	
	
	/* On resize functions */
	window.addEventListener('resize', () => {
		mainNavigationSetup();
	});
	
	
})(window);
/* App.js */

