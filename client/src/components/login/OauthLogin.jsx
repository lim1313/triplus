import React from 'react';
import styled from 'styled-components';
import GoogleLoginBtn from './GoogleLoginBtn';
import KakaoLogin from './KakaoLogin';

const OauthBlock = styled.ul`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

export default function OauthLogin() {
  return (
    <OauthBlock>
      <KakaoLogin />
      <GoogleLoginBtn />
    </OauthBlock>
  );
}
