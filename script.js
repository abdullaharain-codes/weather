// OpenWeather API Key - Replace with your own key
const API_KEY = '4cdd486714f2fbe3ff1243ebf5842dbf';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggleBtn = document.getElementById('unit-toggle-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const tempMax = document.getElementById('temp-max');
const tempMin = document.getElementById('temp-min');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const uvIndex = document.getElementById('uv-index');
const notification = document.getElementById('notification');
const loader = document.getElementById('loader');
const forecast = document.getElementById('forecast');
const airQualityContainer = document.getElementById('air-quality-container');
const aqiValue = document.getElementById('aqi-value');
const aqiLevel = document.getElementById('aqi-level');
const aqiDetails = document.getElementById('aqi-details');
const dateTime = document.getElementById('date-time');
const lastUpdated = document.getElementById('last-updated');
const themeIcon = document.getElementById('theme-icon');
const themeToggle = document.querySelector('.theme-toggle');
const weatherAnimation = document.getElementById('weather-animation');

// State variables
let isCelsius = true;
let currentWeatherData = null;
let currentTheme = 'dark';

// Background images for different weather conditions
const backgroundImages = {
    '01d': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920', // clear day
    '01n': 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920', // clear night
    '02d': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // few clouds day
    '02n': 'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=1920', // few clouds night
    '03d': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920', // scattered clouds
    '03n': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920', // scattered clouds night
    '04d': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920', // broken clouds
    '04n': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920', // broken clouds night
    '09d': 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920', // shower rain
    '09n': 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920', // shower rain night
    '10d': 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920', // rain
    '10n': 'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920', // rain night
    '11d': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // thunderstorm
    '11n': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // thunderstorm night
    '13d': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // snow
    '13n': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // snow night
    '50d': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920', // mist
    '50n': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920'  // mist night
};

// Weather animation classes
const weatherAnimations = {
    '01d': 'sun-animation',
    '01n': 'sun-animation',
    '02d': 'clouds-animation',
    '02n': 'clouds-animation',
    '03d': 'clouds-animation',
    '03n': 'clouds-animation',
    '04d': 'clouds-animation',
    '04n': 'clouds-animation',
    '09d': 'rain-animation',
    '09n': 'rain-animation',
    '10d': 'rain-animation',
    '10n': 'rain-animation',
    '11d': 'thunder-animation',
    '11n': 'thunder-animation',
    '13d': 'snow-animation',
    '13n': 'snow-animation',
    '50d': 'mist-animation',
    '50n': 'mist-animation'
};

// Initialize the app
function init() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('weatherTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.setAttribute('data-theme', currentTheme);
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Check for saved unit preference
    const savedUnit = localStorage.getItem('weatherUnit');
    if (savedUnit) {
        isCelsius = savedUnit === 'celsius';
        unitToggleBtn.innerHTML = isCelsius ? '<i class="fas fa-temperature-low"></i> °C/°F' : '<i class="fas fa-temperature-low"></i> °F/°C';
    }
    
    // Load weather for default city
    getWeatherByCity('London');
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Set up event listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            showNotification('Please enter a city name');
        }
    });
    
    locationBtn.addEventListener('click', getWeatherByLocation);
    
    unitToggleBtn.addEventListener('click', toggleTemperatureUnit);
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeatherByCity(city);
            }
        }
    });
    
    themeToggle.addEventListener('click', toggleTheme);
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

// Toggle between light and dark theme
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('weatherTheme', currentTheme);
    
    // Update background based on current weather if it exists
    if (currentWeatherData) {
        const iconCode = currentWeatherData.weather[0].icon;
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${backgroundImages[iconCode] || backgroundImages['01d']}')`;
    }
}

// Toggle between Celsius and Fahrenheit
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    localStorage.setItem('weatherUnit', isCelsius ? 'celsius' : 'fahrenheit');
    unitToggleBtn.innerHTML = isCelsius ? '<i class="fas fa-temperature-low"></i> °C/°F' : '<i class="fas fa-temperature-low"></i> °F/°C';
    
    // Update displayed temperatures if weather data exists
    if (currentWeatherData) {
        updateWeatherUI(currentWeatherData);
    }
}

