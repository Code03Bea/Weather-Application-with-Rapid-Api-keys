const apiKey = 'bc84a60725msh7d047276499a9f3p1e8c10jsn7565e2166a33'; // Updated API key
let isCelsius = true;

const weatherSymbols = {
    Clear: '☀️',
    Wind: '💨',
    Rain: '🌧️',
    Clouds: '☁️',
    Drizzle: 'drizzle',
    Humidity: '💧',
    Snow: '❄️',
    Smoke: '🌫️'
};

function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://weather-api138.p.rapidapi.com/weather?city_name=${city}`;

    fetchWeatherData(currentWeatherUrl);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude; 
            const lon = position.coords.longitude;
            const currentWeatherUrl = `https://weather-api138.p.rapidapi.com/weather?lat=${lat}&lon=${lon}`;

            fetchWeatherData(currentWeatherUrl);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherData(url) {
    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'weather-api138.p.rapidapi.com'
        }
    }).done(function (data) {
        displayWeather(data);
        saveToLocalStorage(data);
    }).fail(function () {
        alert('Error fetching weather data. Please try again.');
    });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    weatherInfoDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === 404) {
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

    localStorage.setItem('weatherData', JSON.stringify(weatherData));
}

window.onload = function() {
    const savedData = JSON.parse(localStorage.getItem('weatherData'));
    if (savedData) {
        displayWeather(savedData);
        displayHourlyForecast(savedData.forecast);
    }
};