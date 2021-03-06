$(document).ready(() => {

  // read query parameters from the url
  var urlParams = new URLSearchParams(window.location.search);

  var paramObj = {
    city: urlParams.get("city"),
    date: urlParams.get("date"),
    state: urlParams.get("state")
  };
  console.log(paramObj)

  var today = moment().format("MM-DD-YYYY");
  var maxDate = moment(today, "MM-DD-YYYY").add(108, "h").format("MM-DD-YYYY");

  $("#date-id").attr(`min ="${today}`);
  $("#date-id").attr(`max ="${maxDate}`);


  // Ticketmaster requires a specific date format for their API call
  var ticketMasterDate = moment(paramObj.date, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");
  var ticketMasterEndDate = moment(paramObj.date, "YYYY-MM-DD").add(23, "h").format("YYYY-MM-DDTHH:mm:ssZ")

  var ticketMasterUrl = `https://alex-rosencors.herokuapp.com/?url=https://app.ticketmaster.com/discovery/v2/events.json?size=12&apikey=8pz0roVaKoVrDwdaTb4ChFO20fDnHIrg&city=${paramObj.city}&stateCode=${paramObj.state}&startDateTime=${ticketMasterDate}&endDateTime=${ticketMasterEndDate}`
  console.log(ticketMasterUrl);

  $.ajax({
      url: ticketMasterUrl,
      method: "GET"
    })
    .then(function (ticketMasterResponse) {
      console.log(ticketMasterResponse);

      var responseKeys = Object.keys(ticketMasterResponse);

      if (!responseKeys.includes("_embedded")) {
        console.log("Nothing found");
        $("#event-wrapper").text("No Search Results Found. Please check your city/state again.");
        return false;
      }

      var tmResults = ticketMasterResponse._embedded.events;

      // This section is on Events Page load after initial search from main page //

      tmResults.forEach(function (event) {

        var tmStartTime = event.dates.start.localTime;
        var tmDate = event.dates.start.localDate
        var tmDateAndTime = `${tmDate} ${tmStartTime}`


        var tmZipCode = event._embedded.venues[0].postalCode;
        var tmEventName = event.name;


        var eventDiv = $(`<div class="card-wrapper d-flex flex-column col-12 col-md-4 mb-2 pt-3">`);

        eventDiv.attr("data-zip", tmZipCode);
        eventDiv.attr("event-name", tmEventName);
        eventDiv.attr("event-DateAndTime", tmDateAndTime);

        var ticketButton = $(`<a href=${event.url} target="_blank" class="btn btn-block btn-danger">`).text("Get Tickets");

        var eventImg = $(`<img class="card-img-top" src=${event.images[1].url} />`);
        var eventDivBody = $(`<div class="card-body d-flex flex-column">`);

        var eventH5 = $(`<h5 class="card-title title-font">`);
        eventH5.text(event.name);
        var eventP = $(`<p class="card-text normal-font text-muted">`);

        var venueName = event._embedded.venues[0].name
        var eventDate = event.dates.start.localDate
        var eventDateFormatted = moment(eventDate, "YYYY-MM-DDTHH:mm:ssZ").format("M-DD-YYYY");
        var eventTime = event.dates.start.localTime
        var eventTimeFormatted = moment(eventTime, "HH:mm:ss").format("h:mm a");
        eventP.append(`${venueName}<br>${eventDateFormatted}<br>${eventTimeFormatted}`);
        eventDivBody.append(eventH5, eventP, ticketButton);
        eventDiv.append(eventImg, eventDivBody);

        $("#destination").text(paramObj.city);
        // $("#date").text(eventDateFormatted);
        $("#event-wrapper").append(eventDiv);

      });
      // End initial search section //


      $("#event-wrapper").on("click", ".card-wrapper", function () {

        var tmZipCode = $(this).attr("data-zip");
        var tmEventName = $(this).attr("event-name");
        var tmDateAndTime = $(this).attr("event-DateAndTime");

        var openWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${tmZipCode}&APPID=34298613862c897b961ca0ebebbda16d`

        $.ajax({
            url: openWeatherUrl,
            method: "GET"
          })
          .then(function (openWeatherResponse) {
            console.log(openWeatherResponse);

            var owResults = openWeatherResponse.list;

            owResults.forEach(function (result) {
              $(".weather-header").text("")

              var owTempMax = result.main.temp_max;
              var owTempMin = result.main.temp_min;
              var tempMaxConverted = parseInt(1.8 * (owTempMax - 273) + 32);
              var tempMinConverted = parseInt(1.8 * (owTempMin - 273) + 32);
              var weatherCond = result.weather[0].main;

              var weatherEventName = $(`<p class="normal-font text-muted">`).append(tmEventName);

              if (tmDateAndTime < result.dt_txt) {
                console.log(`event time: ${tmDateAndTime} and weather time: ${result.dt_txt}`);

                var conditionPTag = $(`<p class="normal-font text-muted">`).append(weatherCond);
                var temperaturePTag = $(`<p class="normal-font text-muted">`).append(`Low: ${tempMinConverted}° - High: ${tempMaxConverted}°`);

                var weatherDivBody = $(`<div class="card-body">`);

                weatherDivBody.append(weatherEventName);
                if (weatherCond === "Rain") {
                  weatherDivBody.append($("<img src='assets/images/rain.png' alt='rain' class='img-fluid' />"));
                } else if (weatherCond === "Snow") {
                  weatherDivBody.append($("<img src='assets/images/snow.png' alt='snow' class='img-fluid' />"));
                } else if (weatherCond === "Clouds") {
                  weatherDivBody.append($("<img src='assets/images/cloudy.png' alt='clouds' class='img-fluid' />"));
                } else if (weatherCond === "Clear") {
                  weatherDivBody.append($("<img src='assets/images/clear-sky.png' alt='clear' class='img-fluid' />"));
                } else if (weatherCond === "Wind") {
                  weatherDivBody.append($("<img src='assets/images/windy.png' alt='wind' class='img-fluid' />"));
                };
                weatherDivBody.append(conditionPTag, temperaturePTag);

                $("#weather-wrapper").html(weatherDivBody);
              }

            })

          })
      })

      // Begin section for the events page specific search bar //

      $("#searchBtn").on("click", function (event) {
        event.preventDefault();

        // read from user input tags

        var userInput = {
          city: $("#city-id").val().trim(),
          state: $("#state-id").val(),
          date: $("#date-id").val().trim()
        };

        var userInputUnix = parseInt(moment(userInput.date, "YYYY-MM-DD").format("X"));
        var maxDateUnix = parseInt(moment(maxDate, "MM-DD-YYYY").format("X"));

        if (!userInput.city || !userInput.state || !userInput.date) {
          return false;
        } else if (userInputUnix > maxDateUnix) {
          console.log("greater")
          $("#date-rejection").text("* ROAM is all about being spontaneous. Try searching again within the next 4 days.");
          return false;
        }

        var eventUrl = "events.html?city=" + userInput.city + "&state=" + userInput.state + "&date=" + userInput.date;

        location.href = eventUrl;

        $.ajax({
            url: ticketMasterUrl,
            method: "GET"
          })
          .then(function (ticketMasterResponse) {

            var tmResults = ticketMasterResponse._embedded.events

            if (ticketMasterResponse.page.totalElements === 0) {
              $("#event-wrapper").text("No Search Results Found. Please check your city/state again.");
              console.log(false);
            } else {

              tmResults.forEach(function (event) {

                var tmZipCode = event._embedded.venues[0].postalCode;


                var eventDiv = $(`<div class="card-wrapper d-flex flex-column col-12 col-md-4 mb-2 pt-3">`);

                eventDiv.attr(`${tmZipCode}`);

                var eventImg = $(`<img class="card-img-top" src=${event.images[1].url}/>`);
                var eventDivBody = $(`<div class="card-body d-flex flex-column">`);

                var eventH5 = $(`<h5 class="card-title title-font">`);
                eventH5.text(event.name);
                var eventP = $(`<p class="card-text normal-font text-muted">`);
                var ticketButton = $(`<button class="btn btn-block btn-danger mt-auto">`).text("Get Tickets!");
                var venueName = event._embedded.venues[0].name
                var eventDate = event.dates.start.localDate
                var eventDateFormatted = moment(eventDate, "YYYY-MM-DDTHH:mm:ssZ").format("M-DD-YYYY");
                var eventTime = event.dates.start.localTime
                var eventTimeFormatted = moment(eventTime, "HH:mm:ss").format("h:mm a");
                eventP.append(`${venueName}<br>${eventDateFormatted}<br>${eventTimeFormatted}`);
                eventDivBody.append(eventH5, eventP, ticketButton);
                eventDiv.append(eventImg, eventDivBody);

                $("#destination").text(paramObj.city);
                $("#date").text(eventDateFormatted);
                $("#event-wrapper").append(eventDiv);
              });
            }
          });
      });
    });

  //slideshow jumbotron
  $(".backstretch").backstretch([
    "assets/images/events-hero.jpg",
    "assets/images/events-hero2.jpg",
    "assets/images/events-hero3.jpg",
    "assets/images/events-hero4.jpg",
    "assets/images/events-hero5.jpg",
    "assets/images/events-hero6.jpg"
  ], {
    duration: 4000,
    transition: 'fade',
    fade: 500
  });

});