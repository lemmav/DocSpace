﻿import React from "react";
import styled from "styled-components";
import { ReactSVG } from "react-svg";
import { hugeMobile } from "@docspace/components/utils/device";
import { inject, observer } from "mobx-react";
import { getLogoFromPath } from "SRC_DIR/helpers/utils";

const StyledWrapper = styled.div`
  .logo-wrapper {
    width: 386px;
    height: 44px;
  }

  @media ${hugeMobile} {
    display: none;
  }
`;

const DocspaceLogo = (props) => {
  const { className, whiteLabelLogoUrls, userTheme } = props;

  const logo = getLogoFromPath(
    userTheme === "Dark"
      ? whiteLabelLogoUrls[1]?.path?.dark
      : whiteLabelLogoUrls[1]?.path?.light
  );

  return (
    <StyledWrapper>
      <ReactSVG src={logo} className={`logo-wrapper ${className}`} />
    </StyledWrapper>
  );
};

export default inject(({ auth }) => {
  const { settingsStore, userStore } = auth;
  const { whiteLabelLogoUrls } = settingsStore;
  const { userTheme } = userStore;

  return {
    whiteLabelLogoUrls,
    userTheme,
  };
})(observer(DocspaceLogo));
