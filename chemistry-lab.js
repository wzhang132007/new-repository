import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CHEMICALS = [
    { name: 'Yellow', color: 0xFFFF00 },
    { name: 'Blue', color: 0x0066FF },
    { name: 'Green', color: 0x00FF66 },
    { name: 'Purple', color: 0x9933FF },
    { name: 'Red', color: 0xFF3333 },
    { name: 'Orange', color: 0xFF9933 },
    { name: 'Cyan', color: 0x00FFFF }
];

const REACTION_TYPES = {
    EXPLOSION: 'explosion',
    DIFFUSION: 'diffusion',
    BUBBLE: 'bubble',
    STEAM: 'steam',
    STABLE: 'stable'
};

const MAX_BEAKERS = 6;
const SUBSTANCES_PER_BEAKER = 3;

// ============================================
// SHADERS
// ============================================

const liquidVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const liquidFragmentShader = `
    uniform vec3 liquidColor;
    uniform float opacity;
    uniform float time;
    uniform float bubbleIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
        // Fresnel effect
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

        // Bubble animation
        float bubble = sin(vUv.x * 20.0 + time * 3.0) * sin(vUv.y * 20.0 + time * 2.5) * bubbleIntensity;
        bubble = max(0.0, bubble) * 0.3;

        // Color mixing
        vec3 color = liquidColor + vec3(bubble);
        color = mix(color, vec3(1.0), fresnel * 0.3);

        gl_FragColor = vec4(color, opacity);
    }
`;

const glassVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const glassFragmentShader = `
    uniform vec3 glassColor;
    uniform float glassOpacity;
    uniform float refraction;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

        // Glass reflection
        vec3 color = glassColor;
        color = mix(color, vec3(1.0), fresnel * 0.4);

        // Edge highlight
        float edge = 1.0 - abs(dot(viewDir, vNormal));
        color += vec3(edge * 0.2);

        float alpha = glassOpacity + fresnel * 0.2;

        gl_FragColor = vec4(color, alpha);
    }
`;

const particleVertexShader = `
    uniform float time;
    uniform float size;

    attribute float particleSize;
    attribute vec3 particleColor;
    attribute float particleLife;

    varying vec3 vColor;
    varying float vLife;

    void main() {
        vColor = particleColor;
        vLife = particleLife;

        vec3 pos = position;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

        gl_PointSize = particleSize * size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const particleFragmentShader = `
    varying vec3 vColor;
    varying float vLife;

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) discard;

        float alpha = (1.0 - dist * 2.0) * vLife;
        gl_FragColor = vec4(vColor, alpha);
    }
