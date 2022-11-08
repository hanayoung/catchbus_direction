import React, {useState} from 'react';
import {Button} from 'react-native';
import styled from 'styled-components/native';
import SearchBussrc from '../src/SearchBus';

/*버스 검색*
/*todo: (1) 해당 정류장에 오는 모든 버스 목록 조회
(2) 빨버/시내 나눠서 따로 리스트 관리
(3) 버스 누르면 노선 보이게 하기
(4) 옆에 타이머 버튼 누르면 타이머 설정되게 하기
(5) 별 누르면 즐찾등록 (즐찾버튼 누르면 타이머 설정 넘어갔다가 즐찾가는 건 어떤지?)
*/

// SearchBussrc의 부모

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

const SearchBus = ({ route, navigation }) => {

    const item = route.params.item;
    return(
        <Container>
            <SearchBussrc item = {item}/>
        </Container>
    )
}

export default SearchBus;