import React from 'react';
import styled from'styled-components/native';
import PropTypes from 'prop-types';
import IconButton from '../components/IconButton'
import {images} from '../modules/images'
import {TouchableOpacity, StyleSheet} from 'react-native';
// 1. src/searchStation의 자식

const Content_name = styled.Text`
flex: 1;
font-size: 14px;
`;

const Content_locate = styled.Text`
flex: 1;
font-size: 15px;
`;

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
    },
});

const BusList = ({ item, saveResult, storage}) => {

    var choice = new Object();

    const changeClicked = item => {
        if (item.clicked == false) {
            const newStorageObject = {
                [item.id] : {
                    routeid: item.routeId,
                    routename: item.routeName,
                    routetype: item.routetype,
                    region: item.region,
                    turnYn: item.turnYn
                },
            };
            saveResult({...storage, ...newStorageObject});
            item.clicked = true;
        }
        else {
            const currentResults = Object.assign({}, storage);
            delete currentResults[item.id];
            saveResult(currentResults);
            item.clicked = false;
        }
    }
    return (
        <TouchableOpacity
        onPressOut = {() => {
            choice = item;
        }}
        style = {styles.button}
        >
            <Content_name>{item.routeName}</Content_name>
            <Content_locate>{item.predict1}분 후 도착  {item.predict2} 분 후 도착</Content_locate>
            <Content_locate>{item.stationDirection} 방면 </Content_locate>
            <Content_locate>{item.predict}분 후 회차지에 버스 도착 </Content_locate>
            <IconButton 
            type={item.clicked ? images.clicked : images.unclicked} 
            id={item} 
            onPressOut={changeClicked}
            clicked={item.clicked}
            />
        </TouchableOpacity>
    );
};

BusList.defaultProps = {
    onPressOut: () => {},
};

BusList.propTypes = {
    item: PropTypes.object.isRequired,
    onPressOut : PropTypes.func,
};

export default BusList;