import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components/native';
import { DOMParser } from 'xmldom';
import { FlatList, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';
import BusList from '../modules/BusList';
import RealTime from '../modules/RealTime';
import axios from 'axios';
import { array } from 'prop-types';

//wireshark로 테스트해보기
//Check the render method of `VirtualizedList`., , 고치기
const Container = styled.View`
flex : 1;
justify-content: center;
align-items: center;
`;
const StyledText = styled.Text`
font-size : 30px;
margin-bottom: 10px;
`;
const DetailText = styled.Text`
font-size : 15px;
margin-bottom : 10px;
`;

function SearchBus({ item }) {

  //1. screens/SearchBus의 자식, screens/SearchBus로부터 stationID 받음

  function useInterval(callback, delay) {
    
    const savedCallback = useRef(); // 최근에 들어온 callback을 저장할 ref를 하나 만든다.

    useEffect(() => {
      savedCallback.current = callback; // callback이 바뀔 때마다 ref를 업데이트 해준다.
    }, [callback]);

    useEffect(() => {
      function tick() {
        savedCallback.current(); // tick이 실행되면 callback 함수를 실행시킨다.
      }
        let id = setInterval(tick, delay); // delay에 맞추어 interval을 새로 실행시킨다.
        return () => clearInterval(id); // unmount될 때 clearInterval을 해준다.
    }, [delay]); // delay가 바뀔 때마다 새로 실행된다.
  }


  const [result, setResult] = useState([]); //도착정보 저장
  const [routeInfo, setRouteInfo] = useState([]); //노선정보 저장
  const [merge, setMerge] = useState([]); //두 배열 합치기
  const [isReady, setIsReady] = useState(false);
  const [storage, setStorage] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [delay, setDelay] = useState(1000000);
  const [routearray, setRouteArray] = useState([]);
  const [ok, setOk] = useState(false);
  const [endStation, setEndStation]=useState([]);
  
  const handleRouteInfo = (item) => {
    setRouteInfo(routeInfo => [...routeInfo, item]);
  }
  const handleEndStation = (item) => {
    setEndStation(endStation=>[...endStation,item]);
   
  }
  const handleRouteArray = () => {
    const length = routearray.length;
    for(let i = 0; i < length; i++){
   // console.log("passing before", routearray[i]);
     searchRouteName(routearray[i]);
      }
    }
 
  const Merge =async() => {    //result, routeInfo routeId를 키값으로 병합
   // let buslist = [];
   // console.log("result.length",result.length);
    for (var i = 0; i < result.length; i++) {
      let routeId = result[i].routeId;
      let route = routeInfo.find((r) => r.paramID == routeId)
      if(route != undefined){
        result[i].routeName = route.routeName;
        result[i].endStationId=route.endStationId;
        result[i].startStationId=route.startStationId;
        result[i].startName=route.startName;
        result[i].endName=route.endName;
      //  buslist.push(result[i]); 
      }
    }
    if(result.length!=0&&result[result.length-1].endName!=undefined){
      findDirection();
    }
 //   setMerge(buslist);
  };

  const _saveResults = async result => {
    try {
      await AsyncStorage.setItem('results', JSON.stringify(result));
      setStorage(result);
    } catch (e) {
      //console.error(e);
    }
  };

  const _loadResult = async () => {
    const loadedResult = await AsyncStorage.getItem('results');
    setStorage(JSON.parse(loadedResult));
  };

  // 여기서부터 루트아이디 핸들링, 검색, Input : routeId (from busSearch), Output: 노선 번호/유형/종점정보
  const searchRouteName = async (routeId) => {
    try {
      const url = 'http://apis.data.go.kr/6410000/busrouteservice/getBusRouteInfoItem'; 
      var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D';
      queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent(routeId); // xhr.open('GET', url + queryParams);    
      var data = await axios.get(url+queryParams);
      let xmlParser = new DOMParser();
      let xmlDoc = xmlParser.parseFromString(data.data, "text/xml");
      var route = new Object();
      route.paramID = routeId;
      route.routeName = xmlDoc.getElementsByTagName("routeName")[0].textContent;
      route.routeType = xmlDoc.getElementsByTagName("routeTypeName")[0].textContent;
      route.startName = xmlDoc.getElementsByTagName("startStationName")[0].textContent;
      route.endName = xmlDoc.getElementsByTagName("endStationName")[0].textContent;
      route.region = xmlDoc.getElementsByTagName("regionName")[0].textContent;
      route.startStationId=xmlDoc.getElementsByTagName("startStationId")[0].textContent;
      route.endStationId=xmlDoc.getElementsByTagName("endStationId")[0].textContent;
      handleRouteInfo(route);
      findTurnYn(routeId);
    }
    catch (err) {
    //  console.log(err);
    }
  }
  // const searchBusID=async()=>{
  //   try{
  //     const url=`http://api.odsay.com/v1/api/busStationInfo?apiKey=${apiKey}`;
  //     let queryParams='&'+encodeURIComponent('stationID')+encodeURIComponent(item.stationId);
  //     let i=0;
  //     await axios.get(url+queryParams).then((res)=>{
  //       //while(1){
  //         var tmpnode=new Object();
  //       //  if(i==res.data.result.length)
  //        // break;
  //           console.log("res.data",res.data.result)
  //           tmpnode.index=i;
  //           tmpnode.budId=res.data.result.busID;
  //           array.push(tmpnode);
  //           i++;
  //        // }
  //        setResult(array);
         
  //     });//busCompanyNameKor중 4글자가 같을 경우
  //   }
  //   catch(err){

  //   }
  // }
  // 여기서부터 버스 도착 정보 검색, (Input; stationID, Output: 노선 정보와 기타 도착 정보)
  const searchBus = async () => {
    //getBusArrivalList, input param : stationId (ID)
    try {
      const url = 'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList'; 
      var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D';
      queryParams += '&' + encodeURIComponent('stationId') + '=' + encodeURIComponent(item.id); // xhr.open('GET', url + queryParams); 
      var data = await axios.get(url+queryParams);
      let xmlParser = new DOMParser();
      let xmlDoc = xmlParser.parseFromString(data.data, "text/xml");    
      setIsRunning(true);
      let i = 0;
      let array = [];
      let routearray = [];
      while (1) {
        var tmpnode = new Object();
        tmpnode.routeId = xmlDoc.getElementsByTagName("routeId")[i].textContent;
        routearray.push(tmpnode.routeId);
        tmpnode.clicked = false;
        tmpnode.predict1 = xmlDoc.getElementsByTagName("predictTime1")[i].textContent;
       // tmpnode.loc1 = xmlDoc.getElementsByTagName("locationNo1")[i].textContent;
        //tmpnode.remain1 = xmlDoc.getElementsByTagName("remainSeatCnt1")[i].textContent;
        tmpnode.predict2 = xmlDoc.getElementsByTagName("predictTime2")[i].textContent;
      //  tmpnode.loc2 = xmlDoc.getElementsByTagName("locationNo2")[i].textContent;
      //  tmpnode.remain2 = xmlDoc.getElementsByTagName("remainSeatCnt2")[i].textContent;
        tmpnode.staOrder = xmlDoc.getElementsByTagName("staOrder")[i].textContent;
        tmpnode.endName=undefined;
        tmpnode.breakFlag=undefined;
        array.push(tmpnode);
        for (var routeId in storage) {
          if (tmpnode.routeId == routeId)
            tmpnode.clicked = true;
        }
        i++;
        if (xmlDoc.getElementsByTagName("routeId")[i] == undefined) { 
          setRouteArray(routearray);
          break; 
        }
      }
      setResult(array);
      setOk(true);
    }
    catch (err) {
    //  console.error(err);
    }
  };
  const findTurnYn=async(routeId)=>{
    try {
      const url = 'http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList'; 
      var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D';
      queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent(routeId); // xhr.open('GET', url + queryParams);    
      var data = await axios.get(url+queryParams);
      let xmlParser = new DOMParser();
      let xmlDoc = xmlParser.parseFromString(data.data, "text/xml");
      var route = new Object();
      route.paramID = routeId;
      route.turnYn="Y";
      let i=0;
     // console.log("이게 되나?",xmlDoc.getElementsByTagName("turnYn").length);
      while(1){
        if(xmlDoc.getElementsByTagName("turnYn")[i].textContent=="Y"){
            route.stationSeq=xmlDoc.getElementsByTagName("stationSeq")[i].textContent;
          handleEndStation(route);
            break;
        }
        else i++;
      }     
    }
    catch (err) {
    //  console.log(err);
    }
  }
  const findDirection=async()=>{
    for(let i=0;i<result.length;i++){
      for(let j=0;j<endStation.length;j++){
        if(endStation[j].paramID==result[i].routeId){
          if(Number(endStation[j].stationSeq)<Number(result[i].staOrder)){
            result[i].stationDirectionId=1;//0이 종점을 항헤 가는 거, 1이 기점을 향해 이건 찐방면 
            result[i].stationDirection=result[i].startName;
            let count=Number(result[i].staOrder)-Number(endStation[j].stationSeq);
            if(count<8&&count>=0)
            result[i].breakFlag=true;
            else{
              result[i].breakFlag=false;
            }
          }
          else{
            result[i].stationDirectionId=0;
            result[i].stationDirection=result[i].endName;
            if(Number(result[i].staOrder)<8)
            result[i].breakFlag=true;
            else{
              result[i].breakFlag=false;
            }
          }
      }
      }
    }// endStation에 있는 paramID랑 result에 있는 routeId랑 비교해서 같을 경우, stationSeq랑 staOrder 비교하기
   // setMerge(result);
    if(result[result.length-1].breakFlag!=undefined){
    getEndStationInfo();
   }
  }
  const getEndStationInfo=async()=>{
    for(let i=0;i<result.length;i++){
    if(result[i].breakFlag==true){
      if(result[i].stationDirectionId==1){
        let data=await axios.get(`http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D&stationId=${result[i].endStationId}`)
        let xmlParser = new DOMParser();
        let xmlDoc = xmlParser.parseFromString(data.data, "text/xml");  
        for(let j=0;j<xmlDoc.getElementsByTagName("routeId").length;j++){
          if(xmlDoc.getElementsByTagName("routeId")[j].textContent==result[i].routeId){
            result[i].predict=xmlDoc.getElementsByTagName("predictTime1")[j].textContent;
            break;
          }
        }   
       
      }else{
        let data=await axios.get(`http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=UkgvlYP2LDE6M%2Blz55Fb0XVdmswp%2Fh8uAUZEzUbby3OYNo80KGGV1wtqyFG5IY0uwwF0LtSDR%2FIwPGVRJCnPyw%3D%3D&stationId=${result[i].startStationId}`)
        let xmlParser = new DOMParser();
        let xmlDoc = xmlParser.parseFromString(data.data, "text/xml"); 
        for(let j=0;j<xmlDoc.getElementsByTagName("routeId").length;j++){
          if(xmlDoc.getElementsByTagName("routeId")[j].textContent==result[i].routeId){
          result[i].predict=xmlDoc.getElementsByTagName("predictTime1")[j].textContent;
          break;
          }
        }   
        
      }
    }
  }
  setMerge(result);
  }
  // 렌더링 핸들링
  useEffect(() => {
    Merge();
  }, [result]);

  useInterval(() => {
    searchBus();
  }, isRunning ? delay : null);

  useEffect(()=>{
    handleRouteArray();
  }, [ok]);

  return isReady ? (
      <Container>
      <FlatList
        keyExtractor={item => item.routeId}
        data={merge}
        style={[styles.flatlist]}
        renderItem={({ item }) => (
          <BusList
            item={item}
            saveResult={_saveResults}
            storage={storage}
          />
        )}
        windowSize={3}
      />
    </Container>
  ) : (
    <AppLoading
      startAsync={_loadResult}
      onFinish={() => setIsReady(true)}
      onError={console.error}
    />
  );
}
// async function delay_splash(){
//   await SplashScreen.preventAutoHideAsync();
//   await SplashScreen.hideAsync();

// }
const styles = StyleSheet.create({
  flatlist: {
    flex: 1,
    width: '100%',
  }
})

export default SearchBus;