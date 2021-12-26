import React, { useState } from 'react';
import { Background, ModalTitle, ModalWrapper } from '../../styles/common/modal';
import { ColorBtn } from '../../styles/common/index';
import styled from 'styled-components';
import GuideTitle from './GuideTitle';
import GuideImgs from './GuideImgs';
import GuideDate from './GuideDate';
import GuidePlace from './GuidePlace';
import GuideTime from './GuideTime';
import GuideContent from './GuideContent';
import { ImCancelCircle } from 'react-icons/im';
import { createGudie } from '../../network/management/http';
import dayjs from 'dayjs';
import GuideGender from './GuideGender';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Loading from '../common/Loading';
import { exit } from '../../redux/login/action';
import AlertModal from '../common/AlertModal';

const { kakao } = window;

const DatePlaceCtn = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: 13rem;
`;
const SubmitCtn = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;
const DeleteBtn = styled.button`
  background: none;
  border: none;
  position: absolute;
  top: 1rem;
  right: 0.7rem;
  cursor: pointer;
  & .cancel {
    color: ${({ theme }) => theme.color.gray};
    font-size: 1rem;
  }
  @media ${({ theme }) => theme.device.mobile} {
    top: 1.4rem;
    right: 0;
    & .cancel {
      color: ${({ theme }) => theme.color.gray};
      font-size: 1.2rem;
    }
  }
`;

const CreateModalWrapper = styled(ModalWrapper)`
  height: auto;
  @media ${({ theme }) => theme.device.mobile} {
    padding: 1.5rem;
  }
`;

const CompleteMessage = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  font-size: 1.5rem;
  text-align: center;
  color: ${({ theme }) => theme.color.blue};
  position: absolute;
  left: 30%;
  top: 30%;
`;

