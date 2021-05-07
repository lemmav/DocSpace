import React from "react";
import Text from "@appserver/components/text";
import { withTranslation } from "react-i18next";
import commonSettingsStyles from "../../utils/commonSettingsStyles";
import { inject, observer } from "mobx-react";
import Button from "@appserver/components/button";
import Checkbox from "@appserver/components/checkbox";
import RadioButtonGroup from "@appserver/components/radio-button-group";
import RadioButton from "@appserver/components/radio-button";
import styled from "styled-components";
import moment from "moment";
import ScheduleComponent from "./sub-components/scheduleComponent";
import {
  createBackupSchedule,
  deleteBackupSchedule,
  getBackupProgress,
  getBackupSchedule,
} from "@appserver/common/api/portal";
import SaveCancelButtons from "@appserver/components/save-cancel-buttons";
import toastr from "@appserver/components/toast/toastr";
import FileInputWithFolderPath from "@appserver/components/file-input-with-folder-path";
import OperationsDialog from "files/OperationsDialog";
import { getFolderPath } from "@appserver/common/api/files";

const StyledComponent = styled.div`
  ${commonSettingsStyles}
  .manual-backup_buttons {
    margin-top: 16px;
  }
  .backup-include_mail,
  .backup_combobox {
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .inherit-title-link {
    margin-bottom: 8px;
  }
  .note_description {
    margin-top: 8px;
  }
  .radio-button_text {
    font-size: 19px;
  }
  .automatic-backup_main {
    margin-bottom: 30px;
    .radio-button_text {
      font-size: 13px;
    }
  }
  .radio-button_text {
    margin-right: 7px;
    font-size: 19px;
    font-weight: 600;
  }
  .automatic-backup_current_storage {
    margin-bottom: 8px;
  }
  .backup_combobox {
    display: inline-block;
    margin-right: 8px;
  }
`;
const StyledModules = styled.div`
  margin-bottom: 40px;
`;

class AutomaticBackup extends React.Component {
  constructor(props) {
    super(props);
    const { t, language } = props;

    this.lng = language.substring(0, language.indexOf("-"));
    moment.locale(this.lng);

    this.state = {
      isShowedStorageType: false, //if current automatic storage not choose

      isShowDocuments: false,
      isShowThirdParty: false,
      isShowThirdPartyStorage: false,

      isCheckedDocuments: false,
      isCheckedThirdParty: false,
      isCheckedThirdPartyStorage: false,

      monthlySchedule: false,
      dailySchedule: false,
      weeklySchedule: false,

      selectedOption: t("DailyPeriodSchedule"),
      selectedWeekdayOption: "",
      selectedNumberWeekdayOption: "2",
      selectedTimeOption: "12:00",
      selectedMonthOption: "1",
      selectedMaxCopies: "10",
      selectedNumberMaxCopies: "10",
      selectedPermission: "disable",
      weekOptions: [],

      isCopyingToLocal: true,
      isLoadingData: false,
      selectedFolder: "",
      isPanelVisible: false,
      isLoading: false,
    };

    this.periodOptions = [
      {
        key: 1,
        label: t("DailyPeriodSchedule"),
      },
      {
        key: 2,
        label: t("WeeklyPeriodSchedule"),
      },
      {
        key: 3,
        label: t("MonthlyPeriodSchedule"),
      },
    ];

    this.timeOptionsArray = [];
    this.getTimeOptions();
    this.monthNumberOptionsArray = [];
    this.getMonthNumbersOption();

    this.maxNumberCopiesArray = [];
    this.getMaxNumberCopies();

    this.weekdaysOptions = [];
    this.arrayWeekdays = moment.weekdays();
  }

