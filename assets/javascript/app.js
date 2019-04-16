$(document).ready(function () {

  // read query parameters from the url
  var urlParams = new URLSearchParams(window.location.search);

  var paramObj = {
    city: urlParams.get("city"),
    state: urlParams.get("state"),
    date: urlParams.get("date")
  }

  var today = moment().format("MM-DD-YYYY");
  console.log(today);

  $("#date-id").attr(`min ="${today}`);

  $("#searchBtn").on("click", function (event) {
    event.preventDefault();

    // read from input tags

    var userInput = {
      city: $("#city-id").val().trim(),
      state: $("#state-id").val(),
      date: $("#date-id").val().trim()
    };

    if(!userInput.city || !userInput.state || !userInput.date) {
      return false;
    }

    var eventUrl = "events.html?city=" + userInput.city + "&state=" + userInput.state + "&date=" + userInput.date;

    location.href = eventUrl;

  });
});