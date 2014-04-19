$(document).ready(function(){
  $('#input').focus();

  $('#input').on('keypress',function(e){
    var code = e.keyCode || e.which;
    if(code == 13){ // enter
      $('#sayit-button').click();
    }
  });

  $('.message').on('click touchstart',function(e){
    e.stopPropagation();
    var message = $(this);
    if($(this).find('.overlay').length === 0){
      $('.overlay').slideUp('fast',function(){
        $(this).remove();
      });
      var overlay = $('<div class="overlay"></div>');
      var star_button = $('<div class="touch-button" id="star-button"></div>');
      star_button.on('click touchstart',function(e){
        e.stopPropagation();
        var messsage_id = parseInt(message.attr('id').substr(8));
        $.ajax({
          type: "POST",
          url: "/messages/" + messsage_id + "/star",
          data: fkey(),
          dataType: "json"
        });
        overlay.slideUp('fast',function(){
          overlay.remove();
        });
      });
      overlay.append(star_button);
      message.append(overlay);
      overlay.slideDown('fast');
    }
  });
});

function fkey() {
  return 'fkey=' + $("input[name='fkey']").val();
}
