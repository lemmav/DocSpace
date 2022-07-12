import React from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";

import TableRow from "@appserver/components/table-container/TableRow";

import FileNameCell from "./cells/RoomNameCell";
import TypeCell from "./cells/TypeCell";
import OwnerCell from "./cells/OwnerCell";
import DateCell from "./cells/DateCell";
import TagsCell from "./cells/TagsCell";
import { FolderType } from "@appserver/common/constants";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    height: 48px;
    max-height: 48px;
    min-height: 48px;

    background: ${(props) =>
      (props.isChecked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
    cursor: ${(props) =>
      (props.isChecked || props.isActive) &&
      "url(/static/images/cursor.palm.react.svg), auto"};
  }

  &:hover {
    .room-name_cell {
      margin-left: -24px;
      padding-left: 24px;

      .room-logo_icon-container {
        display: none;
      }

      .room-logo_checkbox {
        display: flex;
      }
    }

    .table-container_row-context-menu-wrapper {
      margin-right: -20px;
      padding-right: 18px;
    }

    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};

      margin-top: -1px;
      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    }
  }

  ${(props) =>
    (props.isActive || props.isChecked) &&
    css`
      .room-name_cell {
        .room-logo_icon-container {
          display: none;
        }

        .room-logo_checkbox {
          display: flex;
        }
      }
    `}
`;

const Row = React.forwardRef(
  (
    {
      item,
      tagCount,
      theme,

      isChecked,
      isActive,
      isMe,

      getRoomsContextOptions,
      selectRoom,
      openContextMenu,
      closeContextMenu,
      unpinRoom,

      onOpenRoom,
      onSelectTag,

      history,
    },
    ref
  ) => {
    const onContextMenu = React.useCallback(
      (e) => {
        openContextMenu && openContextMenu(item);
      },
      [openContextMenu, item]
    );

    const onCloseContextMenu = React.useCallback(() => {
      closeContextMenu && closeContextMenu(item);
    }, [item, closeContextMenu]);

    const onRoomSelect = React.useCallback(
      (e) => {
        selectRoom && selectRoom(e.target.checked, item);
      },
      [selectRoom, item]
    );

    const getRoomsContextOptionsActions = React.useCallback(() => {
      return getRoomsContextOptions && getRoomsContextOptions(item);
    }, [getRoomsContextOptions, item]);

    const onClickUnpinRoomAction = React.useCallback(() => {
      unpinRoom && unpinRoom(item);
    }, [item, unpinRoom]);

    const onBadgeClick = React.useCallback(() => {
      console.log("on badge click");
    }, []);

    const onOpenRoomAction = React.useCallback(
      (e) => {
        if (item.isArchive) return;
        onOpenRoom && onOpenRoom(e, item.id, history);
      },
      [onOpenRoom, item.id, history, item.isArchive]
    );

    return (
      <StyledTableRow
        className={`table-row${
          isActive || isChecked ? " table-row-selected" : ""
        }`}
        key={item.id}
        contextOptions={getRoomsContextOptionsActions()}
        getContextModel={getRoomsContextOptionsActions}
        fileContextClick={onContextMenu}
        onHideContextMenu={onCloseContextMenu}
        isChecked={isChecked}
        isActive={isActive}
        onClick={onOpenRoomAction}
      >
        <FileNameCell
          theme={theme}
          label={item.title}
          type={item.roomType}
          pinned={item.pinned}
          badgeLabel={item.new}
          isPrivacy={item.isPrivacy}
          isArchive={item.isArchive}
          isChecked={isChecked}
          onRoomSelect={onRoomSelect}
          onClickUnpinRoom={onClickUnpinRoomAction}
          onBadgeClick={onBadgeClick}
        />
        <TypeCell
          type={item.roomType}
          sideColor={theme.filesSection.tableView.row.sideColor}
        />
        <TagsCell
          ref={ref}
          tags={item.tags}
          tagCount={tagCount}
          onSelectTag={onSelectTag}
        />
        <OwnerCell
          owner={item.createdBy}
          isMe={isMe}
          sideColor={theme.filesSection.tableView.row.sideColor}
        />
        <DateCell sideColor={theme.filesSection.tableView.row.sideColor} />
      </StyledTableRow>
    );
  }
);

export default inject(
  ({ auth, contextOptionsStore, roomsStore, roomsActionsStore }, { item }) => {
    const { getRoomsContextOptions } = contextOptionsStore;

    const {
      selection,
      bufferSelection,
      selectRoom,
      openContextMenu,
      closeContextMenu,
      unpinRoom,
    } = roomsStore;

    const { onOpenRoom, onSelectTag } = roomsActionsStore;

    const isChecked = !!selection.find((room) => room.id === item.id);
    const isActive = !isChecked && bufferSelection?.id === item.id;
    const isMe = item.createdBy.id === auth.userStore.user.id;

    return {
      isChecked,
      isActive,
      isMe,

      getRoomsContextOptions,
      selectRoom,
      openContextMenu,
      closeContextMenu,
      unpinRoom,

      onOpenRoom,
      onSelectTag,
    };
  }
)(observer(Row));
