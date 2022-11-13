import React, { useEffect } from 'react'
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, FlatList, StatusBar, SafeAreaView } from 'react-native';
import { DOMParser } from 'xmldom';
import StationList from '../modules/StationList';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from "expo-location";
import axios from 'axios';
import {FontAwesome} from '@expo/vector-icons';

// 2. screens/SearchStation의 자식

function SearchStation({stationToBus})
 {
  const [station, setStation] = useState('');
  const [result, setResult] = useState([]);
  const [initialRegion, setinitialRegion] = useState();
  const [jsonData,setJsonData]=useState([]);
  //const [latitude,setLatitude]=useState('');
  //const [longitute, setLongitude]=useState('');
  //함수형 컴포넌트 const -> useEffect로 해결
 
  const goBus = (item) => {
    stationToBus(item);
  }
  const handleResult=(arr)=>{
    arr.sort(function(a,b){
        return a.dis-b.dis;
    });
   // console.log("arr",arr);
    setResult(arr);
    setRegion(arr[0].x,arr[0].y);
}
const setRegion=(x,y)=>{
  setinitialRegion({
      latitude:Number(y),
      longitude:Number(x),
      latitudeDelta:0.002,
      longitudeDelta:0.002
  })
  }
  const ask = async () => {
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 }); //coords를 통해 현재 위치의 좌표 받기
   // setLatitude(latitude);
    //setLongitude(longitude);
    setinitialRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02
    })
  };

  const handleStation = text => {
    setStation(text);
  }
  const searchStation = async () => {
    try {
      const url = 'http://apis.data.go.kr/6410000/busstationservice/getBusStationList'; 
      var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D'; 
      queryParams += '&' + encodeURIComponent('keyword') + '=' + encodeURIComponent(station); /**/ 
      var result = await axios.get(url+queryParams);
      let xmlParser = new DOMParser();
      let xmlDoc = xmlParser.parseFromString(result.data, "text/xml");
      let i = 0;
      let array = [];
      while (1) {
        var tmpnode = new Object();
        tmpnode.index = i;
        tmpnode.id = xmlDoc.getElementsByTagName("stationId")[i].textContent;
        tmpnode.name = xmlDoc.getElementsByTagName("stationName")[i].textContent;
        tmpnode.x = xmlDoc.getElementsByTagName("x")[i].textContent;
        tmpnode.y = xmlDoc.getElementsByTagName("y")[i].textContent;
        tmpnode.dis=Math.pow((initialRegion.longitude-tmpnode.x),2)+Math.pow((initialRegion.latitude-tmpnode.y),2);
        array.push(tmpnode);
        i++;
        if (xmlDoc.getElementsByTagName("stationId")[i] == undefined) break;
      }
      handleResult(array);

    }
    catch (err) {
      //alert(err);
    }
  };
  // const searchStationID=async()=>{
  //   try{
  //     const url='https://api.odsay.com/v1/api/searchStation';
  //     var queryParams='?'+encodeURIComponent('apiKey')+'='+'z5Hqo2dueAcuLqjhotmeqGT2Q499QvuS25scQAuC03k';
  //     queryParams+='&'+encodeURIComponent('stationName')+'='+encodeURIComponent(station)+'&'+encodeURIComponent('stationClass')+'='+encodeURIComponent('1')+'&'+encodeURIComponent('myLocation')+'='+encodeURIComponent(longitute)+':'+encodeURIComponent(latitude);
  //     console.log("station",station);
  //     let array=[];
  //     let i=0;
  //     await axios.get(url+queryParams).then((res)=>{
  //       while(1){
  //       var tmpnode=new Object();
  //       if(i==res.data.result.station.length)
  //       break;
  //         tmpnode.index=i;
  //         tmpnode.stationId=res.data.result.station[i].stationID;
  //         tmpnode.stationName=res.data.result.station[i].stationName;
  //         tmpnode.x=res.data.result.station[i].x;
  //         tmpnode.y=res.data.result.station[i].y;
  //         array.push(tmpnode);
  //         i++;
  //       }
  //      setResult(array);
  //     });
  //   }
  //   catch(err){
  //   }
  // }
  useEffect(() => {
    ask();
    searchStation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CatchBus</Text>
      <TextInput
        style={styles.input}
        placeholder='정류장 이름을 입력하세요'
        autoCorrect={false}
        value={station}
        onChangeText={handleStation}
        onSubmitEditing={() => searchStation()}
        multiline={false}
        returnKeyType="search"
      />
      <MapView
        region={initialRegion}
        style={[styles.map]}
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider={PROVIDER_GOOGLE}
      >
        {result && result.map((item) => {
          return (
            <Marker
              key={item.id}
              title={item.name}
              coordinate={{
                latitude: Number(item.y),
                longitude: Number(item.x),//리턴 해줘야지 마커 뜸
              }}
            >
               <FontAwesome name="map-marker" size={30} color="#0067A3"/>
               </Marker>
          );
        }
        )}
      </MapView>
      <FlatList
        keyExtractor={item => item.stationId}
        data={result}
        style={[styles.flatlist]}
        renderItem={({ item }) => (
          <StationList
            item={item}
            goBus={goBus}
          />
        )}
        windowSize={3}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  container: {
    flex: 1,
    alignItems: 'center'
  },
  text: {
    fontsize: 10,
    alignItems: 'center'
  },
  title: {
    margin: 10,
    fontsize: 10
  },
  map: {
    flex: 1,
    width: 500,
    height: 500
  },
  flatlist: {
    flex: 1,
    width: '100%',
  }
});


export default SearchStation;