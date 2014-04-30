$(document).ready(function(){
  $.get('http://api.stackexchange.com/2.2/sites?jsoncallback=?',{pagesize: 1000, format: 'json'}).done(function(data){
    for(var i = 0;i < data["items"].length; i++){
      $('#sites').append('<div class="site">' +
        '<a href="' + data["items"][i]['site_url'] + '/users/login?returnurl=http%3a%2f%2fchat.stackexchange.com">' +
        '<img src="' + data["items"][i]['icon_url'] + '" >' +
        data["items"][i]['name'] + '</a>' +
        '</div>');
    }
  });
  $('#site-chooser').on('keyup',function(){
    $('.site').each(function(){
      if($(this).html().toLowerCase().indexOf($('#site-chooser').val().toLowerCase()) == -1){
        $(this).hide();
      }else{
        $(this).show();
      }
    });
  });
  $('#site-chooser').focus();
});
