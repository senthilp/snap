/**
 * snap 
 *
 * Copyright 2012, Senthil Padmanabhan
 * Released under the MIT License
 *
 * snap is a JQuery plugin inspired from HTML5 photobooth demo 
 * http://html5-demos.appspot.com/static/getusermedia/photobooth.html to 
 * make a DOM element snapable i.e. make the element camera enabled. 
 * 
 * It uses navigator.getUserMedia API for supported browsers to access the 
 * computer's camera and stream the data to video element. Users can then 
 * click a picture with the provided interface and that image is updated in
 * the DOM element. If a server URL is provided then the image blob will 
 * also be posted to the server for saving and persistence.
 * 
 * For browsers which do not support navigator.getUserMedia API a default
 * user avatar icon is displayed. The plugin also assumes that a body element 
 * is present in the page. 
 * 
 * NOTE: snap plugin depends on a small canvas-to-blob polyfill API 
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob for browsers which
 * do not support the canvas element toBlob native function. The API is included 
 * in the plugin itself.
 * 
 * Please refer index.html for a working demo
 * 
 * The various options of the plugin.   
 * 
 *	{
 * 		avatarIcon: "http://p.ebaystatic.com/aw/pics/s.gif", // Optional, the user avatar icon to display for non supporting browsers
 * 															 // If not provided plugin uses default user icon http://i.ebayimg.com/00/s/MTEyWDE1MA==/$T2eC16hHJHoE9n3KhWjoBQMcCKc!(w~~60_14.JPG	 
 *		cameraIcon: "http://thumbs2.ebaystatic.com/pict/1907167068094040_1.jpg", // Optional, the camera icon to display for supporting browsers
 *															// If not provided plugin uses default camera icon http://i.ebayimg.com/00/s/NTc1WDU4MA==/$T2eC16Z,!ysE9sy0i2WDBQMcTZp8ew~~60_14.JPG
 * 		dimension: 70, // Optional, the square dimension of the container element to be made snapable - default value 64px
 *		url: "/picman/upload.php", // Optional, the REST url end point to persist (save) the image
 *		imageType: "image/png", // Optional, the type of the image - default value image/png
 *		callbacks: { // Optional, a JSON for callbacks when the image is been uploaded to the server
 *			successCallback: function() { // Optional, success callback when the image is successfully uploaded
 *				$('.status').text('Image upload is successful');
 *			},
 *			failureCallback: function() { // Optional, failure callback when the image is upload fails
 *				$('.status').text('Image upload failed');
 *			},				
 *			progressCallback: function() { // Optional, progress callback to be executed when the image is being uploaded
 *				$('.status').text('Image upload WIP');
 *			}
 *		},	
 *		errorSelector: ".error", // Optional, the error DOM selector to be shown when an error occurs - default the error is shown in the container element
 *      errorMessage: "There was an error connecting to the camera", // Optional, the error message to be displayed in the container when no errorSelector 
 *      															 // default - Sorry, there was a problem connecting to camera 
 *		waitMessage: "Please wait..." // Optional, the wait message to be alerted when user clicks to activate camera during a picture upload
 *									  // default - Please wait until the save is complete
 *	}
 *	
 */

/*
* JavaScript Canvas to Blob API needed for SNAP
* https://github.com/blueimp/JavaScript-Canvas-to-Blob
*
* Copyright 2012, Sebastian Tschan
* https://blueimp.net
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/MIT
*
*/

