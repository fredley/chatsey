$(document).ready(function(){
  window.isMobile = function(){
    return ($("#header").length == 1);
  };
  window.inChat = function(){
    return ($('#chat-body').length > 0);
  };
  window.setTheme = function(theme){
    if(!inChat()){ return; }
    $('body').removeClass();
    $('body').addClass(theme);
    if(isMobile()){
      $('body').addClass('mob');
    }
    Android.setTheme(theme);
  };

  var URL_ROOT = "http://chatsey.s3-website-eu-west-1.amazonaws.com/remote/";

  var addScript = function(url){
    var script = $('<script/>');
    script.attr('type','text/javascript');
    script.attr('src',url);
    $('head').append(script);
  }
  var addStyle = function(url){
    var style = $('<link/>');
    style.attr('rel','stylesheet');
    style.attr('href',url);
    $('head').append(style);
  }
  if(isMobile()){
    addStyle(URL_ROOT + 'mobile.css');
    addScript(URL_ROOT + 'livequery.js');
    addScript(URL_ROOT + 'mobile.js');
  }else{
    addStyle(URL_ROOT + 'tablet.css');
    addScript(URL_ROOT + 'tablet.js');
  }
  addStyle(URL_ROOT + 'themes.css');
  try{
    Android.setInChat(inChat());
  }catch(e){}
});