// Convert temperature based on current unit
function convertTemp(temp) {
    return isCelsius ? Math.round(temp) : Math.round((temp * 9/5) + 32);
}

// Get weather by city name
async function getWeatherByCity(city) {
    showLoader();
    try {
        // First get coordinates for the city
        const geocodeResponse = await fetch(`${GEOCODE_URL}?q=${city}&limit=1&appid=${API_KEY}`);
        
        if (!geocodeResponse.ok) {
            throw new Error('Failed to find city. Please try another location.');
        }
        
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length === 0) {
            throw new Error('City not found. Please try another location.');
        }
        
        const { lat, lon } = geocodeData[0];
        
        // Then get weather data using coordinates
        const [weatherResponse, forecastResponse, airQualityResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);
        
        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Failed to get weather data. Please try again later.');
        }
        
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        const airQualityData = airQualityResponse.ok ? await airQualityResponse.json() : null;
        
        currentWeatherData = weatherData;
        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
        
        if (airQualityData) {
            updateAirQualityUI(airQualityData);
            airQualityContainer.style.display = 'block';
        } else {
            airQualityContainer.style.display = 'none';
        }
        
        cityInput.value = weatherData.name;
        lastUpdated.textContent = new Date().toLocaleTimeString();
    } catch (error) {
        showNotification(error.message);
        console.error('Error fetching weather:', error);
    } finally {
        hideLoader();
    }
}

