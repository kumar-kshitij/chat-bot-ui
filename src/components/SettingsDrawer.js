import { Close } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  Grid,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const SettingsDrawer = ({ open, onClose, language, onLanguageChange }) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }}>
        <Grid container sx={{ px: 2, py: 1, alignItems: "center" }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            Settings
          </Typography>
          <IconButton color="inherit" edge="end" onClick={onClose}>
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
            onChange={(_, v) => onLanguageChange(v)}
          >
            <ToggleButton value="en">English</ToggleButton>
            <ToggleButton value="hi">Hindi</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;
