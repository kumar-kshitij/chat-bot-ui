import React, { useEffect, useRef, useState } from "react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  AppBar,
  Container,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Typography,
  InputBase,
  styled,
  ButtonBase,
  Fade,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  ArrowDownward,
  Keyboard,
  Mic,
  Settings,
  Close,
} from "@mui/icons-material";
import { keyframes, css } from "@mui/styled-engine-sc";
import FlipkartGridPng from "../assets/images/flipkart_grid.png";

const SUBSCRIPTION_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const REGION = "centralindia";
const TOKEN_ENDPOINT = `https://${REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 15px rgba(0,0,0,0.3);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(0,0,0,0.3);
  }
  100% {
    box-shadow: 0 0 0 15px rgba(0,0,0,0.3);
  }
`;

const StyledIconButton = styled(ButtonBase)(
  ({ theme }) => css`
    color: ${(props) =>
      props.listening ? theme.palette.common.white : "inherit"};
    background-color: ${(props) =>
      props.listening ? theme.palette.error.main : "transparent"};
    animation: ${(props) =>
      props.listening
        ? css`
            ${pulse} 0.75s 0.5s infinite
          `
        : "none"};
    padding: 8px;
    border-radius: 50%;
  `
);

const Message = ({ type, line }) => {
  const x = useRef(null);
  useEffect(() => {
    if (x && x.current) {
      x.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <Grid
      ref={x}
      container
      direction={type === "user" ? "row-reverse" : "row"}
      sx={{
        my: 1,
      }}
    >
      <Grid item xs={10} sm={9} md={8}>
        <Grid container direction={type === "user" ? "row-reverse" : "row"}>
          <Grid item>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                typography: "body2",
                bgcolor:
                  type === "user" ? "rgb(205,215,239)" : "rgb(228,229,231)",
                display: "inline-block",
                color: "rgb(60,64,73)",
              }}
            >
              {line}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const Dictaphone = () => {
  const [loadingSpeechRecognition, setLoadingSpeechRecognition] =
    useState(true);
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition();

  const [messages, setMessages] = useState([]);
  const [drawerOpen, toggleDrawer] = useState(false);
  const [keyboardOpen, toggleKeyboard] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const loadSpeechRecognition = async () => {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
      });
      const authorizationToken = await response.text();
      const { SpeechRecognition: AzureSpeechRecognition } =
        await createSpeechServicesPonyfill({
          credentials: {
            region: REGION,
            authorizationToken,
          },
        });
      SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
      setLoadingSpeechRecognition(false);
    };
    loadSpeechRecognition();
  }, []);

  useEffect(() => {
    const xyz = async () => {
      try {
        const body = new FormData();
        body.append("message", transcript);
        body.append("language", language);
        let res = await fetch("http://13.92.117.36:8000/api/v1/", {
          method: "POST",
          body,
        });
        res = await res.json();
        setMessages((m) => [
          ...m,
          {
            type: "bot",
            body: res.bot_reply,
          },
        ]);
      } catch (err) {
        console.log(err);
      }
    };
    if (!listening && transcript) {
      setMessages((m) => [
        ...m,
        {
          type: "user",
          body: [transcript],
        },
      ]);
      resetTranscript();
      xyz();
    }
  }, [listening, transcript, resetTranscript, language]);

  const textInput = useRef(null);
  useEffect(() => {
    if (keyboardOpen && textInput && textInput.current) {
      textInput.current.focus();
    }
  }, [keyboardOpen]);

  const [showScrollBtn, toggleScrollBtn] = useState(false);
  const handleScroll = (e) => {
    const notBottom =
      e.target.scrollHeight - e.target.scrollTop > e.target.clientHeight + 10;
    if (notBottom && !showScrollBtn) {
      toggleScrollBtn(true);
    }
    if (!notBottom && showScrollBtn) {
      toggleScrollBtn(false);
    }
  };

  const bottomDiv = useRef(null);

  const [textInputValue, setTextInputValue] = useState("");
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    toggleKeyboard(false);
    if (textInputValue.length === 0) return;
    setMessages((m) => [
      ...m,
      {
        type: "user",
        body: [textInputValue],
      },
    ]);
    try {
      const body = new FormData();
      body.append("message", textInputValue);
      body.append("language", "en-IN");
      let res = await fetch("http://13.92.117.36:8000/api/v1/", {
        method: "POST",
        body,
      });
      res = await res.json();
      setMessages((m) => [
        ...m,
        {
          type: "bot",
          body: res.bot_reply,
        },
      ]);
    } catch (err) {
      console.log(err);
    }
    setTextInputValue("");
  };

  if (loadingSpeechRecognition || !browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <Container
      disableGutters
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgb(148,168,219)",
      }}
    >
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 250 }}>
          <Grid container sx={{ py: 1, px: 2, alignItems: "center" }}>
            <Typography variant="h6" component="div" sx={{ flex: 1 }}>
              Settings
            </Typography>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => toggleDrawer(false)}
            >
              <Close />
            </IconButton>
          </Grid>
          <Divider />
          <Box sx={{ px: 2 }}>
            <Typography variant="body1" component="p" sx={{ mt: 2, mb: 1 }}>
              Language
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={language}
              exclusive
              onChange={(e, v) => setLanguage(v)}
            >
              <ToggleButton value="en">English</ToggleButton>
              <ToggleButton value="hi">Hindi</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Drawer>
      <AppBar position="static" sx={{ bgcolor: "rgb(152,176,230)" }}>
        <Grid container sx={{ alignItems: "center", p: 1 }}>
          <Grid item xs>
            <Grid container sx={{ justifyContent: "flex-start" }}>
              <img src={FlipkartGridPng} alt="" style={{ maxHeight: "42px" }} />
            </Grid>
          </Grid>
          <Grid item xs>
            <Grid container sx={{ justifyContent: "center" }}>
              <Typography
                variant="h6"
                component="div"
                align="center"
                sx={{ fontFamily: "Good Times", color: "rgb(67,87,114)" }}
              >
                SARA
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs>
            <Grid container sx={{ justifyContent: "flex-end" }}>
              <IconButton color="inherit" onClick={() => toggleDrawer(true)}>
                <Settings />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </AppBar>
      <Container
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 2,
        }}
        onScroll={handleScroll}
      >
        {messages.map((message, k1) =>
          message.body.map((line, k2) => (
            <Message
              key={k1.toString() + "_" + k2.toString()}
              type={message.type}
              line={line}
            />
          ))
        )}
        {transcript && <Message type="user" line={transcript} />}
        <div ref={bottomDiv} />
      </Container>
      <Divider />
      <Grid container sx={{ alignItems: "flex-end", p: 1 }}>
        <Grid item xs={!keyboardOpen} sx={keyboardOpen ? { flex: 1 } : {}}>
          <Grid
            container
            component="form"
            noValidate
            onSubmit={handleTextSubmit}
            sx={{ justifyContent: "flex-start" }}
          >
            {keyboardOpen ? (
              <InputBase
                inputRef={textInput}
                placeholder="Type a message"
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                sx={{
                  flex: 1,
                  bgcolor: "common.white",
                  px: 2,
                  py: 1,
                  mr: 1,
                }}
              />
            ) : (
              <IconButton
                color="inherit"
                type="button"
                onClick={() => toggleKeyboard(true)}
              >
                <Keyboard />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Grid item xs={!keyboardOpen}>
          <Grid container sx={{ justifyContent: "center" }}>
            <StyledIconButton
              listening={listening ? 1 : 0}
              onClick={() => {
                toggleKeyboard(false);
                if (listening) {
                  SpeechRecognition.abortListening();
                } else {
                  SpeechRecognition.startListening({
                    language: `${language}-IN`,
                  });
                }
              }}
            >
              <Mic />
            </StyledIconButton>
          </Grid>
        </Grid>
        {!keyboardOpen && (
          <Grid item xs>
            <Grid container sx={{ justifyContent: "flex-end" }}>
              <Fade in={showScrollBtn}>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    if (bottomDiv && bottomDiv.current) {
                      bottomDiv.current.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <ArrowDownward />
                </IconButton>
              </Fade>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};
export default Dictaphone;