  componentDidMount() {
    this.getWeekdaysOptions();

    getBackupProgress().then((res) => {
      if (res) {
        if (res.progress === 100)
          this.setState({
            isCopyingToLocal: false,
          });
        if (res.progress !== 100)
          this.timerId = setInterval(() => this.getProgress(), 1000);
      } else {
        this.setState({
          isCopyingToLocal: false,
        });
      }
    });

    this.setState({ isLoading: true }, function () {
      getBackupSchedule()
        .then((selectedSchedule) => {
          if (selectedSchedule) {
            this.folderId = selectedSchedule.storageParams.folderId;
            this.onSelectFolder([`${this.folderId}`]);
            getFolderPath(this.folderId)
              .then((folderPath) => (this.folderPath = folderPath))
              .then(() => {
                this.setState({
                  selectedPermission: "enable",
                  isShowedStorageTypes: true,
                });

                if (selectedSchedule.storageType === 0) {
                  // Documents Module
                  this.setState({
                    isShowDocuments: true,
                    isCheckedDocuments: true,
                    selectedTimeOption: `${selectedSchedule.cronParams.hour}:00`,
                    selectedMaxCopies: `${selectedSchedule.backupsStored}`,
                  });

                  if (selectedSchedule.cronParams.period === 1) {
                    //Every Week option
                    const selectedDay = selectedSchedule.cronParams.day; //selected number of week
                    const arrayIndex =
                      this.lng === "en" ? selectedDay - 1 : selectedDay - 2;
                    console.log("this.weekdaysOptions", this.weekdaysOptions);
                    this.setState({
                      selectedOption: this.periodOptions[1].label,
                      weeklySchedule: true,
                      selectedWeekdayOption: this.weekdaysOptions[arrayIndex]
                        .label,
                    });
                  } else {
                    if (selectedSchedule.cronParams.period === 2) {
                      //Every Month option
                      this.setState({
                        selectedOption: this.periodOptions[2].label,
                        monthlySchedule: true,
                        selectedMonthOption: `${selectedSchedule.cronParams.day}`, //selected day of month
                      });
                    }
                  }
                }
              });
          }
        })
        .finally(() =>
          this.setState({
            isLoading: false,
          })
        );
    });
  }
  componentWillUnmount() {
    clearInterval(this.timerId);
  }
  getProgress = () => {
    getBackupProgress().then((res) => {
      if (res) {
        if (res.error.length > 0 && res.progress !== 100) {
          clearInterval(this.timerId);
          console.log("error", res.error);
          this.setState({
            isCopyingToLocal: true,
          });
          return;
        }
        if (res.progress === 100) {
          clearInterval(this.timerId);
          this.setState({
            isCopyingToLocal: false,
          });
        }
      }
    });
  };
  getTimeOptions = () => {
    for (let item = 0; item < 24; item++) {
      let obj = {
        key: item,
        label: `${item}:00`,
      };
      this.timeOptionsArray.push(obj);
    }
  };

  getMonthNumbersOption = () => {
    for (let item = 1; item <= 31; item++) {
      let obj = {
        key: item + 24,
        label: `${item}`,
      };
      this.monthNumberOptionsArray.push(obj);
    }
  };

  getMaxNumberCopies = () => {
    const { t } = this.props;
    for (let item = 1; item <= 30; item++) {
      let obj = {
        key: `${item}`,
        label: `${item} ${t("MaxCopies")}`,
      };
      this.maxNumberCopiesArray.push(obj);
    }
  };
  getWeekdaysOptions = () => {
    for (let item = 0; item < this.arrayWeekdays.length; item++) {
      let obj = {
        key: `${item + 1}`,
        label: `${this.arrayWeekdays[item]}`,
      };
      this.weekdaysOptions.push(obj);
    }
    const isEnglishLanguage = this.lng === "en";

    if (!isEnglishLanguage) {
      const startWeek = this.weekdaysOptions[0];
      this.weekdaysOptions.shift();
      this.weekdaysOptions.push(startWeek);
    }

    this.setState({
      weekOptions: this.weekdaysOptions,
      selectedWeekdayOption: this.weekdaysOptions[0].label,
    });
  };