(function (window) {
    'use strict';
    var CanvasPrototype = window.HTMLCanvasElement &&
            window.HTMLCanvasElement.prototype,
        hasBlobConstructor = function () {
                try {
                    return !!new Blob();
                } catch (e) {
                    return false;
                }
            }(),
        BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
            window.MozBlobBuilder || window.MSBlobBuilder,
        dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob &&
            window.ArrayBuffer && window.Uint8Array && function (dataURI) {
                var byteString,
                    arrayBuffer,
                    intArray,
                    i,
                    bb,
                    mimeString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                    // Convert base64 to raw binary data held in a string:
                    byteString = atob(dataURI.split(',')[1]);
                } else {
                    // Convert base64/URLEncoded data component to raw binary data:
                    byteString = decodeURIComponent(dataURI.split(',')[1]);
                }
                // Write the bytes of the string to an ArrayBuffer:
                arrayBuffer = new ArrayBuffer(byteString.length);
                intArray = new Uint8Array(arrayBuffer);
                for (i = 0; i < byteString.length; i += 1) {
                    intArray[i] = byteString.charCodeAt(i);
                }
                // Separate out the mime component:
                mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                // Write the ArrayBuffer to a blob:
                if (hasBlobConstructor) {
                    return new Blob([arrayBuffer], {type: mimeString});
                }
                bb = new BlobBuilder();
                bb.append(arrayBuffer);
                return bb.getBlob(mimeString);
            };
    if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
        if (CanvasPrototype.mozGetAsFile) {
            CanvasPrototype.toBlob = function (callback, type) {
                callback(this.mozGetAsFile('blob', type));
            };
        } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
            CanvasPrototype.toBlob = function (callback, type) {
                callback(dataURLtoBlob(this.toDataURL(type)));
            };
        }
    }
    if (typeof define !== 'undefined' && define.amd) {
        define(function () {
            return dataURLtoBlob;
        });
    } else {
        window.dataURLtoBlob = dataURLtoBlob;
    }
}(this));

