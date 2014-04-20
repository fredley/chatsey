$(document).ready(function(){

	// move room title to top
	$('#sidebar-content').prepend( $('#roomtitle') );

	// Add an X to every quick leave button
	$('.quickleave').text('x');

	// Move full stars list link to bottom of starred message widget
	$('#starred-posts').after( $('#show-all-starred') );	

  console.log('injected');
});