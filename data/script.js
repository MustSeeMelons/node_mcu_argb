// Lib used: https://vanilla-picker.js.org/

// Array of port data
let apiData;

let isLocked = true;
let isWifiOpen = false;
let pickerIndex = undefined;
let yeetMode = false; // For resetting swatch colors

// Get wifi field references
const ssidInput = document.querySelector("#ssid");
const passwordInput = document.querySelector("#password");
const deviceIdInput = document.querySelector("#device-id");

const clamp = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

ssidInput.addEventListener("blur", (e) => {
  const l = clamp(e.target.value.length, 1, 64);

  const v = e.target.value;

  ssidInput.value = v.substring(0, l);
});

passwordInput.addEventListener("blur", (e) => {
  const l = clamp(e.target.value.length, 1, 64);

  const v = e.target.value;

  passwordInput.value = v.substring(0, l);
});

deviceIdInput.addEventListener("blur", (e) => {
  deviceIdInput.value = clamp(e.target.value, 1, 255);
});

const toggleWifiSettings = () => {
  const wifi = document.querySelector("#wifi-config-container");

  if (isWifiOpen) {
    wifi.classList.remove("appearClass");
    wifi.classList.add("disappearClass");
    isWifiOpen = false;
  } else {
    wifi.classList.remove("disappearClass");
    wifi.classList.remove("display-none"); // Will happen only once
    wifi.classList.add("appearClass");
    isWifiOpen = true;
  }
};

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

const extractRgb = (rgbString) => rgbString.match(/\d+/g).map(Number);

const pause = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 250);
  });
};

const debounce = (callback, time) => {
  let id = null;

  return (...args) => {
    clearTimeout(id);

    id = setTimeout(() => {
      callback.apply(null, args);
    }, time);
  };
};

const Effect = {
  PinoPong: 0,
  Stars: 1,
  Static: 2,
  FunkyBeat: 3,
  VerticalWing: 4,
  HorizontalWing: 5,
  PaletteSlide: 6,
  PaletteBounce: 7,
};

const updatePaletteApi = (index, rgbArr) => {
  return fetch("/palette", {
    method: "POST",
    body: JSON.stringify({
      index,
      color: {
        r: rgbArr[0],
        g: rgbArr[1],
        b: rgbArr[2],
      },
    }),
  }).catch((e) => {
    addMessage(e, MessageType.ERROR);
    console.error(e);
  });
};

const updateWifiApi = (ssid, password, deviceId) => {
  return fetch("/wifi", {
    method: "POST",
    body: JSON.stringify({
      ssid: ssid,
      ssidLength: ssid.length,
      password: password,
      passwordLength: password.length,
      deviceId: deviceId,
    }),
  }).catch((e) => {
    addMessage(e, MessageType.ERROR);
    console.error(e);
  });
};

