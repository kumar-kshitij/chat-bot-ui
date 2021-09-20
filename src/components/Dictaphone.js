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
  Toolbar,
  Typography,
  InputBase,
  ButtonBase,
} from "@mui/material";
import { Mic, Settings } from "@mui/icons-material";

const SUBSCRIPTION_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const REGION = "centralindia";
const TOKEN_ENDPOINT = `https://${REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

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
        <Toolbar>
          <img src="flipkart_grid.png" alt="" style={{ width: "150px" }} />
          <Typography
            variant="h6"
            component="div"
            align="center"
            sx={{ flex: 1, fontFamily: "Good Times", color: "rgb(67,87,114)" }}
          >
            SARA
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => toggleDrawer(true)}
          >
            <Settings />
          </IconButton>
        </Toolbar>
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
        <InputBase
          placeholder="Type a message"
          multiline
          sx={{
            flex: 1,
            bgcolor: "common.white",
            borderRadius: 5,
            px: 2,
            py: 1,
            mr: 1,
          }}
        />
        <Grid item>
          <ButtonBase
            onClick={
              listening
                ? SpeechRecognition.abortListening
                : () =>
                    SpeechRecognition.startListening({
                      language: "en-US",
                    })
            }
            sx={{
              borderRadius: 6,
              bgcolor: listening ? "error.main" : "rgb(152,176,230)",
              color: "common.white",
              height: "48px",
              width: "48px",
            }}
          >
            <Mic />
          </ButtonBase>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Dictaphone;
