import css from "./style.css"
import moment from "moment"
const img = document.createElement("img");
const giphy = document.getElementById("giphy");
const currentTemperature = document.getElementById("currentTemperature");
const time = document.getElementById("time");
const date = document.getElementById("date");
const location = document.getElementById("location");
let hourlyGraphContainer=document.getElementById("hourlyGraphContainer");
const loading = document.getElementById("loading");
const dailyScrollContainer = document.getElementById("dailyScrollContainer");


const hourlyData = {
    time: [],
    temperature: [],
    weatherCode: [],
    realtiveHumidity:[],
    apparentTemperature:[],
}

//translates the weathercode obtained by the api to its string
const WeatherInterpretationCode={
    0:"Clear",
    1:"Mainly Clear",
    2:"Partly Cloudy",
    3:"Overcast",
    45:"Foggy",
    48:"Foggy",
    51:"Light Drizzle",
    53:"Moderate Drizzle",
    55:"Drizzle",
    61:"Slight rain",
    63:"Moderate rain",
    65:"Heavy rain",
    66:"Freezing rain" ,
    67:"Freezing rain",
    71:"Slight snow",
    73:"Moderate snow",
    75:"Heavy snow",
    77:"Snow",
    80:"Slight rain showers",
    81:"Moderate showers",
    82:"Violent rain showers",
    85:"Slight snow showers",
    86:"Heavy snow showers",
    95:"Moderate thunderstorms",
    96:"Thunderstorm",
    99:"Thunderstorm",
}
//sets the time and date, and updates every second and minute respectively
updateDate();
updateTime();
setInterval(updateDate,60000);
setInterval(updateTime,1000);

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


function updateDate(){
    let currentDate = moment().format("dddd MMMM Do YYYY")
    date.innerText=currentDate;
}
function updateTime(){
    let currentTime = moment().format("h:mm a")
    time.innerText=currentTime;}


//creates userLocation method that will be used for local weather
let userLocation = {
    latitude:"",
    longitude:"",
    city:"",
    state:"",
}
//gets local latitude and longitude and fills in userLocation object
navigator.geolocation.getCurrentPosition(function(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    updateUserLocationObject(latitude,longitude);
});
function updateUserLocationObject(latitude,longitude){
    userLocation.latitude=`${latitude}`;
    userLocation.longitude=`${longitude}`;
    const locationResult =getCityState();
    location.innerText=locationResult;
    const hourlyWeatherResult = getHourlyWeather();
    const dailyWeatherResult =getDailyWeather();
    const promises = [locationResult,hourlyWeatherResult,dailyWeatherResult];
    Promise.all(promises).then(()=>{
        stopLoadingDisplay();})
}

function stopLoadingDisplay(){
loading.remove();
}





const getCityState = async function(){
    let response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&apiKey=b7b344961fd34275826450df81846e7b`,{mode: 'cors'})
    let data = await response.json();
    userLocation.city = data.features[0].properties.city;
    userLocation.state = data.features[0].properties.state_code;
    location.innerText = `${userLocation.city}, ${userLocation.state}`        
}


//retrieves hourly weather data from open-meteo
const getHourlyWeather = async function(){
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode&temperature_unit=fahrenheit&timezone=${timezone}&timeformat=unixtime`,{mode: 'cors'})
    const weatherData =  await response.json();
    

    //formats time, and fixes arrays from full week to current time->rest of week
    let timeData = formatTimeHourly(weatherData.hourly.time);     
    let temperatureData = weatherData.hourly.temperature_2m;
    let weatherCodeData = weatherData.hourly.weathercode;
    let relativeHumidityData= weatherData.hourly.relativehumidity_2m;
    let apparentTemperatureData =weatherData.hourly.apparent_temperature;

    let arrayDifference = temperatureData.length - timeData.length;
    weatherCodeData.splice(0,arrayDifference);
    temperatureData.splice(0,arrayDifference);
    weatherCodeData.splice(0,arrayDifference);
    relativeHumidityData.splice(0,arrayDifference);
    apparentTemperatureData.splice(0,arrayDifference);



    let currentRelativeHumidity= weatherData.hourly.relativehumidity_2m[0];
    let currentTemperatureHourly = weatherData.hourly.temperature_2m[0];
    let currentApparentTemperature = weatherData.hourly.apparent_temperature[0];
    currentTemperature.innerText=currentTemperatureHourly;
    //takes the data from api and fills in hourlydata object
    createHourlyData(timeData,temperatureData,weatherCodeData);
    displayHourlyData();
    console.log(weatherData);
    console.log(currentRelativeHumidity);
    console.log(currentTemperature);
    console.log(currentApparentTemperature);

}

