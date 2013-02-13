jQuery.tagify
=============

A simple UI control to turn any text input into a "tagified" UI control.  The value of the input will be split on the specified delimiter and create one tag for each item in the list.

Installation
============

Include the jquery.tagify.js and jquery.tagify.css after you've included jQuery on the page.

    <script src='/path/to/jquery.tagify.js'></script>
    <link href='/path/to/jquery.tagify.css' rel="stylesheet" />

Usage
=====

Create a tagified UI control:

    $('#my_text_input').tagify();

Optionally you can pass to tagify an options object to control various aspects of tagify.  The available options are:

	{
		//the default class name for each tag
		className: 'tagify-tag', 

		//the delimiter the original input should be split on to create the tags
		delimiter: ',',

		//character codes that should trigger the "add" tag functions
		addNewDelimiter: [13, 44, 188, 32],

		//callback to be run immediately after a tag has been added
		addCb: $.noop,

		//callback to be run immediately after a tag has been removed 
		removeCb: $.noop,

		//the placeholder text for the tagify input
		placeholder: '',

		//a regex to validate tags against (currently does not )
		inputValidation: false,

		//button text for taggify button, if it's shown
		buttonText: 'go',

		//whether or not to show the button for the tagify input
		showButton: false,

		//should duplicate tags be removed?
		removeDupes: true,

		//preview puts the contents of the original input into the tagify input, useful for copying the string value that tagify is creating for you
		showPreviewIcon: false,

		//a title attribute for the preview icon
		previewTitle: 'Click to view the tag values as a string. Useful for copy / paste into other tagify inputs.'
	};

Examples
========

Show me a Tagify UI with:

* [no options](http://jsfiddle.net/dosl/7PxkD/)
* [a button for triggering add functions](http://jsfiddle.net/dosl/QrY8S/)
* [input validation](http://jsfiddle.net/dosl/4ENs4/)
* [placeholder text](http://jsfiddle.net/dosl/su4cL/)
* [add / remove callback functions](http://jsfiddle.net/dosl/pkwh3/)
* [a preview icon (useful for getting the string value of the original input)](http://jsfiddle.net/dosl/hRGYk/)