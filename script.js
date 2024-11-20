const apiKey = '5228c094acmsh7cd121cf8ca6c9ep13c9e1jsne6bca0135e15';
let isCelsius = true;


const weatherSymbols = {
    Clear: '☀️',
    Wind: '💨',
    Rain: '🌧️',
    Clouds: '☁️',
    Drizzle: 'drizzle',
    Humidity: '💧',
    Snow: '❄️'
};

function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://open-weather13.p.rapidapi.com/city/${city}/EN`;
	const forecastUrl = `https://open-weather13.p.rapidapi.com/forecast/${city}/EN`;

    fetchWeatherData(currentWeatherUrl, forecastUrl);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude; 
            const lon = position.coords.longitude;
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            
            fetchWeatherData(currentWeatherUrl, forecastUrl);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherData(currentWeatherUrl, forecastUrl) {
    $.ajax({
        url: currentWeatherUrl,
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
    }).done(function (data) {
        displayWeather(data);
        saveToLocalStorage(data);
    }).fail(function () {
        alert('Error fetching current weather data. Please try again.');
    });

    $.ajax({
        url: forecastUrl,
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
    }).done(function (data) {
        displayHourlyForecast(data.list);
    }).fail(function () {
        alert('Error fetching hourly forecast data. Please try again.');
    });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    weatherInfoDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = isCelsius ? Math.round(data.main.temp - 273.15) : Math.round((data.main.temp - 273.15) * 9/5 + 32);
        const description = data.weather[0].main; 
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `
            <p>${temperature}°${isCelsius ? 'C' : 'F'}</p>
        `;

        const weatherSymbol = weatherSymbols[description] || description; 
        const weatherHtml = `
            <p>${cityName}</p>
            <p>${weatherSymbol}</p> <!-- Display the weather symbol -->
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        weatherIcon.style.display = 'block'; 
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    hourlyForecastDiv.innerHTML = '';

    const next24Hours = hourlyData.slice(0, 8); 

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); 
        const hour = dateTime.getHours();
        const temperature = isCelsius ? Math.round(item.main.temp - 273.15) : Math.round((item.main.temp - 273.15) * 9/5 + 32);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°${isCelsius ? 'C' : 'F'}</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function toggleTemperature() {
    isCelsius = !isCelsius;

	const city = document.getElementById('city').value;
    if (city) {
        getWeather(); 
    } else {

        const savedData = JSON.parse(localStorage.getItem('weatherData'));
        if (savedData) {
            displayWeather(savedData);
            displayHourlyForecast(savedData.forecast);
        }
    }
}

function saveToLocalStorage(data) {

    const weatherData = {
        name: data.name,
        main: {
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            temp_min: data.main.temp_min,
            temp_max: data.main.temp_max,
            pressure: data.main.pressure,
            humidity: data.main.humidity
        },
        weather: data.weather,
        forecast: [] 
    };

    const forecastUrl = `https://open-weather13.p.rapidapi.com/forecast/${data.name}/EN`;

    $.ajax({
        url: forecastUrl,
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
    }).done(function (forecastData) {
       
        weatherData.forecast = forecastData.list.slice(0, 8); 
        localStorage.setItem('weatherData', JSON.stringify(weatherData));
    }).fail(function () {
        console.error('Error fetching forecast data for saving.');
    });
}

window.onload = function() {
    const savedData = JSON.parse(localStorage.getItem('weatherData'));
    if (savedData) {
        displayWeather(savedData);
        displayHourlyForecast(savedData.forecast);
    }
};