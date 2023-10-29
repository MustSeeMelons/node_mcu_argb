const debounce = (callback, time) => {
  let id = null;

  return (...args) => {
    clearTimeout(id);

    id = setTimeout(() => {
      callback.apply(null, args);
    }, time);
  };
};

const pause = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 250);
  });
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

const clamp = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

// Plain JS element creation is a pain. Use a templatey solution instead.
const getPortHTML = (portId) => {
  return `
  <div class="port mb-3">
    <div class="port-header">
        <h4 class="">D${portId + 1} Port</h4>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="d${portId}-enabled">
        </div>
    </div>
    <div id="details-${portId}" class="port-details">
        <div class="form-floating mt-1 mb-1">
            <select id="d${portId}-select" class="form-select" aria-label="Effect selection">
                <option value="0">Ping Pong</option>
                <option value="1">Stars</option>
                <option value="2">Static</option>
                <option value="3">Colliding</option>
                <option value="4">Vertical Wing</option>
                <option value="5">Horizontal Wing</option>
                <option value="6">Palette Slide</option>
                <option value="7">Palette Bounce</option>
            </select>
            <label for="d${portId}-select" class="form-label">Effect</label>
        </div>
        <div class="input-group pb-2">
            <span class="input-group-text" id="d${portId}-ledCount-label">LED Count</span>
            <input id="d${portId}-ledCount" type="number" class="form-control" placeholder="0" aria-label="ledCount"
                aria-describedby="d${portId}-ledCount-label">

        </div>
        <div id="d${portId}-config" class="">
        </div>
    </div>
  </div>
  `;
};
