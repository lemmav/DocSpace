import React from "react";
import { Provider as MobxProvider } from "mobx-react";
import { I18nextProvider } from "react-i18next";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import i18n from "./i18n";
import stores from "../../../store/index";
import FileInput from "./fileInput";
import SelectFileDialog from "../SelectFileDialog";
import StyledComponent from "./styledSelectFileInput";

let path = "";

class SelectFile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      isLoading: false,
      fileName: "",
    };
  }

  onSetFileName = (fileName) => {
    this.setState({
      fileName: fileName,
    });
  };
  render() {
    const {
      name,
      onClickInput,
      isPanelVisible,
      withoutProvider,
      onClose,
      isError,
      isDisabled,
      foldersType,
      iconUrl,
      filterType,
      filterValue,
      withSubfolders,
      onSelectFile,
      folderId,
      header,
      isImageOnly,
      isArchiveOnly,
      isDocumentsOnly,
      searchParam,
      isPresentationOnly,
      isTablesOnly,
      isMediaOnly,
    } = this.props;
    const { isLoading, fileName } = this.state;
    const zIndex = 310;

    return (
      <StyledComponent>
        <FileInput
          name={name}
          className="file-input"
          fileName={fileName}
          isDisabled={isDisabled}
          isError={isError}
          onClickInput={onClickInput}
        />

        <SelectFileDialog
          zIndex={zIndex}
          onClose={onClose}
          isPanelVisible={isPanelVisible}
          foldersType={foldersType}
          onSetFileName={this.onSetFileName}
          withoutProvider={withoutProvider}
          iconUrl={iconUrl}
          filterValue={filterValue}
          withSubfolders={withSubfolders}
          filterType={filterType}
          onSelectFile={onSelectFile}
          folderId={folderId}
          header={header}
          searchParam={searchParam}
          isImageOnly={isImageOnly}
          isArchiveOnly={isArchiveOnly}
          isDocumentsOnly={isDocumentsOnly}
          isPresentation={isPresentationOnly}
          isTables={isTablesOnly}
          isMediaOnly={isMediaOnly}
        />
      </StyledComponent>
    );
  }
}

SelectFile.propTypes = {
  onClickInput: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

SelectFile.defaultProps = {
  withoutProvider: false,
  isDisabled: false,
};
const SelectFileWrapper = withTranslation(["SelectedFolder", "Common"])(
  SelectFile
);

class SelectFileModal extends React.Component {
  render() {
    return (
      <MobxProvider {...stores}>
        <I18nextProvider i18n={i18n}>
          <SelectFileWrapper {...this.props} />
        </I18nextProvider>
      </MobxProvider>
    );
  }
}

export default SelectFileModal;
