import { Mic } from "@mui/icons-material";
import { ButtonBase, styled } from "@mui/material";
import { css, keyframes } from "@mui/styled-engine-sc";

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0,0,0,0.5);
  }
  70% {
    box-shadow: 0 0 0 30px rgba(0,0,0,0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0,0,0,0);
  }
`;

const StyledButton = styled(ButtonBase)(
  ({ theme }) => css`
    color: ${(props) =>
      props.listening ? theme.palette.common.white : "inherit"};
    background-color: ${(props) =>
      props.listening ? theme.palette.error.main : "transparent"};
    animation: ${(props) =>
      props.listening
        ? css`
            ${pulse} 1s infinite
          `
        : "none"};
    padding: 8px;
    border-radius: 50%;
    transition: all ${theme.transitions.duration.shorter}ms
      ${theme.transitions.easing.easeInOut};

    :hover {
      background-color: ${(props) =>
        props.listening ? theme.palette.error.main : "rgb(0,0,0,0.04)"};
    }
  `
);

const MicButton = ({ listening, onStart, onStop }) => {
  return (
    <StyledButton
      listening={listening ? 1 : 0}
      onClick={listening ? onStop : onStart}
    >
      <Mic />
    </StyledButton>
  );
};

export default MicButton;
