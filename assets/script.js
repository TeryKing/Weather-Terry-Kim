var myAPI = "c10398046f11053f7d7f2aa0ce7f3c2c";
var myCity = "";
var lastCity = "";



var Weather = function (event) 
{
    let city = $('#searchcity').val();
    myCity= $('#searchcity').val();
    let APIURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(APIURL)
    .then(handleErrors)
    .then(function (response)  
    {
        return response.json();
    })
    .then(function (response)  
    {
        saveCity(city);
        $('#searcherror').text("");
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
        let UVURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long +"&exclude=minutely,daily" + "&appid=" + myAPI;
        fetch(UVURL)
        .then(handleErrors)
        .then(function(response)  
        {
            return response.json();
        })
        .then(function (response)  
        {
            let uvIndex = response.current.uvi;
            $('#uvIndex').html(`UV Index: <span id="uvValue"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3)
            {
                $('#uvValue').attr("class", "uv-favorable");
            } 
            else if (uvIndex>=3 && uvIndex<8)
            {
                $('#uvValue').attr("class", "uv-moderate");
            } 
            else if (uvIndex>=8){
                $('#uvValue').attr("class", "uv-severe");
            }
        });
    })
}

var getFiveDayForecast = function()  
{
    let city = $('#searchcity').val();
    let APIURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(APIURL)
        .then (handleErrors)
        .then(function(response)  
        {
            return response.json();
        })
        .then(function(response)  
        {
        let fiveDayForecastHTML = '<h2>5 Day Forecast:</h2> <div id="fivedayUl" class="d-inline-flex flex-wrap ">';
        for (let i = 0; i < response.list.length; i++) 
        {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") 
            {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <br>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        fiveDayForecastHTML += "</div>";
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}


var saveCity = function (newCity)  
{
    let cityExists = false;
    for (let i = 0; i < localStorage.length; i++) 
    {
        if (localStorage["cities" + i] === newCity) 
        {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) 
    {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var renderCities = function()  
{
    $('#city-results').empty();
    if (localStorage.length===0)
    {
        if (lastCity)
        {
            $('#searchcity').attr("value", lastCity);
        } 
        
        else 
        {
            $('#searchcity').attr("value", "Enter A City");
        }
    } 
    
    else 
    {
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#searchcity').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) 
        {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (myCity==="")
            {
                myCity=lastCity;
            }
            if (city === myCity) 
            {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } 

            else 
            {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }

        if (localStorage.length>0)
        {
            $('#clear-storage').html($('<a id="clear-storage" href="#">CLEAR THE LIST</a>'));
        } 
        
        else 
        {
            $('#clear-storage').html('');
        }
    }
    
}

$('#search-button').on("click", function (event) 
{
event.preventDefault();
myCity = $('#searchcity').val();
Weather(event);
});

$('#city-results').on("click", function (event)  
{
    event.preventDefault();
    $('#searchcity').val(event.target.textContent);
    myCity=$('#searchcity').val();
    Weather(event);
});

$("#clear-storage").on("click", function()  
{
    localStorage.clear();
    renderCities();
});

renderCities();
Weather();

var handleErrors = function (response) 
{
    if (!response.ok) 
    {
        throw Error(response.statusText);
    }
    return response;
}