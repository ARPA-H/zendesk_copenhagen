// Test double for @iconify/react so unit tests never reach the Iconify API.
// Renders a lightweight placeholder that echoes the requested icon name.
const React = require("react");

function Icon({ icon }) {
  return React.createElement("span", {
    "data-testid": "iconify-icon",
    "data-icon": typeof icon === "string" ? icon : "",
  });
}

module.exports = {
  Icon,
  InlineIcon: Icon,
  addAPIProvider: () => undefined,
  addIcon: () => undefined,
  addCollection: () => undefined,
  loadIcons: () => undefined,
  loadIcon: () => Promise.resolve(),
};