  onClickPermissions = (e) => {
    console.log("res", e);
    const name = e.target.defaultValue;
    if (name === "enable") {
      this.setState({
        isShowedStorageTypes: true,
        isCheckedDocuments: true,
        isShowDocuments: true,
      });
    } else {
      this.setState({
        isShowedStorageTypes: false,
        isCheckedDocuments: false,
        isShowDocuments: false,
      });
    }
  };

  onClickShowStorage = (e) => {
    console.log("e0", e);
    const name = e.target.name;

    name === "DocumentsModule"
      ? this.setState({
          isShowDocuments: true,
          isCheckedDocuments: true,
          isShowThirdParty: false,
          isCheckedThirdParty: false,
          isShowThirdPartyStorage: false,
          isCheckedThirdPartyStorage: false,
        })
      : name === "ThirdPartyResource"
      ? this.setState({
          isShowDocuments: false,
          isCheckedDocuments: false,
          isShowThirdParty: true,
          isCheckedThirdParty: true,
          isShowThirdPartyStorage: false,
          isCheckedThirdPartyStorage: false,
        })
      : this.setState({
          isShowDocuments: false,
          isCheckedDocuments: false,
          isShowThirdParty: false,
          isCheckedThirdParty: false,
          isShowThirdPartyStorage: true,
          isCheckedThirdPartyStorage: true,
        });
  };

  onSelectPeriod = (options) => {
    console.log("options", options);

    const key = options.key;
    const label = options.label;

    this.setState({ selectedOption: label });
    key === 1
      ? this.setState({ weeklySchedule: false, monthlySchedule: false })
      : key === 2
      ? this.setState({ weeklySchedule: true, monthlySchedule: false })
      : this.setState({ monthlySchedule: true, weeklySchedule: false });
  };

  onSelectWeedDay = (options) => {
    console.log("options", options);

    const key = options.key;
    const label = options.label;

    this.setState({
      selectedNumberWeekdayOption: key,
      selectedWeekdayOption: label,
    });
  };
  onSelectMonthNumberAndTimeOptions = (options) => {
    const key = options.key;
    const label = options.label;
    if (key <= 24) {
      this.setState({ selectedTimeOption: label });
    } else {
      this.setState({
        selectedMonthOption: label,
      });
    }
  };
  onSelectMaxCopies = (options) => {
    const key = options.key;
    const label = options.label;
    console.log("opr max", options);
    this.setState({
      selectedNumberMaxCopies: key,
      selectedMaxCopies: label,
    });
  };

  onClickDeleteSchedule = () => {
    const { t } = this.props;
    this.setState({ isLoadingData: true }, function () {
      deleteBackupSchedule()
        .then(() => toastr.success(t("SuccessfullySaveSettingsMessage")))
        .catch((error) => toastr.error(error))
        .finally(() => this.setState({ isLoadingData: false }));
    });
  };

  onSelectFolder = (folderId) => {
    console.log("folderId", folderId);
    this.setState({
      selectedFolder: folderId,
    });
  };

  onSaveDocumentsModuleSettings = () => {
    const {
      selectedFolder,
      weeklySchedule,
      selectedTimeOption,
      monthlySchedule,
      selectedMonthOption,
      selectedNumberWeekdayOption,
      selectedNumberMaxCopies,
    } = this.state;
    const { t } = this.props;
    this.setState({ isLoadingData: true }, function () {
      let period = weeklySchedule ? "1" : monthlySchedule ? "2" : "0";

      let day = weeklySchedule
        ? selectedNumberWeekdayOption
        : monthlySchedule
        ? selectedMonthOption
        : null;

      let time = selectedTimeOption.substring(
        0,
        selectedTimeOption.indexOf(":")
      );

      console.log("selectedNumberMaxCopies", selectedNumberMaxCopies);
      console.log("period", period);
      console.log("selectedTimeOption", selectedTimeOption);
      console.log("time", time);
      console.log("day", day);
      createBackupSchedule(
        "0",
        "folderId",
        selectedFolder[0],
        selectedNumberMaxCopies,
        period,
        time,
        day
      )
        .then(() => toastr.success(t("SuccessfullySaveSettingsMessage")))
        .catch((error) => console.log("error", error))
        .finally(() => this.setState({ isLoadingData: false }));
    });
  };

