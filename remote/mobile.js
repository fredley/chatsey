$(document).ready(function(){
  $('#input').focus();

  $('#input').on('keypress',function(e){
    var code = e.keyCode || e.which;
    if(code == 13){ // enter
      $('#sayit-button').click();
    }
  });

  var hook_message = function(){
    $('.message').off();
    $('.message').on('click touchstart',function(e){
      e.stopPropagation();
      var message = $(this);
      if($(this).find('.overlay').length === 0){
        $('.overlay').slideUp('fast',function(){
          $(this).remove();
        });
        var overlay = $('<div class="overlay"></div>');
        if(message.parent().parent().hasClass('mine')){
          var edit_button = $('<div class="touch-button" id="edit-button">&#x270e;</div>');
          edit_button.on('click touchstart',function(e){
            e.stopPropagation();
            var msg = $('#input').val();
            message.addClass('editing');
            $('#input').addClass('editing');
            $('#input').focus().val(message.find('.content').html());
            hideOverlay(overlay);
          });
          var delete_button = $('<div class="touch-button" id="delete-button">&#x232b;</div>');
          delete_button.on('click touchstart',function(e){
            e.stopPropagation();
            var messsage_id = chatseyMessageId(message);
            $.ajax({
              type: "POST",
              url: "/messages/" + messsage_id + "/delete",
              data: chatseyFkey(),
              dataType: "json"
            });
            hideOverlay(overlay);
          });
          overlay.append(edit_button);
          overlay.append(delete_button);
        }else{
          var reply_button = $('<div class="touch-button" id="reply-button">&#x21B3;</div>');
          reply_button.on('click touchstart',function(e){
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
          var star_button = $('<div class="touch-button" id="star-button">&#x2605;</div>');
          if(message.hasClass('user-star')){
            star_button.addClass('starred');
          }
          star_button.on('click touchstart',function(e){
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
          overlay.append(reply_button);
          overlay.append(star_button);
        }
        var close_button = $('<div class="touch-button" id="close-button">&times;</div>');
        close_button.on('click touchstart',function(e){
          e.stopPropagation();
          hideOverlay(overlay);
        });
        overlay.append(close_button);
        message.append(overlay);
        overlay.slideDown('fast');
      }
    });
  };
  $('#chat .message').livequery(hook_message);
});

function chatseyMessageId(elem){
  return parseInt(elem.attr('id').substr(8))
}

function hideOverlay(elem){
  elem.slideUp('fast',function(){
    elem.remove();
  });
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