//changes time format from api array that is in unixtime to readable time
function formatTimeHourly(hourArray){
    let unixArray = hourArray;
    let formattedArray = [];
    unixArray.forEach(unixTime=>{
        if(moment(unixTime).isAfter(moment().subtract(1,"hour").unix())){        
        let formattedTime = moment(unixTime * 1000).format(`dddd h:mm a`);
        formattedArray.push(formattedTime);}        
    ;})
    return formattedArray
}



//gets time, temperature and weather data from api then fills in hourly data object
function createHourlyData(timeData,temperatureData,weatherCodeData){
    for(let i = 1; i<timeData.length;i++){            
            hourlyData.time.push(timeData[i]);
            hourlyData.temperature.push(temperatureData[i]);
            hourlyData.weatherCode.push(weatherCodeData[i]);
    }
}

//Display Hourly Data
function displayHourlyData(){
    for(let i =0;i<hourlyData.time.length;i++){
    let hourlyDataContainer = createHourlyDataContainer();
    let hourlyDataDate = createHourlyDataDate(hourlyData.time[i]);
    let hourlyDataTemperature = createHourlyDataTemperature(hourlyData.temperature[i]);
    let hourlyDataWeatherDescriptor = createHourlyDataWeatherDescriptor(hourlyData.weatherCode[i]);

    hourlyDataContainer.appendChild(hourlyDataDate);
    hourlyDataContainer.appendChild(hourlyDataTemperature);
    hourlyDataContainer.appendChild(hourlyDataWeatherDescriptor);

    hourlyGraphContainer.appendChild(hourlyDataContainer);}
}
function createHourlyDataContainer(){
    let hourlyDataContainer = document.createElement("div");
    hourlyDataContainer.classList.add("hourDataContainer");
    return hourlyDataContainer
}

function createHourlyDataDate(hourlyTimeData){
    let hourlyDataDateContainer = document.createElement("div");
    hourlyDataDateContainer.classList.add("hourDataDate");
    hourlyDataDateContainer.innerText=hourlyTimeData;
    return hourlyDataDateContainer
}
function createHourlyDataTemperature(hourlyTemperatureData){
    let hourlyDataTemperatureContainer = document.createElement("div");
    hourlyDataTemperatureContainer.classList.add("hourDataTemperature");
    hourlyDataTemperatureContainer.innerText=`${hourlyTemperatureData}°`;
    return hourlyDataTemperatureContainer
    
}
function createHourlyDataWeatherDescriptor(hourlyWeatherData){
    let hourlyWeatherDataCode = hourlyWeatherData;
    let hourlyDataWeatherDescriptorContainer = document.createElement("div");
    hourlyDataWeatherDescriptorContainer.classList.add("hourDataWeatherDescriptor");
    let weatherCodeText = WeatherInterpretationCode[hourlyWeatherDataCode];
    hourlyDataWeatherDescriptorContainer.innerText=weatherCodeText;
    return hourlyDataWeatherDescriptorContainer
}


