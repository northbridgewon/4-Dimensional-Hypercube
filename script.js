// Matrix operations for 4D rotations
class Matrix4D {
  static multiply(a, b) {
    const result = new Array(4).fill(0).map(() => new Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  }

  static rotateWX(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotateWY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, -s, 0],
      [0, 1, 0, 0],
      [s, 0, c, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotateWZ(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, 0, -s],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [s, 0, 0, c]
    ];
  }
}

class HypercubeVisualization {
  constructor() {
    this.vertices = [];
    this.edges = [];
    this.svg = document.querySelector('.hypercube');
    this.verticesGroup = this.svg.querySelector('.vertices');
    this.edgesGroup = this.svg.querySelector('.edges');
    this.labelsGroup = this.svg.querySelector('.labels');
    this.isAutoRotating = true;
    
    this.initializeGeometry();
    this.setupControls();
    this.render();

    // Add automatic rotation
    this.autoRotate();
  }

  initializeGeometry() {
    // Generate vertices (4D coordinates of a hypercube)
    for (let i = 0; i < 16; i++) {
      const binary = i.toString(2).padStart(4, '0');
      const coords = binary.split('').map(bit => bit === '1' ? 1 : -1);
      this.vertices.push({
        coords: coords,
        binary: binary
      });
    }

    // Generate edges (connect vertices that differ by one bit)
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = (i ^ j).toString(2).match(/1/g)?.length;
        if (diff === 1) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  setupControls() {
    console.log("Setting up controls...");
    ['WX', 'WY', 'WZ'].forEach(plane => {
      const slider = document.getElementById(`rotate${plane}`);
      slider.addEventListener('input', () => this.render());
    });

    const toggleRotationButton = document.getElementById('toggleRotation');
    console.log("Toggle button element:", toggleRotationButton);
    if (!toggleRotationButton) {
      console.error("CRITICAL ERROR: toggleRotation button not found in DOM! Cannot attach event listener.");
    } else {
      toggleRotationButton.addEventListener('click', () => {
        console.log("Toggle Auto-Rotation: Click detected. Current 'this':", this);
        console.log("Toggle Auto-Rotation: 'this.isAutoRotating' before toggle:", this.isAutoRotating);
        this.isAutoRotating = !this.isAutoRotating;
        console.log("Toggle Auto-Rotation: 'this.isAutoRotating' after toggle:", this.isAutoRotating);
        
        const buttonElement = document.getElementById('toggleRotation');
        if (buttonElement) {
            buttonElement.textContent = this.isAutoRotating ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation';
            console.log("Toggle Auto-Rotation: Button text updated to:", buttonElement.textContent);
        } else {
            console.error("Toggle Auto-Rotation: CRITICAL - toggleRotation button element not found when trying to update text!");
        }
      });
    }

    const resetViewButton = document.getElementById('resetView');
    console.log("Reset view button element:", resetViewButton);
    if (!resetViewButton) {
      console.error("CRITICAL ERROR: resetView button not found in DOM! Cannot attach event listener.");
    } else {
      resetViewButton.addEventListener('click', () => {
        console.log("Reset View: Click detected. Current 'this':", this);
        const wxSlider = document.getElementById('rotateWX');
        const wySlider = document.getElementById('rotateWY');
        const wzSlider = document.getElementById('rotateWZ');
        console.log("Reset View: Sliders fetched:", wxSlider, wySlider, wzSlider);

        if (wxSlider && wySlider && wzSlider) {
            console.log("Reset View: Setting slider values to 0.");
            wxSlider.value = 0;
            wySlider.value = 0;
            wzSlider.value = 0;
            console.log("Reset View: Slider values set. Calling render().");
            this.render();
            console.log("Reset View: render() call completed.");
        } else {
            console.error("Reset View: CRITICAL - One or more rotation sliders not found during reset! WX:", wxSlider, "WY:", wySlider, "WZ:", wzSlider);
        }
      });
    }

    const rotationSpeedSliderElement = document.getElementById('rotationSpeed');
    if (!rotationSpeedSliderElement) {
        console.error("SetupControls: CRITICAL - rotationSpeed slider not found in DOM! Cannot attach input listener.");
    } else {
        console.log("SetupControls: rotationSpeed slider element found:", rotationSpeedSliderElement);
        rotationSpeedSliderElement.addEventListener('input', () => {
            console.log("Rotation Speed Slider: Input detected. New value:", rotationSpeedSliderElement.value);
        });
        console.log("SetupControls: Input event listener attached to rotationSpeed slider.");
    }
  }

  autoRotate() {
    let tick = 0;
    const rotationSpeedSlider = document.getElementById('rotationSpeed');
    // console.log("Rotation speed slider element:", rotationSpeedSlider); // This is logged in setupControls now
    if (!rotationSpeedSlider) {
      // Error already logged in setupControls, but this is a safeguard for autoRotate's direct usage
      console.error("AutoRotate: CRITICAL ERROR: rotationSpeed slider not found in DOM! Will use default speed 1.0.");
    }

    setInterval(() => {
      if (this.isAutoRotating) {
        let currentSpeed = 1.0; // Default speed
        if (rotationSpeedSlider) {
            currentSpeed = parseFloat(rotationSpeedSlider.value) || 1.0;
        }
        // Keep this log for detailed tick information
        console.log("Auto-rotate tick. Current speed:", currentSpeed, "isAutoRotating:", this.isAutoRotating); 
        tick += 0.5 * currentSpeed;
        document.getElementById('rotateWX').value = Math.sin(tick * 0.02) * 180 + 180;
        document.getElementById('rotateWY').value = Math.sin(tick * 0.015) * 180 + 180;
        document.getElementById('rotateWZ').value = Math.sin(tick * 0.01) * 180 + 180;
        this.render();
      }
    }, 50);
  }

  project4Dto3D(point, rotations) {
    let matrix = Matrix4D.rotateWX(rotations.wx);
    matrix = Matrix4D.multiply(matrix, Matrix4D.rotateWY(rotations.wy));
    matrix = Matrix4D.multiply(matrix, Matrix4D.rotateWZ(rotations.wz));
    
    const rotated = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotated[i] += point[j] * matrix[i][j];
      }
    }
    
