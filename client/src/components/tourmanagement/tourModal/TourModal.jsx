import React, { useState } from 'react';
import styled from 'styled-components';
import { Background, ModalWrapper } from '../../../styles/common/modal';
import GuideContent from '../../map/cardModal/GuideContent';
import GuideImgs from '../../map/cardModal/GuideImgs';
import Userinfo from '../../map/cardModal/UserInfo';
import { FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { completeDelete, openTourModal } from '../../../redux/tourManagement/action';
import { ColorBtn, BorderBtn } from '../../../styles/common/index';
import { clickDelete } from '../../../redux/tourManagement/action';
import Modal from '../../common/Modal';
import AlertModal from '../../common/AlertModal';
import { getDday } from '../../../utils/dDay';
import { deleteTourList } from '../../../network/tourmanagement/http';
import { useNavigate } from 'react-router';
import SpinLoading from '../../common/SpinLoading';
import { exit } from '../../../redux/login/action';
import { createRoom } from '../../../network/chat/http';

const TourModalWrapper = styled(ModalWrapper)`
  height: ${({ allow }) => (allow === 'CANCELED' ? '30vh' : '90vh')};
  overflow: auto;
  width: 27rem;

  .alert-message {
    margin-top: 0.5rem;
    color: ${({ theme }) => theme.color.red};
    font-size: 0.8rem;
  }
`;
const TourTitle = styled.h1`
  margin: 0;
  padding: 1rem 0;
  font-size: 1.7rem;
  text-align: center;
  color: ${({ theme }) => theme.color.darkGray};
  word-break: keep-all;
`;

const BtnWrapper = styled.div`
  text-align: right;
  position: sticky;
  top: 0;
  right: 0;
  z-index: 4;
`;
const CloseBtn = styled.button`
  border: none;
  background-color: unset;
  padding: 0.5rem;
  font-size: 1.2rem;
  opacity: 0.5;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;

const CancelBtnWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
`;
const CancelBtn = styled(ColorBtn)`
  width: 9rem;
`;

const ChattingBtn = styled(BorderBtn)`
  width: 9rem;
`;

const NoticeMsg = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const MsgWapper = styled.div`
  text-align: center;
`;

export default function TourModal({ modalInfo, handleDeleteClickPageNum }) {
  const {
    title,
    address,
    gender,
    guideId,
    guideDate,
    tourImage,
    userImage,
    nickName,
    openDate,
    content,
    state,
    startTime,
    endTime,
    userId,
  } = modalInfo;
  const isDeleteClick = useSelector((state) => state.openDeleteModalReducer);
  const [isCompletedMsg, setIsCompletedMsg] = useState(false);
  const [isAlertMsg, setIsAlertMsg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const closeModal = () => {
    dispatch(openTourModal({ isOpen: false }));
  };
  const closeModalNotBtn = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(openTourModal({ isOpen: false }));
    }
  };
  const handleDeleteClick = () => {
    dispatch(clickDelete());
  };
  const handleYesClick = () => {
    if (getDday(guideDate) !== 1) {
      setIsLoading(true);
      deleteTourList(guideId)
        .then((res) => {
          if (res.status === 200) {
            setTimeout(() => {
              setIsLoading(false);
              setIsCompletedMsg(true);
            }, 0);
            setTimeout(() => {
              setIsCompletedMsg(false);
              dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
              dispatch(clickDelete());
              dispatch(completeDelete());
              handleDeleteClickPageNum();
            }, 1000);
          }
        })
        .catch((err) => {
          dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
          dispatch(clickDelete());
          dispatch(exit());
          alert('로그인이 만료되어 로그인페이지로 이동합니다.');
          navigate('/login');
        });
    } else {
      setTimeout(() => {
        setIsAlertMsg(true);
      }, 0);
      setTimeout(() => {
        setIsAlertMsg(false);
      }, 1000);
    }
  };
  const handleCancelClick = () => {
    setIsLoading(true);
    deleteTourList(guideId)
      .then((res) => {
        if (res.status === 200) {
          setTimeout(() => {
            setIsLoading(false);
            setIsCompletedMsg(true);
          }, 0);
          setTimeout(() => {
            setIsCompletedMsg(false);
            dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
            dispatch(completeDelete());
            handleDeleteClickPageNum();
          }, 1000);
        }
      })
      .catch((err) => {
        dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
        dispatch(exit());
        alert('로그인이 만료되어 로그인페이지로 이동합니다.');
        navigate('/login');
      });
  };

  const clickChat = async (e) => {
    const guideUserId = e.target.id;
    const isCreated = await createRoom(guideUserId);

    if (isCreated.data) {
      dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
      navigate('/chat');
    } else {
      dispatch(openTourModal({ isOpen: false, modalInfo: {} }));
      alert(isCreated);
    }
  };
  return (
    <Background onClick={closeModalNotBtn}>
      <TourModalWrapper allow={state}>
        {state === 'CANCELED' ? (
          <>
            <BtnWrapper onClick={closeModal}>
              <CloseBtn>
                <FaTimes />
              </CloseBtn>
            </BtnWrapper>
            <NoticeMsg>
              <MsgWapper>
                가이드에 의해 삭제된 여행입니다. <br />
                여행목록에서 삭제하시려면 <br />
                하단의 취소하기를 눌러주세요
              </MsgWapper>
              <CancelBtnWrapper>
                <CancelBtn palette='red' onClick={handleCancelClick}>
                  취소하기
                </CancelBtn>
              </CancelBtnWrapper>
              {isCompletedMsg && <AlertModal>신청 취소가 완료되었습니다!</AlertModal>}
            </NoticeMsg>
          </>
        ) : (
          <>
            {isDeleteClick && (
              <Modal
                content='여행신청을 취소하시겠습니까?'
                yesClick={handleYesClick}
                noClick={() => {
                  dispatch(clickDelete());
                }}
              ></Modal>
            )}
            {isLoading && <SpinLoading />}
            {isCompletedMsg && <AlertModal>신청 취소가 완료되었습니다!</AlertModal>}
            {isAlertMsg && <AlertModal>여행 하루전에는 취소가 불가능합니다.</AlertModal>}
            <BtnWrapper onClick={closeModal}>
              <CloseBtn>
                <FaTimes />
              </CloseBtn>
            </BtnWrapper>
            <TourTitle>{title}</TourTitle>
            <Userinfo nickName={nickName} gender={gender} userImage={userImage} />
            <GuideImgs tourImage={tourImage} title={title} />
            <GuideContent
              address={address}
              guideDate={guideDate}
              content={content}
              openDate={openDate}
              startTime={startTime}
              endTime={endTime}
            />
            <div className='alert-message'>*여행 하루전에는 취소가 불가능합니다.</div>
            <CancelBtnWrapper>
              <CancelBtn palette='red' onClick={handleDeleteClick}>
                취소하기
              </CancelBtn>
              <ChattingBtn id={userId} palette='black' onClick={clickChat}>
                채팅하기
              </ChattingBtn>
            </CancelBtnWrapper>
          </>
        )}
      </TourModalWrapper>
    </Background>
  );
}
