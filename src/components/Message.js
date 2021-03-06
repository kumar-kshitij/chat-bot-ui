import { Grid, Paper } from "@mui/material";
import { useEffect, useRef } from "react";

const Message = ({ sender, lang, text, ponyfill, voices }) => {
  const container = useRef(null);

  useEffect(() => {
    if (container && container.current) {
      container.current.scrollIntoView({ behavior: "smooth" });
    }
    if (sender !== "user" && ponyfill) {
      const utterance = new ponyfill.SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => {
        if (lang === "en") {
          return /AmberNeural/u.test(v.name);
        }
        if (lang === "hi") {
          return /MadhurNeural/u.test(v.name);
        }
        return false;
      });
      if (voice) {
        utterance.voice = voice;
        utterance.rate = 1.25;
        utterance.pitch = 1.05;
        ponyfill.speechSynthesis.speak(utterance);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      ref={container}
      container
      direction={sender === "user" ? "row-reverse" : "row"}
      sx={{ my: 1 }}
    >
      <Grid item xs={10} sm={9} md={8}>
        <Grid container direction={sender === "user" ? "row-reverse" : "row"}>
          <Grid item>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                typography: "body2",
                bgcolor: sender === "user" ? "#d2e3f4" : "#cbded5",
                display: "inline-block",
                color: "rgb(60,64,73)",
                borderRadius: 2.5,
              }}
            >
              {text}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Message;
