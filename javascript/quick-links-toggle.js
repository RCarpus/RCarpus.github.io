/*Function to toggle quick links bar*/
$(document).ready(() => {
  $('#sidebar-header').on('click', (event) => {
    $('#quick-links').slideToggle();
  });
});