const renderColorPicker = (
  parent,
  portDesignator,
  currentColor,
  onChange,
  idx
) => {
  const pickerContainer = document.createElement("button");
  pickerContainer.type = "button";
  pickerContainer.id = `${portDesignator}-${idx}-picker`;
  pickerContainer.classList.add("btn");
  pickerContainer.classList.add("btn-light");
  pickerContainer.classList.add("picker-button");
  parent.appendChild(pickerContainer);

  // Create picker
  var picker = new Picker(pickerContainer);

  // Configure picker - set start color
  picker.setOptions({
    color: [currentColor.r, currentColor.g, currentColor.b, 1],
    alpha: false,
  });

  pickerContainer.style.background = picker.color.rgbaString;

  picker.onChange = (color) => {
    pickerContainer.style.background = color.rgbaString;

    onChange(color);
  };

  const updateTileStyle = (rgbObj, tile) => {
    if (rgbObj.r === 0 && rgbObj.g === 0 && rgbObj.b === 0) {
      tile.style.backgroundColor = "#e7e7e7";
      tile.style.border = "1px solid #c3c3c3";
    } else {
      tile.style.backgroundColor = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
      tile.style.border = "unset";
    }
  };

  // Ad-hoc our palette to the picker
  pickerContainer.addEventListener("click", () => {
    pickerIndex = undefined;

    const renderPresetTiles = (parent) => {
      const container = document.createElement("div");
      container.classList.add("preset-tile-container");

      for (let i = 0; i < 21; i++) {
        const tile = document.createElement("div");
        tile.classList.add("preset-tile");

        tile.addEventListener("mousedown", (e) => {
          e.stopPropagation();

          if (e.button !== 0) {
            return;
          }

          pickerIndex = i;

          if (yeetMode) {
            // Update response stash
            apiData.paletteColors[i] = { r: 0, g: 0, b: 0 };

            // Send to ESP
            updatePaletteApi(i, [0, 0, 0]);

            // Update our fancy styles
            updateTileStyle({ r: 0, g: 0, b: 0 }, tile);
            updateAllTileExtras(
              pickerContainer.querySelector(".picker_wrapper")
            );

            return;
          }

          const apiRgb = apiData.paletteColors[i];

          // If we have no color - add color
          if (apiRgb.r === 0 && apiRgb.g === 0 && apiRgb.b === 0) {
            const rgb = extractRgb(pickerContainer.style.background);

            updateTileStyle({ r: rgb[0], g: rgb[1], b: rgb[2] }, tile);

            apiData.paletteColors[i] = {
              r: rgb[0],
              g: rgb[1],
              b: rgb[2],
            };

            updateAllTileExtras(
              pickerContainer.querySelector(".picker_wrapper")
            );

            updatePaletteApi(i, rgb);
            return;
          }

          // If we have a color - apply it to the picker
          const color = tile.style.backgroundColor;
          const rgb = extractRgb(color);

          picker.setOptions({
            color: rgb,
          });

          updateTileStyle({ r: rgb[0], g: rgb[1], b: rgb[2] }, tile);

          updateAllTileExtras(pickerContainer.querySelector(".picker_wrapper"));
        });

        const rgb = apiData.paletteColors[i];

        updateTileStyle(rgb, tile);

        container.appendChild(tile);
      }

      parent.appendChild(container);
    };

    setTimeout(() => {
      const picker = pickerContainer.querySelector(".picker_wrapper");

      picker.addEventListener("click", (e) => e.stopPropagation());

      if (!picker.querySelector(".presets")) {
        const presets = document.createElement("div");
        presets.classList.add("presets");

        renderPresetTiles(presets);
        updateAllTileExtras(presets);

        const reset = document.createElement("p");
        reset.textContent = "🗑️";
        reset.classList.add("delete");

        reset.addEventListener("click", () => {
          yeetMode = !yeetMode;

          if (yeetMode) {
            reset.classList.add("tile-jiggle");
          } else {
            reset.classList.remove("tile-jiggle");
          }

          updateAllTileExtras(picker);
        });

        presets.appendChild(reset);

        picker.appendChild(presets);
      } else {
        const tiles = picker.querySelectorAll(".preset-tile");

        for (const [idx, tile] of tiles.entries()) {
          const rgb = apiData.paletteColors[idx];

          updateTileStyle(rgb, tile);
        }

        updateAllTileExtras(picker);
      }
    }, 50);
  });
};

/**
 * Updated plus signs & selected styles & yeet mode
 * @param {*} picker
 */
