/* eslint-disable react-hooks/exhaustive-deps*/

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { getCardModal } from '../../../network/map/http';
import { openGuideModal } from '../../../redux/map/action';
import { Profile, UserNick } from '../../../styles/map/card';
import { getDday } from '../../../utils/dDay';
import { overlays } from '../../../utils/kakao';
import { map } from '../map/KakaoMap';

export const CardLi = styled.li`
  width: 100%;
  height: 230px;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  filter: ${({ state }) => (state === 'FULL' || state === 'CANCELED') && 'grayscale(100%)'};
  position: relative;
  box-shadow: 0px 0px 9px -1px rgba(46, 46, 46, 0.57);

  &:not(:last-of-type) {
    margin-bottom: 1rem;
  }

  ${({ theme, isClicked }) =>
    isClicked &&
    css`
      border: 5px solid ${isClicked && theme.color.blue};
      box-shadow: 0px 0px 10px ${theme.color.blue};
    `}

  &:hover {
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex: 0 0 auto;
    width: 200px;
    margin: 6px;
    height: 175px;

    &:not(:last-of-type) {
      margin-right: 6px;
      margin-bottom: unset;
    }
  }

  & .imageWrapper {
    position: absolute;
    filter: blur(1px);
    height: 100px;
    width: 100%;
  }

  & .lazy {
    background: none;
    background-color: ${({ theme }) => theme.color.gray};
  }

  & .imgload {
    background-color: ${({ theme }) => theme.color.gray};
    background-image: url(${({ backImage }) => backImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
`;

export const ImageWrapper = styled.div`
  position: absolute;
  filter: blur(1px);
  height: 100px;
  width: 100%;
  background-image: url(${({ backImage }) => backImage});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

export const TitleWrapper = styled.div`
  flex-basis: 40%;
  height: 100px;
  padding: 0.5rem;
  font-weight: 700;

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  & .date {
    position: relative;
    color: #fff;
    padding: 0 1rem;
    text-align: center;
    font-size: 0.8rem;
    background-color: ${({ theme, dday }) => (dday <= 7 ? theme.color.red : theme.color.blue)};
  }

  & .title {
    position: relative;
    color: #fff;
    text-shadow: 0 0 5px black;
    word-break: keep-all;
    text-align: right;
    margin: 0;
  }

  @media ${({ theme }) => theme.device.mobile} {
    align-items: unset;
    justify-content: start;

    & .date,
    & .title {
      margin: unset;
    }

    & .titleWrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    & .title {
      flex-grow: 1;
      font-size: 1.4rem;
      text-align: center;
    }
  }
`;

export const GuideWrapper = styled.div`
  position: absolute;
  top: 70px;
  padding: 1rem;
  padding-top: 0;

  @media ${({ theme }) => theme.device.mobile} {
    position: relative;
    top: 2px;
    padding: 0;
  }
`;

export const GuideInfo = styled.div`
  display: flex;
  align-items: flex-end;
  @media ${({ theme }) => theme.device.mobile} {
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;

    & .nick {
      font-size: 0.7rem;
    }

    & .userNick {
      font-size: 0.8rem;
    }
  }
`;

export const GuideContent = styled.div`
  font-size: 0.8rem;
  padding-top: 0.5rem;
  color: ${({ theme }) => theme.color.gray};

  @media ${({ theme }) => theme.device.mobile} {
    display: none;
  }
`;

export default function GuideCard({ cardInfo, ulRef, scroll }) {
  const { title, gender, guideDate, tourImage, userImage, state, nickName, content, guideId } =
    cardInfo;

  const { modalInfo } = useSelector((state) => state.guideModalReducer);
  const dispatch = useDispatch();
  let dDay = getDday(guideDate);
  const cardRef = useRef();

  const cardClick = (cardId) => {
    // TODO GET /map/guide-card?guide-id=cardId
    getCardModal(cardId).then((res) => {
      dispatch(openGuideModal({ isOpen: true, modalInfo: res }));
    });
  };

  const option = {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  };

  const callback = (entries, observer) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      let classes = cardRef.current.classList;
      classes.add('imgload');
      if (classes.contains('imgload')) observer.unobserve(cardRef.current);
    }
  };

  useEffect(() => {
    const interObserver = new IntersectionObserver(callback, option);
    if (cardRef.current) interObserver.observe(cardRef.current);

    return () => interObserver.disconnect();
  }, []);

  return (
    <CardLi
      onClick={() => cardClick(guideId)}
      isClicked={modalInfo && modalInfo.guideId === guideId}
      state={state}
      backImage={tourImage}
      onMouseEnter={() => overlays[guideId].setMap(map)}
      onMouseLeave={() => overlays[guideId].setMap(null)}
    >
      <div className='imageWrapper lazy' ref={cardRef} />
      <TitleWrapper dday={dDay}>
        <div className='date'>{state === 'FULL' ? '예약마감' : `D - ${dDay}`}</div>
        <div className='titleWrapper'>
          <h2 className='title'>{title}</h2>
        </div>
      </TitleWrapper>
      <GuideWrapper>
        <GuideInfo>
          <Profile
            userImg={userImage}
            width='80px'
            height='80px'
            mWidth='70px'
            mHeight='70px'
            marginRight='1rem'
          />
          <UserNick gender={gender} nickName={nickName} card />
        </GuideInfo>
        <GuideContent>{content.length > 70 ? content.slice(0, 70) + '...' : content}</GuideContent>
      </GuideWrapper>
    </CardLi>
  );
}
