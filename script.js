let cityName = '';
const apiURL = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = 'ab4cca0f30c8d3eea4b86778b7e5f92b';

const fetchData = () => {
  const cityInput = document.getElementById('city-input');
  cityName = cityInput.value;

  if (!cityName) {
    document.getElementById('city-name').innerText = '';
    document.getElementById('weather-list').innerHTML = '';
    return;
  }

  fetch(`${apiURL}?q=${cityName}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const weatherList = document.getElementById('weather-list');
      weatherList.innerHTML = '';

      const days = {};
      data.list.forEach((weather, index) => {
        const date = new Date(weather.dt * 1000);
        const day = date.toLocaleDateString();

        if (!days[day]) {
          days[day] = [];
        }

        days[day].push(weather);
      });

      for (const day in days) {
        const weatherItems = days[day];
        const weatherItem = document.createElement('li');
        weatherItem.className = 'weather-item';

        const date = new Date(weatherItems[0].dt * 1000);
        const dateString = `${date.toLocaleDateString()}`;

        const tempInCelsius = (weatherItems[0].main.temp - 273.15).toFixed(2);
        let conditions = weatherItems[0].weather[0].description;
        let emoji = "";

        if (conditions.includes("clear")) {
          emoji = "☀️";
        } else if (conditions.includes("cloud")) {
          emoji = "☁️";
        } else if (conditions.includes("rain")) {
          emoji = "🌧️";
        } else if (conditions.includes("snow")) {
          emoji = "🌨️";
        } else if (conditions.includes("storm")) {
          emoji = "🌪️";
        } else {
          emoji = "🤖";
        }
        const time = date.getHours();
        const isDaytime = time >= 6 && time <= 18;
        const emojiClass = isDaytime ? 'day' : 'night';

        weatherItem.innerHTML = `
          <h3>${dateString}</h3>
          <p>Temp: ${tempInCelsius}°C</p>
          <p>Conditions: ${emoji} ${conditions}</p>
        `;

        weatherList.appendChild(weatherItem);
      }

      document.getElementById('city-name').innerText = data.city.name;
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.getElementById('city-name').innerText = '';
      document.getElementById('weather-list').innerHTML = '<li>Not available</li>';
    });
};

fetchData(); // initial fetch

const searchButton = document.getElementById('search-button');
const weatherInfo = document.querySelector('.weather-info');

searchButton.addEventListener('click', () => {
  weatherInfo.classList.add('show');
  fetchData();
  console.log('Fetching data...');
});

document.getElementById('city-input').addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    fetchData();
    console.log('Fetching data...');
    weatherInfo.classList.add('show');
  }
});