const updateAllTileExtras = (picker) => {
  const tiles = picker.querySelectorAll(".preset-tile");

  const firstBlank = apiData.paletteColors.findIndex(
    (c) => c.r === 0 && c.g === 0 && c.b === 0
  );

  for (const [idx, tile] of tiles.entries()) {
    // Yeet current state
    tile.textContent = "";
    tile.textContent = "";

    tile.classList.remove("tile-selected");
    tile.classList.remove("jiggle");

    const color = apiData.paletteColors[idx];

    const isNotEmpty = color.r !== 0 && color.g !== 0 && color.b !== 0;

    if (yeetMode) {
      if (isNotEmpty) {
        tile.classList.add("jiggle");
      }
    }

    if (idx === firstBlank) {
      // Next logical choice gets a +
      const extra = document.createElement("div");
      extra.classList.add("tile-plus");

      const v = document.createElement("div");
      v.classList.add("vertical-bar");
      extra.appendChild(v);

      const h = document.createElement("div");
      h.classList.add("horizontal-bar");
      extra.appendChild(h);

      tile.appendChild(extra);
    } else if (idx > firstBlank) {
      // Others after logical choice get a hover
      const extra = document.createElement("div");
      extra.classList.add("tile-plus-hover");

      const v = document.createElement("div");
      v.classList.add("vertical-bar");
      extra.appendChild(v);

      const h = document.createElement("div");
      h.classList.add("horizontal-bar");
      extra.appendChild(h);

      tile.appendChild(extra);
    }

    // Selected gets extra flair
    if (idx === pickerIndex && isNotEmpty) {
      tile.classList.add("tile-selected");
    }
  }
};

const updateData = (portData) => {
  switch (portData.effectId) {
    case Effect.PinoPong:
    case Effect.Stars:
    case Effect.Static:
    case Effect.VerticalWing:
    case Effect.HorizontalWing:
      if (!portData.color) {
        portData.color = {
          r: 120,
          g: 120,
          b: 120,
        };
      }
      break;
    case Effect.FunkyBeat:
      if (!portData.colors) {
        portData.colors = [
          {
            r: 120,
            g: 120,
            b: 120,
          },
          {
            r: 120,
            g: 120,
            b: 120,
          },
        ];
      }
      break;
    case Effect.PaletteSlide:
    case Effect.PaletteBounce: {
      if (!portData.colors) {
        portData.colors = [
          {
            r: 120,
            g: 120,
            b: 120,
          },
          {
            r: 120,
            g: 120,
            b: 120,
          },
          {
            r: 120,
            g: 120,
            b: 120,
          },
        ];
      }

      portData.speed = 100;
    }
  }
};

const toggleLock = () => {
  const lock = document.querySelector("#lock");
  if (isLocked) {
    lock.classList.remove("appearClass");
    lock.classList.add("disappearClass");
    isLocked = false;
  } else {
    lock.classList.remove("disappearClass");
    lock.classList.add("appearClass");
    isLocked = true;
  }
};

