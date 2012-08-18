/**
 * snap 
 *
 * Copyright 2012, Senthil Padmanabhan
 * Released under the MIT License
 */
!function($, window){	
	// Mandating ECMAScript 5 strict mode
	"use strict";
	
	// Retrieving the native APIs
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
	window.URL = window.URL || window.webkitURL; 
	
	// TODO change these to image URLs 
	var DEFAULT_AVATAR_ICON = 'data:image/jpeg;base64,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',
		DEFAULT_CAMERA_ICON = 'data:image/jpeg;base64,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',
		// Creating a rondom number to append to ID newly created DOM nodes
		// avoids namespace conflicts
		RANDOM = Math.floor((Math.random() * 100)), 
		MASK_ID = 'mask' + RANDOM,
		VIDEO_CONTAINER_ID = 'vcon' + RANDOM,
		TEMPLATES = {
			mask: '<div id="' + MASK_ID + '" style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;background: #CCC;opacity: 0.4;z-index: 999;display: none;"></div>',
			videoContainer: '<div id="' + VIDEO_CONTAINER_ID + '" style="position: absolute;left: 25%;top: 25%;background: #000;z-index: 9999;display: none;">'
							+ '<div style="position:relative">'
							+ '<video style="height: 350px;width: 470px;padding: 10px 20px;" autoplay title="Click camera below when ready"></video>'
							+ '<canvas style="display:none"></canvas>'
							+ '</div></div>'
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
				errMsg = lConfig.errMsg || ERROR_MSG,
				getBackgroundStyle = function(imageUrl) {
					return 'url(\''+ imageUrl + '\') no-repeat 50% 50%';
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
						$(videoElem).click(captureHandler);
						// Attach close event
						$(videoElem).click(closeHandler);	
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
					// Draw image from context
					canvasCtx.drawImage(videoElem, 0, 0);
					// Set the source of the master elem
					$(masterElem).css('background', 'none');
					$(masterElem).html('<img src="' + canvasElem.toDataURL('image/webp') + '" height="' + $(masterElem).height() + '" width="' + $(masterElem).width() + '"/>');
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
					var that = this;
					n.getUserMedia({video: true}, function(stream) {
						gotStream(stream, that);
					}, function(err) {						
						noStream(err, that);
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
				init = function(elem) {
					var jElem = $(elem),
						cameraIcon = 'background:' + getBackgroundStyle(DEFAULT_CAMERA_ICON) + '; cursor:pointer;';
					
					// Setting the camera icon style
					jElem.attr('style', cameraIcon);

					// Attaching events
					jElem.click(initCamera);
				};
			
			return this.each(function() {
				// Do feature deduction and if not avilable set auto-avatar and return
				if(typeof n.getUserMedia == "undefined") {
					$(this).css('background', getBackgroundStyle(DEFAULT_AVATAR_ICON));
					return;
				}
				// Initinalize snap
				init(this);
			});
		}
	});
}(jQuery, window);