/* exported initPhotoSlideFromDOM */
/* global photoboothTools */

// eslint-disable-next-line no-unused-vars
let PhotoSwipeLightbox,
    ssRunning = false,
    ssOnce = false,
    lastDBSize = -1;

const ssDelay = config.slideshow.pictureTime,
    ssButtonClass = '.pswp__button--playpause',
    interval = 1000 * config.slideshow.refreshTime,
    ajaxurl = 'gallery.php?status';

// eslint-disable-next-line no-unused-vars
function initPhotoSlideFromDOM(gallerySelector) {
    const gallery = new PhotoSwipeLightbox({
        gallery: gallerySelector,
        children: 'a',
        allowPanToNext: true,
        spacing: 0.1,
        loop: true,
        pinchToClose: false,
        closeOnVerticalDrag: false,
        hideAnimationDuration: 333,
        showAnimationDuration: 333,
        zoomAnimationDuration: 333,
        escKey: false,
        close: false,
        zoom: false,
        arrowKeys: true,
        returnFocus: true,
        maxWidthToAnimate: 4000,
        clickToCloseNonZoomable: false,
        imageClickAction: 'toggle-controls',
        bgClickAction: 'toggle-controls',
        tapAction: 'toggle-controls',
        doubleTapAction: 'toggle-controls',
        indexIndicatorSep: ' / ',
        preloaderDelay: 2000,
        bgOpacity: 0.8,

        index: 0,
        errorMsg: 'The image cannot be loaded',
        preload: [1, 2],
        easing: 'cubic-bezier(.4,0,.22,1)',

        // dynamic import is not supported in UMD version
        pswpModule: PhotoSwipe
    });

    // Slideshow not running from the start
    setSlideshowState(ssButtonClass, false);

    gallery.on('change', function () {
        if (ssRunning && ssOnce) {
            ssOnce = false;
            setTimeout(gotoNextSlide, ssDelay);
        }
    });

    gallery.on('close', function () {
        if (ssRunning) {
            setSlideshowState(ssButtonClass, false);
            $('.pswp__button--playpause i:first').toggleClass(config.icons.slideshow_toggle);
        }
    });

    gallery.on('uiRegister', function () {
        // Order of element, default order elements: counter - 5, zoom button - 10, info - 15, close - 20.
        gallery.pswp.ui.registerElement({
            name: 'playpause',
            ariaLabel: 'Slideshow',
            order: 18,
            isButton: true,
            html: '<i class="' + config.icons.slideshow_play + '"></i>',
            // eslint-disable-next-line no-unused-vars
            onClick: (event, el, pswp) => {
                // toggle slideshow on/off
                $('.pswp__button--playpause i:first').toggleClass(config.icons.slideshow_toggle);
                setSlideshowState(ssButtonClass, !ssRunning);
            }
        });
        gallery.pswp.ui.registerElement({
            name: 'reload',
            ariaLabel: 'Reload',
            order: 19,
            isButton: true,
            html: '<i class="' + config.icons.refresh + '"></i>',
            // eslint-disable-next-line no-unused-vars
            onClick: (event, el, pswp) => {
                // Stop slideshow
                setSlideshowState(ssButtonClass, false);

                // Reload page
                photoboothTools.reloadPage();
            }
        });
    });

    gallery.on('afterInit', () => {
        // photoswipe fully initialized and opening transition is running (if available)
        if ($('#galimages').children('a').length > 0) {
            $('.pswp__button--playpause i:first').toggleClass(config.icons.slideshow_toggle);
            setSlideshowState(ssButtonClass, !ssRunning);
        }
    });

    gallery.init();
    if ($('#galimages').children('a').length > 0) {
        gallery.loadAndOpen(0, {
            gallery: document.querySelector('#galimages')
        });
    }

    /* slideshow management */
    function gotoNextSlide() {
        const pswp = gallery.pswp;
        if (ssRunning && Boolean(gallery)) {
            ssOnce = true;
            pswp.next();
        }
    }

    function setSlideshowState(el, running) {
        if (running) {
            setTimeout(gotoNextSlide, ssDelay / 2.0);
        }
        const title = running ? 'Pause Slideshow' : 'Play Slideshow';
        $(el).prop('title', title);
        ssRunning = running;
    }
}

// Init on domready
$(function () {
    initPhotoSlideFromDOM('#galimages');
    if (config.gallery.scrollbar) {
        $('#gallery').addClass('scrollbar');
    }

    $('#gallery').addClass('gallery--open');

    function dbUpdated() {
        photoboothTools.console.log('DB is updated - refreshing');
        //location.reload(true); //Alternative
        photoboothTools.reloadPage();
    }

    const checkForUpdates = function () {
        $.getJSON({
            url: ajaxurl,
            success: function (result) {
                const currentDBSize = result.dbsize;
                if (lastDBSize != currentDBSize && lastDBSize != -1) {
                    dbUpdated();
                }
                lastDBSize = currentDBSize;
            }
        });
    };
    setInterval(checkForUpdates, interval);
});
