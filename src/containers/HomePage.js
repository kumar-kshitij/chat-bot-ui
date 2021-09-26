import React, { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import { ArrowDownward, Keyboard, Settings } from "@mui/icons-material";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SettingsDrawer from "../components/SettingsDrawer";
import FlipkartGridPng from "../assets/images/flipkart_grid.png";
import Message from "../components/Message";
import MicButton from "../components/MicButton";

const REGION = "centralindia";
const TOKEN_ENDPOINT = `https://${REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
const SUBSCRIPTION_KEY = "1d09a80fd5bf4c45aff35bd30a8f70f8";

const HomePage = () => {
  const bottomDiv = useRef(null);
  const textInput = useRef(null);

  const [drawerOpen, toggleDrawer] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showScrollBtn, toggleScrollBtn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [ponyfill, setPonyfill] = useState(null);
  const [voices, setVoices] = useState([]);
  const [loadingSpeechRecognition, setLoadingSpeechRecognition] =
    useState(true);
  const [showTextInput, toggleTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");

  const {
    browserSupportsSpeechRecognition,
    listening,
    transcript,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    const loadSpeechRecognition = async () => {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
      });
      const authorizationToken = await response.text();
      setPonyfill(
        await createSpeechServicesPonyfill({
          credentials: {
            region: REGION,
            authorizationToken,
          },
        })
      );
    };
    loadSpeechRecognition();
  }, []);

  useEffect(() => {
    if (ponyfill) {
      SpeechRecognition.applyPolyfill(ponyfill.SpeechRecognition);
      setLoadingSpeechRecognition(false);

      ponyfill.speechSynthesis.addEventListener("voiceschanged", () => {
        setVoices(ponyfill.speechSynthesis.getVoices());
      });
    }
  }, [ponyfill]);

  const handleScroll = useCallback(
    (e) => {
      const atBottom =
        e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 30;
      if (!atBottom && !showScrollBtn) {
        toggleScrollBtn(true);
      }
      if (atBottom && showScrollBtn) {
        toggleScrollBtn(false);
      }
    },
    [showScrollBtn]
  );

  const fetchBotReply = useCallback(
    async (text) => {
      setMessages((m) => [
        ...m,
        { sender: "user", lang: language, body: [text] },
      ]);
      try {
        const body = new FormData();
        body.append("message", text);
        body.append("language", language);
        let res = await fetch(
          "https://simpledjango.azurewebsites.net/api/v1/",
          { method: "POST", body }
        );
        res = await res.json();
        setMessages((m) => [
          ...m,
          { sender: "bot", lang: language, body: res.bot_reply },
        ]);
      } catch (err) {
        console.log(err);
      }
    },
    [language]
  );

  useEffect(() => {
    if (!listening && transcript) {
      fetchBotReply(transcript);
      resetTranscript();
    }
  }, [listening, transcript, fetchBotReply, resetTranscript]);

  useEffect(() => {
    if (showTextInput && textInput && textInput.current) {
      textInput.current.focus();
    }
  }, [showTextInput]);

  const handleTextSubmit = useCallback(
    (e) => {
      e.preventDefault();
      toggleTextInput(false);
      if (textInputValue.length === 0) return;
      fetchBotReply(textInputValue);
      setTextInputValue("");
    },
    [textInputValue, fetchBotReply]
  );

  return (
    <Container
      disableGutters
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f8f7",
      }}
    >
      <Backdrop
        sx={{
          color: "common.white",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={
          loadingSpeechRecognition ||
          !browserSupportsSpeechRecognition ||
          !ponyfill
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <SettingsDrawer
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        language={language}
        onLanguageChange={(v) => setLanguage(v)}
      />
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundImage: "linear-gradient(to right, #0d233d, #7ac79f)",
        }}
      >
        <Grid container sx={{ p: 1, alignItems: "center" }}>
          <Grid item xs>
            <Grid container sx={{ justifyContent: "flex-start" }}>
              <img
                src={FlipkartGridPng}
                alt="Flipkart Grid 3.0"
                style={{ maxHeight: "42px" }}
              />
            </Grid>
          </Grid>
          <Grid item xs>
            <Grid container sx={{ justifyContent: "center" }}>
              <Typography
                variant="h5"
                component="div"
                align="center"
                sx={{
                  fontFamily: "Good Times",
                  color: "common.white",
                  letterSpacing: "5px",
                }}
              >
                SIGA
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
        onScroll={handleScroll}
        sx={{ flex: 1, overflowY: "auto", my: 1 }}
      >
        {messages.map((message, k1) =>
          message.body.map((text, k2) => (
            <Message
              key={k1.toString() + "_" + k2.toString()}
              sender={message.sender}
              lang={message.lang}
              text={text}
              ponyfill={ponyfill}
              voices={voices}
            />
          ))
        )}
        {transcript && <Message sender="user" text={transcript} />}
        <div ref={bottomDiv} />
      </Container>
      <Divider />
      <Grid
        container
        direction={showTextInput ? "row-reverse" : "row"}
        sx={{ p: 1, alignItems: "center", position: "relative" }}
      >
        <Fade in={showScrollBtn}>
          <IconButton
            size="small"
            onClick={() => {
              if (bottomDiv && bottomDiv.current) {
                bottomDiv.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
            sx={{
              position: "absolute",
              right: "10px",
              bottom: "calc(100% + 10px)",
              boxShadow: 2,
            }}
          >
            <ArrowDownward />
          </IconButton>
        </Fade>
        <Grid item xs={!showTextInput} sx={{ justifyContent: "flex-start" }} />
        <Grid item xs={!showTextInput}>
          <Grid container sx={{ justifyContent: "center" }}>
            <MicButton
              listening={listening}
              onStart={() => {
                ponyfill && ponyfill.speechSynthesis.cancel();
                toggleTextInput(false);
                SpeechRecognition.startListening({
                  language: `${language}-IN`,
                });
              }}
              onStop={SpeechRecognition.abortListening}
            />
          </Grid>
        </Grid>
        <Grid item xs={!showTextInput} sx={showTextInput ? { flex: 1 } : {}}>
          <Grid
            container
            component="form"
            noValidate
            onSubmit={handleTextSubmit}
            sx={{ justifyContent: "flex-end" }}
          >
            {showTextInput ? (
              <InputBase
                inputRef={textInput}
                placeholder="Type a message"
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                sx={{
                  flex: 1,
                  bgcolor: "common.white",
                  typography: "body2",
                  px: 2,
                  py: 0.5,
                  mr: 1,
                  borderRadius: 5,
                }}
              />
            ) : (
              <IconButton
                color="inherit"
                type="button"
                onClick={() => {
                  ponyfill && ponyfill.speechSynthesis.cancel();
                  SpeechRecognition.abortListening();
                  toggleTextInput(true);
                }}
              >
                <Keyboard />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
