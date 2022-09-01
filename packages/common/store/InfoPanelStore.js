import { makeAutoObservable } from "mobx";

import { getCategoryType } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

class InfoPanelStore {
  isVisible = false;
  roomState = "members";
  isRoom = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsRoom = (isRoom) => {
    this.isRoom = isRoom;
  };

  toggleIsVisible = () => {
    this.isVisible = !this.isVisible;
  };

  setVisible = () => {
    this.isVisible = true;
  };

  setIsVisible = (bool) => {
    this.isVisible = bool;
  };

  setRoomState = (str) => {
    this.roomState = str;
  };
}

export default InfoPanelStore;