// Render configuration for each effect type
const renderConfig = (portDesignator, portData) => {
  const container = document.querySelector(`#d${portDesignator}-config`);

  // Reset any possible content
  container.textContent = "";

  // Update select
  const effectSelect = document.querySelector(`#d${portDesignator}-select`);
  effectSelect.value = portData.effectId;
  effectSelect.addEventListener("change", (e) => {
    const newEffect = e.target.value;

    const targetPort = apiData.ports.find((port) => port.id === portData.id);

    targetPort.effectId = +newEffect;

    // Update data so we have the necessary props
    updateData(portData);

    // Re-render config for the port
    renderConfig(portDesignator, portData);
  });

  // Update ledCount
  const ledCountInput = document.querySelector(`#d${portDesignator}-ledCount`);
  ledCountInput.value = portData.ledCount;
  ledCountInput.addEventListener("change", (e) => {
    const newLedCount = e.target.value;

    const targetPort = apiData.ports.find((port) => port.id === portData.id);

    targetPort.ledCount = newLedCount;
  });

  // Update isEnabled
  const isEnabledInput = document.querySelector(`#d${portDesignator}-enabled`);
  isEnabledInput.checked = portData.isEnabled;
  isEnabledInput.addEventListener("change", (e) => {
    const targetPort = apiData.ports.find((port) => port.id === portData.id);

    targetPort.isEnabled = e.target.checked;

    updatePortEnabledStatus();
  });

  // Create config container
  const node = document.createElement("div");

  switch (portData.effectId) {
    // Single color selection
    case Effect.PinoPong:
    case Effect.Stars:
    case Effect.Static:
    case Effect.VerticalWing:
    case Effect.HorizontalWing: {
      // Create a niceish title for it
      const title = document.createElement("h6");
      title.textContent = "Settings";
      node.appendChild(title);

      const currentColor = portData.color;

      renderColorPicker(
        node,
        portDesignator,
        currentColor,
        (color) => {
          const targetPort = apiData.ports.find(
            (port) => port.id === portData.id
          );

          targetPort.color = {
            r: color.rgba[0],
            g: color.rgba[1],
            b: color.rgba[2],
          };
        },
        0
      );

      break;
    }
    case Effect.FunkyBeat: {
      const title = document.createElement("h6");
      title.textContent = "Settings";
      node.appendChild(title);

      const colors = portData.colors;

      for (const [idx, color] of colors.entries()) {
        renderColorPicker(
          node,
          portDesignator,
          color,
          (color) => {
            const targetPort = apiData.ports.find(
              (port) => port.id === portData.id
            );

            targetPort.colors[idx] = {
              r: color.rgba[0],
              g: color.rgba[1],
              b: color.rgba[2],
            };
          },
          idx
        );
      }

      break;
    }
    case Effect.PaletteSlide:
    case Effect.PaletteBounce: {
      const title = document.createElement("h6");
      title.textContent = "Settings";
      node.appendChild(title);

      // TODO make slider?
      // TODO extract input group creation into a fucntion
      const inputGroup = document.createElement("div");
      inputGroup.classList.add("input-group");
      inputGroup.classList.add("pb-2");

      const span = document.createElement("span");
      span.classList.add("input-group-text");
      span.textContent = "Speed";
      inputGroup.appendChild(span);

      const inp = document.createElement("input");
      inp.classList.add("form-control");
      inp.id = `${portDesignator}-speed`;
      inp.placeholder = "Speed";
      inp.value = portData.speed;
      inp.type = "number";
      // TODO add clamps blur listeners
      inp.min = -32000;
      inp.max = 32000;
      inputGroup.appendChild(inp);
      inputGroup.addEventListener("change", (e) => {
        portData.speed = e.target.value;
      });

      node.appendChild(inputGroup);

      const colors = portData.colors;

      for (const [idx, color] of colors.entries()) {
        renderColorPicker(
          node,
          portDesignator,
          color,
          (color) => {
            const targetPort = apiData.ports.find(
              (port) => port.id === portData.id
            );

            targetPort.colors[idx] = {
              r: color.rgba[0],
              g: color.rgba[1],
              b: color.rgba[2],
            };
          },
          idx
        );
      }

      break;
    }
    default: {
      const node = document.createElement("div");
      node.classList.add("mb-3");

      const text = document.createElement("span");
      text.style = "border: 2px solid red;";
      text.textContent = `${JSON.stringify(portData)}`;

      node.appendChild(text);
      container.appendChild(node);
      break;
    }
  }

  // Add everything to page
  container.appendChild(node);
};

const MessageType = {
  ERROR: "error",
  INFO: "info",
};

const addMessage = (msgText, type) => {
  const msg = document.createElement("div");
  msg.classList.add("alert");

  msg.role = "alert";
  msg.classList.add("styled-alert");

  switch (type) {
    case MessageType.ERROR:
      msg.classList.add("alert-danger");
      break;
    case MessageType.INFO:
      msg.classList.add("alert-primary");
      break;
  }

  msg.role = "alert";
  msg.textContent = msgText;

  document.querySelector("body").appendChild(msg);

  const clickHandler = (e) => {
    const msg = document.querySelector(".alert");

    msg.classList.add("disappearClass");

    setTimeout(() => {
      msg.remove();

      document.removeEventListener("click", clickHandler);
    }, 1000);
  };

  document.addEventListener("click", clickHandler);
};

