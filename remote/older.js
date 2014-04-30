$(document).ready(function(){
  if($('#login').length > 0){
    if(confirm("Logging in to chat requires you to log into a site first. Do you want to log in now?")){
      location.href = "http://chatsey.s3-website-eu-west-1.amazonaws.com/remote/login.html";
    }
  }
});
