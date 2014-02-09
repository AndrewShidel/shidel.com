var view;
(function() {
    view = {

        create: function(setup) {
            view.setup = setup;
            var readyStateCheckInterval = setInterval(function() {
                if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);
                    var hashValue = view.getHash(),
                        handles = document.querySelectorAll('.handle'),
                        i;
                    view.flag = false;
                    if (hashValue === '') {
                        view.update(setup.index.name, true);
                    } else {
                        view.update(view.getHash(), false);
                    }
                    for (i = 0; i < handles.length; i += 1) {
                        if (handles[i].addEventListener) {
                            handles[i].addEventListener('click', view.trigger)
                        } else if (handles[i].attachEvent) {
                            handles[i].attachEvent('onclick', view.trigger);
                        }
                    }

                    window.onhashchange = function() {
                        if (view.flag) {
                            view.update(view.getHash(), false);
                        } else {
                            view.flag = true;
                        }
                    };
                }
            }, 10);
        },

        update: function(hashValue, bool) {
            var temp = document.createElement("IFRAME"),
                frame = document.getElementById(view.setup.view),
                parent = frame.parentNode;
            if (view.setup.exceptions[hashValue]) {
                temp.src = view.setup.exceptions[hashValue];
            } else {
                temp.src = view.setup.path + '/' + hashValue + '.html' || view.setup.index.location
            }
            var src = temp.src;
            temp.id = view.setup.view;

            temp.frameBorder = "no";



            parent.replaceChild(temp, frame);

            if (view.setup.autoSize == true) {
                temp.contentWindow.addEventListener('resize', function(event) {
                    view.sizeFrame(view.setup.view);
                });
            }

            if (temp.addEventListener) {
                temp.addEventListener("load", function() {
                    view.sizeFrame(view.setup.view);
                    var cur_url = temp.contentWindow.location.href;
                    if (cur_url != src) {
                        view.flag = false;
                        view.setHash(cur_url.match(/([^\/]+)(?=\.\w+$)/)[0]);
                    }

                });
            } else if (temp.attachEvent) {
                temp.attachEvent("onload", function() {
                    view.sizeFrame(view.setup.view)
                    var cur_url = temp.contentWindow.location.href;
                    if (cur_url != src) {
                        view.flag = false;
                        view.setHash(cur_url.match(/([^\/]+)(?=\.\w+$)/)[0]);
                    }
                });
            }

            if (bool) {
                view.setHash(hashValue);
            }
        },

        trigger: function(event) {
            if (!event) {
                event = window.event;
            }

            var caller = event.target || event.srcElement,
                link = caller.getAttribute('data-link');

            view.update(link, true);
        },

        getHash: function() {
            return window.location.hash.substring(1);
        },

        setHash: function(str) {
            view.flag = false;
            window.location.hash = str;
        },

        sizeFrame: function(elem) {

            var el = document.getElementById(elem);
            el.height = (getWH(el.contentWindow.document.body,'height',true)) + "px";
            window.scrollTo(0, 0);       
        },
    };

    var defView = document.defaultView;

    var getStyle = defView && defView.getComputedStyle ?
            function(elem) {
                return defView.getComputedStyle(elem, null);
        } :
            function(elem) {
                return elem.currentStyle;
        };

    // hack for WebKit bug, which does not return proper values for percent-margins
    // Hard work done by Mike Sherov https://github.com/jquery/jquery/pull/616

    var body = document.getElementsByTagName("body")[0],
        div = document.createElement('div'),
        fakeBody = body || document.createElement('body');

    div.style.marginTop = '1%';
    fakeBody.appendChild(div);

    var supportsPercentMargin = getStyle(div).marginTop !== '1%';

    fakeBody.removeChild(div);

    // TODO remove fakebody if it's fake?

    // https://github.com/mikesherov/jquery/blob/191c9c1be/src/css.js

    function hackPercentMargin(elem, computedStyle, marginValue) {
        if (marginValue.indexOf('%') === -1) {
            return marginValue;
        }

        var elemStyle = elem.style,
            originalWidth = elemStyle.width,
            ret;

        // get measure by setting it on elem's width
        elemStyle.width = marginValue;
        ret = computedStyle.width;
        elemStyle.width = originalWidth;

        return ret;
    }


    // returns width/height of element, refactored getWH from jQuery

    function getWH(elem, measure, isOuter) {
        // Start with offset property
        var isWidth = measure !== 'height',
            val = isWidth ? elem.offsetWidth : elem.offsetHeight,
            dirA = isWidth ? 'Left' : 'Top',
            dirB = isWidth ? 'Right' : 'Bottom',
            computedStyle = getStyle(elem),
            paddingA = parseFloat(computedStyle['padding' + dirA]) || 0,
            paddingB = parseFloat(computedStyle['padding' + dirB]) || 0,
            borderA = parseFloat(computedStyle['border' + dirA + 'Width']) || 0,
            borderB = parseFloat(computedStyle['border' + dirB + 'Width']) || 0,
            computedMarginA = computedStyle['margin' + dirA],
            computedMarginB = computedStyle['margin' + dirB],
            marginA, marginB;

        if (!supportsPercentMargin) {
            computedMarginA = hackPercentMargin(elem, computedStyle, computedMarginA);
            computedMarginB = hackPercentMargin(elem, computedStyle, computedMarginB);
        }

        marginA = parseFloat(computedMarginA) || 0;
        marginB = parseFloat(computedMarginB) || 0;

        if (val > 0) {

            if (isOuter) {
                // outerWidth, outerHeight, add margin
                val += marginA + marginB;
            } else {
                // like getting width() or height(), no padding or border
                val -= paddingA + paddingB + borderA + borderB;
            }

        } else {

            // Fall back to computed then uncomputed css if necessary
            val = computedStyle[measure];
            if (val < 0 || val === null) {
                val = elem.style[measure] || 0;
            }
            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;

            if (isOuter) {
                // Add padding, border, margin
                val += paddingA + paddingB + marginA + marginB + borderA + borderB;
            }
        }

        return val;
    }


})()