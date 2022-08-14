//API KEY for Open Weather
var myAPI = "c10398046f11053f7d7f2aa0ce7f3c2c";
var myCity = "";
var lastCity = "";


//weather function for temperature,humidity, and wind speed. Using api key here to retrieve information for display
var Weather = function (event) 
{
    let city = $('#searchcity').val();
    let APIURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    myCity= $('#searchcity').val();
    fetch(APIURL)
    .then(handleErrors)
    .then(function (response)  
    {
        return response.json();
    })
    .then(function (response)  
    {   //Location fetch to grab city location, and weather information for the main dashboard
        saveCity(city);
        $('#searcherror').text("");
        let TimeUTC = response.dt;
        let TimeZone = response.timezone;
        let TimeZoneHours = TimeZone / 60 / 60;
        let currentMoment = moment.unix(TimeUTC).utc().utcOffset(TimeZoneHours);
        renderCities();
        getFiveDayForecast(event);
        //Inputing text inside the html content when function flows
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

        //UV INDEX function which will display certain UV value will apply a certain CSS using IF statement.
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
            //simple if statement to determine UV index is favorable to severe
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

//This function will be displaying the 5 day forecast below the main dashboard
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
        let FiveDayForecastHTML = '<h2>5 Day Forecast:</h2> <div id="fivedayUl" class="d-inline-flex flex-wrap ">';
        for (let i = 0; i < response.list.length; i++) 
        {
            //Putting timezone using moment
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZone = response.city.timezone;
            let timeZoneHours = timeZone / 60 / 60;
            let Moment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneHours);
            if (Moment.format("HH:mm:ss") === "11:00:00" || Moment.format("HH:mm:ss") === "12:00:00" || Moment.format("HH:mm:ss") === "13:00:00") 
            {//adds date thru JS within the five day forecast
                FiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${Moment.format("MM/DD/YY")}</li>
                        <br>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        FiveDayForecastHTML += "</div>";
        $('#five-day-forecast').html(FiveDayForecastHTML);
    })
}

//Local Storage function to save user inputed cities
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

//Rendering Cities for displaying cities
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
            $('#searchcity').attr("value", "Mexico");
        }
    } 
    
    //Loop to get city and local storage when rendering
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


//onclick function for city search function
$('#search-button').on("click", function (event) 
{
event.preventDefault();
myCity = $('#searchcity').val();
Weather(event);
});

//
$('#city-results').on("click", function (event)  
{
    event.preventDefault();
    $('#searchcity').val(event.target.textContent);
    myCity=$('#searchcity').val();
    Weather(event);
});

//Clearing function upon clicking Clear storage element
$("#clear-storage").on("click", function()  
{
    localStorage.clear();
    renderCities();
});

//Rendering cities and the weather
renderCities();
Weather();

//Error function for in case for incorrect response
var handleErrors = function (response) 
{
    if (!response.ok) 
    {
        throw Error(response.statusText);
    }
    return response;
}