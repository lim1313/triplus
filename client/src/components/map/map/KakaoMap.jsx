/* eslint-disable react-hooks/exhaustive-deps*/

import React, { useEffect, useRef } from 'react';
import { getCardModal, getGuideCards } from '../../../network/map/http';
import { useDispatch } from 'react-redux';
import { guideCardInfo, openGuideModal } from '../../../redux/map/action';
import { createMarker, deleteMarker, getInfo } from '../../../utils/kakao';
import styled from 'styled-components';

const { kakao } = window;
export let map;

const MapWrapper = styled.div`
  height: 100%;
  position: relative;

  & .svgMarker {
    &:hover {
      cursor: pointer;
    }
  }

  & .infowindow {
    display: inline-block;
    background: white;
    border-radius: 10px;
    word-break: break-word;
    text-align: center;
    min-width: 8rem;

    box-shadow: 0px 0px 5px 2px rgba(46, 46, 46, 0.4);
    overflow: hidden;

    & .wrapper {
      padding: 0.7rem 1rem;
      & .title {
        position: relative;
        font-weight: 600;
        font-size: 0.8rem;
        padding-bottom: 0.5rem;
        color: ${({ theme }) => theme.color.blue};

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          display: inline-block;
          width: 100%;
          border-bottom: 1px solid ${({ theme }) => theme.color.blue};
        }
      }
      & .content {
        font-weight: 500;
        font-size: 0.7rem;
        padding-top: 0.5rem;
      }
    }

    & .dday {
      font-weight: 600;
      padding: 0.2rem 0;
      font-size: 0.7rem;
      background: ${({ theme }) => theme.color.lightGray};
      color: black;
    }
  }
`;

export default function KakaoMap({ filterInfo, loading }) {
  const filterRef = useRef();
  const mapRef = useRef(null);
  filterRef.current = filterInfo;
  const dispatch = useDispatch();

  //* 카카오 지도 생성
  useEffect(() => {
    let startLat = 37.518197895084874;
    let startLog = 126.98255734652028;
    let container = mapRef.current;
    let options = {
      center: new kakao.maps.LatLng(startLat, startLog),
      level: 7,
    };
    map = new kakao.maps.Map(container, options);

    //* 지도 이동, 확대, 축소 이벤트 발생
    kakao.maps.event.addListener(map, 'dragend', kakaoEvent);
    kakao.maps.event.addListener(map, 'zoom_changed', kakaoEvent);

    return () => {
      kakao.maps.event.removeListener(map, 'dragend', kakaoEvent);
      kakao.maps.event.removeListener(map, 'zoom_changed', kakaoEvent);
    };
  }, []);

  useEffect(() => {
    //* 첫 렌더링 & 가이드 필터 변경 시 발생 함수
    kakaoEvent();
  }, [filterInfo]);

  //* 마커 클릭 이벤트 함수
  // 리렌더링 발생. 개선 필요
  const clickMarker = (id) => {
    //TODO GET /map 모달
    getCardModal(id).then((res) => {
      if (res >= 400) return alert('에러가 발생했습니다. 다시 시도해 주세요');
      dispatch(openGuideModal({ isOpen: true, modalInfo: res }));
    });
  };

  //* 지도 이동, 확대, 축소 이벤트 발생 함수
  const kakaoEvent = () => {
    loading(true);
    let latLngparams = getInfo(map);
    latLngparams = { ...latLngparams, ...filterRef.current };

    // TODO GET 요청
    getGuideCards(latLngparams).then((res) => {
      dispatch(openGuideModal({ isOpen: false, modalInfo: {} }));
      deleteMarker();
      if (res >= 400) {
        alert('에러가 발생했습니다. 다시 시도해 주세요');
        loading(false);
      } else {
        dispatch(guideCardInfo(res));
        createMarker(res, map, clickMarker);
        loading(false);
      }
    });
  };

  return <MapWrapper ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
