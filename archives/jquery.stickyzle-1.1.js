/**
 * This plugin allows you to stick an element on the top of the screen when the page is scrolling
 *
 * @author	Olivier Bossel (andes)
 * @created	08.01.2013
 * @updated 13.03.2013
 * @version 1.1
 */
;(function($) {
	
	/**
	 * Plugin :
	 */
	function stickyzle(item, options) {
		
		// vars :
		this.settings = {											// save the options
			classes : {
				sticked : 'stickyzle-sticked'						// add this class when the element is sticked
			},
			animatedProp : 'margin-top',							// define the prop that will ben animated (margin-top or top)
			fixed : false,											// define if the sticky type use the fixed position (no animation allowed...)
			scrollTimeout : 100,									// define the timeout for detecting end of scroll and launch application
			parentSelector : null, 									// define the selector for detecting the parent to use
			animation : {
				duration : 500,										// define the duration of the animation
				easing : 'swing'									// define the easing used for animation
			},
			isActiveDelegate : null									// define an delegate to desavtive the sticky panel
		};
		this.$refs = {
			parent : null,											// save the jquery ref to the parent
			window : null											// save the jquery ref of the window element
		};
		this.$this = $(item);										// save the jQuery item to access it
		
		// init :
		this.init($(item), options); 
		
	};
	
	/**
	 * Init : init the plugin
	 *
	 * @param	jQuery	item	The jQuery item
	 * @param	object	options	The options
	 */
	stickyzle.prototype.init = function(item, options) {
		
		// vars :
		var _this = this,
			$this = item;
		
		// extend settings if needed :
		if (options) $.extend(this.settings, options);

		// save refs :
		if (!_this._getSetting('parentSelector')) _this.$refs.parent = $this.parent();
		else _this.$refs.parent = $this.closest(_this._getSetting('parentSelector'));
		_this.$refs.window = $(window);

		// add listeners :
		_this._addListeners();
		
	};

	/**
	 * Add listeners :
	 */
	stickyzle.prototype._addListeners = function() {

		// vars :
		var _this = this,
			$this = _this.$this;

		// check if is fexed :
		if (_this._getSetting('fixed'))
		{
			// add scroll listener :
			_this.$refs.window.bind('scroll', function(e) {
				// onscroll :
				_this._onScroll(e);
			});
		} else {
			_this.$refs.window.bind('scroll', function(e) {
			    clearTimeout($.data(this, 'stickyzle_scrollTimer'));
			    $.data(this, 'stickyzle_scrollTimer', setTimeout(function() {
			    	// onscroll :
			    	_this._onScroll(e);
			    }, _this._getSetting('scrollTimeout')));
			});
		}
	};

	/**
	 * On scroll :
	 */
	stickyzle.prototype._onScroll = function(e) {

		// vars :
		var _this = this,
			$this = _this.$this;

		if (_this.$refs.parent.height() > $this.height())
		{
			// check if the stick type is fixed :
			if (_this._getSetting('fixed'))
			{
				// check if a delegate exist :
				if (!_this._getSetting('isActiveDelegate') || (_this._getSetting('isActiveDelegate') && _this._getSetting('isActiveDelegate')()))
				{
					if (_this.$refs.parent.offset().top - _this.$refs.window.scrollTop() > 0)
					{
						// reset position because the parent element is not abow the top of screen :
						$this.css('position','');
						// remove sticked class :
						$this.removeClass(_this._getSetting('classes.sticked'));
					} else if (_this.$refs.parent.offset().top + _this.$refs.parent.outerHeight() - _this.$refs.window.scrollTop() - $this.outerHeight() < 0)
					{
						// the screen scroll is under the container so we place if at the bottom of the container :
						$this.css(_this._getSetting('animatedProp'), _this.$refs.parent.offset().top + _this.$refs.parent.outerHeight() - $this.outerHeight() - _this.$refs.window.scrollTop());
						// remove sticked class :
						$this.removeClass(_this._getSetting('classes.sticked'));
					} else if ($this.offset().top - _this.$refs.window.scrollTop() < 0)
					{
						// fix the element :
						$this.css('position', 'fixed').css(_this._getSetting('animatedProp'), 0);
						// add sticked class :
						$this.addClass(_this._getSetting('classes.sticked'));
					}
				} else {
					// reset position because the parent element is not abow the top of screen :
					$this.css('position','');
					$this.css(_this._getSetting('animatedProp'),'');
					// remove sticked class :
					$this.removeClass(_this._getSetting('classes.sticked'));
				}
			} else {

				// check if a delegate exist :
				if (!_this._getSetting('isActiveDelegate') || (_this._getSetting('isActiveDelegate') && _this._getSetting('isActiveDelegate')()))
				{
					var prop = {};
					prop[_this._getSetting('animatedProp')] = _this._boundarize(_this.$refs.window.scrollTop() - _this.$refs.parent.offset().top);

					$this.clearQueue().animate(prop ,_this._getSetting('animation.duration'),_this._getSetting('animation.easing'), function() {
						// check complete callback :
						if (_this._getSetting('onComplete')) _this._getSetting('onComplete')(_this);
					});
				} else {
					$this.css(_this._getSetting('animatedProp'), '');
				}
			}
		}
	};

	/**
	 * Boundarize :
	 */
	stickyzle.prototype._boundarize = function(value) {

		// vars :
		var _this = this,
			$this = _this.$this
			parent_h = _this.$refs.parent.outerHeight();

		// check margin top :
		if (value < 0) value = 0;
		if (value + $this.outerHeight() > parent_h) value = parent_h - $this.outerHeight();

		return value;

	};
	
	/**
	 * Get setting :
	 * this function try to get the setting asked on the html tag itself
	 * the name has to be a string separated by the "." -> classes.loading
	 * this function will check if data-{pluginName}-classes-loading attr ecist and return it, or return the _this._getSetting('classes.loading value if not
	 *
	 * @param 	string 	name 	The name of the setting to get (use dot notation) (ex : classes.loading)
	 */
	stickyzle.prototype._getSetting = function(name) {

		// vars :
		var _this = this,
			$this = _this.$this;

		// split the setting name :
		var inline_setting = 'data-stickyzle-' + name.replace('.','-'),
		inline_attr = $this.attr(inline_setting);	

		// check if element has inline setting :
		if (typeof inline_attr !== 'undefined' && inline_attr !== false) return inline_attr;
		else return eval('_this.settings.'+name);
	};

	/**
	 * Expose API :
	 */
	var methods = {
		
		/**
		 * Init :
		 */
		init : function(options) {
			return this.each(function() {
				// init plugin :
				var p = new stickyzle(this, options);
				// save plugin :
				$(this).data('stickyzle_plugin', p);
			});	
		}
		
	};
	
	/**
	 * Call methods on plugin :
	 */
	function plugin_call(ref, method, args)
	{
		// get plugin :
		var plugin = $(ref).data('stickyzle_plugin');
		// check plugin :
		if (plugin) {
			// call into plugin :
			return plugin[method].apply( plugin, Array.prototype.slice.call( arguments, 2 ));
		}
	}
	 
	/**
	 * jQuery stickyzle controller :
	 */
	$.fn.stickyzle = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.stickyzle' );
		}    
	}

})(jQuery);