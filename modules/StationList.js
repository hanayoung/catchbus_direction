import React from 'react';
import styled from'styled-components/native';
import PropTypes from 'prop-types';
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

const StationList = ({ item, goBus}) => {

    var choice = new Object();

    return (
        <TouchableOpacity
        onPressOut = {() => {
            goBus(item);
        }}                                                            
        style = {styles.button}
        >
            <Content_name>{item.name}</Content_name>
            <Content_locate>{item.id}</Content_locate>
            <Content_locate>위치: {item.x}, {item.y}</Content_locate>
        </TouchableOpacity>
    );
};

StationList.defaultProps = {
    onPressOut: () => {},
};

StationList.propTypes = {
    item: PropTypes.object.isRequired,
    onPressOut : PropTypes.func,
};

export default StationList;