/**
 * snap plugin code Starts
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
		IMAGE_TYPE = 'image/png',
		/**
	     * A static utility function which replaces %p of the provided string with vendor prefixes  
	     * 
	     * @method PREFIXED 
	     * @param {String} style The style string which should be vendor prefixed
	     * @private
	     */			
		PREFIXED = function(style) {
			var prefixedStyle = [];
			// Check for forEach API first
			if(typeof prefixedStyle.forEach == 'undefined') {
				prefixedStyle.push(style.replace(/%p/g, ''));
				return prefixedStyle.join('');	
			}
			['-webkit-', '-moz-', '-o-', '-ms-', ''].forEach(function(prefix) {
				prefixedStyle.push(style.replace(/%p/g, prefix));
			});
			return prefixedStyle.join('');
		},
		// Creating a rondom number to append to ID newly created DOM nodes
		// avoids namespace conflicts
		RANDOM = Math.floor((Math.random() * 100)), 
		MASK_ID = 'mask' + RANDOM,
		VIDEO_CONTAINER_ID = 'vcon' + RANDOM,
		TEMPLATES = {
			mask: '<div id="' + MASK_ID + '" style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;background: #EEE;opacity: 0.6;z-index: 999;display: none;">' 
					+ '<div style="position:absolute;top:50%;left:50%;margin:-23px 0 0 -135px;color:#D52A33;font-weight:bold;font-size:23px;">Please allow camera access.</div>'
					+ '</div>',
			videoContainer: '<div id="' + VIDEO_CONTAINER_ID + '" style="position: absolute;height: 400px; width: 500px;left: 50%;top: 25%;margin-left:-250px; background: #000;z-index: 9999;display: none;">'
							+ '<div style="position:relative">'
							+ '<span title="Close video" class="iclose" style="display:inline-block;position:absolute;top:11px;right:22px;cursor:pointer;color:red;font: bold 23px Arial,Helvetica,sans-serif;">X</span>'
							+ '<video style="padding: 10px 20px;width:460px;" autoplay title="Click camera below when ready"></video>'
							+ '<canvas style="display:none"></canvas>'
							+ '</div>'
							+ '<div style="position: absolute;bottom: 0;border: 1px solid #BBBBBB;height: 50px;width:99.7%;background-color: #D7D7D7;' + PREFIXED('background: %plinear-gradient(top, #FFFFFF, #D7D7D7);') + '">' 
							+ '<div title="Click to snap" class="icam" style="cursor:pointer;width: 60px;height: 40px;margin: 4px auto;border: 1px solid #BBBBBB;border-radius: 15%;">'
							+ '<div style="background: #000;width:20px;height:5px;margin: 5px auto 0;"></div><div style="width:40px;height:15px;background:#000;margin:0 auto 5px;padding: 5px 0;"><div style="background: #FFF;border-radius: 50%;width: 23px;height:15px;margin: 0 auto;"></div></div>'
							+ '</div>'							
							+ '</div>'
							+ '</div>'
		},
		ERROR_MSG = 'Sorry, there was a problem connecting to camera',
		WAIT_MSG = 'Please wait until the save is complete',
		// Variables to cache DOM
		maskJElem,
		videoContainerJElem,
		videoElem,
		canvasElem,
		canvasCtx,
		// A boolean flag to hold the save state of the plugin
		isSaving = false;
	
	$.fn.extend({
		
		snap: function(config) {
			
			var n = navigator, // caching navigator object to enable minification
				lConfig = config || {}, // Caching locally
				avatarIcon = lConfig.avatarIcon || DEFAULT_AVATAR_ICON,
				cameraIcon = lConfig.cameraIcon || DEFAULT_CAMERA_ICON,
				errorMessage = lConfig.errorMessage || ERROR_MSG,
				waitMsg = lConfig.waitMessage || WAIT_MSG,
				errorSelector = lConfig.errorSelector,
				dimension = lConfig.dimension || DEFAULT_BIGGER_DIMENSION,
				callbacks = lConfig.callbacks,
				successCallback = callbacks && callbacks.successCallback,
				failureCallback = callbacks && callbacks.failureCallback,
				progressCallback = callbacks && callbacks.progressCallback,
				url = window.dataURLtoBlob && lConfig.url, // Check if blob supported
				imageType = lConfig.imageType || IMAGE_TYPE,
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
					var h = jElem.height(),
						w = jElem.width(),
						bigger, // Getting the bigger dimension
						isDefaultIcon = avatarIcon === DEFAULT_AVATAR_ICON 
										|| cameraIcon === DEFAULT_CAMERA_ICON
										|| h === 0
										|| w === 0, // Do calculations only if default icon or height/width is 0
						sizeStyle = '';

					// If default icon size bigger than container then return the container size
					if(isDefaultIcon) {
						if(h <= 0 || w <= 0) { // Checking <= 0, since sometimes h or w comes negative
							h = w = dimension;
							sizeStyle += 'height:' + h + 'px; width:' + w + 'px;';
						}
						bigger = w > h?w: h; // Getting the bigger dimension
						if(DEFAULT_BIGGER_DIMENSION >= bigger) {
							sizeStyle += 'background-size:' + bigger + 'px;';
						}
					}
					// Set the calculated height & width as data attributes to avoid future reflow calculation
					jElem.data({h: h, w: w});					
					return sizeStyle;
				},
				hideVideo = function() {
					// Hide the mask & video container if available
					maskJElem && maskJElem.hide();
					if(videoContainerJElem){
						videoContainerJElem.hide();
						// Detaching the events
						videoContainerJElem.undelegate('click');
						$(document).undelegate('.snapvideo');
					} 						
				},
				createMask = function() {
					// create the mask element if not present
					if(!maskJElem) {
						$('body').append(TEMPLATES.mask);
						maskJElem = $('#' + MASK_ID);
					}								
					maskJElem.show();
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
					// create the video element if not present
					if(!videoContainerJElem) {
						$('body').append(TEMPLATES.videoContainer);
						videoContainerJElem = $(videoContainerId);
						videoElem = $(videoContainerId + ' video').get(0);
						canvasElem = $(videoContainerId + ' canvas').get(0);
						canvasCtx = canvasElem.getContext('2d');						
					}
					// Attach events - this has to be done everytime to bind events to the actual master element
					// Attach capture event
					videoContainerJElem.delegate(videoContainerId + ' .icam', 'click', captureHandler);
					// Attach close event
					videoContainerJElem.delegate(videoContainerId + ' .iclose', 'click', closeHandler);		
					// Attach esc event
					$(document).delegate('body', 'keydown.snapvideo', function(event){
						if(event.which === 27) {
							closeHandler();
						}
					});										
				},
				/**
			     * Saves the image to the server with the provided URL and updates the 
			     * image in the masterElem   
			     * 
			     * @method save 
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				save = function(masterElem) {
					var xhr = new XMLHttpRequest(),
						fileName = 'avatar';
							        
			        xhr.onreadystatechange = function(){
			            if (xhr.readyState == 4){
			            	// Reset save state
			            	isSaving = false;
			            	if (xhr.status == 200){	            		
			            		updateImage(masterElem);
			            		// Call success callback if given
			            		successCallback && successCallback();
			            	} else {
			            		noStream({message: 'Call to upload service ' + url + ' failed'}, masterElem);
			            		// Call failure callback if given
			            		failureCallback && failureCallback(); 
			            	}
			            }
			        };	
			        
			        xhr.open("POST", url + "?picfile=" + fileName, true);
			        // Headers for file upload
			        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			        xhr.setRequestHeader("X-File-Name", encodeURIComponent(fileName));
			        xhr.setRequestHeader("Content-Type", "application/octet-stream");	        
			        canvasElem.toBlob(function(blob) {
			        	xhr.send(blob);
			        }, imageType);		
			        
			        // Call progress callback if given
			        if(progressCallback) {
			        	progressCallback();
			        } else {
				        // Update progress status
				        updateText(masterElem, 'Saving...');	
			        }
			        // Set isSaving to true
			        isSaving = true;			        
				},
				/**
			     * Captures the current image from current stream, saves if needed 
			     * and updates the master element with the captured image  
			     * 
			     * @method capture 
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				capture = function(masterElem) {					
					// unbinding click event
					$(masterElem).unbind('click', initCamera);
					// Draw image from context
					canvasCtx.drawImage(videoElem, 0, 0);
					// Check if persistence is needed and save the image
					if(url) {
						save(masterElem);
					} else { 
						updateImage(masterElem);
					}
				},
				/**
			     * Updates the image in the master element 
			     * 
			     * @method updateImage 
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				updateImage = function(masterElem) {
					var masterJElem = $(masterElem),
						w = masterJElem.data('w') || masterJElem.width(), // Get it from data first
						// Creating a clone 
						// 1. This avoids reflows when setting the styles
						// 2. Events are un-bound
						masterJClone = masterJElem.clone(), // deep clone											
						imgSrc;
					
					// Set the image src to the DataUrl
					imgSrc = canvasElem.toDataURL(imageType);

					// Set the style to have image as background
					masterJClone.css('background', getBackgroundStyle(imgSrc));
					masterJClone.css('background-size', w + 'px');
					// Empty text if any
					masterJClone.text('');
					// Attaching click handler
					masterJClone.click(initCamera);
					
					// Replace the clone with the main div
					masterJElem.replaceWith(masterJClone);
				},
				/**
			     * Handle streaming errors
			     * 
			     * @method updateText 
			     * @param {Node} elem The DOM element whic needs to be updated
			     * @param {String} text The text to be displayed
			     * @param {Boolean} isError Flag to indicate is this is error message
			     *  
			     * @private
			     */				
				updateText = function(elem, text, isError) {
					var jElem = $(elem);
					jElem.text(text);
					jElem.css('background', 'none');
					jElem.css('cursor', 'pointer');
					isError && jElem.css('color', 'red');
				},
				/**
			     * Handle streaming errors
			     * 
			     * @method noStream 
			     * @param {Object} err The error object
			     * @param {node} masterElem The master DOM node which initiated the snap
			     * @private
			     */						
				noStream = function(err, masterElem) {
					// Hide the video layer
					hideVideo();
					
					// If user denied access just return without disabling the element
					// Error handling codes not fully implemented by browsers
					if(err && err.code === 1) {
						// TODO
					}
					if(errorSelector) {
						$(errorSelector).show();
					} else {
						// Fill the error & update the master element
						updateText(masterElem, err.message || errorMessage, true)
					}
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
					
					// Creating a dummy stop function on stream to avoid Opera errors
					if(!stream.stop) { 
						stream.stop = function() {}; // Opera
					}
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
						noStream(e, masterElem);
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
					// First Check if any save in progress
					if(isSaving) {
						alert(waitMsg);
						return;
					}					
					var elem = this;
					// Show the mask to indicate user to grant camera access 
					createMask();
					// Hide the error selector in case it is already displayed
					errorSelector && $(errorSelector).hide();
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