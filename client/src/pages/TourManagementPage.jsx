import React, { useState, useRef } from 'react';
import { ManageCtn } from '../styles/management/container';
import styled from 'styled-components';
import TourFilter from '../components/tourmanagement/TourFilter';
import OrderFilter from '../components/tourmanagement/OrderFilter';
import ListSection from '../components/tourmanagement/ListSection';
import { useSelector } from 'react-redux';
import TourModal from '../components/tourmanagement/tourModal/TourModal';
import SpinLoading from '../components/common/SpinLoading';
import useFetch from '../utils/useFetch';

const SectionCtn = styled.section`
  width: 70vw;
  border-radius: 0.5rem;
  background-color: white;
  height: auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100vw;
    padding: 0.5rem;
    border-radius: 0;
    margin-top: 2rem;
  }
`;

export default function TourManagementPage() {
  //상태관리
  const state = useSelector((state) => state.openTourModalReducer);
  const isComplete = useSelector((state) => state.completeDeleteReducer);
  const { isOpen, modalInfo } = state;
  const [pageNum, setPageNum] = useState({ approved: 1, completed: 1 });
  const [isActive, setIsActive] = useState({ approved: true, completed: false });
  const [sortBy, setSortBy] = useState('ASC');

  const observerRef = useRef();
  const { items, hasMore, isLoading } = useFetch(pageNum, isActive, sortBy, isComplete);
  // const [filterdItems, setFilteredItems] = useState([]);

  //oberver핸들함수
  const observer = (node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && isActive.approved) {
          setPageNum({ ...pageNum, approved: pageNum.approved + 1, completed: 1 });
        } else if (entry.isIntersecting && hasMore && isActive.completed) {
          setPageNum({ ...pageNum, completed: pageNum.completed + 1, approved: 1 });
        }
      },
      { rootMargin: '700px 0px 10px 0px', threshold: 0.3 }
    );
    node && observerRef.current.observe(node);
  };

  const handleApprovedClick = () => {
    setIsActive({ ...isActive, approved: true, completed: false });
    setPageNum({ approved: 1, completed: 1 });
  };
  const handleCompletedClick = () => {
    setIsActive({ ...isActive, approved: false, completed: true });
    setPageNum({ approved: 1, completed: 1 });
  };
  const handleFilterChange = (e) => {
    const filter = e.target.value;
    if (filter === '날짜 느린순') {
      setSortBy('DESC');
      setPageNum({ approved: 1, completed: 1 });
    } else {
      setSortBy('ASC');
      setPageNum({ approved: 1, completed: 1 });
    }
  };

  // tourmodal delete handle function!
  const handleDeleteClickPageNum = () => {
    setPageNum({ approved: 1, completed: 1 });
  };
  return (
    <>
      {isOpen && (
        <TourModal modalInfo={modalInfo} handleDeleteClickPageNum={handleDeleteClickPageNum} />
      )}
      <ManageCtn>
        <SectionCtn id='scrollArea' count={items}>
          <TourFilter
            handleApprovedClick={handleApprovedClick}
            handleCompletedClick={handleCompletedClick}
            isActive={isActive}
          />
          <OrderFilter handleFilterChange={handleFilterChange} />
          <ListSection items={items} />
          {items.length === 0 && isActive.approved && (
            <div style={{ textAlign: 'center' }}>신청한 여행이 없습니다.</div>
          )}
          {items.length === 0 && isActive.completed && (
            <div style={{ textAlign: 'center' }}>다녀온 여행이 없습니다.</div>
          )}
        </SectionCtn>
        {isLoading && items.length > 3 && <SpinLoading />}
        <div ref={observer} />
      </ManageCtn>
    </>
  );
}
