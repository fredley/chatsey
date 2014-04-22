$(document).ready(function(){
  window.isMobile = function(){
    return ($("#header").length == 1);
  };
  window.inChat = function(){
    return ($('#chat-body').length > 0);
  };
  window.setTheme = function(theme){
    if(!inChat(){ return; })
    $('body').removeClass();
    $('body').addClass(theme);
    if(isMobile()){
      $('body').addClass('mob');
    }
    Android.setTheme(theme);
  };
  Android.setDeviceMobile(isMobile());
  Android.setInChat(inChat());
});
