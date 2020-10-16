import axios from 'axios'

const apiKey = 'xxx'

export const weatherApi = async (path, { zipcode, coords }) => {
  let suffix = ''

  if (zipcode) {
    suffix = `zip=${zipcode}`
  } else if (coords) {
    suffix = `lat=${coords.latitude}&lon=${coords.longitude}`
  }

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/${path}?appid=${apiKey}&units=imperial&${suffix}`)
    return response.data
  } catch (err) {
    console.log('getCurrentWeather -> err', err)
  }
}
