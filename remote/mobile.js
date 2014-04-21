$(document).ready(function(){

  Android.setInChat($('#chat-body').length > 0);

  $('#input').on('keyup',function(e){
    var pos = $('#input').caret().start;
    var words = $('#input').val().substring(0,pos + 1).split(' ');
    var currentWord = words[words.length - 1];
    if(currentWord.charAt(0) == '@' && currentWord.length > 1){
      var searchString = currentWord.substring(1);
      var options = [];
      $('.username').each(function(){
        var condensed = $(this).html().replace(/\s+/g,'');
        console.log(condensed);
        if(options.indexOf(condensed) == -1 && condensed.toLowerCase().indexOf(searchString.toLowerCase()) == 0){
          options.push(condensed);
        }
      });
      if(options.length > 0){
        var autocomplete = $('#autocomplete').length > 0 ? $('#autocomplete') : $('<div id="autocomplete"></div>');
        autocomplete.html('');
        for(var i=0;i<options.length;i++){
          autocomplete.append('<div class="option" >' + options[i] + '</div>');
        }
        if($('#autocomplete').length == 0){
          $('body').append(autocomplete);
        }
        $('#autocomplete > .option').on('click',function(){
          // This could be more robust...
          $('#input').val($('#input').val().replace(searchString,$(this).html()) + ' ');
          $('#autocomplete').remove();
          $('#input').focus();
          $('#input').caret(pos + ($(this).html().length - searchString.length) + 2);
        });
      }else{
        $('#autocomplete').remove();
      }
    }else{
      $('#autocomplete').remove();
    }
    var code = e.keyCode || e.which;
    if(code == 13){ // enter
      $('#sayit-button').click();
    }
  });

  $('#sayit-button').on('click',function(){
    cancelEditing();
  });

  var hook_message = function(){
    $('.message').off();
    $('.message').on('click',function(e){
      e.stopPropagation();
      var message = $(this);
      if($(this).find('.overlay').length === 0){
        $('.overlay').slideUp('fast',function(){
          $(this).remove();
        });
        var overlay = $('<div class="overlay"></div>');
        if(message.parent().parent().hasClass('mine')){
          var edit_button = $('<div class="touch-button" id="edit-button"></div>');
          edit_button.on('click',function(e){
            e.stopPropagation();
            $.get('/message/' + chatseyMessageId(message) + '?plain=true&_=' + Date.now(),
              function(data){
                $('.message.editing').removeClass('editing');
                message.addClass('editing');
                $('#input').addClass('editing');
                $('#input').focus().val(data);
                  var cancel_edit_button = $('<button id="cancel-editing">cancel</button>');
                  cancel_edit_button.on('click',function(e){
                    e.stopPropagation();
                    cancelEditing();
                  });
                  if($('#cancel-editing').length == 0){
                    $('#bubble').append(cancel_edit_button);
                  }
                $('#input').animate({
                  'width': '59%'
                },500,function(){
                  cancel_edit_button.fadeIn('fast');
                });
              });
            hideOverlay(overlay);
          });
          var delete_button = $('<div class="touch-button" id="delete-button"></div>');
          delete_button.on('click',function(e){
            e.stopPropagation();
            if(confirm("Are you sure you want to delete this?")){
              var messsage_id = chatseyMessageId(message);
              $.ajax({
                type: "POST",
                url: "/messages/" + messsage_id + "/delete",
                data: chatseyFkey(),
                dataType: "json"
              });
            }
            hideOverlay(overlay);
          });
          overlay.append(edit_button);
          overlay.append(delete_button);
        }else{
          var reply_button = $('<div class="touch-button" id="reply-button"></div>');
          reply_button.on('click',function(e){
            e.stopPropagation();
            var msg = $('#input').val();
            var reply_code = ':' + chatseyMessageId(message) + " ";
            if(msg && msg.length > 0){
              var firstWord = msg.split(" ")[0];
              if(firstWord.charAt(0) == ":" && parseInt(firstWord.substr(1)) > 0){
                reply_code = reply_code + msg.substr(firstWord.length + 1);
              }
            }
            $('#input').focus().val(reply_code);
            hideOverlay(overlay);
          });
          var star_button = $('<div class="touch-button" id="star-button"></div>');
          if(message.hasClass('user-star')){
            star_button.addClass('starred');
          }
          star_button.on('click',function(e){
            e.stopPropagation();
            var messsage_id = chatseyMessageId(message);
            $.ajax({
              type: "POST",
              url: "/messages/" + messsage_id + "/star",
              data: chatseyFkey(),
              dataType: "json",
              success: function(data){
                if(star_button.hasClass('starred')){
                  message.removeClass('user-star');
                  message.find('.vote-count.container.stars').removeClass('user-star');
                }else{
                  message.addClass('user-star');
                  message.find('.vote-count.container.stars').addClass('user-star');
                }
              }
            });
            hideOverlay(overlay);
          });
          var flag_button = $('<div class="touch-button" id="flag-button"></div>');
          flag_button.on('click',function(e){
            e.stopPropagation();
            if(confirm("Are you sure you want to flag this?")){
              var messsage_id = chatseyMessageId(message);
              $.ajax({
                type: "POST",
                url: "/messages/" + messsage_id + "/flag",
                data: chatseyFkey(),
                dataType: "json"
              });
            }
            hideOverlay(overlay);
          });
          overlay.append(reply_button);
          overlay.append(star_button);
          overlay.append(flag_button);
        }
        var close_button = $('<div class="touch-button" id="close-button">&times;</div>');
        close_button.on('click',function(e){
          e.stopPropagation();
          hideOverlay(overlay);
        });
        overlay.append(close_button);
        message.append(overlay);
        overlay.slideDown('fast',function(){
          if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            $("html, body").animate({ scrollTop: $(document).height() }, "fast");
          }
        });
        $('#input').focus();
      }
    });
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
      $("html, body").animate({ scrollTop: $(document).height() }, "fast");
    }
  };
  var init_lq = setInterval(function(){
    if($('.message').length > 0){
        hook_message();
        try{
          $('#chat .message').livequery(hook_message);
          $('#input').focus();
          clearInterval(init_lq);
        }catch(e){
          // pass
        }
    }
  }, 500);
});

$(window).on('resize', function(){
  $("html, body").animate({ scrollTop: $(document).height() }, "fast");
});

function chatseyMessageId(elem){
  return parseInt(elem.attr('id').substr(8))
}

function hideOverlay(elem){
  elem.slideUp('fast',function(){
    elem.remove();
  });
  $('#input').focus();
}

function cancelEditing(){
  $('#cancel-editing').fadeOut('fast',function(){
    $('#input').animate({
      'width': '78%'
    },'fast');
  });
  $('.message.editing').removeClass('editing');
  $('#input').removeClass('editing');
  $('#input').val('');
}

function cancelEditing(){
  $('#cancel-editing').fadeOut('fast',function(){
    $('#input').animate({
      'width': '78%'
    },'fast');
  });
  $('.message.editing').removeClass('editing');
  $('#input').removeClass('editing');
  $('#input').val('');
}

function chatseyFkey() {
  return 'fkey=' + $("input[name='fkey']").val();
}

// http://stackoverflow.com/questions/4715762/javascript-move-caret-to-last-character
function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}
