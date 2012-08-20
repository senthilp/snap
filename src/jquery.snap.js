/**
 * snap 
 *
 * Copyright 2012, Senthil Padmanabhan
 * Released under the MIT License
 * TODO
 * 1. remove webkit prefix
 * 2. test various scenarios
 * 3. arrow to indicate user to click yes for camera
 * 
 */
!function($, window){	
	// Mandating ECMAScript 5 strict mode
	"use strict";
	
	// Retrieving the native APIs
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
	window.URL = window.URL || window.webkitURL; 
	 
	var DEFAULT_AVATAR_ICON = 'http://i.ebayimg.com/00/s/MTEyWDE1MA==/$T2eC16hHJHoE9n3KhWjoBQMcCKc!(w~~60_14.JPG',
		DEFAULT_CAMERA_ICON = 'http://i.ebayimg.com/00/s/NTc1WDU4MA==/$T2eC16Z,!ysE9sy0i2WDBQMcTZp8ew~~60_14.JPG',
		DEFAULT_BIGGER_DIMENSION = 64, // The bigger dimension of the image
		// Creating a rondom number to append to ID newly created DOM nodes
		// avoids namespace conflicts
		RANDOM = Math.floor((Math.random() * 100)), 
		MASK_ID = 'mask' + RANDOM,
		VIDEO_CONTAINER_ID = 'vcon' + RANDOM,
		TEMPLATES = {
			mask: '<div id="' + MASK_ID + '" style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;background: #CCC;opacity: 0.4;z-index: 999;display: none;"></div>',
			videoContainer: '<div id="' + VIDEO_CONTAINER_ID + '" style="position: absolute;height: 400px; width: 500px;left: 50%;top: 25%;margin-left:-250px; background: #000;z-index: 9999;display: none;">'
							+ '<div style="position:relative">'
							+ '<span title="Close video" class="iclose" style="display:inline-block;position:absolute;top:11px;right:22px;cursor:pointer;color:red;font: bold 23px Arial,Helvetica,sans-serif;">X</span>'
							+ '<video style="padding: 10px 20px;width:460px;" autoplay title="Click camera below when ready"></video>'
							+ '<canvas style="display:none"></canvas>'
							+ '</div>'
							+ '<div style="position: absolute;bottom: 0;border: 1px solid #BBBBBB;height: 40px;width:99.7%;background-color: #D7D7D7;' 
							+ 'background: -webkit-linear-gradient(top, #FFFFFF, #D7D7D7);'
							+ 'background: -moz-linear-gradient(top, #FFFFFF, #D7D7D7);'
							+ 'background: -o-linear-gradient(top, #FFFFFF, #D7D7D7);'
							+ 'background: -ms-linear-gradient(top, #FFFFFF, #D7D7D7);'
							+ 'background: linear-gradient(top, #FFFFFF, #D7D7D7);">'
							+ '<div title="Click to snap" class="icam" style="cursor:pointer;width: 70px;height: 30px;margin: 4px auto;border: 1px solid #BBBBBB;border-radius: 15%;"></div>'							
							+ '</div>'
							+ '</div>'
		},
		ERROR_MSG = 'Sorry, there was a problem connecting to camera',
		// Variables to cache DOM
		maskJElem,
		videoContainerJElem,
		videoElem,
		canvasElem,
		canvasCtx;
	
	$.fn.extend({
		
		snap: function(config) {
			
			var n = navigator, // caching navigator object to enable minification
				lConfig = config || {}, // Caching locally
				avatarIcon = lConfig.avatarIcon || DEFAULT_AVATAR_ICON,
				cameraIcon = lConfig.cameraIcon || DEFAULT_CAMERA_ICON,
				errMsg = lConfig.errMsg || ERROR_MSG,
				getBackgroundStyle = function(imageUrl) {
					return 'url(\''+ imageUrl + '\') no-repeat 50% 50%';
				},
				/**
			     * Retrieves the background image size of the icon image based on the container dimensions 
			     * 
			     * @method getIconBgSizeStyle 
			     * @param {Object} jElem The jQuery DOM object of the main container
			     * @private
			     */					
				getIconBgSizeStyle = function(jElem) {
					var h,
						w,
						bigger, // Getting the bigger dimension
						isDefaultIcon = avatarIcon === DEFAULT_AVATAR_ICON || cameraIcon === DEFAULT_CAMERA_ICON, // Do calculations only if default icon
						sizeStyle = '';

					// If default icon size bigger than container then return the container size
					if(isDefaultIcon) {
						h = jElem.height();
						w = jElem.width();
						bigger = w > h?w: h; // Getting the bigger dimension
						// Set the calculated height & width as data attributes to avoid future reflow calculation
						jElem.data({h: h, w: w});
						if(DEFAULT_BIGGER_DIMENSION > bigger) {
							sizeStyle = 'background-size:' + bigger + 'px;';
						}
					}
					return sizeStyle;
				},
				hideVideo = function() {
					// Hide the mask & video container if available
					maskJElem && maskJElem.hide();
					videoContainerJElem && videoContainerJElem.hide();						
				},
				createMarkupAndBindEvents = function(stream, masterElem) {
					var videoContainerId = '#' + VIDEO_CONTAINER_ID,
					captureHandler = function() {
						// Hide the video
						hideVideo();
						// Capture the image
						capture(masterElem);
						// Stop the stream
						stream.stop();								
					},
					closeHandler = function() {
						// Hide the video
						hideVideo();
						// Stop the stream
						stream.stop();
					};					
					// create the mask and video elements if not present
					if(!maskJElem) {
						$('body').append(TEMPLATES.mask);
						maskJElem = $('#' + MASK_ID);
					}
					
					if(!videoContainerJElem) {
						$('body').append(TEMPLATES.videoContainer);
						videoContainerJElem = $(videoContainerId);
						videoElem = $(videoContainerId + ' video').get(0);
						canvasElem = $(videoContainerId + ' canvas').get(0);
						canvasCtx = canvasElem.getContext('2d');
						// Attach capture event
						$(videoContainerId + ' .icam').click(captureHandler);
						// Attach close event
						$(videoContainerId + ' .iclose').click(closeHandler);	
						// Attach esc event
						$(document).keydown(function(event){
							if(event.which === 27) {
								closeHandler();
							}
						});
					}					
				},
				/**
			     * Captures the current stream and creates an image 
			     * 
			     * @method capture 
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				capture = function(masterElem) {
					var masterJElem = $(masterElem),
						w = masterJElem.data('w') || masterJElem.width(), // Get it from data first
						// Creating a clone 
						// 1. This avoids reflows when setting the styles
						// 2. Events are un-bound
						masterJClone = masterJElem.clone(),											
						imgSrc;
					
					// Draw image from context
					canvasCtx.drawImage(videoElem, 0, 0);
					imgSrc = canvasElem.toDataURL('image/webp');

					// Set the style to have image as background
					masterJClone.css('background', getBackgroundStyle(imgSrc));
					masterJClone.css('background-size', w + 'px');
					masterJClone.css('cursor', 'auto');
					
					// Replace the clone with the main div
					masterJElem.replaceWith(masterJClone);					
				},
				/**
			     * Handle streaming errors
			     * 
			     * @method noStream 
			     * @param {stream} stream The video stream
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				noStream = function(err, masterElem) {
					// Hide the video layer
					hideVideo();
					
					// If user denied access just return without disabling the element
					if(err && err.code === 1) {
						return;
					}
					// Fill the error & update the master element
					$(masterElem).text(errMsg);
					$(masterElem).attr("style", "background: none; color: red; cursor: auto;");
				},			
				/**
			     * Streams camera to the vdieo elem 
			     * 
			     * @method gotStream 
			     * @param {stream} stream The video stream
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */													
				gotStream = function(stream, masterElem) {
					var timerObj,
						streamReady = function() {
							// Show the mask & video container
							maskJElem.show();
							videoContainerJElem.show();
							// Setting the canvas
							canvasElem.height = videoElem.videoHeight;
							canvasElem.width = videoElem.videoWidth;
						};
					
					// Create the DOM markup for mask, video overlay and canvas
					createMarkupAndBindEvents(stream, masterElem);	
						
					// Set the source of the video element
					if (window.URL) {
						videoElem.src = window.URL.createObjectURL(stream);
					} else {
						videoElem.src = stream; // Opera.
					}
						
					// Stop streaming if there is a video error
					videoElem.onerror = function(e) {
						stream.stop();
						noStream(videoElem.error, masterElem);
					};
					
					// If video ended, treat it as user stopped
					videoElem.onended = function(e) {
						stream.stop();
						noStream({code: 1}, masterElem);
					};

					videoElem.onloadedmetadata = function(e) { // Not firing in Chrome. See crbug.com/110938.
						streamReady();
					};

					// Since video.onloadedmetadata isn't firing for getUserMedia video, we have
					// to fake it.
					timerObj = setTimeout(function() {
						clearTimeout(timerObj);
						streamReady();
					}, 50);					
					
														
				},
				/**
			     * Initializes the camera to start streaming 
			     * 
			     * @method initCamera 
			     * 
			     * @private
			     */									
				initCamera = function() {
					var elem = this;
					n.getUserMedia({video: true}, function(stream) {
						gotStream(stream, elem);
					}, function(err) {						
						noStream(err, elem);
					});
				},
				/**
			     * Initializes the snap plugin 
			     * 
			     * @method init 
			     * @param {node} elem The DOM node to init snap
			     * 
			     * @private
			     */					
				init = function(jElem) {
					var icon = 'background:' + getBackgroundStyle(cameraIcon) + '; cursor:pointer;' + getIconBgSizeStyle(jElem); 
					
					// Setting the camera icon style
					jElem.attr('style', icon);

					// Attaching events
					jElem.click(initCamera);
				};
			
			return this.each(function() {
				var jElem = $(this);
				// Do feature deduction and if not avilable set auto-avatar and return
				if(typeof n.getUserMedia == "undefined") {					
					jElem.attr('style', 'background:' + getBackgroundStyle(avatarIcon) + ';' + getIconBgSizeStyle(jElem));
					return;
				}
				// Initinalize snap
				init(jElem);
			});
		}
	});
}(jQuery, window);