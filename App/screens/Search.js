import React, {useState, useEffect} from 'react';
import { FlatList, Text, View } from 'react-native';

import { SearchBar } from '../components/SearchBar';
import { SearchItem } from '../components/List';
import { getRecentSearch } from '../util/recentSearch'

const Search = ({ navigation }) => {
  const [query, setQuery] = useState('')
  const [recentSearch, setRecentSearch] = useState([])


  useEffect(() => {
    getRecentSearch().then(items => setRecentSearch(items))
  }, [])

  return (
    <FlatList
      data={recentSearch}
      renderItem={({ item }) => (
        <SearchItem
          name={item.name}
          onPress={() => navigation.navigate('Details', {
            lat: item.lat,
            lon: item.lon
          })}
        />
      )}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={
        <View>
          <SearchBar
            onSearch={() => {
              navigation.navigate('Details', {
                zipcode: query,
              });
            }}
            searchButtonEnabled={query.length >= 5}
            placeholder="Zipcode"
            onChangeText={query => setQuery(query)}
          />
          <Text
            style={{
              marginHorizontal: 10,
              fontSize: 16,
              color: '#aaa',
              marginTop: 10,
              marginBottom: 5,
            }}
          >
            Recents
          </Text>
        </View>
      }
    />
  );
}

export default Search;