    const w = rotated[3];
    const scale = 100 / (2 - w);
    return {
      x: rotated[0] * scale,
      y: rotated[1] * scale,
      z: rotated[2] * scale
    };
  }

  render() {
    const rotations = {
      wx: document.getElementById('rotateWX').value * Math.PI / 180,
      wy: document.getElementById('rotateWY').value * Math.PI / 180,
      wz: document.getElementById('rotateWZ').value * Math.PI / 180
    };

    // Clear previous rendering
    this.verticesGroup.innerHTML = '';
    this.edgesGroup.innerHTML = '';
    this.labelsGroup.innerHTML = '';

    // Project and render vertices
    const projectedVertices = this.vertices.map(v => {
      const proj = this.project4Dto3D(v.coords, rotations);
      return { ...proj, binary: v.binary };
    });

    // Render edges
    this.edges.forEach(([i, j]) => {
      const v1 = projectedVertices[i];
      const v2 = projectedVertices[j];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute('class', 'edge');
      line.setAttribute('x1', v1.x);
      line.setAttribute('y1', v1.y);
      line.setAttribute('x2', v2.x);
      line.setAttribute('y2', v2.y);
      this.edgesGroup.appendChild(line);
    });

    // Render vertices and labels
    projectedVertices.forEach((v, i) => {
      const vertex = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      vertex.setAttribute('class', 'vertex');
      vertex.setAttribute('cx', v.x);
      vertex.setAttribute('cy', v.y);
      vertex.setAttribute('r', 5);
      this.verticesGroup.appendChild(vertex);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute('class', 'vertex-label');
      label.setAttribute('x', v.x);
      label.setAttribute('y', v.y + 20);
      label.textContent = v.binary;
      this.labelsGroup.appendChild(label);
    });
  }
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', () => {
  new HypercubeVisualization();
});