document.querySelector("#save").addEventListener("click", async () => {
  toggleLock();

  const results = [];

  results.push(
    fetch("/brightness", {
      method: "POST",
      body: JSON.stringify({
        value: apiData.brightness,
      }),
    }).catch((e) => {
      addMessage(e, MessageType.ERROR);
      console.error(e);
    })
  );

  // We need brightness to be done first
  await pause();

  for (const port of apiData.ports) {
    const getDetails = (port) => {
      switch (port.effectId) {
        case Effect.PinoPong:
        case Effect.Stars:
        case Effect.Static:
        case Effect.VerticalWing:
        case Effect.HorizontalWing:
          return {
            color: {
              r: port.color.r,
              g: port.color.g,
              b: port.color.b,
            },
          };
        case Effect.FunkyBeat:
        case Effect.PaletteSlide:
        case Effect.PaletteBounce:
          return {
            colors: port.colors.map((c) => {
              return {
                r: c.r,
                g: c.g,
                b: c.b,
              };
            }),
          };
      }
    };

    results.push(
      fetch("/save", {
        method: "POST",
        body: JSON.stringify({
          id: port.id,
          ...getDetails(port),
          effectId: +port.effectId,
          ledCount: port.ledCount,
          isEnabled: port.isEnabled,
          speed: port.speed,
        }),
      })
    );

    // Some distance between requests
    await pause();
  }

  Promise.all(results)
    .catch((e) => {
      addMessage(e, MessageType.ERROR);
      console.error(e);
    })
    .then((r) => {
      fetch("/commit")
        .then((r) => {
          console.info("response", r);
          toggleLock();
        })
        .catch((e) => {
          addMessage(e, MessageType.ERROR);
          console.error(e);
        });
    });
});

// Update led brightness
const brightnessInput = document.querySelector(`#brightness`);
brightnessInput.addEventListener("change", (e) => {
  apiData.brightness = e.target.value;
});

const gearInput = document.querySelector("#wifi-toggle");
gearInput.addEventListener("click", toggleWifiSettings);

const wifiSaveInput = document.querySelector("#wifi-save");
wifiSaveInput.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!ssidInput.value || deviceIdInput.value === undefined) {
    addMessage("DeviceId & SSID required!", MessageType.INFO);
    return;
  }

  apiData.wifi.ssid = ssidInput.value;
  apiData.wifi.password = passwordInput.value;
  apiData.wifi.deviceId = deviceIdInput.value;

  await updateWifiApi(
    apiData.wifi.ssid,
    apiData.wifi.password,
    apiData.wifi.deviceId
  );

  toggleLock();

  addMessage("Restarting Device", MessageType.INFO);

  setTimeout(() => {
    window.location.href = `http://argb-${apiData.wifi.deviceId}.local`;
  }, 4000);
});

const wifiCancelInput = document.querySelector("#wifi-cancel");
wifiCancelInput.addEventListener("click", toggleWifiSettings);

const updatePortEnabledStatus = () => {
  for (const [idx, port] of apiData.ports.entries()) {
    const details = document.querySelector(`#details-${idx}`);
    if (port.isEnabled) {
      details.classList.add("enabled-port");
      details.classList.remove("disabled-port");
    } else {
      details.classList.remove("enabled-port");
      details.classList.add("disabled-port");
    }
  }
};

fetch("/load").then(async (response) => {
  const data = await response.json();

  brightnessInput.value = data.brightness ?? 0;

  console.info("raw", data);

  ssidInput.value = data.wifi.ssid;
  passwordInput.value = data.wifi.password;
  deviceIdInput.value = data.wifi.deviceId;

  for (const port of data.ports) {
    renderConfig(port.id, port);
  }

  apiData = data;

  updatePortEnabledStatus();

  toggleLock();
});
