/* eslint-disable react-hooks/exhaustive-deps*/
import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';
import Toggle from './components/common/Toggle';
import Loading from './components/common/Loading';

const MainPage = lazy(() => import('./pages/MainPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ChattingPage = lazy(() => import('./pages/ChattingPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const GoogleCallback = lazy(() => import('./pages/Googlecallback'));
const ManagementPage = lazy(() => import('./pages/ManagementPage'));
const KakaoCallback = lazy(() => import('./pages/KakaoCallback'));
const TourManagementPage = lazy(() => import('./pages/TourManagementPage'));

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isToggled = useSelector((state) => state.toggleReducer.isToggled);

  useEffect(() => {
    if (
      !(
        pathname === '/admin' ||
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/map' ||
        pathname === '/admin' ||
        pathname === '/management' ||
        pathname === '/management/tourlist' ||
        pathname === '/chat' ||
        pathname === '/mypage' ||
        pathname === '/googlecallback' ||
        pathname === '/kakaocallback'
      )
    ) {
      navigate('/');
    }
  }, [pathname]);
  return (
    <>
      {pathname === '/admin' ? null : <NavBar />}
      {isToggled && <Toggle />}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/' element={<MainPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/map' element={<MapPage />} />
          <Route path='/management' element={<ManagementPage />}>
            <Route path='tourlist' element={<TourManagementPage />} />
          </Route>
          <Route path='/chat' element={<ChattingPage />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/googlecallback' element={<GoogleCallback />} />
          <Route path='/kakaocallback' element={<KakaoCallback />} />
        </Routes>
      </Suspense>
      {(pathname === '/' || pathname === '/login' || pathname === '/signup') && (
        <Footer main={pathname === '/' ? 'main' : null} />
      )}
    </>
  );
}

export default App;
