# angular.dotdotdot

Based jQuery.dotdotdot, this angular directive tried to port many of the features of it avoiding jQuery lib.
For is completed to personal success. In future hope some people helps to check everything on it and will
be really appreciated(coffee script preferred).

Here is presented the original doc.

## jQuery.dotdotdot

A jQuery plugin for advanced cross-browser ellipsis on multiple line content.<br />
Demo's and documentation: http://dotdotdot.frebsite.nl

<img src="http://dotdotdot.frebsite.nl/img/preview.png" width="100%" border="0" />

### How to use the plugin
Include all nessesary .js-files inside the head-tag of the page.

```html
<head>
    <script src="jquery.js" type="text/javascript"></script>
    <script src="jquery.dotdotdot.js" type="text/javascript"></script>
</head>
```

Create a DOM element and put some text and other HTML markup in this "wrapper".

```html
<div id="wrapper">
    <p>Lorem Ipsum is simply dummy text.</p>
</div>
```

Fire the plugin onDocumentReady using the wrapper-selector.

```javascript
$(document).ready(function() {
    $("#wrapper").dotdotdot({
        // configuration goes here
    });
});
```

### More info
Please visit http://dotdotdot.frebsite.nl

### Licence
The jQuery.dotdotdot plugin is licensed under the MIT license:
http://en.wikipedia.org/wiki/MIT_License