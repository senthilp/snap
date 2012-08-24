#snap
snap is a JQuery plugin inspired from HTML5 [photobooth demo](http://html5-demos.appspot.com/static/getusermedia/photobooth.html) 
to make a DOM element snapable i.e. make the element camera enabled. It uses **navigator.getUserMedia** API for 
supported browsers to access the computer's camera and stream the data to video element. Users can then click a picture 
with the provided interface and that image is updated in the DOM element. If a server URL is provided then the image 
blob will also be posted to the server for saving and persistence.

For browsers which do not support navigator.getUserMedia API a default user avatar icon is displayed. The plugin also 
assumes that a body element is present in the page. Please refer to [index.html]()https://github.com/senthilp/snap/blob/master/index.html 
for a working demo.

**NOTE:** snap plugin depends on a small [**canvas-to-blob**](https://github.com/blueimp/JavaScript-Canvas-to-Blob) polyfill 
API for browsers which do not support the canvas element toBlob native function. The API is included in the plugin itself.
