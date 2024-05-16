let cityName = '';
const apiURL = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'ab4cca0f30c8d3eea4b86778b7e5f92b';

const fetchData = () => {
  const cityInput = document.getElementById('city-input');
  cityName = cityInput.value;

  if (!cityName) {
    document.getElementById('city-name').innerText = '';
    document.getElementById('temp').innerText = '';
    document.getElementById('conditions').innerText = '';
    return;
  }

  fetch(`${apiURL}?q=${cityName}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const tempInCelsius = (data.main.temp - 273.15).toFixed(2);
      let conditions = data.weather[0].description;
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

      document.getElementById('city-name').innerText = data.name;
      document.getElementById('temp').innerText = `${tempInCelsius}°C`;
      document.getElementById('conditions').innerText = `${emoji} ${conditions}`;
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.getElementById('city-name').innerText = '';
      document.getElementById('temp').innerText = '';
      document.getElementById('conditions').innerText = 'Not available';
    });
};

fetchData(); // initial fetch
const searchButton = document.getElementById('search-button');
const weatherInfo = document.querySelector('.weather-info');

searchButton.addEventListener('click', () => {
  weatherInfo.classList.add('show');
  // Your fetch data logic here
  console.log('Fetching data...');}
);

document.getElementById('city-input').addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    fetchData();
    console.log('Fetching data...');
    weatherInfo.classList.add('show');
  }

  });
  