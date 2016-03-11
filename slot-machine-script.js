(function($){
    $.fn.slot_machine = function( options ) {

        var defaults = {
            code: 'cat',
            answer: 'cat',
            tries: '5'
        };

        options = $.extend(defaults, options);

        var code = options.code.toUpperCase();
        var answer = options.answer.toUpperCase();
        var tries = options.tries;

        /* Generate the reels
        ============================================================================*/
        var reels = '';
        var num_reels = answer.length;
        var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var append = '';

        for(var i = 0; i < num_reels; i++) {
            var k = i + 1;
            reels += '<div class="reel-frames" id="reel-' + k + '"><div class="reels-machinery"><div class="reel">';
            var n = 1;
            for(var j = 0; j < 30; j++) {
                if(j == 0) {
                    append = ' first';
                }
                else {
                    append = '';
                }
                if(j < 26) {
                    k = j + 1;
                    reels += '<div class="figures figure-' + k + append + '">' + letters[j] + '</div>';
                }
                if(j >= 26) {
                    reels += '<div class="figures figure-' + n + append + '">' + letters[n-1] + '</div>';
                    n++;
                }
            }
            reels += '</div></div></div>';
        }
        $('#framework-center').html(reels);

        var width = ( num_reels * 12 ) + 16;

        $('#machine').css({'width': width+'em'});
        $('#counter').text(tries);

        /* Functionality of the reels here
        ============================================================================*/

        // Max length of input field
        $('#machine-marquee').prop('maxlength', code.length);
        $('#machine-marquee').focus();

        // Lever clicking
        $('#lever-ball').click(function() {
            trigger_motion(answer, code);
        });
        // Enter key pressing
        $('input').bind('keypress', function(e) {
            var keyPressed = e.keyCode || e.which;
            if(keyPressed == 13) {
                trigger_motion(answer, code);
            }
        });

        function trigger_motion(answer, code) {
            var guess = $('#machine-marquee').prop('value').toUpperCase();
            var count_tries = parseInt($('#counter').text());

            // Only trigger motion when there is a guess
            if(guess.length > 0 && $('.winner').length == 0 && count_tries > 0) {
                $('#counter').text(count_tries - 1);

                // move the lever
                $('#lever-ball').animate(
                    { 'height': '6em', 'width': '6em', 'bottom': '2.5em', 'right': '3em' },
                    1000,
                    function() {
                        $('#lever-ball').animate(
                            { 'height': '5em', 'width': '5em', 'bottom': '11.5em', 'right': '2em' },
                            1500
                        );
                    }
                );
                $('#lever-bar').animate(
                    { 'height': '22em', 'bottom': '11em' },
                    1000,
                    function() {
                        $('#lever-bar').animate(
                            { 'height': '30em', 'bottom': '13em' },
                            1500
                        );
                    }
                );

                // move the reels
                for(var i = 0; i < num_reels; i++) {
                    var j = i + 1;
                    var k = i + 2;
                    var min = 1;
                    var max = 26;
                    var figure = Math.floor(Math.random() * (max - min + 1)) + min;
                    move_reel($('#reel-'+ j +' .first'), k, figure, j, answer, guess, code);
                }
            }
        }

        function move_reel(reel, repeats, figure, start, answer, guess, code) {
            $.extend( $.easing,
            {
                easeInQuad: function (x, t, b, c, d) {
                    return c*(t/=d)*t + b;
                },
                easeOutQuad: function (x, t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                }
            });
            var time = 250;
            var easing = 'linear';
            var marginT = -1.3;
            var answer_letters = answer.split('');
            var answer_letters_length = answer_letters.length;

            if (typeof start === 'undefined') {
                time = 1500;
                easing = 'easeInQuad';
            }
            else if (repeats == 0) {
                time = 1500;
                easing = 'easeOutQuad';
                marginT = -1.3*figure;
            }

            reel.css({ 'margin-top': '.5em' });

            reel.animate(
                { 'margin-top': marginT.toString()+'em' },
                time,
                easing,
                function() {
                    if (repeats > 0) {
                        move_reel(reel, repeats-1, figure, 1, answer, guess, code);
                    }
                }
            ).promise().done(function() {
                if(guess == code) {
                    reel.addClass('finished');
                }
                if($('.finished').length == answer_letters_length) {
                    $('#machine-marquee').prop({
                        'value': 'You Win!',
                        'disabled': 'disabled'
                    });
                    $('#machine').addClass('winner');
                }
            });
            if(guess == code) {
                repeats = 0;

                for(var i = 0; i < answer_letters_length; i++) {
                    var j = i + 1;
                    $('#reel-' + j + ' .figures').each(function(index){
                        if($(this).text() == answer_letters[i]) {
                            var currPos = 1.3 * (index - 1);
                            $('#reel-' + j + ' .first').animate({'margin-top': '-' + currPos + 'em'});
                            $(this).addClass('selected');
                        }
                        else {
                            $(this).removeClass('selected');
                        }
                        if(index > 25) {
                            return false;
                        }
                    });
                }
            }
        }
    }
}( jQuery ));