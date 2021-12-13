require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const { google } = require('googleapis');
const { user } = require('../models');
const { generateAccessToken, sendAccessToken, isAuthorized } = require('./functions/user');

module.exports = {
  google: async (req, res) => {
    const accessCode = req.body.authorizationCode;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URL
    );
    const { tokens } = await oauth2Client.getToken(accessCode);
    oauth2Client.setCredentials(tokens);
    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );
    const { sub, email, picture } = userInfo.data;
    user
      .findOrCreate({
        where: { userId: sub, email: email },
        defaults: { userId: sub, email: email, image: picture },
      })
      .then(([data, created]) => {
        const accessToken = generateAccessToken(data.dataValues);
        sendAccessToken(res, accessToken);
        return res.status(201).json({ success: true, message: '로그인이 완료되었습니다' });
      })
      .catch((err) => console.log(err));
  },

  naver: async (req, res) => {
    return res.redirect(
      `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.REACT_APP_NAVER_CLIENT}&state=STATE_STRING&redirect_uri=${process.env.REACT_APP_REDIRECT_URL}/navercallback`
    );
  },

  navercallback: async (req, res) => {
    const authorizationCode = req.body.authorizationCode;
    const state = req.body.state;
    try {
      const result = await axios.get(
        `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.REACT_APP_NAVER_CLIENT}&client_secret=${process.env.REACT_APP_NAVERPW}&code=${authorizationCode}&state=${state}`
      );

      console.log(result);

      const userInfo = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${result.data.access_token}`,
        },
        withCredentials: true,
      });

      console.log(userInfo);

      //       data: {
      //   resultcode: '00',
      //   message: 'success',
      //   response: {
      //     id: 'OmHiyO12ExD_LimJlBK7AV1EMsR404RuCDKC7ay56ek',
      //     nickname: 'jk****',
      //     profile_image: 'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
      //     gender: 'M',
      //     email: 'jkyyc3@hanmail.net',
      //     name: '박예찬'
      //   }
      // }
      const { gender, email, nickname, profile_image } = userInfo.data.response;
      // console.log(id);
      if (gender === 'M') {
        gender = 0;
      } else {
        gender = 1;
      }
      const userInstance = await user.findOrCreate({
        where: {
          userId: nickname,
          social: 'naver',
          email: email,
        },
        defaults: {
          gender,
          password: '',
          role: 'general',
          image: profile_image,
        },
      });

      const instance = userInstance[0];

      const accessToken = generateAccessToken(instance.dataValues);
      sendAccessToken(res, accessToken);
      return res.status(201).json({ success: true, message: '로그인이 완료되었습니다' });
    } catch (error) {
      console.error(error);
      res.status(500).send('잠시 후 다시 시도해주세요');
    }
  },

  //* 카카오 인가코드 받기
  kakao: async (req, res) => {
    return res.redirect(
      `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`
    );
  },

  kakaocallback: async (req, res) => {
    const authorizationCode = req.body.authorizationCode;

    try {
      //* 카카오 토큰 발급
      let kakaoToken = await axios.post(
        `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${authorizationCode}`,
        {
          headers: { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
          withCredentials: true,
        }
      );

      //* 카카오 토큰을 통한 유저 정보 GET
      let userInfo = await axios.get(`https://kapi.kakao.com/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${kakaoToken.data.access_token}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8;',
        },
        withCredentials: true,
      });

      const { nickname, profile_image_url } = userInfo.data.kakao_account.profile;

      //* 닉네임 생성
      const key1 = crypto.randomBytes(256).toString('hex').substr(100, 4);
      const randomNum = parseInt(key1, 16);
      const nick = '여행자' + randomNum;

      //* 카카오 회원 테이블 저장
      const [userData, created] = await user.findOrCreate({
        where: {
          userId: nickname,
          social: 'kakao',
        },
        defaults: {
          nick_name: nick,
          gender: '',
          password: '',
          email: '',
          role: 'general',
          image: profile_image_url,
        },
      });

      const accessToken = generateAccessToken(userData.dataValues);
      sendAccessToken(res, accessToken);

      return res.status(201).json({ success: true, message: '로그인이 완료되었습니다' });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ success: false, message: '로그인에 실패했습니다' });
    }
  },
};
