import styled from "styled-components";
import { FiCamera } from "react-icons/fi";
import { useState } from "react";
import ReactFileReader from "react-file-reader";
import { Button, IconButton } from "rsuite";

export const AvatarInput = styled.div`
    margin-bottom: 10px;
    position: relative;
    align-self: center;
    img {
        width: 140px;
        height: 140px;
        object-fit: cover;
        border-radius: 50%;
    }
    .circle {
        width: 180px;
        height: 180px;
        border-radius: 50%;
    }
    label {
        right: 23em !important;
        position: absolute;
        width: 48px;
        height: 48px;
        background: #312e38;
        border-radius: 50%;
        right: 0;
        bottom: 0;
        border: 0;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        input {
            display: none;
        }
        svg {
            width: 20px;
            height: 20px;
            color: #f4ede8;
        }
        &:hover {
            background: blue;
        }
  }
`;

export function PhotoPicker({padding}) {
  const [url, setUrl] = useState("https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-701751694975293fcgzulxp2k.png");

  const handleFiles = (files) => {
    console.log(files);
    setUrl(files.base64);
  };

  return (
    <div style={{fontFamily: 'sans-serif', textAlign: 'center', padding: padding}}>
      <>
        <AvatarInput><img src={url} alt="Avatar Placeholder" /></AvatarInput>

        <ReactFileReader fileTypes={[".png", ".jpg"]} base64={true} handleFiles={handleFiles} >
          <IconButton appearance="subtle" icon={<FiCamera style={{ width: 25, height: 25 }} />} />
        </ReactFileReader>
      </>
    </div>
  );
}