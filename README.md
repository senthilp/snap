#snap
snap is a JQuery plugin inspired from HTML5 [photobooth demo](http://html5-demos.appspot.com/static/getusermedia/photobooth.html) 
to make a DOM element snapable i.e. make the element camera enabled. It uses **navigator.getUserMedia** API for 
supported browsers to access the computer's camera and stream the data to video element. Users can then click a picture 
with the provided interface and that image is updated in the DOM element. If a server URL is provided then the image 
blob will also be posted to the server for saving and persistence.

For browsers which do not support navigator.getUserMedia API a default user avatar icon is displayed. The plugin also 
assumes that a body element is present in the page. Please refer to [index.html](https://github.com/senthilp/snap/blob/master/index.html) 
for a working demo.

**NOTE:** snap plugin depends on a small [**canvas-to-blob**](https://github.com/blueimp/JavaScript-Canvas-to-Blob) polyfill 
API for browsers which do not support the canvas element toBlob native function. The API is included in the plugin itself.

The snap plugin is pretty simple to invoke

    // Basic, without any options
    $('.avatar').snap();
    
    // Full loaded, with all options
    $('.avatar').snap({
      avatarIcon: "http://p.ebaystatic.com/aw/pics/s.gif",
      cameraIcon: "http://thumbs2.ebaystatic.com/pict/1907167068094040_1.jpg",
      dimension: 70,
      url: "/picman/upload.php",
      imageType: "image/png",
      callbacks: {
        successCallback: function() {
          $('.status').text('Image upload is successful');
        },
        failureCallback: function() {
          $('.status').text('Image upload failed');
        },
        progressCallback: function() {
          $('.status').text('Image upload WIP');
        }
      },	
      errorSelector: ".error", 
      errorMessage: "There was an error connecting to the camera",
      waitMessage: "Please wait..."
    });

##Options
###avatarIcon
**Optional**
<br/>
The user avatar icon to display for non supporting browsers, if not provided plugin uses [default](http://i.ebayimg.com/00/s/MTEyWDE1MA==/$T2eC16hHJHoE9n3KhWjoBQMcCKc!(w~~60_14.JPG) 
user icon 
###cameraIcon
**Optional**
<br/>
The camera icon to display for supporting browsers, If not provided plugin uses [default](http://i.ebayimg.com/00/s/NTc1WDU4MA==/$T2eC16Z,!ysE9sy0i2WDBQMcTZp8ew~~60_14.JPG) 
camera icon
###dimension
**Optional**
<br/>
The square dimension of the container element to be made snapable, default value 64px
###url
**Optional**
<br/>
The REST url end point to persist (save) the image
###imageType
**Optional**
<br/>
The type of the image, default value image/png
###callbacks
**Optional**
<br/>
a JSON for callbacks when the image is been uploaded to the server
###successCallback
**Optional**
<br/>
Success callback when the image is successfully uploaded
###failureCallback
**Optional**
<br/>
Failure callback when the image is upload fails
###progressCallback
**Optional**
<br/>
Progress callback to be executed when the image is being uploaded
###errorSelector
**Optional**
<br/>
The error DOM selector to be shown when an error occurs, default the error is shown in the container element
###errorMessage
**Optional**
<br/>
The error message to be displayed in the container when no errorSelector, default "Sorry, there was a problem connecting to camera"
###waitMessage
**Optional**
<br/>
the wait message to be alerted when user clicks to activate camera during a picture upload, default "Please wait until 
the save is complete"
