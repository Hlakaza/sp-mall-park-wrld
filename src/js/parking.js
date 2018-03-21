const Wrld = require('wrld.js');
const env = require('../../env');
const { getParkingAreas } = require('./api-service');

const keys = {
  wrld: env.WRLD_KEY,
};

const parkPolys = [];
const updateCycle = 5000; // 5 seconds

// Color Codes
const fullColor = [255, 0, 0, 128]; // Completely full, 100%
const almostColor = [255, 165, 0, 128]; // Few parking slots left, 80% full
const availableColor = [0, 255, 0, 128]; // Plenty of parking space available

const getColorCode = (parkingArea) => {
  const occupied = (parkingArea.usedSlots / parkingArea.totalSlots) * 100;
  if (occupied === 100) {
    return fullColor;
  } else if (occupied >= 80) {
    return almostColor;
  }
  return availableColor;
};

window.addEventListener('load', async () => {
  const map = await Wrld.map('map', keys.wrld, {
    center: [56.460087, -2.975432],
    zoom: 17.5,
  });

  // Adjust bearing and tilt
  setTimeout(() => {
    map.setCameraHeadingDegrees(45).setCameraTiltDegrees(0);
  }, 1000);

  const updateParkingAreas = async () => {
    const parkingAreas = await getParkingAreas();
    parkingAreas.forEach((parkingArea) => {
      const parkPoly = parkPolys.find(target => parkingArea.id === target.id);
      if (parkPoly) {
        parkPoly.poly.setColor(getColorCode(parkingArea));
      }
    });
    // Repeat every 5 seconds
    setTimeout(updateParkingAreas, updateCycle);
  };

  map.on('initialstreamingcomplete', async () => {
    // Highlight Parking Areas
    const parkingAreas = await getParkingAreas();
    parkingAreas.forEach((parkingArea) => {
      const colorCode = getColorCode(parkingArea);
      const poly = Wrld.polygon(parkingArea.polygonPoints, { color: colorCode })
        .addTo(map);
      parkPolys.push({ id: parkingArea.id, poly });
    });

    setTimeout(updateParkingAreas, updateCycle);
  });
});
