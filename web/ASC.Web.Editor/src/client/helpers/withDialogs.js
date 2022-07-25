import React, { useState, useEffect } from "react";
import DynamicComponent from "../components/DynamicComponent";
import { getPresignedUri } from "@appserver/common/api/files";
import { STUDIO_SCOPE, STUDIO_REMOTE_ENTRY_URL } from "./constants";
import { useTranslation } from "react-i18next";
import SharingDialog from "../components/SharingDialog";
import SelectFileDialog from "../components/SelectFileDialog";
import SelectFolderDialog from "../components/SelectFolderDialog";

const insertImageAction = "imageFileType";
const mailMergeAction = "mailMergeFileType";
const compareFilesAction = "documentsFileType";

const withDialogs = (WrappedComponent) => {
  return (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [filesType, setFilesType] = useState("");
    const [isFileDialogVisible, setIsFileDialogVisible] = useState(false);
    const [typeInsertImageAction, setTypeInsertImageAction] = useState();
    const [isFolderDialogVisible, setIsFolderDialogVisible] = useState(false);
    const [titleSelectorFolder, setTitleSelectorFolder] = useState("");
    const [urlSelectorFolder, setUrlSelectorFolder] = useState("");
    const [extension, setExtension] = useState();
    const [openNewTab, setNewOpenTab] = useState(false);
    const [
      preparationPortalDialogVisible,
      setPreparationPortalDialogVisible,
    ] = useState(false);

    const { t } = useTranslation(["Editor", "Common"]);

    const { config, fileId, mfReady, sharingSettings } = props;
    const { file: fileInfo } = config;

    useEffect(() => {
      if (window.authStore) {
        initSocketHelper();
      }
    }, [mfReady]);

    const initSocketHelper = async () => {
      await window.authStore.auth.init(true);

      const { socketHelper } = window.authStore.auth.settingsStore;
      socketHelper.emit({
        command: "subscribe",
        data: "backup-restore",
      });
      socketHelper.on("restore-backup", () => {
        setPreparationPortalDialogVisible(true);
      });
    };

    const onSDKRequestSharingSettings = () => {
      setIsVisible(true);
    };

    const onCancel = () => {
      setIsVisible(false);
    };

    const loadUsersRightsList = () => {
      window.SharingDialog.getSharingSettings(fileId, sharingSettings).then(
        (sharingSettings) => {
          window.docEditor.setSharingSettings({
            sharingSettings,
          });
        }
      );
    };

    const onCloseFileDialog = () => {
      setIsFileDialogVisible(false);
    };

    const onSDKRequestCompareFile = () => {
      setFilesType(compareFilesAction);
      setIsFileDialogVisible(true);
    };

    const onSDKRequestMailMergeRecipients = () => {
      setFilesType(mailMergeAction);
      setIsFileDialogVisible(true);
    };

    const onSDKRequestInsertImage = (event) => {
      setTypeInsertImageAction(event.data);
      setFilesType(insertImageAction);
      setIsFileDialogVisible(true);
    };

    const insertImage = (link) => {
      const token = link.token;

      window.docEditor.insertImage({
        ...typeInsertImageAction,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const mailMerge = (link) => {
      const token = link.token;

      window.docEditor.setMailMergeRecipients({
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const compareFiles = (link) => {
      const token = link.token;

      window.docEditor.setRevisedFile({
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    };

    const insertImageActionProps = {
      isImageOnly: true,
    };

    const mailMergeActionProps = {
      isTablesOnly: true,
      searchParam: ".xlsx",
    };
    const compareFilesActionProps = {
      isDocumentsOnly: true,
    };

    const fileTypeDetection = () => {
      if (filesType === insertImageAction) {
        return insertImageActionProps;
      }
      if (filesType === mailMergeAction) {
        return mailMergeActionProps;
      }
      if (filesType === compareFilesAction) {
        return compareFilesActionProps;
      }
    };

    const onSelectFile = async (file) => {
      try {
        const link = await getPresignedUri(file.id);

        if (filesType === insertImageAction) insertImage(link);
        if (filesType === mailMergeAction) mailMerge(link);
        if (filesType === compareFilesAction) compareFiles(link);
      } catch (e) {
        console.error(e);
      }
    };

    const getFileTypeTranslation = () => {
      switch (filesType) {
        case mailMergeAction:
          return t("MailMergeFileType");
        case insertImageAction:
          return t("ImageFileType");
        case compareFilesAction:
          return t("DocumentsFileType");
      }
    };

    const selectFilesListTitle = () => {
      const type = getFileTypeTranslation();
      return filesType === mailMergeAction
        ? type
        : t("SelectFilesType", { fileType: type });
    };

    const onSDKRequestSaveAs = (event) => {
      setTitleSelectorFolder(event.data.title);
      setUrlSelectorFolder(event.data.url);
      setExtension(event.data.title.split(".").pop());

      setIsFolderDialogVisible(true);
    };

    const onCloseFolderDialog = () => {
      setIsFolderDialogVisible(false);
      setNewOpenTab(false);
    };

    const getSavingInfo = async (title, folderId) => {
      const savingInfo = await window.filesUtils.SaveAs(
        title,
        urlSelectorFolder,
        folderId,
        openNewTab
      );

      if (savingInfo) {
        const convertedInfo = savingInfo.split(": ").pop();
        docEditor.showMessage(convertedInfo);
      }
    };

    const onClickSaveSelectFolder = (e, folderId) => {
      const currentExst = titleSelectorFolder.split(".").pop();

      const title =
        currentExst !== extension
          ? titleSelectorFolder.concat(`.${extension}`)
          : titleSelectorFolder;

      if (openNewTab) {
        window.filesUtils.SaveAs(
          title,
          urlSelectorFolder,
          folderId,
          openNewTab
        );
      } else {
        getSavingInfo(title, folderId);
      }
    };

    const onClickCheckbox = () => {
      setNewOpenTab(!openNewTab);
    };

    const onChangeInput = (e) => {
      setTitleSelectorFolder(e.target.value);
    };

    const sharingDialog = (
      <SharingDialog
        mfReady={mfReady}
        isVisible={isVisible}
        fileInfo={fileInfo}
        onCancel={onCancel}
        loadUsersRightsList={loadUsersRightsList}
        filesSettings={props.filesSettings}
      />
    );

    const selectFileDialog = (
      <SelectFileDialog
        isVisible={isFileDialogVisible}
        onSelectFile={onSelectFile}
        onCloseFileDialog={onCloseFileDialog}
        {...fileTypeDetection()}
        filesListTitle={selectFilesListTitle()}
        settings={props.filesSettings}
        mfReady={mfReady}
        successAuth={props.successAuth}
      />
    );

    const selectFolderDialog = (
      <SelectFolderDialog
        successAuth={props.successAuth}
        folderId={fileInfo?.folderId}
        isVisible={isFolderDialogVisible}
        onCloseFolderDialog={onCloseFolderDialog}
        onClickSaveSelectFolder={onClickSaveSelectFolder}
        titleSelectorFolder={titleSelectorFolder}
        onChangeInput={onChangeInput}
        onClickCheckbox={onClickCheckbox}
        openNewTab={openNewTab}
        mfReady={mfReady}
      />
    );

    const preparationPortalDialog = mfReady && preparationPortalDialogVisible && (
      <DynamicComponent
        system={{
          scope: STUDIO_SCOPE,
          url: STUDIO_REMOTE_ENTRY_URL,
          module: "./PreparationPortalDialog",
        }}
        visible={preparationPortalDialogVisible}
      />
    );

    return (
      <WrappedComponent
        {...props}
        sharingDialog={sharingDialog}
        onSDKRequestSharingSettings={onSDKRequestSharingSettings}
        loadUsersRightsList={loadUsersRightsList}
        isVisible={isVisible}
        selectFileDialog={selectFileDialog}
        onSDKRequestInsertImage={onSDKRequestInsertImage}
        onSDKRequestMailMergeRecipients={onSDKRequestMailMergeRecipients}
        onSDKRequestCompareFile={onSDKRequestCompareFile}
        isFileDialogVisible={isFileDialogVisible}
        selectFolderDialog={selectFolderDialog}
        onSDKRequestSaveAs={onSDKRequestSaveAs}
        isFolderDialogVisible={isFolderDialogVisible}
        preparationPortalDialog={preparationPortalDialog}
      />
    );
  };
};

export default withDialogs;
