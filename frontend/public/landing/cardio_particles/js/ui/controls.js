export function setupControls(config, canvas, renderer) {
  // Check if controls exist (they don't in production mode)
  const toggleBtn = document.getElementById('toggleControls');
  const controlPanel = document.getElementById('controlPanel');
  
  // If controls don't exist, skip setup (production mode)
  if (!toggleBtn || !controlPanel) {
    console.log('Controls not found - running in production mode');
    return;
  }
  
  // Toggle control panel
  toggleBtn.addEventListener('click', () => {
    controlPanel.classList.toggle('visible');
  });


  // Heart grow strength
  const heartGrowSlider = document.getElementById('heartGrowSlider');
  const heartGrowDisplay = document.getElementById('heartGrowDisplay');
  heartGrowSlider.addEventListener('input', (e) => {
    config.heartGrow = parseFloat(e.target.value);
    heartGrowDisplay.textContent = config.heartGrow.toFixed(1);
  });

  // Mouse radius
  const mouseRadiusSlider = document.getElementById('mouseRadiusSlider');
  const mouseRadiusDisplay = document.getElementById('mouseRadiusDisplay');
  mouseRadiusSlider.addEventListener('input', (e) => {
    config.mouseRadius = parseFloat(e.target.value);
    mouseRadiusDisplay.textContent = config.mouseRadius.toFixed(1);
  });

  // Heart rate
  const heartRateSlider = document.getElementById('heartRateSlider');
  const heartRateDisplay = document.getElementById('heartRateDisplay');
  heartRateSlider.addEventListener('input', (e) => {
    config.heartRate = parseFloat(e.target.value);
    heartRateDisplay.textContent = config.heartRate.toFixed(1);
  });

  // Beat intensity
  const beatIntensitySlider = document.getElementById('beatIntensitySlider');
  const beatIntensityDisplay = document.getElementById('beatIntensityDisplay');
  beatIntensitySlider.addEventListener('input', (e) => {
    config.beatIntensity = parseFloat(e.target.value);
    beatIntensityDisplay.textContent = config.beatIntensity.toFixed(1);
  });

  // Heart point size
  const heartSizeSlider = document.getElementById('heartSizeSlider');
  const heartSizeDisplay = document.getElementById('heartSizeDisplay');
  heartSizeSlider.addEventListener('input', (e) => {
    config.heartPointSize = parseFloat(e.target.value);
    heartSizeDisplay.textContent = config.heartPointSize.toFixed(1);
  });

  // Heart density (requires reload)
  const heartDensitySlider = document.getElementById('heartDensitySlider');
  const heartDensityDisplay = document.getElementById('heartDensityDisplay');
  heartDensitySlider.value = config.heartDensity;
  heartDensityDisplay.textContent = config.heartDensity.toFixed(2);
  console.log('Current heart density:', config.heartDensity);
  heartDensitySlider.addEventListener('input', (e) => {
    const density = parseFloat(e.target.value);
    config.heartDensity = density;
    heartDensityDisplay.textContent = density.toFixed(2);
    localStorage.setItem('heartDensity', density);
    console.log('Heart density saved:', density, '- Reload page to apply');
  });

  // Particle count override (requires reload)
  const particleCountSlider = document.getElementById('particleCountSlider');
  const particleCountDisplay = document.getElementById('particleCountDisplay');
  if (particleCountSlider) {
    particleCountSlider.value = config.particleCount || 0;
    particleCountDisplay.textContent = (config.particleCount > 0) ? config.particleCount.toLocaleString() : 'Auto';
    particleCountSlider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value);
      config.particleCount = count;
      particleCountDisplay.textContent = (count > 0) ? count.toLocaleString() : 'Auto';
      localStorage.setItem('particleCount', count);
      console.log('Particle count override saved:', count, '- Reload page to apply');
    });
  }

  // Auto-rotate
  const autoRotateCheck = document.getElementById('autoRotateCheck');
  autoRotateCheck.addEventListener('change', (e) => {
    config.autoRotate = e.target.checked;
  });

  // FOV
  const fovSlider = document.getElementById('fovSlider');
  const fovDisplay = document.getElementById('fovDisplay');
  fovSlider.addEventListener('input', (e) => {
    const fovDegrees = parseInt(e.target.value);
    config.fov = (fovDegrees * Math.PI) / 180;
    fovDisplay.textContent = fovDegrees;
  });

  // ========================================
  // BACKGROUND GLOW CONTROLS
  // ========================================
  
  // Enable/disable glow
  const glowEnabledCheck = document.getElementById('glowEnabledCheck');
  if (glowEnabledCheck) {
    glowEnabledCheck.checked = config.glowEnabled !== false;
    glowEnabledCheck.addEventListener('change', (e) => {
      config.glowEnabled = e.target.checked;
      renderer.updateAmbientConfig();
    });
  }
  
  // Glow intensity
  const glowIntensitySlider = document.getElementById('glowIntensitySlider');
  const glowIntensityDisplay = document.getElementById('glowIntensityDisplay');
  if (glowIntensitySlider) {
    glowIntensitySlider.value = config.glowIntensity || 0.3;
    glowIntensityDisplay.textContent = (config.glowIntensity || 0.3).toFixed(2);
    glowIntensitySlider.addEventListener('input', (e) => {
      config.glowIntensity = parseFloat(e.target.value);
      glowIntensityDisplay.textContent = config.glowIntensity.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }
  
  // Glow radius
  const glowRadiusSlider = document.getElementById('glowRadiusSlider');
  const glowRadiusDisplay = document.getElementById('glowRadiusDisplay');
  if (glowRadiusSlider) {
    glowRadiusSlider.value = config.glowRadius || 1.2;
    glowRadiusDisplay.textContent = (config.glowRadius || 1.2).toFixed(2);
    glowRadiusSlider.addEventListener('input', (e) => {
      config.glowRadius = parseFloat(e.target.value);
      glowRadiusDisplay.textContent = config.glowRadius.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }
  
  // Glow falloff
  const glowFalloffSlider = document.getElementById('glowFalloffSlider');
  const glowFalloffDisplay = document.getElementById('glowFalloffDisplay');
  if (glowFalloffSlider) {
    glowFalloffSlider.value = config.glowFalloff || 2.0;
    glowFalloffDisplay.textContent = (config.glowFalloff || 2.0).toFixed(1);
    glowFalloffSlider.addEventListener('input', (e) => {
      config.glowFalloff = parseFloat(e.target.value);
      glowFalloffDisplay.textContent = config.glowFalloff.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }

  // ========================================
  // CONNECTION CONTROLS
  // ========================================
  
  // Enable/disable connections
  const connectionsEnabledCheck = document.getElementById('connectionsEnabledCheck');
  if (connectionsEnabledCheck) {
    connectionsEnabledCheck.checked = config.connectionsEnabled !== false;
    connectionsEnabledCheck.addEventListener('change', (e) => {
      config.connectionsEnabled = e.target.checked;
      renderer.updateAmbientConfig(); // This also updates connections
    });
  }
  
  // Max neighbors
  const maxNeighborsSlider = document.getElementById('maxNeighborsSlider');
  const maxNeighborsDisplay = document.getElementById('maxNeighborsDisplay');
  if (maxNeighborsSlider) {
    maxNeighborsSlider.value = config.maxNeighbors || 1;
    maxNeighborsDisplay.textContent = config.maxNeighbors || 1;
    maxNeighborsSlider.addEventListener('input', (e) => {
      config.maxNeighbors = parseInt(e.target.value);
      maxNeighborsDisplay.textContent = config.maxNeighbors;
      renderer.updateAmbientConfig();
    });
  }
  
  // Connection distance
  const connectionDistanceSlider = document.getElementById('connectionDistanceSlider');
  const connectionDistanceDisplay = document.getElementById('connectionDistanceDisplay');
  if (connectionDistanceSlider) {
    connectionDistanceSlider.value = config.connectionDistance || 0.03;
    connectionDistanceDisplay.textContent = (config.connectionDistance || 0.03).toFixed(3);
    connectionDistanceSlider.addEventListener('input', (e) => {
      config.connectionDistance = parseFloat(e.target.value);
      connectionDistanceDisplay.textContent = config.connectionDistance.toFixed(3);
      renderer.updateAmbientConfig();
    });
  }
  
  // Connection line width
  const connectionLineWidthSlider = document.getElementById('connectionLineWidthSlider');
  const connectionLineWidthDisplay = document.getElementById('connectionLineWidthDisplay');
  if (connectionLineWidthSlider) {
    connectionLineWidthSlider.value = config.connectionLineWidth || 1.0;
    connectionLineWidthDisplay.textContent = (config.connectionLineWidth || 1.0).toFixed(1);
    connectionLineWidthSlider.addEventListener('input', (e) => {
      config.connectionLineWidth = parseFloat(e.target.value);
      connectionLineWidthDisplay.textContent = config.connectionLineWidth.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }
  
  // Connection opacity
  const connectionOpacitySlider = document.getElementById('connectionOpacitySlider');
  const connectionOpacityDisplay = document.getElementById('connectionOpacityDisplay');
  if (connectionOpacitySlider) {
    connectionOpacitySlider.value = config.connectionOpacity || 0.3;
    connectionOpacityDisplay.textContent = (config.connectionOpacity || 0.3).toFixed(2);
    connectionOpacitySlider.addEventListener('input', (e) => {
      config.connectionOpacity = parseFloat(e.target.value);
      connectionOpacityDisplay.textContent = config.connectionOpacity.toFixed(2);
      // No need to rebuild for opacity changes
    });
  }
  
  // Connection pulse
  const connectionPulseCheck = document.getElementById('connectionPulseCheck');
  if (connectionPulseCheck) {
    connectionPulseCheck.checked = config.connectionPulse !== false;
    connectionPulseCheck.addEventListener('change', (e) => {
      config.connectionPulse = e.target.checked;
    });
  }
  
  // Geodesic threshold
  const geodesicThresholdSlider = document.getElementById('geodesicThresholdSlider');
  const geodesicThresholdDisplay = document.getElementById('geodesicThresholdDisplay');
  if (geodesicThresholdSlider) {
    geodesicThresholdSlider.value = config.geodesicThreshold || 1.2;
    geodesicThresholdDisplay.textContent = (config.geodesicThreshold || 1.2).toFixed(2);
    geodesicThresholdSlider.addEventListener('input', (e) => {
      config.geodesicThreshold = parseFloat(e.target.value);
      geodesicThresholdDisplay.textContent = config.geodesicThreshold.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  // Camera presets
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      renderer.setCameraPreset(preset);
    });
  });

  // Quality presets
  const qualityBtns = document.querySelectorAll('.quality-btn');
  qualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      qualityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const quality = btn.dataset.quality;
      switch(quality) {
        case 'low':
          config.heartPointSize = 3;
          heartSizeSlider.value = 3;
          heartSizeDisplay.textContent = '3.0';
          break;
        case 'medium':
          config.heartPointSize = 4;
          heartSizeSlider.value = 4;
          heartSizeDisplay.textContent = '4.0';
          break;
        case 'high':
          config.heartPointSize = 5;
          heartSizeSlider.value = 5;
          heartSizeDisplay.textContent = '5.0';
          break;
        case 'ultra':
          config.heartPointSize = 6;
          heartSizeSlider.value = 6;
          heartSizeDisplay.textContent = '6.0';
          break;
      }
    });
  });

  // Ambient Particles Type 1 Controls
  const ambientType1EnabledCheck = document.getElementById('ambientType1EnabledCheck');
  if (ambientType1EnabledCheck) {
    ambientType1EnabledCheck.checked = config.ambientType1Enabled !== false;
    ambientType1EnabledCheck.addEventListener('change', (e) => {
      config.ambientType1Enabled = e.target.checked;
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1CountSlider = document.getElementById('ambientType1CountSlider');
  const ambientType1CountDisplay = document.getElementById('ambientType1CountDisplay');
  if (ambientType1CountSlider) {
    ambientType1CountSlider.value = config.ambientType1Count || 5000;
    ambientType1CountDisplay.textContent = (config.ambientType1Count || 5000).toLocaleString();
    ambientType1CountSlider.addEventListener('input', (e) => {
      config.ambientType1Count = parseInt(e.target.value);
      ambientType1CountDisplay.textContent = config.ambientType1Count.toLocaleString();
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1AreaMultiplierSlider = document.getElementById('ambientType1AreaMultiplierSlider');
  const ambientType1AreaMultiplierDisplay = document.getElementById('ambientType1AreaMultiplierDisplay');
  if (ambientType1AreaMultiplierSlider) {
    ambientType1AreaMultiplierSlider.value = config.ambientType1AreaMultiplier || 1.5;
    ambientType1AreaMultiplierDisplay.textContent = (config.ambientType1AreaMultiplier || 1.5).toFixed(2);
    ambientType1AreaMultiplierSlider.addEventListener('input', (e) => {
      config.ambientType1AreaMultiplier = parseFloat(e.target.value);
      ambientType1AreaMultiplierDisplay.textContent = config.ambientType1AreaMultiplier.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1WidthSlider = document.getElementById('ambientType1WidthSlider');
  const ambientType1WidthDisplay = document.getElementById('ambientType1WidthDisplay');
  if (ambientType1WidthSlider) {
    ambientType1WidthSlider.value = config.ambientType1Width || 0;
    ambientType1WidthDisplay.textContent = config.ambientType1Width && config.ambientType1Width > 0 
      ? config.ambientType1Width.toFixed(2) 
      : 'Auto';
    ambientType1WidthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      config.ambientType1Width = value > 0 ? value : null;
      ambientType1WidthDisplay.textContent = value > 0 ? value.toFixed(2) : 'Auto';
      renderer.updateAmbientConfig();
    });
  }


  const ambientType1ParticleSpeedSlider = document.getElementById('ambientType1ParticleSpeedSlider');
  const ambientType1ParticleSpeedDisplay = document.getElementById('ambientType1ParticleSpeedDisplay');
  if (ambientType1ParticleSpeedSlider) {
    ambientType1ParticleSpeedSlider.value = config.ambientType1ParticleSpeed || 1.0;
    ambientType1ParticleSpeedDisplay.textContent = (config.ambientType1ParticleSpeed || 1.0).toFixed(2);
    ambientType1ParticleSpeedSlider.addEventListener('input', (e) => {
      config.ambientType1ParticleSpeed = parseFloat(e.target.value);
      ambientType1ParticleSpeedDisplay.textContent = config.ambientType1ParticleSpeed.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1NoiseScaleSlider = document.getElementById('ambientType1NoiseScaleSlider');
  const ambientType1NoiseScaleDisplay = document.getElementById('ambientType1NoiseScaleDisplay');
  if (ambientType1NoiseScaleSlider) {
    ambientType1NoiseScaleSlider.value = config.ambientType1NoiseScale || 0.01;
    ambientType1NoiseScaleDisplay.textContent = (config.ambientType1NoiseScale || 0.01).toFixed(4);
    ambientType1NoiseScaleSlider.addEventListener('input', (e) => {
      config.ambientType1NoiseScale = parseFloat(e.target.value);
      ambientType1NoiseScaleDisplay.textContent = config.ambientType1NoiseScale.toFixed(4);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1NoiseSpeedSlider = document.getElementById('ambientType1NoiseSpeedSlider');
  const ambientType1NoiseSpeedDisplay = document.getElementById('ambientType1NoiseSpeedDisplay');
  if (ambientType1NoiseSpeedSlider) {
    ambientType1NoiseSpeedSlider.value = config.ambientType1NoiseSpeed || 0.1;
    ambientType1NoiseSpeedDisplay.textContent = (config.ambientType1NoiseSpeed || 0.1).toFixed(2);
    ambientType1NoiseSpeedSlider.addEventListener('input', (e) => {
      config.ambientType1NoiseSpeed = parseFloat(e.target.value);
      ambientType1NoiseSpeedDisplay.textContent = config.ambientType1NoiseSpeed.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1NoiseStrengthSlider = document.getElementById('ambientType1NoiseStrengthSlider');
  const ambientType1NoiseStrengthDisplay = document.getElementById('ambientType1NoiseStrengthDisplay');
  if (ambientType1NoiseStrengthSlider) {
    ambientType1NoiseStrengthSlider.value = config.ambientType1NoiseStrength || 0.5;
    ambientType1NoiseStrengthDisplay.textContent = (config.ambientType1NoiseStrength || 0.5).toFixed(2);
    ambientType1NoiseStrengthSlider.addEventListener('input', (e) => {
      config.ambientType1NoiseStrength = parseFloat(e.target.value);
      ambientType1NoiseStrengthDisplay.textContent = config.ambientType1NoiseStrength.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1DiffusionSlider = document.getElementById('ambientType1DiffusionSlider');
  const ambientType1DiffusionDisplay = document.getElementById('ambientType1DiffusionDisplay');
  if (ambientType1DiffusionSlider) {
    ambientType1DiffusionSlider.value = config.ambientType1Diffusion || 0.02;
    ambientType1DiffusionDisplay.textContent = (config.ambientType1Diffusion || 0.02).toFixed(3);
    ambientType1DiffusionSlider.addEventListener('input', (e) => {
      config.ambientType1Diffusion = parseFloat(e.target.value);
      ambientType1DiffusionDisplay.textContent = config.ambientType1Diffusion.toFixed(3);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1RepulsionRadiusSlider = document.getElementById('ambientType1RepulsionRadiusSlider');
  const ambientType1RepulsionRadiusDisplay = document.getElementById('ambientType1RepulsionRadiusDisplay');
  if (ambientType1RepulsionRadiusSlider) {
    ambientType1RepulsionRadiusSlider.value = config.ambientType1RepulsionRadius || 0.1;
    ambientType1RepulsionRadiusDisplay.textContent = (config.ambientType1RepulsionRadius || 0.1).toFixed(2);
    ambientType1RepulsionRadiusSlider.addEventListener('input', (e) => {
      config.ambientType1RepulsionRadius = parseFloat(e.target.value);
      ambientType1RepulsionRadiusDisplay.textContent = config.ambientType1RepulsionRadius.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType1SizeSlider = document.getElementById('ambientType1SizeSlider');
  const ambientType1SizeDisplay = document.getElementById('ambientType1SizeDisplay');
  if (ambientType1SizeSlider) {
    ambientType1SizeSlider.value = config.ambientType1Size || 2.0;
    ambientType1SizeDisplay.textContent = (config.ambientType1Size || 2.0).toFixed(1);
    ambientType1SizeSlider.addEventListener('input', (e) => {
      config.ambientType1Size = parseFloat(e.target.value);
      ambientType1SizeDisplay.textContent = config.ambientType1Size.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }

  // Ambient Particles Type 2 Controls
  const ambientType2EnabledCheck = document.getElementById('ambientType2EnabledCheck');
  if (ambientType2EnabledCheck) {
    ambientType2EnabledCheck.checked = config.ambientType2Enabled !== false;
    ambientType2EnabledCheck.addEventListener('change', (e) => {
      config.ambientType2Enabled = e.target.checked;
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2CountSlider = document.getElementById('ambientType2CountSlider');
  const ambientType2CountDisplay = document.getElementById('ambientType2CountDisplay');
  if (ambientType2CountSlider) {
    ambientType2CountSlider.value = config.ambientType2Count || 3000;
    ambientType2CountDisplay.textContent = (config.ambientType2Count || 3000).toLocaleString();
    ambientType2CountSlider.addEventListener('input', (e) => {
      config.ambientType2Count = parseInt(e.target.value);
      ambientType2CountDisplay.textContent = config.ambientType2Count.toLocaleString();
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2SizeSlider = document.getElementById('ambientType2SizeSlider');
  const ambientType2SizeDisplay = document.getElementById('ambientType2SizeDisplay');
  if (ambientType2SizeSlider) {
    ambientType2SizeSlider.value = config.ambientType2Size || 1.5;
    ambientType2SizeDisplay.textContent = (config.ambientType2Size || 1.5).toFixed(1);
    ambientType2SizeSlider.addEventListener('input', (e) => {
      config.ambientType2Size = parseFloat(e.target.value);
      ambientType2SizeDisplay.textContent = config.ambientType2Size.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2AreaMultiplierSlider = document.getElementById('ambientType2AreaMultiplierSlider');
  const ambientType2AreaMultiplierDisplay = document.getElementById('ambientType2AreaMultiplierDisplay');
  if (ambientType2AreaMultiplierSlider) {
    ambientType2AreaMultiplierSlider.value = config.ambientType2AreaMultiplier || 2.0;
    ambientType2AreaMultiplierDisplay.textContent = (config.ambientType2AreaMultiplier || 2.0).toFixed(2);
    ambientType2AreaMultiplierSlider.addEventListener('input', (e) => {
      config.ambientType2AreaMultiplier = parseFloat(e.target.value);
      ambientType2AreaMultiplierDisplay.textContent = config.ambientType2AreaMultiplier.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2WidthSlider = document.getElementById('ambientType2WidthSlider');
  const ambientType2WidthDisplay = document.getElementById('ambientType2WidthDisplay');
  if (ambientType2WidthSlider) {
    ambientType2WidthSlider.value = config.ambientType2Width || 0;
    ambientType2WidthDisplay.textContent = config.ambientType2Width && config.ambientType2Width > 0 
      ? config.ambientType2Width.toFixed(2) 
      : 'Auto';
    ambientType2WidthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      config.ambientType2Width = value > 0 ? value : null;
      ambientType2WidthDisplay.textContent = value > 0 ? value.toFixed(2) : 'Auto';
      renderer.updateAmbientConfig();
    });
  }


  const ambientType2SpawnRadiusSlider = document.getElementById('ambientType2SpawnRadiusSlider');
  const ambientType2SpawnRadiusDisplay = document.getElementById('ambientType2SpawnRadiusDisplay');
  if (ambientType2SpawnRadiusSlider) {
    ambientType2SpawnRadiusSlider.value = config.ambientType2SpawnRadius || 1.8;
    ambientType2SpawnRadiusDisplay.textContent = (config.ambientType2SpawnRadius || 1.8).toFixed(2);
    ambientType2SpawnRadiusSlider.addEventListener('input', (e) => {
      config.ambientType2SpawnRadius = parseFloat(e.target.value);
      ambientType2SpawnRadiusDisplay.textContent = config.ambientType2SpawnRadius.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2ParticleSpeedSlider = document.getElementById('ambientType2ParticleSpeedSlider');
  const ambientType2ParticleSpeedDisplay = document.getElementById('ambientType2ParticleSpeedDisplay');
  if (ambientType2ParticleSpeedSlider) {
    ambientType2ParticleSpeedSlider.value = config.ambientType2ParticleSpeed || 1.0;
    ambientType2ParticleSpeedDisplay.textContent = (config.ambientType2ParticleSpeed || 1.0).toFixed(2);
    ambientType2ParticleSpeedSlider.addEventListener('input', (e) => {
      config.ambientType2ParticleSpeed = parseFloat(e.target.value);
      ambientType2ParticleSpeedDisplay.textContent = config.ambientType2ParticleSpeed.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2SpringStrengthSlider = document.getElementById('ambientType2SpringStrengthSlider');
  const ambientType2SpringStrengthDisplay = document.getElementById('ambientType2SpringStrengthDisplay');
  if (ambientType2SpringStrengthSlider) {
    ambientType2SpringStrengthSlider.value = config.ambientType2SpringStrength || 0.15;
    ambientType2SpringStrengthDisplay.textContent = (config.ambientType2SpringStrength || 0.15).toFixed(2);
    ambientType2SpringStrengthSlider.addEventListener('input', (e) => {
      config.ambientType2SpringStrength = parseFloat(e.target.value);
      ambientType2SpringStrengthDisplay.textContent = config.ambientType2SpringStrength.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2DragCoefficientSlider = document.getElementById('ambientType2DragCoefficientSlider');
  const ambientType2DragCoefficientDisplay = document.getElementById('ambientType2DragCoefficientDisplay');
  if (ambientType2DragCoefficientSlider) {
    ambientType2DragCoefficientSlider.value = config.ambientType2DragCoefficient || 0.98;
    ambientType2DragCoefficientDisplay.textContent = (config.ambientType2DragCoefficient || 0.98).toFixed(2);
    ambientType2DragCoefficientSlider.addEventListener('input', (e) => {
      config.ambientType2DragCoefficient = parseFloat(e.target.value);
      ambientType2DragCoefficientDisplay.textContent = config.ambientType2DragCoefficient.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoiseStrengthSlider = document.getElementById('ambientType2NoiseStrengthSlider');
  const ambientType2NoiseStrengthDisplay = document.getElementById('ambientType2NoiseStrengthDisplay');
  if (ambientType2NoiseStrengthSlider) {
    ambientType2NoiseStrengthSlider.value = config.ambientType2NoiseStrength || 12.0;
    ambientType2NoiseStrengthDisplay.textContent = (config.ambientType2NoiseStrength || 12.0).toFixed(2);
    ambientType2NoiseStrengthSlider.addEventListener('input', (e) => {
      config.ambientType2NoiseStrength = parseFloat(e.target.value);
      ambientType2NoiseStrengthDisplay.textContent = config.ambientType2NoiseStrength.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoiseScaleSlider = document.getElementById('ambientType2NoiseScaleSlider');
  const ambientType2NoiseScaleDisplay = document.getElementById('ambientType2NoiseScaleDisplay');
  if (ambientType2NoiseScaleSlider) {
    ambientType2NoiseScaleSlider.value = config.ambientType2NoiseScale || 0.02;
    ambientType2NoiseScaleDisplay.textContent = (config.ambientType2NoiseScale || 0.02).toFixed(4);
    ambientType2NoiseScaleSlider.addEventListener('input', (e) => {
      config.ambientType2NoiseScale = parseFloat(e.target.value);
      ambientType2NoiseScaleDisplay.textContent = config.ambientType2NoiseScale.toFixed(4);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoiseOctavesSlider = document.getElementById('ambientType2NoiseOctavesSlider');
  const ambientType2NoiseOctavesDisplay = document.getElementById('ambientType2NoiseOctavesDisplay');
  if (ambientType2NoiseOctavesSlider) {
    ambientType2NoiseOctavesSlider.value = config.ambientType2NoiseOctaves || 3;
    ambientType2NoiseOctavesDisplay.textContent = config.ambientType2NoiseOctaves || 3;
    ambientType2NoiseOctavesSlider.addEventListener('input', (e) => {
      config.ambientType2NoiseOctaves = parseInt(e.target.value);
      ambientType2NoiseOctavesDisplay.textContent = config.ambientType2NoiseOctaves;
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoisePersistenceSlider = document.getElementById('ambientType2NoisePersistenceSlider');
  const ambientType2NoisePersistenceDisplay = document.getElementById('ambientType2NoisePersistenceDisplay');
  if (ambientType2NoisePersistenceSlider) {
    ambientType2NoisePersistenceSlider.value = config.ambientType2NoisePersistence || 0.5;
    ambientType2NoisePersistenceDisplay.textContent = (config.ambientType2NoisePersistence || 0.5).toFixed(2);
    ambientType2NoisePersistenceSlider.addEventListener('input', (e) => {
      config.ambientType2NoisePersistence = parseFloat(e.target.value);
      ambientType2NoisePersistenceDisplay.textContent = config.ambientType2NoisePersistence.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoiseLacunaritySlider = document.getElementById('ambientType2NoiseLacunaritySlider');
  const ambientType2NoiseLacunarityDisplay = document.getElementById('ambientType2NoiseLacunarityDisplay');
  if (ambientType2NoiseLacunaritySlider) {
    ambientType2NoiseLacunaritySlider.value = config.ambientType2NoiseLacunarity || 2.0;
    ambientType2NoiseLacunarityDisplay.textContent = (config.ambientType2NoiseLacunarity || 2.0).toFixed(2);
    ambientType2NoiseLacunaritySlider.addEventListener('input', (e) => {
      config.ambientType2NoiseLacunarity = parseFloat(e.target.value);
      ambientType2NoiseLacunarityDisplay.textContent = config.ambientType2NoiseLacunarity.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2NoiseTimeScaleSlider = document.getElementById('ambientType2NoiseTimeScaleSlider');
  const ambientType2NoiseTimeScaleDisplay = document.getElementById('ambientType2NoiseTimeScaleDisplay');
  if (ambientType2NoiseTimeScaleSlider) {
    ambientType2NoiseTimeScaleSlider.value = config.ambientType2NoiseTimeScale || 0.05;
    ambientType2NoiseTimeScaleDisplay.textContent = (config.ambientType2NoiseTimeScale || 0.05).toFixed(2);
    ambientType2NoiseTimeScaleSlider.addEventListener('input', (e) => {
      config.ambientType2NoiseTimeScale = parseFloat(e.target.value);
      ambientType2NoiseTimeScaleDisplay.textContent = config.ambientType2NoiseTimeScale.toFixed(2);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2PatternShiftSpeedSlider = document.getElementById('ambientType2PatternShiftSpeedSlider');
  const ambientType2PatternShiftSpeedDisplay = document.getElementById('ambientType2PatternShiftSpeedDisplay');
  if (ambientType2PatternShiftSpeedSlider) {
    ambientType2PatternShiftSpeedSlider.value = config.ambientType2PatternShiftSpeed || 0.01;
    ambientType2PatternShiftSpeedDisplay.textContent = (config.ambientType2PatternShiftSpeed || 0.01).toFixed(3);
    ambientType2PatternShiftSpeedSlider.addEventListener('input', (e) => {
      config.ambientType2PatternShiftSpeed = parseFloat(e.target.value);
      ambientType2PatternShiftSpeedDisplay.textContent = config.ambientType2PatternShiftSpeed.toFixed(3);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2MinLifespanSlider = document.getElementById('ambientType2MinLifespanSlider');
  const ambientType2MinLifespanDisplay = document.getElementById('ambientType2MinLifespanDisplay');
  if (ambientType2MinLifespanSlider) {
    ambientType2MinLifespanSlider.value = config.ambientType2MinLifespan || 10.0;
    ambientType2MinLifespanDisplay.textContent = (config.ambientType2MinLifespan || 10.0).toFixed(1);
    ambientType2MinLifespanSlider.addEventListener('input', (e) => {
      config.ambientType2MinLifespan = parseFloat(e.target.value);
      ambientType2MinLifespanDisplay.textContent = config.ambientType2MinLifespan.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }

  const ambientType2MaxLifespanSlider = document.getElementById('ambientType2MaxLifespanSlider');
  const ambientType2MaxLifespanDisplay = document.getElementById('ambientType2MaxLifespanDisplay');
  if (ambientType2MaxLifespanSlider) {
    ambientType2MaxLifespanSlider.value = config.ambientType2MaxLifespan || 20.0;
    ambientType2MaxLifespanDisplay.textContent = (config.ambientType2MaxLifespan || 20.0).toFixed(1);
    ambientType2MaxLifespanSlider.addEventListener('input', (e) => {
      config.ambientType2MaxLifespan = parseFloat(e.target.value);
      ambientType2MaxLifespanDisplay.textContent = config.ambientType2MaxLifespan.toFixed(1);
      renderer.updateAmbientConfig();
    });
  }
}
