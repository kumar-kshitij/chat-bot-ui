import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { ArrowDownward, Keyboard, Mic, Settings } from "@mui/icons-material";
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
  }, [listening]);

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
        // bgcolor: "grey.200",
      }}
    >
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      />
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
      >
        {messages.map((message, k1) =>
          message.body.map((line, k2) => (
            <Grid
              key={k1.toString() + "_" + k2.toString()}
              container
              direction={message.type === "user" ? "row-reverse" : "row"}
              sx={{
                my: 1,
              }}
            >
              <Grid item xs={10} sm={9} md={8}>
                <Grid
                  container
                  direction={message.type === "user" ? "row-reverse" : "row"}
                >
                  <Grid item>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        typography: "body2",
                        bgcolor:
                          message.type === "user"
                            ? "rgb(205,215,239)"
                            : "rgb(228,229,231)",
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
          ))
        )}
        {transcript && (
          <Grid
            container
            direction="row-reverse"
            sx={{
              my: 1,
            }}
          >
            <Grid item xs={10} sm={9} md={8}>
              <Grid container direction="row-reverse">
                <Grid item>
                  <Paper
                    sx={{
                      p: 1,
                      typography: "body2",
                      bgcolor: "rgb(205,215,239)",
                      display: "inline-block",
                      color: "rgb(60,64,73)",
                    }}
                  >
                    {transcript}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Container>
      <Grid container sx={{ alignItems: "flex-end", p: 1 }}>
        <Grid item xs={!keyboardOpen} sx={keyboardOpen ? { flex: 1 } : {}}>
          <Grid container sx={{ justifyContent: "flex-start" }}>
            {keyboardOpen ? (
              <InputBase
                placeholder="Type a message"
                sx={{
                  flex: 1,
                  bgcolor: "common.white",
                  px: 2,
                  py: 1,
                  mr: 1,
                }}
              />
            ) : (
              <IconButton color="inherit" onClick={() => toggleKeyboard(true)}>
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
                    language: "en-US",
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
              <IconButton color="inherit" onClick={() => {}}>
                <ArrowDownward />
              </IconButton>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};
export default Dictaphone;
