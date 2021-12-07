import React, { useEffect, useRef } from "react";
import TableContainer from "@appserver/components/table-container";
import { inject, observer } from "mobx-react";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import TableBody from "@appserver/components/table-container/TableBody";
import { isMobile } from "react-device-detect";
import styled, { css } from "styled-components";

const borderColor = "#ECEEF1";
const colorBorderTransition = "#f3f4f4";
const contentStyles = css`
  position: absolute;
  width: 100%;
  height: 1px;
  background: ${borderColor};
  margin-left: -24px;
`;
const StyledTableContainer = styled(TableContainer)`
  .table-row-selected + .table-row-selected {
    .table-row {
      .table-container_row-checkbox-wrapper,
      .table-container_row-context-menu-wrapper {
        margin-top: -1px;
        border-image-slice: 1;
        border-top: 1px solid;
      }
      .table-container_row-checkbox-wrapper {
        border-image-source: ${`linear-gradient(to right, ${colorBorderTransition} 24px, ${borderColor} 24px)`};
      }
      .table-container_row-context-menu-wrapper {
        border-image-source: ${`linear-gradient(to left, ${colorBorderTransition} 24px, ${borderColor} 24px)`};
      }
    }
  }

  .table-row-selected + .files-item:not(.table-row-selected) {
    .table-row {
      .table-container_row-checkbox-wrapper:first-child:before {
        ${contentStyles}
        margin-top: -40px;
      }
    }
  }

  .files-item:not(.table-row-selected) + .table-row-selected {
    .table-row {
      .table-container_row-checkbox-wrapper,
      .table-container_row-context-menu-wrapper {
        margin-top: -1px;
        border-top: ${`1px ${borderColor} solid`};
      }
    }
  }

  .table-row-selected:last-child {
    .table-row {
      .table-container_row-checkbox-wrapper:before {
        ${contentStyles}
        margin-top: 40px;
      }
    }
  }
`;

const Table = ({ filesList, sectionWidth, viewAs, setViewAs }) => {
  const ref = useRef(null);

  useEffect(() => {
    if ((viewAs !== "table" && viewAs !== "row") || !setViewAs) return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  return (
    <StyledTableContainer forwardedRef={ref}>
      <TableHeader sectionWidth={sectionWidth} containerRef={ref} />
      <TableBody>
        {filesList.map((item) => (
          <TableRow key={item.id} item={item} />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ filesStore }) => {
  const { filesList, viewAs, setViewAs } = filesStore;

  return {
    filesList,
    viewAs,
    setViewAs,
  };
})(observer(Table));
