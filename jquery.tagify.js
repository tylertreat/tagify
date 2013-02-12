(function ($) {
	/*jshint validthis:true */

	'use strict';

	/**
	 * The entry point to our jquery plugin.  This gets attached to $.fn 
	 * and is called with $('.someSelector').tagify({..opts...})
	 * @param  {jQuery} $originalInput  A jQuery object of our original input
	 * @param  {object} options         An object with custom options
	 * @return {undefined}              Returns nothing.
	 */
	function Tagify($originalInput, options) {
		var regexType;
		var regex;
		var defaultOptions = {
			className: 'tagify-tag',
			delimiter: ',',
			addNewDelimiter: [13, 44, 188, 32],
			addCb: $.noop,
			removeCb: $.noop,
			placeholder: '',
			inputValidation: false,
			validationMessage: 'Improper input type.  Please check the input and try again.',
			buttonText: 'go',
			showButton: false,
			removeDupes: true,
			showPreviewIcon: false,
			previewTitle: 'Click to view the tag values as a string. Useful for copy / paste into other tagify inputs.'
		};

		//create the options for this instance of tagify
		this.opts = $.extend(defaultOptions, options || {});

		//normalize inputValidation to a regex
		if (this.opts.inputValidation) {
			regexType = $.type(this.opts.inputValidation);

			if (regexType === 'string') {
				regex = new RegExp(this.opts.inputValidation);
			} else if (regexType === 'regexp') {
				regex = this.opts.inputValidation;
			} else {
				regex = null;
			}
		
			this.inputValidation = regex;	
		}
		
		//ensure the callbacks are functions
		if (! $.isFunction(this.opts.addCb)) {
			this.opts.addCb = $.noop;
		}

		if (! $.isFunction(this.opts.removeCb)) {
			this.opts.removeCb = $.noop;
		}

		//some instance variables
		this.$originalInput = $originalInput;
		this._tagValues = [];
		this._tagList = this.splitter(this.$originalInput.val(), this._tagValues);
		this.$tagify = this.createTagifyView();
		this.updateOriginalInput();

		//dom manipulation
		this.$originalInput.hide();
		this.$tagify.insertAfter(this.$originalInput);

		//event bindings for tagify.
		this.addEvents();
	}

	/**
	 * splitter is a helper function for taking some content,
	 * splitting by a specified delimiter, and tracking the
	 * values for future interogation (like removing dupes).
	 * @param  {string} content    A opts.delimter delimited string (emails)
	 * @return {object}            Returns an object with the tag and it's validity
	 */
	Tagify.prototype.splitter = function splitter(content) {
		if (! content) {
			return [];
		}

		var me = this;
		var tags = content.split(this.opts.delimiter);
		var useValidation = me.opts.inputValidation;

		return $.map(tags, function (t, idx) {
			var invalid;

			t = $.trim(t);

			if (! t) {
				return;
			}

			if (me.opts.removeDupes) {
				if ($.inArray(t, me._tagValues) !== -1) {
					//it's a tag that's already been seen, so do not add it.
					return;
				}
			}

			if (useValidation) {
				invalid = ! useValidation.test(t);
			}

			//track this value
			me._tagValues.push(t);

			return {
				tag: t,
				invalid: invalid
			};
		});
	};

	/**
	 * Update an input based on the current _tagList
	 * @return {undefined}             Returns nothing
	 */
	Tagify.prototype.updateOriginalInput = function updateOriginalInput() {
		this.$originalInput.val($.map(this._tagList, function (tagObj) {
			return tagObj.tag;
		}).join(' '));
	};

	/**
	 * The tagify input is responsible for allowing a user to enter
	 * new tags, and get to the string representation for the input.
	 * @return {jQuery}         Returns a jquery object of the input
	 */
	Tagify.prototype.tagifyInput = function tagifyInput() {
		var $tagifyInput = $('<div class="tagify-input-container" />');
		var $input = $('<input type="text" class="tagify-input" />');
		var $enter;
		var $previewIcon;
		var previewClass;

		if (this.opts.placeholder) {
			$input.attr('placeholder', this.opts.placeholder);
		}

		if (this.opts.showPreviewIcon) {
			previewClass = this._tagList.length ? 'tagify-preview' : 'tagify-preview-disabled';
			$previewIcon = $('<i class="tagify-preview-icon"></i>').addClass(previewClass).attr('title', this.opts.previewTitle);
			$tagifyInput.append($previewIcon);	
		}

		$tagifyInput.append($input);

		if (this.opts.showButton) {
			$enter = $('<button></button>').text(this.opts.buttonText);
			$tagifyInput.append($enter);
		}

		return $tagifyInput;
	};

	/**
	 * Generates one jQuery tag object used for display in the UI.
	 * @param  {string} tag     The tag name used for display in the UI.
	 * @param  {bool} invalid   Is this a valid tag?
	 * @return {jQuery}         Returns the jQuery tag object.
	 */
	Tagify.prototype.generateTag = function generateTag(tag, invalid) {
		var $tag = $('<div />');

		if (this.opts.className) {
			$tag.addClass(this.opts.className);
		}

		if (invalid) {
			$tag.addClass('invalid');
		}

		$tag.text(tag);

		//add the remove icon
		$tag.append($('<i class="tagify-remove"></i>'));

		return $tag;
	};

	/**
	 * Creates the main container around the tagify ui control.
	 * @return {jQuery}    Returns a jQuery tagify object ready for UI.
	 */
	Tagify.prototype.createTagifyView = function createTagifyView() {
		//createTagifyView genderates the markup for our tagify view.  It's 
		//responsible for creating the main tagify <div> as well as generating 
		//the markup for all the tags, and the input field for adding a tag.
		var me = this;
		var $node = $('<div />').addClass('tagify');

		$.each(this._tagList, function (idx, c) {
			var $tag = me.generateTag(c.tag, c.invalid);

			//add the $tag to the main $tagify node
			$node.append($tag);
		});

		//add the input that will allow for adding a new tag
		$node.append(me.tagifyInput());

		return $node;
	};

	/**
	 * Adds one tag to the view.  Called with the main $tagify jQuery object
	 * as the context.
	 * @param  {string} tag     The string representation of the tag
	 * @param  {bool} invalid   Is this a valid or invalid tag?
	 * @return {undefined}      Returns nothing.
	 */
	Tagify.prototype.addTagToView = function addTagToView(tag, invalid) {
		var $tag = this.generateTag(tag, invalid);

		this.$tagify.find('.tagify-input-container').before($tag);
	};

	/**
	 * Reset the tagify input to an empty state.
	 * @return {undefined} Returns nothing.
	 */
	Tagify.prototype.resetTagifyInput = function resetTagifyInput() {
		this.$tagify.find('.tagify-input').val('');
	};

	/**
	 * Should set the proper icon on the preview icon.
	 * @return {undefined} Returns nothing
	 */
	Tagify.prototype.setPreviewIcon = function setPreviewIcon() {
		var classNames = 'tagify-preview-disabled tagify-preview';
		var $icon = this.$tagify.find('.tagify-preview-icon');

		//remove all classes
		$icon.removeClass(classNames);

		if (this._tagList.length) {
			$icon.addClass('tagify-preview');
		} else {
			$icon.addClass('tagify-preview-disabled');
		}
	};

	/**
	 * Responsible for binding events and managing what happens when listened 
	 * for events occur.
	 * @param {object} opts    Tagify options object
	 */
	Tagify.prototype.addEvents = (function () {
		/**
		 * Manages what happens when we attempt to add a tag. Called with the 
		 * main tagify instance as the context.
		 * @param {string} tag     The tag as a string we want to add.
		 */
		function _add(tag) {
			this.resetTagifyInput();

			var me = this;
			var tags = this.splitter(tag);

			//if no tags, return nothing
			if (! tags.length) {
				return;
			}

			//add each tag to the view
			$.each(tags, function (idx, tag) {
				me.addTagToView(tag.tag, tag.invalid);
			});

			//keep the internal _tagList up to date
			$.each(tags, function (idx, tag) {
				me._tagList.push(tag);
			});


			//update the orignal hidden input.
			this.updateOriginalInput();
			this.setPreviewIcon();

			return tags;
		}

		/**
		 * Returns a tag object from the list based on tag name
		 * @param  {string} tag      Tag name to retrieve object for
		 * @param  {array} _tagList  The list of tag objects
		 * @return {obj}             Returns a tag object
		 */
		function getTagFromTagList(tag, _tagList) {
			var tagObj;

			for (var i = 0, len = _tagList.length; i < len; i++) {
				var t = _tagList[i];

				if (t.tag === tag) {
					tagObj = t;
					break;
				}
			}

			return tagObj;
		}

		/**
		 * Handles removing a tag object from the UI and tracked tag objects
		 * @param  {string} tag    The name of the string.
		 * @return {undefined}     Returns nothing
		 */
		function _remove(tag) {
			//_remove's main responsibility is to maintain the original inputs value
			//so when any remove callbacks are fired, the input is correct.
			var tagObj = getTagFromTagList(tag, this._tagList);
			var idx = $.inArray(tagObj, this._tagList);
			var valueIdx = $.inArray(tagObj, this._tagValues);

			if (idx !== -1) {
				this._tagList.splice(idx, 1);
				this._tagValues.splice(valueIdx, 1);
			
				this.updateOriginalInput();
				this.setPreviewIcon();
			}
		}

		/**
		 * Events is a self calling function so this is the main function that
		 * is run when events is called.  Handles all events that occur within
		 * the this.$tagify object.
		 * @return {undefined} Returns nothing.
		 */
		return function addEvents() {
			var me = this;
			var addCb = this.opts.addCb;
			var removeCb = this.opts.removeCb;
			var $tagifyInput = this.$tagify.find('.tagify-input');

			//listen for clicks on the preview icon (eye icon)	
			this.$tagify.on('click', '.tagify-preview', function (evt) {
				$tagifyInput.val(me.$originalInput.val());
				$tagifyInput.focus();
				$tagifyInput[0].select();
			});

			//listen for clicks on the remove (x on each tag)
			this.$tagify.on('click', '.tagify-remove', function (evt) {
				//get a reference to the tag itself				
				var $tag = $(evt.target).closest('.tagify-tag');
				var tag = $tag.text();

				_remove.call(me, tag);

				//run the specified remove callback
				removeCb.call(me.$originalInput[0], tag);

				//remove the tag from the alert
				$tag.remove();
			});

			//listen for blur events on the tagify input
			this.$tagify.on('blur', '.tagify-input', function (evt) {
				evt.preventDefault();
				
				var $input = $(evt.target);
				var tag = $input.val();
				
				//add the tag
				var tags = _add.call(me, tag);

				if (tags) {
					addCb.call(me.$originalInput[0], tags);
				}
			});

			//listen for keypress events on the tagify input.  If a key is 
			//pressed that is in our opts.addNewDelimiter then run all our
			//add functions and add callback.
			this.$tagify.on('keypress', '.tagify-input', function (evt) {
				var which = evt.which;
				var $input;

				if ($.inArray(which, me.opts.addNewDelimiter) !== -1) {
					evt.preventDefault();

					$input = $(evt.target);
					var tag = $input.val();
					var tags = _add.call(me, tag);

					if (tags) {
						addCb.call(me.$originalInput[0], tags);
					}
				}
			});
		};
	})();

	function isAllowedType($input, options) {
		var allowedTypes = 'input[type=text] textarea'.split(' ');	
		var allowed = true;

		//only tagify certain types of inputs
		if (options.allowedTypes) {
			allowedTypes = options.allowedTypes;

			if (! $.isArray(allowedTypes)) {
				allowedTypes = [allowedTypes];
			}
		}
		
		for (var i = 0, len = allowedTypes.length; i < len; i++) {
			if (! $input.is(allowedTypes[i])) {
				allowed = false;
			} else {
				allowed = true;
				break;
			}
		}

		return allowed;
	}

	function tagify(options) {
		//loop over each thing to be tagified and create a Tagify 
		//instance for each thing.
		return this.each(function () {
			var $this = $(this);

			if (! isAllowedType($this, options)) {
				return;
			}

			new Tagify($this, options);
		});
	}

	$.fn.tagify = tagify;

})(jQuery);