export default function CreateModal(props) {
  //props와 state
  const { handleCloseCreate, handleCreateClick, handleComplete, isCompleted } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    title: '',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    address: '',
    gender: false,
    startTime: { sdayNight: '오전', stime: '00', sminute: '00' },
    endTime: { edayNight: '오전', etime: '00', eminute: '00' },
    count: '',
    content: '',
    openDate: '',
    latitude: '',
    longitude: '',
  });
  const [fileUrl, setFileUrl] = useState({
    file: null,
    file2: null,
    file3: null,
  });
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [fileArray, setFileArray] = useState({ file: null, file2: null, file3: null });
  const [isGender, setIsGender] = useState(false);
  const [address, setAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [startTime, setStartTime] = useState({ sdayNight: '오전', stime: '00', sminute: '00' });
  const [endTime, setEndTime] = useState({ edayNight: '오전', etime: '00', eminute: '00' });
  const [unCompleteMsgOpen, setUnCompleteMsgOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //이벤트핸들러 함수

  //주소->좌표 변경함수
  const geocoder = new kakao.maps.services.Geocoder();
  const callback = (result, status) => {
    const data = result[0].road_address;
    setInputs({ ...inputs, latitude: data.y, longitude: data.x });
  };

  //상세주소 입력시점 + 주소->좌표 변경시점
  const handlePlaceBlur = () => {
    if (address) {
      geocoder.addressSearch(address, callback);
    } else return;
  };

  // input상태관리 함수
  const handleInputChange = (e) => {
    const id = e.target.getAttribute('id');
    if (id === 'title' && e.target.value.length > 20) return;
    if (id === 'address') {
      setInputs({
        ...inputs,
        address: address + ' ' + e.target.value,
      });
      setExtraAddress(e.target.value);
    } else {
      setInputs({ ...inputs, [id]: e.target.value });
    }
  };

  //date input 상태관리 함수
  const handleDateChange = (date) => {
    setStartDate(date);
    setInputs({
      ...inputs,
      date: dayjs(date).format('YYYY.MM.DD'),
    });
  };

  //img input 상태관리 함수+미리보기 구현
  const handleImgChange = (e) => {
    if (!e.target.files[0]) return;
    if (e.target.files) {
      const targetId = e.target.getAttribute('id');
      const imgFile = e.target.files[0];
      const imgUrl = URL.createObjectURL(imgFile);
      setFileUrl({ ...fileUrl, [targetId]: imgUrl });
      setFileArray({ ...fileArray, [targetId]: e.target.files[0] });
    }
  };

  //도로명주소 저장 함수
  const handleAddressChange = (data) => {
    setAddress(data);
  };

  //시간 저장 함수
  const handleStartTimeChange = (e) => {
    const key = e.target.getAttribute('id');
    setStartTime({ ...startTime, [key]: e.target.value });
    if (key === 'stime') {
      setEndTime({ ...endTime, etime: e.target.value });
      setInputs({
        ...inputs,
        endTime: { ...inputs.endTime, etime: e.target.value },
        startTime: { ...inputs.startTime, stime: e.target.value },
      });
    } else if (key === 'sminute') {
      setEndTime({ ...endTime, eminute: e.target.value });
      setInputs({
        ...inputs,
        endTime: { ...inputs.endTime, eminute: e.target.value },
        startTime: { ...inputs.startTime, sminute: e.target.value },
      });
    } else if (key === 'sdayNight') {
      setEndTime({ ...endTime, edayNight: e.target.value });
      setInputs({
        ...inputs,
        endTime: { ...inputs.endTime, edayNight: e.target.value },
        startTime: { ...inputs.startTime, sdayNight: e.target.value },
      });
    }
  };
  const handleEndTimeChange = (e) => {
    const key = e.target.getAttribute('id');
    setEndTime({ ...endTime, [key]: e.target.value });
    setInputs({ ...inputs, endTime: { ...inputs.endTime, [key]: e.target.value } });
  };

  // 성별 토글 상태관리 함수
  const handleGenderClick = () => {
    setIsGender(!isGender);
  };

  const inputCheck = (checkData) => {
    for (let key in checkData) {
      if (key === 'gender') continue;
      if (key === 'openDate') continue;
      if (key === 'date') continue;
      if (!checkData[key] || Number(checkData.count) < 1) return false;
    }
    return true;
  };

  //가이드 생성 버튼 클릭시 이벤트 핸들러 함수
  const handleSubmitClick = () => {
    if (inputCheck(inputs)) {
      setIsLoading(true);
      const formData = new FormData();
      for (let key in inputs) {
        if (key === 'startTime') {
          const iStartTime =
            inputs.startTime.sdayNight +
            ' ' +
            inputs.startTime.stime +
            ':' +
            inputs.startTime.sminute;
          formData.append(key, iStartTime);
        } else if (key === 'endTime') {
          const iEndTime =
            inputs.endTime.edayNight + ' ' + inputs.endTime.etime + ':' + inputs.endTime.eminute;
          formData.append(key, iEndTime);
        } else {
          formData.append(key, inputs[key]);
        }
      }
      for (let key in fileArray) {
        if (fileArray[key]) {
          formData.append('file', fileArray[key]);
        } else continue;
      }
      createGudie(formData)
        .then((res) => {
          if (res.data.message === 'accessToken이 없습니다') {
            dispatch(exit());
            alert('로그인이 만료되어 로그인페이지로 이동합니다.');
            navigate('/login');
            setIsLoading(false);
          } else {
            handleComplete();
            navigate('/management');
          }
        })
        .catch((error) => {
          alert('잠시후에 다시 시도해주세요');
          navigate('/management');
        });
    } else {
      setTimeout(() => setUnCompleteMsgOpen(true), 0);
      setTimeout(() => setUnCompleteMsgOpen(false), 1000);
      navigate('/management');
    }
  };

  return (
    <Background onClick={handleCloseCreate} name='Background'>
      {unCompleteMsgOpen && <AlertModal content={'정확한 정보를 기입해주세요'} />}
      <CreateModalWrapper width='26rem' minWidth='23rem'>
        <DeleteBtn>
          <ImCancelCircle className='cancel' onClick={handleCreateClick} />
        </DeleteBtn>
        {isLoading ? (
          <>
            {isCompleted ? (
              <CompleteMessage>
                업로드가 완료되었습니다!
                <br />
              </CompleteMessage>
            ) : (
              <>
                <LoadingMessage>업로드중입니다...</LoadingMessage>
                <Loading />
              </>
            )}
          </>
        ) : (
          <>
            <ModalTitle>가이드 카드 만들기</ModalTitle>
            <GuideTitle handleInputChange={handleInputChange} value={inputs.title} />
            <GuideGender handleGenderClick={handleGenderClick} isGender={isGender} />
            <GuideImgs handleImgChange={handleImgChange} fileUrl={fileUrl} />
            <DatePlaceCtn>
              <GuideDate
                setInputs={setInputs}
                inputs={inputs}
                handleDateChange={handleDateChange}
                value={inputs.date}
                startDate={startDate}
              />
              <GuidePlace
                handleInputChange={handleInputChange}
                handleAddressChange={handleAddressChange}
                value={inputs.address}
                address={address}
                extraAddress={extraAddress}
                handlePlaceBlur={handlePlaceBlur}
              />
            </DatePlaceCtn>
            <GuideTime
              handleInputChange={handleInputChange}
              value={inputs}
              handleStartTimeChange={handleStartTimeChange}
              handleEndTimeChange={handleEndTimeChange}
              startTime={startTime}
              endTime={endTime}
            />
            <GuideContent handleInputChange={handleInputChange} value={inputs} />
            <SubmitCtn>
              <ColorBtn palette='red' width='8rem' fontSize='1rem' onClick={handleSubmitClick}>
                카드 만들기
              </ColorBtn>
            </SubmitCtn>
          </>
        )}
      </CreateModalWrapper>
    </Background>
  );
}
