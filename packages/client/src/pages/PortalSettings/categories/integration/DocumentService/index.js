import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import * as Styled from "./index.styled";
import {
  Button,
  Heading,
  HelpButton,
  InputBlock,
  Label,
} from "@docspace/components";
import toastr from "@docspace/components/toast/toastr";

const URL_REGEX = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\/?$/;

const DocumentService = ({
  getDocumentServiceLocation,
  changeDocumentServiceLocation,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const [isSaveLoading, setSaveIsLoading] = useState(false);
  const [isResetLoading, setResetIsLoading] = useState(false);

  const [docServiceUrl, setDocServiceUrl] = useState("");
  const [docServiceUrlIsValid, setDocServiceUrlIsValid] = useState(true);
  const onChangeApiUrl = (e) => {
    setDocServiceUrl(e.target.value);
    if (!e.target.value) setDocServiceUrlIsValid(true);
    else setDocServiceUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const [internalUrl, setInternalUrl] = useState("");
  const [internalUrlIsValid, setInternalUrlIsValid] = useState(true);
  const onChangeInternalUrl = (e) => {
    setInternalUrl(e.target.value);
    if (!e.target.value) setInternalUrlIsValid(true);
    else setInternalUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const [portalUrl, setPortalUrl] = useState("");
  const [portalUrlIsValid, setPortalUrlIsValid] = useState(true);
  const onChangePortalUrl = (e) => {
    setPortalUrl(e.target.value);
    if (!e.target.value) setPortalUrlIsValid(true);
    else setPortalUrlIsValid(URL_REGEX.test(e.target.value));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSaveIsLoading(true);
    changeDocumentServiceLocation(docServiceUrl, internalUrl, portalUrl)
      .then((response) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));
        setDocServiceUrl(response[0]);
        setInternalUrl(response[1]);
        setPortalUrl(response[2]);
      })
      .catch((e) => toastr.error(e))
      .finally(() => setSaveIsLoading(false));
  };

  const onReset = () => {
    setDocServiceUrlIsValid(true);
    setInternalUrlIsValid(true);
    setPortalUrlIsValid(true);

    setResetIsLoading(true);
    changeDocumentServiceLocation(null, null, null)
      .then((response) => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));
        setDocServiceUrl(response[0]);
        setInternalUrl(response[1]);
        setPortalUrl(response[2]);
      })
      .catch((e) => toastr.error(e))
      .finally(() => setResetIsLoading(false));
  };

  const isFormEmpty = !docServiceUrl && !internalUrl && !portalUrl;
  const allInputsValid =
    docServiceUrlIsValid && internalUrlIsValid && portalUrlIsValid;

  const anyInputFilled = docServiceUrl || internalUrl || portalUrl;

  useEffect(() => {
    getDocumentServiceLocation()
      .then((result) => {
        setPortalUrl(result?.docServicePortalUrl);
        setInternalUrl(result?.docServiceUrlInternal);
        setDocServiceUrl(result?.docServiceUrl);
      })
      .catch((error) => toastr.error(error));
  }, []);

  return (
    <Styled.Location>
      <Styled.LocationHeader>
        <div className="main">
          <Heading className={"heading"} isInline level={3}>
            {t("Settings:DocumentServiceLocationHeader")}
          </Heading>
          <div className="help-button-wrapper">
            <HelpButton
              tooltipContent={t("Settings:DocumentServiceLocationHeaderHelp")}
            />
          </div>
        </div>
        <div className="secondary">
          {t("Settings:DocumentServiceLocationHeaderInfo")}
        </div>
      </Styled.LocationHeader>

      <Styled.LocationForm onSubmit={onSubmit}>
        <div className="form-inputs">
          <div className="input-wrapper">
            <Label
              htmlFor="docServiceAdress"
              text={t("Settings:DocumentServiceLocationUrlApi")}
            />
            <InputBlock
              id="docServiceAdress"
              type="text"
              autoComplete="off"
              tabIndex={1}
              scale
              iconButtonClassName={"icon-button"}
              value={docServiceUrl}
              onChange={onChangeApiUrl}
              placeholder={"http://<editors-dns-name>/"}
              hasError={!docServiceUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
            />
          </div>
          <div className="input-wrapper">
            <Label
              htmlFor="internalAdress"
              text={t("Settings:DocumentServiceLocationUrlInternal")}
            />
            <InputBlock
              id="internalAdress"
              type="text"
              autoComplete="off"
              tabIndex={2}
              scale
              iconButtonClassName={"icon-button"}
              value={internalUrl}
              onChange={onChangeInternalUrl}
              placeholder={"http://<editors-dns-name>/"}
              hasError={!internalUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
            />
          </div>
          <div className="input-wrapper">
            <Label
              htmlFor="portalAdress"
              text={t("Settings:DocumentServiceLocationUrlPortal")}
            />
            <InputBlock
              id="portalAdress"
              type="text"
              autoComplete="off"
              tabIndex={3}
              scale
              iconButtonClassName={"icon-button"}
              value={portalUrl}
              onChange={onChangePortalUrl}
              placeholder={"http://<docspace-dns-name>/"}
              hasError={!portalUrlIsValid}
              isDisabled={isSaveLoading || isResetLoading}
            />
          </div>
        </div>
        <div className="form-buttons">
          <Button
            onClick={onSubmit}
            className="button"
            primary
            size={"small"}
            label={t("Common:SaveButton")}
            isDisabled={
              isFormEmpty || !allInputsValid || isSaveLoading || isResetLoading
            }
            isLoading={isSaveLoading}
          />
          <Button
            onClick={onReset}
            className="button"
            size={"small"}
            label={t("Common:ResetButton")}
            isDisabled={!anyInputFilled || isSaveLoading || isResetLoading}
            isLoading={isResetLoading}
          />
        </div>
      </Styled.LocationForm>
    </Styled.Location>
  );
};

export default inject(({ auth, settingsStore }) => {
  return {
    getDocumentServiceLocation: settingsStore.getDocumentServiceLocation,
    changeDocumentServiceLocation: settingsStore.changeDocumentServiceLocation,
  };
})(observer(DocumentService));
