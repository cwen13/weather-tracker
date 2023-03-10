let apiBase = "https://api.openweathermap.org/";
let apiKey = "83a44da7964246bbf900a3b2168f29ce";
let apiBaseWeather = apiBase + "data/2.5/forecast?";
let apiBaseLatLon = apiBase + "geo/1.0/direct?";
let apiBaseToday = apiBase + "data/2.5/weather?";

let weatherData = JSON.parse(localStorage.getItem("weatherResponse"));
let weatherToday = JSON.parse(localStorage.getItem("weatherToday"));
let prevCities = JSON.parse( localStorage.getItem("cityLatLong"));

let searchBtn = $("#search");
let cityEl = $("#city");
let stateEl = document.getElementById("selectState");
let latlong;
let cityLatLong = [];



function pullStats(weatherEntry) {
  let entry = {date:"",
	       icon:"",
	       temp:"",
	       wind:"",
	       humidity:""
	      };
  let date = new Date(weatherEntry["dt"]*1000);
  entry["date"] = date.getFullYear()
    +'/'+('0'+(date.getMonth()+1)).slice(-2)
    +'/'+('0'+date.getDate()).slice(-2);
  entry["icon"] = weatherEntry["weather"][0]["icon"];
  entry["temp"] = weatherEntry["main"]["temp"];
  // add in line to get direction in NWSE
  entry["wind"] = weatherEntry["wind"]["speed"];
  entry["humidity"] = weatherEntry["main"]["humidity"];

  return entry;
}
    
function buildToday (weatherNow) {
  function getIcon(iconTag) {
    let iconURL = "http://openweathermap.org/img/wn/"+iconTag+".png";
    let icon = $("<img>");
    icon.attr("src",iconURL);
    $("#today .date").append(icon);
    return 0;
  }

  // reach inot global to get weatherToday
  let city = $("<h2>").text(weatherNow["name"]);
  city.insertBefore($("#today"))
  let date = $("#today .date").text("Now: ");
  getIcon(weatherNow["weather"][0]["icon"]);
    
  let temp = $("#today .temp").text("Temperature: "+weatherNow["main"]["temp"]);
  let wind = $("#today .wind").text("wind speed: "+weatherNow["wind"]["speed"]);
  let humidity = $("#today .humidity").text("Humidity: "+weatherNow["main"]["humidity"]);
  return 0;
}


function buildForecast (weather) {
  
  // reach into gloaal for weeather variable
  let weekForcast = $(".week-forecast");
  let section = $("<section>");
  let date = $("<section>").text("DATE:");
  let icon = $("<img>");
  let temp = $("<section>");
  let wind = $("<section>");
  let humidity = $("<section>");

  date.text("Date: " + weather["date"]);
  icon.attr("src","http://openweathermap.org/img/wn/"+weather["icon"]+".png")
  temp.text("Temperature: " +weather["temp"]);
  wind.text("Wind speed: " + weather["wind"]);
  humidity.text("Humidity: " +weather["humidity"]);

  section.attr("class","box has-background-info has-text-black");
  section.attr("style", "margin-bottom: 1.5rem;");
  section.append(date);
  section.append(icon);
  section.append(temp);
  section.append(wind);
  section.append(humidity);
  weekForcast.append(section);
  return 0;
}

function buildPrevCities(pCity) {
  let city = pCity[0].split(",")[0];
  let cityEntry = $("<li>");
  let cityEl = $("<button>");
  cityEl.text(city);
  cityEl.attr("class", "button is-info city-list");
  
  $(".prev-cities").append(cityEntry.append(cityEl));
  return 0;
}

let handlePrevCity = (event) => {
  let oldCity = event.target.textContent;
  let oldCities = JSON.parse(localStorage.getItem("cityLatLong"));
  let cityLon, cityLat;
  for (let i=0;i<oldCities.length;i++) {
    if (oldCity === oldCities[i][0].split(",")[0]) {
      cityLat = oldCities[i][1][0];
      cityLon = oldCities[i][1][1];
    }
  }

  let apiWeather = `${apiBaseWeather}lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`;
  fetch(apiWeather)
    .then(response => response.json())
    .then((data) => {
      localStorage.setItem("weatherResponse", JSON.stringify(data["list"]));
    })
    .then( () => {
      let apiToday = `${apiBaseToday}lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`;
      fetch(apiToday)
	.then(response => response.json())
	.then( data => {
	  localStorage.setItem("weatherToday", JSON.stringify(data));
	})
	.then(() => { window.location.reload();});
    });
  return 0;

}

function getLatLon(geoJson, state) {
  for (let i=0; i<geoJson.length; i++) {
    if (geoJson[i]["state"] == state) {
      return [geoJson[i]["lat"].toFixed(2)
	      ,geoJson[i]["lon"].toFixed(2)];
    }
  }
  return console.log("State not found");
}

function handlerGetData(event){
  event.preventDefault();
  if (localStorage.getItem("cityLatLong")) {
    cityLatLong = JSON.parse(localStorage.getItem("cityLatLong"));
  }
  
  let city = cityEl.val();
  let state = stateEl.options[stateEl.selectedIndex].value;
  let cityState = city+","+state;
  let apiLatLon = `${apiBaseLatLon}q=${city},${state}&limit=10&appid=${apiKey}`;
   fetch(apiLatLon)
    .then(response => response.json())
    .then((data) =>{
      latlong = getLatLon(data,state);
      if (cityLatLong.length === 0 ) {
	cityLatLong.push([cityState,latlong]);
      } else {
	for (let i=0; i<cityLatLong.length; i++) {
	  if (cityState == cityLatLong[i][0]) {
	    break;
	  }
	  if (i+1 === cityLatLong.length) {
	    cityLatLong.push([cityState, latlong]);
	  }
	}
      }

      localStorage.setItem("cityLatLong", JSON.stringify(cityLatLong));
      let apiWeather = `${apiBaseWeather}lat=${latlong[0]}&lon=${latlong[1]}&units=imperial&appid=${apiKey}`;
      fetch(apiWeather)
	.then(response => response.json())
	.then((data) => {
	  localStorage.setItem("weatherResponse", JSON.stringify(data["list"]));
	})
	.then( () => {
	  let apiToday = `${apiBaseToday}lat=${latlong[0]}&lon=${latlong[1]}&units=imperial&appid=${apiKey}`;
	  fetch(apiToday)
	    .then(response => response.json())
	    .then( data => {
	      localStorage.setItem("weatherToday", JSON.stringify(data));
	    })
	    .then(() => { window.location.href = "./results.html";});
	});
    });  
  return 0;
}

function main () {
  if (prevCities) {
    for (let i=0; i<prevCities.length; i++){
      buildPrevCities(prevCities[i]);
    }
  }
  buildToday(weatherToday);
  for (let i=0;i<weatherData.length; i++) {
    let readingTime = (weatherData[i]["dt_txt"]).split(" ")[1];
    if (readingTime === "12:00:00"){
      buildForecast(pullStats(weatherData[i]));
    }
  }
}

main();
$("li").on("click",handlePrevCity);
searchBtn[0].addEventListener('click', handlerGetData);