`;

// ============================================
// MAIN APPLICATION CLASS
// ============================================

class ChemistryLab {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.currentStage = 1;
        this.selectedChemical = null;
        this.beakers = [];
        this.completedReactions = [];

        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.particleSystems = [];

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.setupStage1();
        this.setupEventListeners();
        this.updateUI();
        this.animate();
    }

    setupScene() {
        const container = document.getElementById('canvas-container');

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f5f9);
        this.scene.fog = new THREE.Fog(0xf0f5f9, 10, 50);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 12);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 25;
        this.controls.maxPolarAngle = Math.PI / 2.1;

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
        pointLight1.position.set(0, 5, 0);
        this.scene.add(pointLight1);
    }

    setupStage1() {
        // Lab table
        const tableGeometry = new THREE.BoxGeometry(10, 0.2, 6);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.3,
            metalness: 0.1
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = -0.1;
        table.castShadow = true;
        table.receiveShadow = true;
        this.scene.add(table);

        // Beaker rack
        this.createBeakerRack();

        // Initialize beaker data
        for (let i = 0; i < MAX_BEAKERS; i++) {
            this.beakers.push({
                index: i,
                substances: [],
                mesh: null,
                liquidMesh: null,
                reactionType: null,
                reacting: false
            });
        }

        // Create UI for chemicals
        this.createChemicalPalette();
    }

    createBeakerRack() {
        const rackGroup = new THREE.Group();
        const spacing = 1.5;
        const startX = -(MAX_BEAKERS - 1) * spacing / 2;

        for (let i = 0; i < MAX_BEAKERS; i++) {
            const x = startX + i * spacing;

            // Beaker base platform
            const baseGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x999999,
                roughness: 0.5,
                metalness: 0.3
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(x, 0.025, 0);
            base.castShadow = true;
            rackGroup.add(base);

            // Glass beaker
            const beakerGroup = new THREE.Group();
            beakerGroup.position.set(x, 0.05, 0);

            // Beaker body (glass cylinder)
            const beakerGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.2, 32, 1, true);
            const beakerMaterial = new THREE.ShaderMaterial({
                vertexShader: glassVertexShader,
                fragmentShader: glassFragmentShader,
                uniforms: {
                    glassColor: { value: new THREE.Color(0xccffff) },
                    glassOpacity: { value: 0.15 },
                    refraction: { value: 0.98 }
                },
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const beakerMesh = new THREE.Mesh(beakerGeometry, beakerMaterial);
            beakerMesh.position.y = 0.6;
            beakerMesh.userData.beakerIndex = i;
            beakerMesh.userData.interactable = true;
            beakerGroup.add(beakerMesh);

            // Beaker bottom
            const bottomGeometry = new THREE.CircleGeometry(0.25, 32);
            const bottomMaterial = beakerMaterial.clone();
            const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
            bottom.rotation.x = -Math.PI / 2;
            bottom.position.y = 0.05;
            beakerGroup.add(bottom);

            // Store reference
            this.beakers[i].mesh = beakerGroup;
            this.beakers[i].glassMesh = beakerMesh;

            rackGroup.add(beakerGroup);
        }

        this.scene.add(rackGroup);
    }

    createChemicalPalette() {
        const palette = document.getElementById('chemical-palette');
        palette.innerHTML = '';

        CHEMICALS.forEach((chemical, index) => {
            const button = document.createElement('div');
            button.className = 'chemical-button';
            button.style.background = `linear-gradient(135deg, #${chemical.color.toString(16).padStart(6, '0')}, #${this.darkenColor(chemical.color).toString(16).padStart(6, '0')})`;
            button.dataset.index = index;

            const label = document.createElement('div');
            label.className = 'chemical-label';
            label.textContent = chemical.name;
            button.appendChild(label);

            button.addEventListener('click', () => this.selectChemical(index));
            palette.appendChild(button);
        });
    }

    darkenColor(color) {
        const c = new THREE.Color(color);
        c.multiplyScalar(0.7);
        return parseInt(c.getHexString(), 16);
    }

    selectChemical(index) {
        this.selectedChemical = index;

        // Update UI
        const buttons = document.querySelectorAll('.chemical-button');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('selected', i === index);
        });

        this.updateInstructions();
    }

    addChemicalToBeaker(beakerIndex) {
        if (this.selectedChemical === null) {
            this.updateInstructions('Please select a chemical first!');
            return;
        }

        const beaker = this.beakers[beakerIndex];

        if (beaker.reacting) {
            this.updateInstructions('This beaker is reacting!');
            return;
        }

        if (beaker.substances.length >= SUBSTANCES_PER_BEAKER) {
            this.updateInstructions('Beaker is full!');
            return;
        }

        const chemical = CHEMICALS[this.selectedChemical];
        beaker.substances.push({
            name: chemical.name,
            color: chemical.color
        });

        // Update liquid visualization
        this.updateBeakerLiquid(beakerIndex);

        // Check if beaker is ready to react
        if (beaker.substances.length === SUBSTANCES_PER_BEAKER) {
            setTimeout(() => this.triggerReaction(beakerIndex), 500);
        }

        this.updateProgress();
        this.updateInstructions();
    }

    updateBeakerLiquid(beakerIndex) {
        const beaker = this.beakers[beakerIndex];

        // Remove old liquid
        if (beaker.liquidMesh) {
            beaker.mesh.remove(beaker.liquidMesh);
        }

        // Calculate mixed color
        const mixedColor = this.mixColors(beaker.substances.map(s => s.color));

        // Liquid height based on number of substances
        const liquidHeight = (beaker.substances.length / SUBSTANCES_PER_BEAKER) * 0.8;

        // Create liquid
        const liquidGeometry = new THREE.CylinderGeometry(0.28, 0.23, liquidHeight, 32);
        const liquidMaterial = new THREE.ShaderMaterial({
            vertexShader: liquidVertexShader,
            fragmentShader: liquidFragmentShader,
            uniforms: {
                liquidColor: { value: new THREE.Color(mixedColor) },
                opacity: { value: 0.7 },
                time: { value: 0 },
                bubbleIntensity: { value: 0.0 }
            },
            transparent: true,
            depthWrite: false
        });

        const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquidMesh.position.y = 0.05 + liquidHeight / 2;
        beaker.mesh.add(liquidMesh);
        beaker.liquidMesh = liquidMesh;
    }

    mixColors(colors) {
        if (colors.length === 0) return 0xffffff;

        let r = 0, g = 0, b = 0;
        colors.forEach(color => {
            const c = new THREE.Color(color);
            r += c.r;
            g += c.g;
            b += c.b;
        });

        return new THREE.Color(r / colors.length, g / colors.length, b / colors.length).getHex();
    }

    triggerReaction(beakerIndex) {
        const beaker = this.beakers[beakerIndex];
        beaker.reacting = true;

        // Determine reaction type
        beaker.reactionType = this.determineReactionType(beaker.substances);

        // Play reaction animation
        this.playReactionAnimation(beakerIndex, beaker.reactionType);

        // Mark as completed after animation
        setTimeout(() => {
            beaker.reacting = false;
            this.completedReactions.push({
                index: beakerIndex,
                type: beaker.reactionType,
                color: this.mixColors(beaker.substances.map(s => s.color)),
                substances: [...beaker.substances]
            });

            this.checkStage1Completion();
        }, 3000);
    }

    determineReactionType(substances) {
        const colors = substances.map(s => s.name);

        // Check for identical colors
        if (colors.every(c => c === colors[0])) {
            return REACTION_TYPES.STABLE;
        }

        // Energy burst: Red + Orange + Yellow
        if (colors.includes('Red') && colors.includes('Orange') && colors.includes('Yellow')) {
            return REACTION_TYPES.EXPLOSION;
        }

        // Energy burst: Any combination with Red + Yellow
        if (colors.includes('Red') && colors.includes('Yellow')) {
            return REACTION_TYPES.EXPLOSION;
        }

        // Steam: Blue + Red (hot + cold)
        if (colors.includes('Blue') && colors.includes('Red')) {
            return REACTION_TYPES.STEAM;
        }

        // Bubble: Green + any
        if (colors.includes('Green')) {
            return REACTION_TYPES.BUBBLE;
        }

        // Diffusion: CMY colors (Cyan, Purple/Magenta, Yellow)
        const hasCMY = (colors.includes('Cyan') || colors.includes('Blue')) &&
                       (colors.includes('Purple')) &&
                       (colors.includes('Yellow'));
        if (hasCMY) {
            return REACTION_TYPES.DIFFUSION;
        }

        // Diffusion: Cool colors
        const coolColors = ['Blue', 'Cyan', 'Purple'];
        if (colors.every(c => coolColors.includes(c))) {
            return REACTION_TYPES.DIFFUSION;
        }

        // Default: Bubble
        return REACTION_TYPES.BUBBLE;
    }

    playReactionAnimation(beakerIndex, reactionType) {
        const beaker = this.beakers[beakerIndex];
        const position = new THREE.Vector3();
        beaker.mesh.getWorldPosition(position);

        switch (reactionType) {
            case REACTION_TYPES.EXPLOSION:
                this.animateExplosion(beaker, position);
                break;
            case REACTION_TYPES.DIFFUSION:
                this.animateDiffusion(beaker, position);
                break;
            case REACTION_TYPES.BUBBLE:
                this.animateBubbles(beaker, position);
                break;
            case REACTION_TYPES.STEAM:
                this.animateSteam(beaker, position);
                break;
            case REACTION_TYPES.STABLE:
                this.animateStable(beaker, position);
                break;
        }
    }

    animateExplosion(beaker, position) {
        // Flash effect
        if (beaker.liquidMesh) {
            const material = beaker.liquidMesh.material;
            const originalColor = material.uniforms.liquidColor.value.clone();

            // Glow animation
            const glowAnimation = { value: 0 };
            const animate = () => {
                glowAnimation.value += 0.05;
                const glow = Math.sin(glowAnimation.value * Math.PI * 2) * 0.5 + 0.5;
                material.uniforms.liquidColor.value.lerpColors(
                    originalColor,
                    new THREE.Color(0xffaa00),
                    glow * 0.7
                );

                if (glowAnimation.value < 3) {
                    requestAnimationFrame(animate);
                } else {
                    material.uniforms.liquidColor.value.copy(originalColor);
                }
            };
            animate();
        }

        // Particle burst
        this.createParticleExplosion(position, 0xff6600, 150);
    }

    animateDiffusion(beaker, position) {
        if (beaker.liquidMesh) {
            const material = beaker.liquidMesh.material;
            material.uniforms.bubbleIntensity.value = 0.3;

            setTimeout(() => {
                material.uniforms.bubbleIntensity.value = 0;
            }, 3000);
        }

        // Gentle color particles
        this.createParticleExplosion(position, beaker.liquidMesh.material.uniforms.liquidColor.value.getHex(), 50, 0.5);
    }

    animateBubbles(beaker, position) {
        if (beaker.liquidMesh) {
            const material = beaker.liquidMesh.material;
            material.uniforms.bubbleIntensity.value = 0.8;

            setTimeout(() => {
                material.uniforms.bubbleIntensity.value = 0;
            }, 3000);
        }

        // Rising bubbles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const bubblePos = position.clone();
                bubblePos.y += 0.3;
                bubblePos.x += (Math.random() - 0.5) * 0.3;
                bubblePos.z += (Math.random() - 0.5) * 0.3;
                this.createRisingBubble(bubblePos);
            }, i * 100);
        }
    }

    animateSteam(beaker, position) {
        // Steam particles rising
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const steamPos = position.clone();
                steamPos.y += 0.6;
                steamPos.x += (Math.random() - 0.5) * 0.2;
                steamPos.z += (Math.random() - 0.5) * 0.2;
                this.createSteamParticle(steamPos);
            }, i * 50);
        }
    }

    animateStable(beaker, position) {
        if (beaker.liquidMesh) {
            const material = beaker.liquidMesh.material;
            material.uniforms.bubbleIntensity.value = 0.1;

            setTimeout(() => {
                material.uniforms.bubbleIntensity.value = 0;
            }, 1500);
        }
    }

    createParticleExplosion(position, color, count, speed = 1.0) {
        const particles = new THREE.Group();
        const particleGeometry = new THREE.BufferGeometry();

        const positions = [];
        const velocities = [];
        const colors = [];
        const sizes = [];
        const lifetimes = [];

        const baseColor = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            // Position
            positions.push(position.x, position.y + 0.5, position.z);

            // Velocity
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const velocity = (Math.random() * 0.5 + 0.5) * speed;

            velocities.push(
                Math.sin(phi) * Math.cos(theta) * velocity,
                Math.abs(Math.cos(phi)) * velocity,
                Math.sin(phi) * Math.sin(theta) * velocity
            );

            // Color variation
            const particleColor = baseColor.clone();
            particleColor.offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2 - 0.1);
            colors.push(particleColor.r, particleColor.g, particleColor.b);

            // Size
            sizes.push(Math.random() * 20 + 10);

            // Lifetime
            lifetimes.push(1.0);
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        particleGeometry.setAttribute('particleColor', new THREE.Float32BufferAttribute(colors, 3));
        particleGeometry.setAttribute('particleSize', new THREE.Float32BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('particleLife', new THREE.Float32BufferAttribute(lifetimes, 1));

        const particleMaterial = new THREE.ShaderMaterial({
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            uniforms: {
                time: { value: 0 },
                size: { value: 1.0 }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particleSystem);

        // Animate particles
        const startTime = Date.now();
        const duration = 2000;

        const animateParticles = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.geometry.attributes.velocity.array;
            const lifetimes = particleSystem.geometry.attributes.particleLife.array;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;

                // Update position
                positions[i3] += velocities[i3] * 0.016;
                positions[i3 + 1] += velocities[i3 + 1] * 0.016;
                positions[i3 + 2] += velocities[i3 + 2] * 0.016;

                // Apply gravity
                velocities[i3 + 1] -= 0.01;

                // Update lifetime
                lifetimes[i] = 1 - progress;
            }

            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.geometry.attributes.particleLife.needsUpdate = true;

            if (progress < 1) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particleSystem);
                particleGeometry.dispose();
                particleMaterial.dispose();
            }
        };

        animateParticles();
    }

    createRisingBubble(position) {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            metalness: 0,
            roughness: 0,
            transmission: 0.9
        });

        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.copy(position);
        this.scene.add(bubble);

        const startY = position.y;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 2000;

            bubble.position.y = startY + progress * 2;
            bubble.position.x += Math.sin(elapsed * 0.005) * 0.002;
            bubble.position.z += Math.cos(elapsed * 0.005) * 0.002;

            material.opacity = 0.3 * (1 - progress);

            if (progress < 1 && bubble.position.y < 4) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(bubble);
                geometry.dispose();
                material.dispose();
            }
        };

        animate();
    }

    createSteamParticle(position) {
        const geometry = new THREE.PlaneGeometry(0.3, 0.3);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });

        const steam = new THREE.Mesh(geometry, material);
        steam.position.copy(position);
        this.scene.add(steam);

        const startY = position.y;
        const startTime = Date.now();
        const offsetX = (Math.random() - 0.5) * 0.001;
        const offsetZ = (Math.random() - 0.5) * 0.001;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 3000;

            steam.position.y = startY + progress * 2;
            steam.position.x += offsetX;
            steam.position.z += offsetZ;

            steam.scale.setScalar(1 + progress * 2);
            material.opacity = 0.5 * (1 - progress);

            steam.lookAt(this.camera.position);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(steam);
                geometry.dispose();
                material.dispose();
            }
        };

        animate();
    }

    checkStage1Completion() {
        if (this.completedReactions.length === MAX_BEAKERS) {
            setTimeout(() => this.transitionToStage2(), 1000);
        }
    }

    transitionToStage2() {
        const transitionScreen = document.getElementById('transition-screen');
        const message = document.getElementById('transition-message');

        message.textContent = 'Stage 1 Completed — Entering Distillation Lab...';
        transitionScreen.classList.add('active');

        setTimeout(() => {
            this.setupStage2();
            transitionScreen.classList.remove('active');
        }, 3000);
    }

    setupStage2() {
        this.currentStage = 2;

        // Clear Stage 1
        this.scene.children = this.scene.children.filter(child => {
            if (child.isLight || child.type === 'Fog') return true;
            if (child.geometry?.type === 'PlaneGeometry' && child.position.y < 0) return true;
            return false;
        });

        // Create distillation apparatus
        this.createDistillationApparatus();

        // Update UI
        document.getElementById('chemical-palette').style.display = 'none';
        this.createVialUI();

        this.updateUI();
        this.updateInstructions();

        // Adjust camera
        this.camera.position.set(0, 4, 10);
        this.controls.target.set(0, 2, 0);
        this.controls.update();
    }

    createDistillationApparatus() {
        const apparatus = new THREE.Group();

        // Central reaction flask (large sphere)
        const flaskGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const flaskMaterial = new THREE.ShaderMaterial({
            vertexShader: glassVertexShader,
            fragmentShader: glassFragmentShader,
            uniforms: {
                glassColor: { value: new THREE.Color(0xccffff) },
                glassOpacity: { value: 0.2 },
                refraction: { value: 0.98 }
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const centralFlask = new THREE.Mesh(flaskGeometry, flaskMaterial);
        centralFlask.position.y = 2;
        apparatus.add(centralFlask);

        this.centralFlask = centralFlask;
        this.centralFlaskLiquid = null;

        // Create 6 branching tubes
        this.distillationBranches = [];
        const angleStep = (Math.PI * 2) / 6;

        for (let i = 0; i < 6; i++) {
            const angle = i * angleStep;
            const x = Math.cos(angle) * 1.5;
            const z = Math.sin(angle) * 1.5;

            const branch = this.createDistillationBranch(x, z, angle);
            branch.userData.branchIndex = i;
            branch.userData.filled = false;
            apparatus.add(branch);
            this.distillationBranches.push(branch);
        }

        // Metallic stand
        const standGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 16);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });

        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const stand = new THREE.Mesh(standGeometry, standMaterial);
            stand.position.set(Math.cos(angle) * 0.9, 2, Math.sin(angle) * 0.9);
            stand.castShadow = true;
            apparatus.add(stand);
        }

        // Base ring
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.05, 16, 100);
        const ring = new THREE.Mesh(ringGeometry, standMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        ring.castShadow = true;
        apparatus.add(ring);

        this.scene.add(apparatus);
        this.apparatus = apparatus;
    }

    createDistillationBranch(x, z, angle) {
        const branch = new THREE.Group();

        // Vertical tube
        const tubeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 16, 1, true);
        const tubeMaterial = new THREE.ShaderMaterial({
            vertexShader: glassVertexShader,
            fragmentShader: glassFragmentShader,
            uniforms: {
                glassColor: { value: new THREE.Color(0xccffff) },
                glassOpacity: { value: 0.15 },
                refraction: { value: 0.98 }
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.position.set(x, 3, z);
        branch.add(tube);

        // Connection to center
        const connectionGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
        const connection = new THREE.Mesh(connectionGeometry, tubeMaterial.clone());
        connection.position.set(x * 0.5, 2.5, z * 0.5);
        connection.rotation.z = angle;
        connection.rotation.x = Math.PI / 2;
        branch.add(connection);

        // Spiral condenser (decorative rings)
        for (let i = 0; i < 5; i++) {
            const ringGeometry = new THREE.TorusGeometry(0.18, 0.02, 8, 16);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.6,
                roughness: 0.3
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, 2.5 + i * 0.3, z);
            ring.rotation.x = Math.PI / 2;
            branch.add(ring);
        }

        branch.userData.tubePosition = new THREE.Vector3(x, 3, z);

        return branch;
    }

    createVialUI() {
        const container = document.getElementById('vial-container');
        container.style.display = 'flex';
        container.innerHTML = '';

        this.completedReactions.forEach((reaction, index) => {
            const vial = document.createElement('div');
            vial.className = 'vial-slot';
            vial.dataset.index = index;
            vial.style.background = `linear-gradient(180deg,
                rgba(255,255,255,0.2),
                #${reaction.color.toString(16).padStart(6, '0')})`;

            const label = document.createElement('div');
            label.className = 'vial-label';
            label.textContent = `${reaction.type.toUpperCase()}`;
            vial.appendChild(label);

            vial.draggable = true;
            vial.addEventListener('dragstart', (e) => this.onVialDragStart(e, index));
            vial.addEventListener('dragend', (e) => this.onVialDragEnd(e));

            container.appendChild(vial);
        });
    }

    onVialDragStart(e, index) {
        e.dataTransfer.setData('vialIndex', index);
        e.target.classList.add('dragging');
        this.draggingVial = index;
    }

    onVialDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggingVial = null;
    }

    pourVialIntoBranch(vialIndex, branchIndex) {
        const reaction = this.completedReactions[vialIndex];
        const branch = this.distillationBranches[branchIndex];

        if (branch.userData.filled) return;

        branch.userData.filled = true;
        branch.userData.reaction = reaction;

        // Visual feedback in tube
        const tubePos = branch.userData.tubePosition;
        const liquidGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.5, 16);
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: reaction.color,
            transparent: true,
            opacity: 0.6,
            metalness: 0.1,
            roughness: 0.2
        });

        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.copy(tubePos);
        liquid.position.y -= 0.5;
        branch.add(liquid);

        // Localized reaction animation
        this.playBranchReaction(branch, reaction);

        // Remove vial from UI
        const vialElement = document.querySelector(`[data-index="${vialIndex}"]`);
        if (vialElement) {
            vialElement.classList.add('empty');
            vialElement.style.opacity = '0.2';
        }

        // Check if all branches filled
        const allFilled = this.distillationBranches.every(b => b.userData.filled);
        if (allFilled) {
            setTimeout(() => this.triggerFinalReaction(), 1000);
        }
    }

    playBranchReaction(branch, reaction) {
        const pos = branch.userData.tubePosition;

        switch (reaction.type) {
            case REACTION_TYPES.EXPLOSION:
                this.createParticleExplosion(pos, 0xff6600, 30, 0.5);
                break;
            case REACTION_TYPES.BUBBLE:
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => this.createRisingBubble(pos.clone()), i * 100);
                }
                break;
            case REACTION_TYPES.STEAM:
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const steamPos = pos.clone();
                        steamPos.y += 0.5;
                        this.createSteamParticle(steamPos);
                    }, i * 50);
                }
                break;
        }
    }

    triggerFinalReaction() {
        const reactions = this.distillationBranches.map(b => b.userData.reaction);

        // Count reaction types
        const typeCounts = {};
        reactions.forEach(r => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        });

        // Determine final outcome
        let finalReaction = '';

        if (typeCounts[REACTION_TYPES.EXPLOSION] >= 3) {
            finalReaction = 'MAJOR ENERGY BURST';
            this.animateMajorExplosion();
        } else if (typeCounts[REACTION_TYPES.DIFFUSION] === 6) {
            finalReaction = 'LAYERED CHROMATIC DISTILLATION';
            this.animateLayeredDistillation();
        } else if (typeCounts[REACTION_TYPES.STEAM] >= 2 && typeCounts[REACTION_TYPES.BUBBLE] >= 2) {
            finalReaction = 'OSCILLATING THERMAL REACTION';
            this.animateOscillatingReaction();
        } else if (typeCounts[REACTION_TYPES.STABLE] >= 1) {
            finalReaction = 'CRYSTAL FORMATION';
            this.animateCrystalFormation();
        } else if (reactions.every(r => r.type === reactions[0].type)) {
            finalReaction = 'REACTION FAILED - UNIFORM MIXTURE';
            this.animateFailure();
        } else {
            finalReaction = 'COMPLEX MIXTURE FORMED';
            this.animateMixedReaction();
        }

        // Show final result
        setTimeout(() => {
            const message = document.getElementById('transition-message');
            message.innerHTML = `<strong>FINAL OUTCOME:</strong><br>${finalReaction}`;
            document.getElementById('transition-screen').classList.add('active');
        }, 4000);
    }

    animateMajorExplosion() {
        const pos = new THREE.Vector3(0, 2, 0);

        // Multiple explosion waves
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticleExplosion(pos, 0xff3300, 200, 2.0);
            }, i * 200);
        }

        // Flash the central flask
        if (this.centralFlask) {
            const material = this.centralFlask.material;
            let flash = 0;
            const flashInterval = setInterval(() => {
                flash++;
                material.uniforms.glassColor.value.setHex(flash % 2 === 0 ? 0xffaa00 : 0xff3300);
                if (flash > 20) {
                    clearInterval(flashInterval);
                    material.uniforms.glassColor.value.setHex(0xccffff);
                }
            }, 100);
        }
    }

    animateLayeredDistillation() {
        // Create rainbow layers in central flask
        const layers = [
            0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff, 0x9900ff
        ];

        layers.forEach((color, i) => {
            setTimeout(() => {
                const geometry = new THREE.CylinderGeometry(0.75, 0.75, 0.2, 32);
                const material = new THREE.MeshPhysicalMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.5
                });
                const layer = new THREE.Mesh(geometry, material);
                layer.position.set(0, 1.5 + i * 0.15, 0);
                this.apparatus.add(layer);
            }, i * 300);
        });
    }

    animateOscillatingReaction() {
        const pos = new THREE.Vector3(0, 2, 0);

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                if (i % 2 === 0) {
                    this.createSteamParticle(pos.clone());
                } else {
                    this.createRisingBubble(pos.clone());
                }
            }, i * 100);
        }
    }

    animateCrystalFormation() {
        // Create geometric crystals
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const geometry = new THREE.OctahedronGeometry(0.1);
                const material = new THREE.MeshPhysicalMaterial({
                    color: 0x88ccff,
                    metalness: 0.3,
                    roughness: 0.1,
                    transparent: true,
                    opacity: 0.8
                });

                const crystal = new THREE.Mesh(geometry, material);
                const angle = (i / 12) * Math.PI * 2;
                crystal.position.set(
                    Math.cos(angle) * 0.4,
                    1.5 + Math.random() * 0.5,
                    Math.sin(angle) * 0.4
                );
                crystal.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                this.apparatus.add(crystal);

                // Grow animation
                crystal.scale.set(0, 0, 0);
                const startTime = Date.now();
                const animate = () => {
                    const progress = Math.min((Date.now() - startTime) / 1000, 1);
                    crystal.scale.setScalar(progress);
                    crystal.rotation.y += 0.01;
                    if (progress < 1) requestAnimationFrame(animate);
                };
                animate();
            }, i * 200);
        }
    }

    animateFailure() {
        // Gray puff
        const pos = new THREE.Vector3(0, 2, 0);
        this.createParticleExplosion(pos, 0x888888, 50, 0.3);
    }

    animateMixedReaction() {
        const pos = new THREE.Vector3(0, 2, 0);
        this.createParticleExplosion(pos, 0x00ff88, 100, 1.0);

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createRisingBubble(pos.clone());
            }, i * 100);
        }
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));

        // Drag and drop for Stage 2
        this.renderer.domElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.onCanvasDragOver(e);
        });

        this.renderer.domElement.addEventListener('drop', (e) => {
            e.preventDefault();
            this.onCanvasDrop(e);
        });
    }

    onCanvasClick(event) {
        if (this.currentStage !== 1) return;

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(obj => obj.userData.interactable),
            true
        );

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.beakerIndex !== undefined) {
                this.addChemicalToBeaker(object.userData.beakerIndex);
            }
        }
    }

    onCanvasMouseMove(event) {
        this.updateMousePosition(event);
    }

    onCanvasDragOver(event) {
        if (this.currentStage !== 2) return;
        this.updateMousePosition(event);
    }

    onCanvasDrop(event) {
        if (this.currentStage !== 2 || this.draggingVial === null) return;

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check which branch we're over
        const intersects = this.raycaster.intersectObjects(
            this.distillationBranches,
            true
        );

        if (intersects.length > 0) {
            let branch = intersects[0].object;
            while (branch.parent && branch.parent !== this.apparatus) {
                branch = branch.parent;
            }

            if (branch.userData.branchIndex !== undefined) {
                this.pourVialIntoBranch(this.draggingVial, branch.userData.branchIndex);
            }
        }
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    updateUI() {
        const title = document.getElementById('stage-title');

        if (this.currentStage === 1) {
            title.textContent = 'STAGE 1 — BEAKER LABORATORY';
            this.updateInstructions('Select a chemical and click on a beaker to add it');
        } else {
            title.textContent = 'STAGE 2 — DISTILLATION CHAMBER';
            this.updateInstructions('Drag vials from the left and drop them onto the glass tubes');
        }

        title.classList.add('visible');
    }

    updateInstructions(text = null) {
        const instructions = document.getElementById('instructions');

        if (text) {
            instructions.textContent = text;
            return;
        }

        if (this.currentStage === 1) {
            if (this.selectedChemical === null) {
                instructions.textContent = 'Select a chemical from the palette on the right';
            } else {
                const remaining = this.beakers.filter(b => b.substances.length < SUBSTANCES_PER_BEAKER).length;
                instructions.textContent = `Click on a beaker to add ${CHEMICALS[this.selectedChemical].name} • ${remaining} beakers available`;
            }
        } else {
            const remaining = this.distillationBranches.filter(b => !b.userData.filled).length;
            instructions.textContent = `Drag and drop vials into the distillation tubes • ${remaining} tubes remaining`;
        }
    }

    updateProgress() {
        const progress = document.getElementById('progress-indicator');

        if (this.currentStage === 1) {
            progress.textContent = `Completed: ${this.completedReactions.length} / ${MAX_BEAKERS}`;
        } else {
            const filled = this.distillationBranches.filter(b => b.userData.filled).length;
            progress.textContent = `Filled: ${filled} / 6`;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Update liquid shaders
        this.beakers.forEach(beaker => {
            if (beaker.liquidMesh && beaker.liquidMesh.material.uniforms) {
                beaker.liquidMesh.material.uniforms.time.value = time;
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    new ChemistryLab();
});
