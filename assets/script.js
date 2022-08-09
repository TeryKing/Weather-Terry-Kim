var owmAPI = "c10398046f11053f7d7f2aa0ce7f3c2c";
var currentCity = "";
var lastCity = "";



var Weather = function (event) 
{
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then(function (response)  
    {
        return response.json();
    })
    .then(function (response)  
    {
        saveCity(city);
        $('#search-error').text("");
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        renderCities();
        getFiveDayForecast(event);
        $('#header-text').text(response.name);
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}</h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        let lat = response.coord.lat;
        let long = response.coord.lon;
        let UVURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long +"&exclude=minutely,daily" + "&appid=" + owmAPI;
        fetch(UVURL)
        .then(handleErrors)
        .then(function(response)  
        {
            return response.json();
        })
        .then(function (response)  
        {
            let uvIndex = response.current.uvi;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3)
            {
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8)
            {
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}