  onClickInput = (e) => {
    this.setState({
      isPanelVisible: true,
    });
  };

  onClose = () => {
    this.setState({
      isPanelVisible: false,
    });
  };
  render() {
    const { t, panelVisible } = this.props;
    const {
      isShowedStorageTypes,
      isCheckedDocuments,
      isCheckedThirdParty,
      isCheckedThirdPartyStorage,
      isShowDocuments,
      isShowThirdParty,
      isShowThirdPartyStorage,
      weeklySchedule,
      monthlySchedule,
      weekOptions,
      selectedOption,
      selectedWeekdayOption,
      selectedTimeOption,
      selectedMonthOption,
      selectedMaxCopies,
      isCopyingToLocal,
      isLoadingData,
      isPanelVisible,
      selectedPermission,
      isLoading,
    } = this.state;

    console.log("this.folderPath", this.folderPath);
    return isLoading ? (
      <></>
    ) : (
      <StyledComponent>
        <RadioButtonGroup
          className="automatic-backup_main "
          name={"DocumentsModule"}
          options={[
            {
              label: t("DisableAutomaticBackup"),
              value: "disable",
            },
            {
              label: t("EnableAutomaticBackup"),
              value: "enable",
            },
          ]}
          isDisabled={isLoadingData}
          onClick={this.onClickPermissions}
          orientation="vertical"
          selected={selectedPermission}
        />

        {isShowedStorageTypes && (
          <>
            <StyledModules>
              <RadioButton
                fontSize="13px"
                fontWeight="400"
                label={t("DocumentsModule")}
                name={"DocumentsModule"}
                onClick={this.onClickShowStorage}
                isChecked={isCheckedDocuments}
                value="value"
                className="automatic-backup_current_storage"
              />
              <Text className="category-item-description">
                {t("DocumentsModuleDescription")}
              </Text>
              {isShowDocuments && (
                <>
                  <OperationsDialog
                    onSelectFolder={this.onSelectFolder}
                    name={"common"}
                    onClose={this.onClose}
                    onClickInput={this.onClickInput}
                    isPanelVisible={isPanelVisible}
                    isCommonWithoutProvider
                    folderPath={this.folderPath}
                  />

                  <ScheduleComponent
                    weeklySchedule={weeklySchedule}
                    monthlySchedule={monthlySchedule}
                    weekOptions={weekOptions}
                    selectedOption={selectedOption}
                    selectedWeekdayOption={selectedWeekdayOption}
                    selectedTimeOption={selectedTimeOption}
                    selectedMonthOption={selectedMonthOption}
                    selectedMaxCopies={selectedMaxCopies}
                    periodOptions={this.periodOptions}
                    monthNumberOptionsArray={this.monthNumberOptionsArray}
                    timeOptionsArray={this.timeOptionsArray}
                    maxNumberCopiesArray={this.maxNumberCopiesArray}
                    onClickCheckbox={this.onClickCheckbox}
                    onSelectMaxCopies={this.onSelectMaxCopies}
                    onSelectMonthNumberAndTimeOptions={
                      this.onSelectMonthNumberAndTimeOptions
                    }
                    onSelectWeedDay={this.onSelectWeedDay}
                    onSelectPeriod={this.onSelectPeriod}
                  />
                </>
              )}

              <SaveCancelButtons
                className="team-template_buttons"
                onSaveClick={this.onSaveDocumentsModuleSettings}
                onCancelClick={() => console.log("cancel")}
                showReminder={false}
                reminderTest={t("YouHaveUnsavedChanges")}
                saveButtonLabel={t("SaveButton")}
                cancelButtonLabel={t("CancelButton")}
                isDisabled={isCopyingToLocal || isLoadingData}
              />
            </StyledModules>

            <StyledModules>
              <RadioButton
                fontSize="13px"
                fontWeight="400"
                label={t("ThirdPartyResource")}
                name={"ThirdPartyResource"}
                onClick={this.onClickShowStorage}
                isChecked={isCheckedThirdParty}
                value="value"
              />
              <Text className="category-item-description">
                {t("ThirdPartyResourceDescription")}
              </Text>
              <Text className="category-item-description note_description">
                {t("ThirdPartyResourceNoteDescription")}
              </Text>
              {isShowThirdParty && (
                <>
                  <OperationsDialog
                    onSelectFolder={this.onSelectFolder}
                    name={"common"}
                    onClose={this.onClose}
                    onClickInput={this.onClickInput}
                    isPanelVisible={isPanelVisible}
                    isCommonWithoutProvider
                  />
                  <ScheduleComponent
                    weeklySchedule={weeklySchedule}
                    monthlySchedule={monthlySchedule}
                    weekOptions={weekOptions}
                    selectedOption={selectedOption}
                    selectedWeekdayOption={selectedWeekdayOption}
                    selectedTimeOption={selectedTimeOption}
                    selectedMonthOption={selectedMonthOption}
                    selectedMaxCopies={selectedMaxCopies}
                    periodOptions={this.periodOptions}
                    monthNumberOptionsArray={this.monthNumberOptionsArray}
                    timeOptionsArray={this.timeOptionsArray}
                    maxNumberCopiesArray={this.maxNumberCopiesArray}
                    onClickCheckbox={this.onClickCheckbox}
                    onSelectMaxCopies={this.onSelectMaxCopies}
                    onSelectMonthNumberAndTimeOptions={
                      this.onSelectMonthNumberAndTimeOptions
                    }
                    onSelectWeedDay={this.onSelectWeedDay}
                    onSelectPeriod={this.onSelectPeriod}
                  />
                </>
              )}
            </StyledModules>

            <StyledModules>
              <RadioButton
                fontSize="13px"
                fontWeight="400"
                label={t("ThirdPartyStorage")}
                name={"ThirdPartyStorage"}
                onClick={this.onClickShowStorage}
                isChecked={isCheckedThirdPartyStorage}
                value="value"
              />
              <Text className="category-item-description">
                {t("ThirdPartyStorageDescription")}
              </Text>
              <Text className="category-item-description note_description">
                {t("ThirdPartyStorageNoteDescription")}
              </Text>
              {isShowThirdPartyStorage && (
                <ScheduleComponent
                  weeklySchedule={weeklySchedule}
                  monthlySchedule={monthlySchedule}
                  weekOptions={weekOptions}
                  selectedOption={selectedOption}
                  selectedWeekdayOption={selectedWeekdayOption}
                  selectedTimeOption={selectedTimeOption}
                  selectedMonthOption={selectedMonthOption}
                  selectedMaxCopies={selectedMaxCopies}
                  periodOptions={this.periodOptions}
                  monthNumberOptionsArray={this.monthNumberOptionsArray}
                  timeOptionsArray={this.timeOptionsArray}
                  maxNumberCopiesArray={this.maxNumberCopiesArray}
                  onClickCheckbox={this.onClickCheckbox}
                  onSelectMaxCopies={this.onSelectMaxCopies}
                  onSelectMonthNumberAndTimeOptions={
                    this.onSelectMonthNumberAndTimeOptions
                  }
                  onSelectWeedDay={this.onSelectWeedDay}
                  onSelectPeriod={this.onSelectPeriod}
                />
              )}
            </StyledModules>
          </>
        )}

        {!isShowedStorageTypes && (
          <Button
            label={t("SaveButton")}
            onClick={this.onClickDeleteSchedule}
            primary
            isDisabled={isCopyingToLocal || isLoadingData}
            size="medium"
            tabIndex={10}
          />
        )}
      </StyledComponent>
    );
  }
}
export default inject(({ auth }) => {
  const { language } = auth;
  const { panelVisible } = auth;
  return {
    language,
    panelVisible,
  };
})(withTranslation("Settings")(observer(AutomaticBackup)));
