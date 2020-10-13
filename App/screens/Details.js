import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, SafeAreaView, View, Alert } from "react-native";
import { weatherApi } from '../util/weatherApi'
import { Container } from '../components/Container'
import { WeatherIcon } from '../components/WeatherIcon'
import { BasicRow } from '../components/List'
import { H1, H2, P } from '../components/Text'
import { format } from 'date-fns'
import { addRecentSearch } from '../util/recentSearch';

const groupForecastByDat = list => {
  const data = {}
  
  list.forEach(item => {
    const [day] = item.dt_txt.split(" ")

    if (data[day]) {
      if (data[day].temp_max < item.main.temp_max) {
        data[day].temp_max = item.main.temp_max
      }

      if (data[day].temp_min > item.main.temp_min) {
        data[day].temp_min = item.main.temp_min
      }
    } else {
      data[day] = {
      temp_min: item.main.temp_min,
      temp_max: item.main.temp_max
    }
    }
    
  })
  const formattedList = Object.keys(data).map(key => {
    return {
      day: key,
      ...data[key]
    }
  })
  return formattedList
}

export default (props) => {
  const [currentWeather, setCurrentWeather] = useState({})
  const [loadingCurrentWeather, setLoadingCurrentWeather] = useState(true)
  const [forecast, setForecast] = useState([])
  const [loadingForecast, setLoadingForecast] = useState(true)
  const zipcodeParam = props.navigation.getParam('zipcode')
  const latParam = props.navigation.getParam('lat')
  const lonParam = props.navigation.getParam('lon')

  const handleError = () => {
    Alert.alert('No location data found!', 'please try again', [
      {
        text: 'Okay',
        onPress: () => props.navigation.navigate('Search')
      }
    ])
  }

  const getCurrentWeather = async ({ zipcode, coords }) => {
    try {
      const response =  await weatherApi('/weather', { zipcode, coords })
      props.navigation.setParams({ title: response.name })
      setCurrentWeather(response)
      setLoadingCurrentWeather(false)
      addRecentSearch({
        id: response.id,
        name: response.name,
        lat: response.coord.lat,
        lon: response.coord.lon
      })
    } catch (err) {
      handleError()
    }
  }
  
  const getForecast = async ({ zipcode, coords }) => {
    try {
      const response = await weatherApi('/forecast', { zipcode, coords })

      setLoadingForecast(false)
      setForecast(groupForecastByDat(response.list))
    } catch (err) {
      console.log('getForecast -> err', err)
    }
  }

  // componentDidMount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      getCurrentWeather({ coords: position.coords })
      getForecast({ coords: position.coords })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // componentDidUpdate
  useEffect(() => {
    if(zipcodeParam) {
      getCurrentWeather({ zipcode: zipcodeParam })
      getForecast({ zipcode: zipcodeParam })
    }

    if (latParam && lonParam) {
      getCurrentWeather({ coords: { latitude: latParam, longitude: lonParam } });
      getForecast({ coords: { latitude: latParam, longitude: lonParam } });
    } else if (zipcodeParam) {
      getCurrentWeather({ zipcode: zipcodeParam });
      getForecast({ zipcode: zipcodeParam });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipcodeParam, latParam, lonParam])

  if (loadingCurrentWeather || loadingForecast) {
    return (
      <Container>
        <ActivityIndicator color='#fff' size='large' />
      </Container>
    )
  }

  const { weather, main } = currentWeather

  return (
    <Container>
      <ScrollView>
        <SafeAreaView>
          <WeatherIcon icon={weather[0].icon} />
          <H1>{`${Math.round(main.temp)}°`}</H1>
          <BasicRow>
            <H2>{`Humidity: ${main.temp_max}°`}</H2>
          </BasicRow>
          <BasicRow>
            <H2>{`Low: ${Math.round(main.temp_min)}°`}</H2>
            <H2>{`High: ${Math.round(main.humidity)}%`}</H2>
          </BasicRow>
          <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
            {forecast.map(day => {
              return (
                <BasicRow key={day.day} style={{ justifyContent: "space-between" }}>
                  <P>{format(new Date(day.day), 'EEEE, MM d')}</P>
                  <View style={{ flexDirection: 'row' }}>
                    <P style={{ fontWeight: "700", marginRight: 10 }}>
                      {Math.round(day.temp_max)}
                    </P>
                    <P>{Math.round(day.temp_min)}</P>
                  </View>
                </BasicRow>
              )
            })}
          </View>
        </SafeAreaView>
      </ScrollView>
    </Container>
  );
  
}