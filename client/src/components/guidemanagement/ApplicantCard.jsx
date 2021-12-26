import React from 'react';
import styled from 'styled-components';
import { ColorBtn } from '../../styles/common';
import { Profile } from '../../styles/map/card';

import { useNavigate } from 'react-router-dom';

import { createRoom } from '../../network/chat/http';

const CardCtn = styled.li`
  /* flex: 0 0 auto; */
  flex-shrink: 0;
  width: 32%;
  height: 200px;
  margin: 0 0.4rem;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  position: relative;
  padding-bottom: 1rem;
  box-shadow: 0px 0px 9px -1px rgba(46, 46, 46, 0.57);
  transform: translateX(${({ fromLeft }) => fromLeft + 'px'});
  @media ${({ theme }) => theme.device.mobile} {
    height: 150px;
  }
`;
const GuideInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const UserProfile = styled(Profile)`
  margin: 0;
`;
const Nick = styled.div`
  color: ${({ theme }) => theme.color.gray};
  /* font-weight: bold; */
  @media ${({ theme }) => theme.device.mobile} {
    font-size: 0.9rem;
  }
`;
const ChatBtn = styled(ColorBtn)`
  position: absolute;
  margin-top: 10px;
  right: 12px;
  bottom: 10px;
  @media ${({ theme }) => theme.device.mobile} {
    bottom: 5px;
    width: 3rem;
    height: 25px;
    padding: 0;
  }
`;

export default function ApplicantCard(props) {
  const { applicant, cardRef } = props;

  const navigate = useNavigate();

  const clickChat = async (e) => {
    const userId = e.target.id;
    const isCreated = await createRoom(userId);

    if (isCreated.data) {
      navigate('/chat');
    } else {
      alert(isCreated);
    }
  };

  return (
    <CardCtn ref={cardRef}>
      <GuideInfo>
        <UserProfile
          userImg={applicant ? applicant.image : '/asset/logo/logo.png'}
          width='100px'
          height='100px'
          mWidth='70px'
          mHeight='70px'
          marginRight='1rem'
        ></UserProfile>
        <Nick>닉네임: {applicant && applicant.nickName}</Nick>
      </GuideInfo>
      <ChatBtn id={applicant.userId} palette='red' onClick={clickChat}>
        채팅
      </ChatBtn>
    </CardCtn>
  );
}
