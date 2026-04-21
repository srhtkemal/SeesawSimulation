(function () {
  const ZONES = 10;
  const ARM_WIDTH = 600;
  const ZONE_WIDTH = ARM_WIDTH / (ZONES * 2);
  const STEP = 0.5;

  const arm = document.getElementById('arm');
  const statusEl = document.getElementById('status');
  const weightPanel = document.getElementById('weightPanel');
  const selZoneLabel = document.getElementById('selZoneLabel');
  const weightBtnsContainer = document.getElementById('weightButtons');

  let objects = [];
  let markerEls = [];
  let selectedZone = null;
  let currentAngle = 0;
  let targetAngle = 0;
  let animId = null;
  let paused = false;

  let creakCounter = 0; 

  const clickSound = new Audio("sound-effects/click.wav");
  const dropSound = new Audio("sound-effects/drop.wav");
  const creakSound = new Audio("sound-effects/creak.wav");

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function playDrop() {
  dropSound.currentTime = 0;
  dropSound.play();
}

function playCreak() {
  creakSound.currentTime = 0;
  creakSound.play();
}

  for (let i = -ZONES; i <= ZONES; i++) {
    if (i === 0) continue; // because it is the 0 point, it has no torque
    const div = document.createElement('div');
    div.className = 'zone';
    const idx = i < 0 ? i + ZONES : i + ZONES - 1;
    div.style.left = idx * ZONE_WIDTH + 'px';
    div.style.width = ZONE_WIDTH + 'px';
    div.setAttribute('data-zone', i);
    const lbl = document.createElement('div');
    lbl.className = 'zone-label';
    lbl.textContent = i;
    div.appendChild(lbl);

    div.addEventListener('click', function () {
      selectZone(i);
    });
    arm.appendChild(div);
  }

  for (let w = 1; w <= 10; w++) {
    const btn = document.createElement('button');
    btn.textContent = w;
    btn.style.width = '28px';
    btn.addEventListener('click', function () {
      placeWeight(w);
    });
    weightBtnsContainer.appendChild(btn);
  }
  const headerRow = document.getElementById('zoneHeaderRow');
  const dataRow = document.getElementById('zoneDataRow');
  for (let i = -ZONES; i <= ZONES; i++) {
    const th = document.createElement('th');
    const td = document.createElement('td');
    td.id = 'zt_' + i;
    if (i === 0) {
      th.textContent = '0';
      th.style.backgroundColor = 'red';
      td.textContent = '';
      td.style.backgroundColor = 'red';
    } else {
      th.textContent = i;
      td.textContent = '-';
    }
    headerRow.appendChild(th);
    dataRow.appendChild(td);
  }

    function saveState() {
    localStorage.setItem("seesawObjects", JSON.stringify(objects));
  }
 
  function loadState() {
    const saved = localStorage.getItem("seesawObjects");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;
      for (let k = 0; k < parsed.length; k++) {
        objects.push(parsed[k]);
        addMarker(parsed[k].zone, parsed[k].weight, k);
      }
      recalculate();
      statusEl.textContent = "State restored. " + objects.length + " objects loaded.";
    } catch (e) {
      // ignores the invalid data
    }
  }
 

  loadState();

  function selectZone(z) {
    selectedZone = z;
    const allZ = arm.querySelectorAll('.zone');
    for (let k = 0; k < allZ.length; k++) {
      allZ[k].classList.remove('selected');
      if (parseInt(allZ[k].getAttribute('data-zone')) === z) {
        allZ[k].classList.add('selected');
      }
    }
    const side = z < 0 ? 'LEFT' : 'RIGHT';
    selZoneLabel.textContent = side + ' zone ' + Math.abs(z);
    weightPanel.style.display = 'block';
    statusEl.textContent =
      'Zone ' + z + 'selected. Now pick a weight between 1 and 10.';
  }

  window.cancelSelection = function () {
    selectedZone = null;
    weightPanel.style.display = 'none';
    const allZ = arm.querySelectorAll('.zone');
    for (let k = 0; k < allZ.length; k++) {
      allZ[k].classList.remove('selected');
    }
    statusEl.textContent = 'Cancelled. Click a zone to begin';
  };
  function placeWeight(w) {
    if (selectedZone === null) return;
    const zone = selectedZone;
    console.log('weight=> ', w);
    console.log('zone=> ', zone);
    objects.push({ zone: zone, weight: w });
    addMarker(zone, w, objects.length - 1);
    playDrop();
    window.cancelSelection();
    recalculate();
    saveState();
    statusEl.textContent =
      w + ' kg placed at zone ' + zone + ' Total objects=> ' + objects.length;
    selectedZone = null;
  }
  function addMarker(zone, weight, objIndex) {
    const zoneIdx = zone < 0 ? zone + ZONES : zone + ZONES - 1;
    const px = zoneIdx * ZONE_WIDTH;

    let stack = 0;
    for (let k = 0; k < objIndex; k++) {
      if (objects[k].zone === zone) stack++;
    }
    let marker = document.createElement('div');
    marker.className = 'obj-marker';
    marker.style.left = px + 1 + 'px';
    marker.style.width = ZONE_WIDTH - 2 + 'px';
    marker.style.height = '16px';
    marker.style.top = -16 - stack * 18 + 'px';
    marker.textContent = weight + 'kg';

    //So blocks will be more red when weight increases
    const r = Math.min(255, 120 + weight * 14);
    const g = Math.max(100, 220 - weight * 18);
    marker.style.background = 'rgb(' + r + ',' + g + ',100)';
    arm.appendChild(marker);
    markerEls.push(marker);
  }

  function updateDisplay() {
    let leftWeight = 0;
    let leftTorque = 0;
    let rightWeight = 0;
    let rightTorque = 0;

    for (let k = 0; k < objects.length; k++) {
      const o = objects[k];
      const dist = Math.abs(o.zone);
      //const cosA = Math.cos(currentAngle * Math.PI / 180);
      //const t = o.weight * dist * cosA;
      const t = o.weight * dist; // The formula we are going to use is (weight * distance)
      if (o.zone < 0) {
        leftTorque += t;
        leftWeight += o.weight;
      } else {
        rightTorque += t;
        rightWeight += o.weight;
      }
    }

    const diff = rightTorque - leftTorque;
    document.getElementById('infoLW').textContent = leftWeight + ' kg';
    document.getElementById('infoLT').textContent = leftTorque + ' kg';
    document.getElementById('infoRW').textContent = rightWeight + ' kg';
    document.getElementById('infoRT').textContent = rightTorque + ' kg';
    document.getElementById('infoDiff').textContent =
      (diff > 0 ? '+' : '') + diff;
    document.getElementById('infoAngle').textContent =
      currentAngle.toFixed(1) + '\u00B0';
  }

  function recalculate() {
    let leftTorque = 0;
    let rightTorque = 0;
    const zoneWeights = {};

    for (let k = 0; k < objects.length; k++) {
      const o = objects[k];
      const dist = Math.abs(o.zone);
      if (o.zone < 0) leftTorque += o.weight * dist;
      else rightTorque += o.weight * dist;
      if (!zoneWeights[o.zone]) zoneWeights[o.zone] = 0;
      zoneWeights[o.zone] += o.weight;
    }

    //const diff = rightTorque - leftTorque;
    //if (diff > 0) targetAngle = 30;
    //else if (diff < 0) targetAngle = -30;
    //else targetAngle = 0;
    const diff = rightTorque - leftTorque;
    targetAngle = Math.max(-30, Math.min(30, diff / 10));

    for (let z = -ZONES; z <= ZONES; z++) {
      if (z === 0) continue;
      const cell = document.getElementById('zt_' + z);
      cell.textContent = zoneWeights[z] ? zoneWeights[z] + 'kg' : '-';
      cell.style.background = zoneWeights[z] ? '#ffc' : '';
    }

    updateDisplay();
    startAnimation();
  }

  function startAnimation() {
    if (animId || paused) return;
    animId = requestAnimationFrame(animateStep);
  }

  function animateStep() {
    if (paused) {
      animId = null;
      return;
    }
    if (Math.abs(currentAngle - targetAngle) < 0.1) {
      currentAngle = targetAngle;
      arm.style.transform = 'rotate(' + currentAngle + 'deg)';
      updateDisplay();
      animId = null;
      return;
    }
    if (currentAngle < targetAngle) {
      currentAngle = Math.min(currentAngle + STEP, targetAngle);
    } else currentAngle = Math.max(currentAngle - STEP, targetAngle);
    arm.style.transform = 'rotate(' + currentAngle + 'deg)';
    updateDisplay();

    creakCounter++;
    if (creakCounter >= 15) {
      creakCounter = 0;
      playCreak();
    }
    setTimeout(function () {
      animId = requestAnimationFrame(animateStep);
    }, 20);
  }

  window.resetAll = function () {
    objects = [];
    for (let k = 0; k < markerEls.length; k++) markerEls[k].remove();
    markerEls = [];

    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    paused = false;
    document.getElementById('pauseBtn').innerHTML = '<b>PAUSE</b>';
    document.getElementById('pausedLabel').style.display = 'none';
    currentAngle = 0;
    targetAngle = 0;
    arm.style.transform = 'rotate(0deg)';
    window.cancelSelection();
    recalculate();
    saveState();
    statusEl.textContent = 'Reset. Click a zone to begin.';
  };

  window.undoLast = function () {
    if (objects.length === 0) return;
    objects.pop();

    for (let k = 0; k < markerEls.length; k++) markerEls[k].remove();
    markerEls = [];

    for (let k = 0; k < objects.length; k++) {
      addMarker(objects[k].zone, objects[k].weight, k);
    }
    recalculate();
    saveState();
    statusEl.textContent =
      'Last object is removed. Remaining: ' + objects.length;
  };
  window.addRandomLeft = function () {
    const zone = -(Math.floor(Math.random() * ZONES) + 1);
    const weight = Math.floor(Math.random() * 10) + 1;
    objects.push({ zone: zone, weight: weight });
    addMarker(zone, weight, objects.length - 1);
    playDrop();
    recalculate();
    saveState();
    statusEl.textContent = weight + ' kg placed at zone ' + zone + ' (random). Total: ' + objects.length;
  };

  window.addRandomRight = function () {
    const zone = Math.floor(Math.random() * ZONES) + 1;
    const weight = Math.floor(Math.random() * 10) + 1;
    objects.push({ zone: zone, weight: weight });
    addMarker(zone, weight, objects.length - 1);
    playDrop();
    recalculate();
    saveState();
    statusEl.textContent = weight + ' kg placed at zone ' + zone + ' (random). Total: ' + objects.length;
  };

  window.togglePause = function () {
    playClick();
    paused = !paused;
    const btn = document.getElementById('pauseBtn');
    const label = document.getElementById('pausedLabel');

    if (paused) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      btn.innerHTML = '<b> RESUME </b>';
      label.style.display = 'block';
    } else {
      btn.innerHTML = '<b> PAUSE </b>';
      label.style.display = 'none';
      startAnimation();
    }
  };
})();
