import React from "react";
import PropTypes from "prop-types";
import { StyledRow, StyledBox1, StyledBox2 } from "./StyledRowLoader";
import RectangleLoader from "../RectangleLoader/index";
import CircleLoader from "../CircleLoader/index";

const RowLoader = ({ id, className, style, isRectangle, ...rest }) => {
  const {
    title,
    x,
    y,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  return (
    <StyledRow
      id={id}
      className={className}
      style={style}
      gap={isRectangle ? "8px" : "16px"}
    >
      <RectangleLoader
        title={title}
        x={x}
        y={y}
        width="16"
        height="16"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <StyledBox1>
        {isRectangle ? (
          <RectangleLoader
            className="rectangle-content"
            title={title}
            x={x}
            y={y}
            width="100%"
            height="100%"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        ) : (
          <CircleLoader
            title={title}
            x="16"
            y="16"
            width="32"
            height="32"
            radius="16"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        )}
      </StyledBox1>
      <StyledBox2>
        <RectangleLoader
          className="first-row-content__mobile"
          title={title}
          x={x}
          y={y}
          height="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
        <RectangleLoader
          className="second-row-content__mobile"
          title={title}
          x={x}
          y={y}
          height="12px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledBox2>
    </StyledRow>
  );
};

RowLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  isRectangle: PropTypes.bool,
};

RowLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export default RowLoader;
