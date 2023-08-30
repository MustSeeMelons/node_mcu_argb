// Lib used: https://vanilla-picker.js.org/

// Array of port data
let apiData;

let isLocked = true;

window.addEventListener("contextmenu", (e) => e.preventDefault());

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

  // Ad-hoc our palette to the picker
  pickerContainer.addEventListener("click", () => {
    const renderPresetTiles = (parent) => {
      const container = document.createElement("div");
      container.classList.add("preset-tile-container");

      for (let i = 0; i < 21; i++) {
        const tile = document.createElement("div");
        tile.classList.add("preset-tile");

        tile.addEventListener("mousedown", (e) => {
          switch (e.button) {
            case 0:
              const color = tile.style.backgroundColor;
              const rgb = extractRgb(color);

              picker.setOptions({
                color: rgb,
              });

              // TODO update api data!

              break;
            case 2:
              tile.style.backgroundColor = pickerContainer.style.background;

              // TODO update api data!
              break;
          }
        });

        tile.style.backgroundColor = `#${Math.floor(
          Math.random() * 16777215
        ).toString(16)}`;

        container.appendChild(tile);
      }

      parent.appendChild(container);
    };

    setTimeout(() => {
      const picker = pickerContainer.querySelector(".picker_wrapper");

      if (!picker.querySelector(".presets")) {
        const presets = document.createElement("div");
        presets.classList.add("presets");
        renderPresetTiles(presets);

        const reset = document.createElement("button");
        reset.type = "button";
        reset.classList.add("btn");
        reset.classList.add("btn-light");
        reset.classList.add("reset-btn");

        reset.textContent = "Reset";

        presets.appendChild(reset);

        picker.appendChild(presets);
      }
    }, 100);
  });
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
      console.log(e);
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
