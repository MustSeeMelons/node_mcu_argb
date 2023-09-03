// Lib used: https://vanilla-picker.js.org/

// Array of port data
let apiData;

let isLocked = true;
let pickerIndex = undefined;
let yeetMode = false; // For resetting swatch colors

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
    setTimeout(() => resolve(), 100);
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
};

const renderColorPicker = (parent, portDesignator, currentColor, onChange) => {
  const pickerContainer = document.createElement("button");
  pickerContainer.type = "button";
  pickerContainer.id = `${portDesignator}-picker`;
  pickerContainer.classList.add("btn");
  pickerContainer.classList.add("btn-light");
  pickerContainer.classList.add("picker-button");
  pickerContainer.textContent = "Color 1";
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
            apiData.paletteColors[i] = { r: 0, g: 0, b: 0 };
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
            reset.classList.add("jiggle");
          } else {
            reset.classList.remove("jiggle");
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
      title.textContent = "Color";
      node.appendChild(title);

      const currentColor = portData.color;

      renderColorPicker(node, portDesignator, currentColor, (color) => {
        const targetPort = apiData.ports.find(
          (port) => port.id === portData.id
        );

        targetPort.color = {
          r: color.rgba[0],
          g: color.rgba[1],
          b: color.rgba[2],
        };
      });

      break;
    }
    case Effect.FunkyBeat: {
      const title = document.createElement("h6");
      title.textContent = "Colors";
      node.appendChild(title);

      const colors = portData.colors;

      for (const [idx, color] of colors.entries()) {
        renderColorPicker(node, portDesignator, color, (color) => {
          const targetPort = apiData.ports.find(
            (port) => port.id === portData.id
          );

          targetPort.colors[idx] = {
            r: color.rgba[0],
            g: color.rgba[1],
            b: color.rgba[2],
          };
        });
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

document.querySelector("#save").addEventListener("click", async () => {
  // TODO validate data before we send it

  toggleLock();

  const results = [];

  results.push(
    fetch("/brightness", {
      method: "POST",
      body: JSON.stringify({
        value: apiData.brightness,
      }),
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
        }),
      })
    );

    // Some distance between requests
    await pause();
  }

  Promise.all(results)
    .catch((e) => {
      console.error(e);
    })
    .then((r) => {
      fetch("/commit")
        .then((r) => {
          console.info("response", r);
          toggleLock();
        })
        .catch((e) => {
          console.error(e);
        });
    });
});

// Update led brightness
const brightnessInput = document.querySelector(`#brightness`);
brightnessInput.addEventListener("change", (e) => {
  apiData.brightness = e.target.value;
});

fetch("/load").then(async (response) => {
  const data = await response.json();

  brightnessInput.value = data.brightness ?? 0;

  console.info("raw", data);

  for (const port of data.ports) {
    renderConfig(port.id, port);
  }

  apiData = data;

  toggleLock();
});
