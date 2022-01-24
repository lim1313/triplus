import React, { useCallback, useState } from 'react';
import SideBar from '../components/map/SideBar';
import styled from 'styled-components';
import KakaoMap from '../components/map/map/KakaoMap';
import CardFilter from '../components/map/sideBar/CardFilter';

const MapContainer = styled.section`
  position: relative;
  width: 100vw;
  height: calc(100vh - ${({ theme }) => theme.size.navHeight});
  min-height: 3rem;
  display: flex;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column-reverse;
  }
`;

export default function MapPage() {
  const [filterInfo, setFilterInfo] = useState({ gender: '', startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(false);

  const filterSubmit = useCallback((...args) => {
    let [gen, start, end] = args;
    let cardFilter = { gender: gen, startDate: start, endDate: end };
    setFilterInfo(cardFilter);
  }, []);

  return (
    <MapContainer>
      <CardFilter filterSubmit={filterSubmit} />
      <SideBar isLoading={isLoading} />
      <KakaoMap filterInfo={filterInfo} loading={(bool) => setIsLoading(bool)} />
    </MapContainer>
  );
}