async function getDailyWeather(){
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=${timezone}`,{mode: 'cors'})
    const weatherData =  await response.json();
    
    
    for(let i =0;i<7;i++){
        //declaring variables from functions based on weather data
        let formattedDay = formatTimeDaily(weatherData.daily.time[i]);
        let dailyDataContainer = createDailyDataContainer();  
        let dayAndHighLow = createDayAndHighLowContainer();
        let highLow = createHighLow();
        let day = createDay(formattedDay);
        let dailyTemperature = createDailyTemperature(weatherData.daily.temperature_2m_max[i]);
        let dailyWeatherDescription = createDailyWeatherDescription(weatherData.daily.weathercode[i]);        
        //append day and high/low containers to the dayandhighlow container
        dayAndHighLow.appendChild(day);
        dayAndHighLow.appendChild(highLow);
        //append children to the daily data container
        dailyDataContainer.appendChild(dayAndHighLow);
        dailyDataContainer.appendChild(dailyTemperature);
        dailyDataContainer.appendChild(dailyWeatherDescription);
        //appendthe daily data container to the common parent scrolling container
        dailyScrollContainer.appendChild(dailyDataContainer);
    }
}

//formats time to just give the day
function formatTimeDaily(dailyTimeData){
    let unformattedTime = dailyTimeData;
    let formattedTime = moment(unformattedTime).format("dddd")
    return formattedTime
}
//creates the daily data container and assigns its class
function createDailyDataContainer(){
    let dailyDatacontainer = document.createElement("div");
    dailyDatacontainer.className="dailyDataContainer";
    return dailyDatacontainer
}
//creates the day/high/low container and assigns its class
function createDayAndHighLowContainer(){
    let dayAndHighLowContainer = document.createElement("div");
    dayAndHighLowContainer.className="dayAndHighLow"
    return dayAndHighLowContainer
}
//creates the highLow and Day containers and assigns their classes and fills in their values, will display H Temperature by default
function createHighLow(){
    let highLow = document.createElement("div");
    highLow.className ="highLow";
    highLow.innerText="H"
    return highLow
}
function createDay(formattedDay){
    let day = document.createElement("div");
    day.className="day";
    day.innerText=formattedDay
    return day
}
//creates the daily temperature container, assigns its class, and sets its inner text to the daily temperature
function createDailyTemperature(temperatureData){
    let dailyTemperature = document.createElement("div");
    dailyTemperature.className="dailyTemperature"
    dailyTemperature.innerText=`${temperatureData}°`;
    return dailyTemperature
}
//creates weather description container and obtains its code by the api, then uses the interpretator object to fill in its text
function createDailyWeatherDescription(weatherCodeData){
    let dailyWeatherDescription = document.createElement("div");
    dailyWeatherDescription.className="dailyWeatherDescriptor";
    let descriptor = WeatherInterpretationCode[weatherCodeData]
    dailyWeatherDescription.innerText=descriptor;
    return dailyWeatherDescription
}








//finds random int
const randomInt = (min,max) => {
    let num = Math.random() * (max - min) + min;
    return Math.round(num);
};

//arrays to identify gifs based on weather code
const sunshineGifIDs = [`uqpK3SuxEY4W9YQvdg`,`a342Mh0bNtoJEIrMJa`,`qZohEEh4bhuQ8`,`jk9L41aToGZQA`,`1Fm7jEapE18HwS6fkT`,`xUPGcjDsJA9Ki3ZqmY`,`THc9OBG5aZkqUKNuq8`,`a6wPWEJ0k8sPJIgLab`];
const cloudyGifIDs = [`gs2ubveMcc2zPVNceK`,`42uCipbG9P4ZaXoum8`,`oNXIP3xpr00k05NVPQ`,`YbWRmFwlJ3PtuDa0BF`,`KV1s4kSJHaY3m`,`26gs87YcoCMeQFMcw`,`Ke7i5t6QDmDSO82Uga`];
const rainGifIDs = [`t7Qb8655Z1VfBGr5XB`,`5PjafLZFxMWc`,`l0MYyhMKJGQEfSM8g`,`W9qCmeTuUoaFG`,`l0NwzT1BiNMyrzxM4`,`Ns4XGIO44IICMfsQOW`,`1ipRdxBacFXBjoov2f`];
const snowGifIDs = [`3oFzm7xQje1yyQK3e0`,`zGJbfvlsg9KjC2VXyJ`,`iq3nJr0SbPTcDpInRf`,`3oKIP7W2zOcac3RvFe`,`Xi2Xu0MejhsUo`,`qjQN9kTe1zy8Uz5lhy`,`gH2bKIakvLuW4`];

//display different gifs based on what the weather is
function displayRandomSunshineGif(){
    let sunshineID=sunshineGifIDs[randomInt(0,7)];    
    getGif(`${sunshineID}`);
}
function displayRandomCloudyGif(){
    let cloudyID = cloudyGifIDs[randomInt(0,6)];
    getGif(`${cloudyID}`);
}
function displayRandomRainGif(){
    let rainID = rainGifIDs[randomInt(0,6)];
    getGif(`${rainID}`);
}
function displayRandomSnowGif(){
    let snowID = snowGifIDs[randomInt(0,6)];
    getGif(`${snowID}`);
}

//function that retrieves a gif from giphy api
const getGif = async function(searchword){
   const response = await fetch(`http://api.giphy.com/v1/gifs/${searchword}?api_key=Ts51RaqoXf5wG1cLgb7aXZfPTJMA00dv`, {mode: 'cors'})
   const Gifdata = await response.json();
   img.id="giphyImg";
    img.src = Gifdata.data.images.original.url;
    while(giphy.firstChild){
        giphy.firstChild.remove();
    }
    giphy.appendChild(img);}

  displayRandomSunshineGif();



