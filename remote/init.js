$(document).ready(function(){
  Android.setDeviceMobile($("#header").length == 1);
  window.setTheme = function(theme){
    $('body').removeClass();
    $('body').addClass(theme);
    if($("#header").length == 1){
      $('body').addClass('mob');
    }
    Android.setTheme(theme);
  };
});
