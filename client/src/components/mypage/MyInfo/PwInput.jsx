/* eslint-disable react-hooks/exhaustive-deps*/

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  position: relative;
  margin: 1.7rem 0;
`;

const SubTitle = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.color.blue};
`;

const InputPw = styled.input`
  width: 100%;
  &:focus {
    outline: none;
  }
`;

const AlertMsg = styled.div`
  position: absolute;
  bottom: -1.4rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.color.red};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 0.72rem;
  }
`;
export default function PwInput({ firstInput, subTitle, pwNum, onChange, alertMsg, onBlur }) {
  const inputRef = useRef();

  useEffect(() => {
    firstInput && inputRef.current.focus();
  }, []);

  return (
    <InputWrapper>
      <SubTitle>{subTitle}</SubTitle>
      <InputPw
        ref={inputRef}
        type='password'
        placeholder={subTitle}
        value={pwNum}
        onChange={onChange}
        onBlur={onBlur}
        autofocus
      ></InputPw>
      <AlertMsg>{alertMsg}</AlertMsg>
    </InputWrapper>
  );
}