// Get weather by current location
function getWeatherByLocation() {
    showLoader();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    const [weatherResponse, forecastResponse, airQualityResponse] = await Promise.all([
                        fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
                        fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
                        fetch(`${BASE_URL}/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`)
                    ]);
                    
                    if (!weatherResponse.ok || !forecastResponse.ok) {
                        throw new Error('Failed to get weather for your location');
                    }
                    
                    const weatherData = await weatherResponse.json();
                    const forecastData = await forecastResponse.json();
                    const airQualityData = airQualityResponse.ok ? await airQualityResponse.json() : null;
                    
                    currentWeatherData = weatherData;
                    updateWeatherUI(weatherData);
                    updateForecastUI(forecastData);
                    
                    if (airQualityData) {
                        updateAirQualityUI(airQualityData);
                        airQualityContainer.style.display = 'block';
                    } else {
                        airQualityContainer.style.display = 'none';
                    }
                    
                    cityInput.value = weatherData.name;
                    lastUpdated.textContent = new Date().toLocaleTimeString();
                    
                    // Reverse geocode to get city name if not provided
                    if (!weatherData.name) {
                        const geocodeResponse = await fetch(`${GEOCODE_URL}?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
                        if (geocodeResponse.ok) {
                            const geocodeData = await geocodeResponse.json();
                            if (geocodeData.length > 0) {
                                cityName.textContent = `${geocodeData[0].name}, ${geocodeData[0].country}`;
                            }
                        }
                    }
                } catch (error) {
                    showNotification(error.message);
                    console.error('Error fetching weather:', error);
                } finally {
                    hideLoader();
                }
            },
            (error) => {
                hideLoader();
                showNotification('Location access denied. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        hideLoader();
        showNotification('Geolocation is not supported by your browser');
    }
}

// Update the UI with weather data
function updateWeatherUI(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${convertTemp(data.main.temp)}°${isCelsius ? 'C' : 'F'}`;
    tempMax.textContent = `↑${convertTemp(data.main.temp_max)}°`;
    tempMin.textContent = `↓${convertTemp(data.main.temp_min)}°`;
    description.textContent = data.weather[0].description;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    // Update weather animation
    weatherAnimation.className = 'weather-animation ' + (weatherAnimations[iconCode] || 'sun-animation');
    
    // Update details
    feelsLike.textContent = `${convertTemp(data.main.feels_like)}°${isCelsius ? 'C' : 'F'}`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Update background based on weather
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${backgroundImages[iconCode] || backgroundImages['01d']}')`;
    
    // Get UV index if coordinates are available
    if (data.coord) {
        getUVIndex(data.coord.lat, data.coord.lon);
    }
}

// Update forecast UI
function updateForecastUI(data) {
    forecast.innerHTML = '';
    
    // Group forecast by day
    const dailyForecast = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temps: [],
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        }
        
        dailyForecast[day].temps.push(item.main.temp);
    });
    
    // Display forecast for next 5 days
    const days = Object.keys(dailyForecast).slice(0, 5);
    days.forEach(day => {
        const dayData = dailyForecast[day];
        const maxTemp = Math.max(...dayData.temps);
        const minTemp = Math.min(...dayData.temps);
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="day">${day}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${dayData.icon}.png" alt="${dayData.description}">
            <div class="forecast-temp">
                <span class="temp-max">${convertTemp(maxTemp)}°</span>
                <span class="temp-min">${convertTemp(minTemp)}°</span>
            </div>
        `;
        
        forecast.appendChild(forecastDay);
    });
}

// Get UV index
async function getUVIndex(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        
        if (response.ok) {
            const data = await response.json();
            uvIndex.textContent = data.value.toFixed(1);
            
            // Add color coding based on UV index
            const uvValue = data.value;
            if (uvValue <= 2) {
                uvIndex.style.color = '#50C878'; // Green (low)
            } else if (uvValue <= 5) {
                uvIndex.style.color = '#FFD700'; // Yellow (moderate)
            } else if (uvValue <= 7) {
                uvIndex.style.color = '#FF8C00'; // Orange (high)
            } else if (uvValue <= 10) {
                uvIndex.style.color = '#FF0000'; // Red (very high)
            } else {
                uvIndex.style.color = '#8B00FF'; // Purple (extreme)
            }
        }
    } catch (error) {
        console.error('Error fetching UV index:', error);
    }
}

// Update air quality UI
function updateAirQualityUI(data) {
    const aqi = data.list[0].main.aqi;
    aqiValue.textContent = aqi;
    
    // Set AQI level and color
    let level = '';
    let colorClass = '';
    
    switch(aqi) {
        case 1:
            level = 'Good';
            colorClass = 'aqi-good';
            break;
        case 2:
            level = 'Fair';
            colorClass = 'aqi-moderate';
            break;
        case 3:
            level = 'Moderate';
            colorClass = 'aqi-unhealthy-sensitive';
            break;
        case 4:
            level = 'Poor';
            colorClass = 'aqi-unhealthy';
            break;
        case 5:
            level = 'Very Poor';
            colorClass = 'aqi-very-unhealthy';
            break;
        default:
            level = 'Unknown';
    }
    
    aqiLevel.textContent = level;
    aqiValue.className = 'aqi-value ' + colorClass;
    
    // Update AQI details
    const components = data.list[0].components;
    aqiDetails.innerHTML = `
        <div class="aqi-detail">
            <div class="label">CO</div>
            <div class="value">${components.co.toFixed(2)} µg/m³</div>
        </div>
        <div class="aqi-detail">
            <div class="label">NO₂</div>
            <div class="value">${components.no2.toFixed(2)} µg/m³</div>
        </div>
        <div class="aqi-detail">
            <div class="label">O₃</div>
            <div class="value">${components.o3.toFixed(2)} µg/m³</div>
        </div>
        <div class="aqi-detail">
            <div class="label">SO₂</div>
            <div class="value">${components.so2.toFixed(2)} µg/m³</div>
        </div>
        <div class="aqi-detail">
            <div class="label">PM2.5</div>
            <div class="value">${components.pm2_5.toFixed(2)} µg/m³</div>
        </div>
        <div class="aqi-detail">
            <div class="label">PM10</div>
            <div class="value">${components.pm10.toFixed(2)} µg/m³</div>
        </div>
    `;
}

// Show loader
function showLoader() {
    loader.classList.add('active');
}

// Hide loader
function hideLoader() {
    loader.classList.remove('active');
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the app when the page loads
window.addEventListener('load', init);