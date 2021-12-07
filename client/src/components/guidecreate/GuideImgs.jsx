import React, { useState } from 'react';
import styled from 'styled-components';

const ImgForm = styled.form`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const ImgCtn = styled.div`
  border: 1px solid ${({ theme }) => theme.color.gray};
  width: 32.8%;
  border-radius: 0.4rem;
  position: relative;
  & img {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }
  & label {
    display: block;
    width: 100%;
    text-align: center;
    margin: 25% 0;
    color: ${({ theme }) => theme.color.gray};
  }
`;
const ImgInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
`;

export default function GuideImgs() {
  const [fileUrl, setFileUrl] = useState({
    file: null,
    file2: null,
    file3: null,
  });

  const handleImgUpload = (event) => {
    const targetId = event.target.getAttribute('id');
    console.log(targetId);
    const imgFile = event.target.files[0];
    const imgUrl = URL.createObjectURL(imgFile);
    setFileUrl({ ...fileUrl, [targetId]: imgUrl });
  };
  return (
    <ImgForm>
      <ImgCtn>
        {fileUrl.file ? <img src={fileUrl.file} alt='사진1' /> : null}
        <label htmlFor='file'>
          +
          <br />
          사진선택
        </label>
        <ImgInput type='file' id='file' onChange={handleImgUpload} />
      </ImgCtn>
      <ImgCtn>
        {fileUrl.file2 ? <img src={fileUrl.file2} alt='사진2' /> : null}
        <label htmlFor='file2'>
          +
          <br />
          사진선택
        </label>
        <ImgInput type='file' id='file2' onChange={handleImgUpload} />
      </ImgCtn>
      <ImgCtn>
        {fileUrl.file3 ? <img src={fileUrl.file3} alt='사진3' /> : null}
        <label htmlFor='file3'>
          +
          <br />
          사진선택
        </label>
        <ImgInput type='file' id='file3' onChange={handleImgUpload} />
      </ImgCtn>
    </ImgForm>
  );
}
