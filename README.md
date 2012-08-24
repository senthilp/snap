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
      errorMessage: "There was an error connecting to the camera"
      waitMessage: "Please wait..."
    });
