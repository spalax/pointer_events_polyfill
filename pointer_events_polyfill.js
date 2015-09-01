/*
 * Pointer Events Polyfill: Adds support for the style attribute "pointer-events: none" to browsers without this feature (namely, IE).
 * (c) 2013, Kent Mewhort, licensed under BSD. See LICENSE.txt for details.
 */

// constructor
function PointerEventsPolyfill(options){
    // set defaults
    this.options = {
        selector: '*',
        mouseEvents: ['click','dblclick','mousedown','mouseup'],
        cursorPointerOnMask: false,
        classForActiveElements: '',
        usePolyfillIf: function(){
            if(navigator.appName == 'Microsoft Internet Explorer')
            {
                var agent = navigator.userAgent;
                if (agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) != null){
                    var version = parseFloat( RegExp.$1 );
                    if(version < 11)
                      return true;
                }
            }
            return false;
        }
    };
    if(options){
        $.extend( true, this.options, options);
    }

    if (this.options.cursorPointerOnMask === true) {
        if ($.inArray('mouseover', this.options.mouseEvents) == -1) {
            this.options.mouseEvents.push('mouseover');
        }
        if ($.inArray('mouseleave', this.options.mouseEvents) == -1) {
            this.options.mouseEvents.push('mouseleave');
        }
        if ($.inArray('mousemove', this.options.mouseEvents) == -1) {
            this.options.mouseEvents.push('mousemove');
        }
    }


    if(this.options.usePolyfillIf())
      this.register_mouse_events();
}

// singleton initializer
PointerEventsPolyfill.initialize = function(options){
    if(PointerEventsPolyfill.singleton == null)
      PointerEventsPolyfill.singleton = new PointerEventsPolyfill(options);
    return PointerEventsPolyfill.singleton;
};

// handle mouse events w/ support for pointer-events: none
PointerEventsPolyfill.prototype.register_mouse_events = function(){
    var options = this.options,
        elementsToClean = [];
    // register on all elements (and all future elements) matching the selector
    $(document).on(this.options.mouseEvents.join(" "), this.options.selector, function(e){
       if($(this).css('pointer-events') == 'none'){
             // peak at the element below
             var origDisplayAttribute = $(this).css('display');
             $(this).css('display','none');

             var underneathElem = document.elementFromPoint(e.clientX, e.clientY),
                 $underneathElem = $(underneathElem);
           console.log($underneathElem.prop('tagName'), e.type);
           if (options.cursorPointerOnMask) {
               if ((e.type != 'mouseover' && e.type != 'mousemove') ||
                   ($underneathElem.prop('tagName') != 'A' &&
                    !$underneathElem.parents('a').length)) {
                   $(this).css('cursor', '');
               } else if ($(this).css('cursor') != 'pointer' &&
                            ($underneathElem.parents('a').length ||
                                $underneathElem.prop('tagName') == 'A')) {
                   $(this).css('cursor', 'pointer');
               }
           }

           if (options.classForActiveElements.length) {
               if ((e.type != 'mouseover' && e.type != 'mousemove')) {
                   $(elementsToClean).each(function (k, v) {
                       $(v).removeClass(options.classForActiveElements);
                   })
               } else if (!$underneathElem.hasClass(options.classForActiveElements)) {
                   if ($underneathElem.prop('tagName') == 'A') {
                        $underneathElem.addClass(options.classForActiveElements);
                        elementsToClean.push($underneathElem);
                   } else if ($underneathElem.parents('a').length) {
                        $underneathElem.parents('a').addClass(options.classForActiveElements);
                        elementsToClean.push($underneathElem.parents('a'));
                   } else {
                        $underneathElem.addClass(options.classForActiveElements);
                        elementsToClean.push($underneathElem);
                   }
               }
           }

            if(origDisplayAttribute) {
                $(this).css('display', origDisplayAttribute);
            } else {
                $(this).css('display', '');
            }

             // fire the mouse event on the element below
            e.target = underneathElem;

            $underneathElem.trigger(e);

            e.stopPropagation();
            return false;
        }
        return true;
    });
};
