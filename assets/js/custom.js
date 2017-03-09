

/*=============================================================
    Authour URI: www.binarytheme.com
    License: Commons Attribution 3.0

    http://creativecommons.org/licenses/by/3.0/

    100% To use For Personal And Commercial Use.
    IN EXCHANGE JUST GIVE US CREDITS AND TELL YOUR FRIENDS ABOUT US
   
    ========================================================  */


(function ($) {
    "use strict";
    var mainApp = {

        main_fun: function () {
            /*====================================
              CUSTOM LINKS SCROLLING FUNCTION 
             ======================================*/
          
            $('.navbar a[href*=#]').click(function () {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
               && location.hostname == this.hostname) {
                    var $target = $(this.hash);
                    $target = $target.length && $target
                    || $('[name=' + this.hash.slice(1) + ']');
                    if ($target.length) {
                        var targetOffset = $target.offset().top;
                        $('html,body')
                        .animate({ scrollTop: targetOffset }, 800); //set scroll speed here
                        return false;
                    }å
                }
            });
          $('.hl a[href*=#]').click(function () {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
               && location.hostname == this.hostname) {
                    var $target = $(this.hash);
                    $target = $target.length && $target
                    || $('[name=' + this.hash.slice(1) + ']');
                    if ($target.length) {
                        var targetOffset = $target.offset().top;
                        $('html,body')
                        .animate({ scrollTop: targetOffset }, 800); //set scroll speed here
                        return false;
                    }å
                }
            });
           
          
       
            // CAROUSEL FUNCTION 

            $('.carousel').carousel({
                interval: 5000 //TIME IN MILLI SECONDS
            })

          
            /*====================================
               WRITE YOUR SCRIPTS BELOW 
           ======================================*/

            $('.navbar-collapse a').click(function(){
              $(".navbar-collapse").collapse('hide');
            });
          
          
          $(document).ready(function() {
            $('.cpp').css('width', '92%');
            $('.java').css('width', '80%');
            $('.python').css('width', '70%');
            $('.scheme').css('width', '65%');
            $('.html').css('width', '60%');
            $('.css').css('width', '50%');
            $('.bad-humor').css('width', '100%');
          });
          
          
        },

        initialization: function () {
            mainApp.main_fun();

        }

    }
    // Initializing ///

    $(document).ready(function () {
        mainApp.main_fun();
    });

}(jQuery));



