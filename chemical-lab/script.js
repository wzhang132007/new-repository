// Chemical Laboratory Simulator - Main Script

// Game State
const gameState = {
    selectedChemical: null,
    beakers: {
        1: { substances: [], complete: false },
        2: { substances: [], complete: false },
        3: { substances: [], complete: false },
        4: { substances: [], complete: false },
        5: { substances: [], complete: false },
        6: { substances: [], complete: false }
    },
    scene: 1,
    pouredBeakers: [],
    completedBeakers: 0
};

// Chemical Colors Map
const chemicalColors = {
    yellow: { primary: '#FFD700', secondary: '#FFE066' },
    blue: { primary: '#0066CC', secondary: '#4DA6FF' },
    green: { primary: '#00CC00', secondary: '#66FF66' },
    purple: { primary: '#9933FF', secondary: '#CC99FF' },
    red: { primary: '#CC0000', secondary: '#FF6666' },
    orange: { primary: '#FF6600', secondary: '#FFB366' }
};

// Reaction Database - Different combinations create different reactions
const reactionDatabase = {
    // Explosion reactions
    'red-yellow-blue': { type: 'explosion', emoji: '💥', name: 'Explosive Mixture' },
    'red-red-red': { type: 'explosion', emoji: '🔥', name: 'Triple Fire' },
    'orange-red-yellow': { type: 'explosion', emoji: '💥', name: 'Combustion' },

    // Bubble reactions
    'blue-green-yellow': { type: 'bubbles', emoji: '🫧', name: 'Fizzy Solution' },
    'blue-blue-green': { type: 'bubbles', emoji: '💚', name: 'Ocean Bubbles' },
    'green-yellow-blue': { type: 'bubbles', emoji: '🫧', name: 'Foaming Agent' },

    // Steam/Gas reactions
    'purple-yellow-green': { type: 'steam', emoji: '💨', name: 'Toxic Gas' },
    'purple-purple-blue': { type: 'steam', emoji: '☁️', name: 'Purple Haze' },
    'green-green-green': { type: 'steam', emoji: '🌿', name: 'Herbal Vapor' },

    // Crystallization reactions
    'blue-purple-red': { type: 'crystal', emoji: '💎', name: 'Crystal Formation' },
    'yellow-purple-blue': { type: 'crystal', emoji: '✨', name: 'Sparkle Dust' },

    // Glow reactions
    'purple-green-yellow': { type: 'glow', emoji: '🌟', name: 'Bioluminescence' },
    'blue-yellow-purple': { type: 'glow', emoji: '✨', name: 'Glowing Mixture' },

    // Freeze reactions
    'blue-blue-blue': { type: 'freeze', emoji: '❄️', name: 'Deep Freeze' },
    'blue-purple-green': { type: 'freeze', emoji: '🧊', name: 'Ice Formation' },

    // Default reactions
    'default': { type: 'neutral', emoji: '⚗️', name: 'Stable Solution' }
};

// Final Reaction Combinations (based on all 6 beakers)
const finalReactions = {
    'all-explosions': { emoji: '💥💥💥', message: 'MEGA EXPLOSION! The lab shakes violently!', color: '#FF0000' },
    'all-bubbles': { emoji: '🫧🫧🫧', message: 'BUBBLE OVERFLOW! Foam everywhere!', color: '#4DA6FF' },
    'all-steam': { emoji: '💨💨💨', message: 'GAS CLOUD! The room fills with mysterious vapor!', color: '#9933FF' },
    'mixed': { emoji: '🎆', message: 'SPECTACULAR REACTION! A beautiful chemical display!', color: '#FFD700' },
    'stable': { emoji: '✅', message: 'PERFECTLY BALANCED! A safe and stable mixture!', color: '#00CC00' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateUI();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Chemical palette selection
    const chemicalItems = document.querySelectorAll('.chemical-item');
    chemicalItems.forEach(item => {
        item.addEventListener('click', () => selectChemical(item));
    });

    // Beaker clicks
    const beakers = document.querySelectorAll('.beaker');
    beakers.forEach(beaker => {
        beaker.addEventListener('click', () => {
            const beakerNum = beaker.getAttribute('data-beaker');
            addChemicalToBeaker(beakerNum);
        });
    });

    // Control buttons
    document.getElementById('clearBeaker').addEventListener('click', clearBeaker);
    document.getElementById('proceedScene2').addEventListener('click', () => switchScene(2));
    document.getElementById('backToScene1').addEventListener('click', () => switchScene(1));
    document.getElementById('resetLab').addEventListener('click', resetLaboratory);
    document.getElementById('triggerReaction').addEventListener('click', triggerFinalReaction);

    // Pour buttons
    const pourButtons = document.querySelectorAll('.pour-btn');
    pourButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const beakerNum = btn.getAttribute('data-beaker');
            pourBeaker(beakerNum, btn);
        });
    });
}

// Select a chemical from the palette
function selectChemical(item) {
    // Remove previous selection
    document.querySelectorAll('.chemical-item').forEach(el => {
        el.classList.remove('selected');
    });

    // Set new selection
    item.classList.add('selected');
    const color = item.getAttribute('data-color');
    gameState.selectedChemical = color;

    // Update UI
    document.getElementById('selectedChemical').textContent =
        color.charAt(0).toUpperCase() + color.slice(1);
    document.getElementById('selectedChemical').style.color = chemicalColors[color].primary;
}

// Add chemical to beaker
function addChemicalToBeaker(beakerNum) {
    if (!gameState.selectedChemical) {
        showNotification('Please select a chemical first!', 'warning');
        return;
    }

    const beaker = gameState.beakers[beakerNum];

    if (beaker.complete) {
        showNotification('This beaker is already full!', 'warning');
        return;
    }

    if (beaker.substances.length >= 3) {
        showNotification('This beaker is full!', 'warning');
        return;
    }

    // Add substance to beaker
    beaker.substances.push(gameState.selectedChemical);

    // Update visual
    updateBeakerVisual(beakerNum);

    // Check if beaker is complete
    if (beaker.substances.length === 3) {
        completeBeaker(beakerNum);
    }
}

// Update beaker visual representation
function updateBeakerVisual(beakerNum) {
    const beaker = gameState.beakers[beakerNum];
    const beakerElement = document.querySelector(`.beaker[data-beaker="${beakerNum}"]`);
    const layers = beakerElement.querySelectorAll('.liquid-layer');
    const statusElement = beakerElement.querySelector('.beaker-status');

    // Update each layer
    beaker.substances.forEach((substance, index) => {
        const layer = layers[index];
        layer.classList.add('active');
        const colors = chemicalColors[substance];
        layer.style.background = `linear-gradient(180deg, ${colors.secondary} 0%, ${colors.primary} 100%)`;
    });

    // Update status text
    statusElement.textContent = `${beaker.substances.length}/3`;
}

// Complete a beaker and trigger reaction
function completeBeaker(beakerNum) {
    const beaker = gameState.beakers[beakerNum];
    beaker.complete = true;
    gameState.completedBeakers++;

    // Get reaction
    const reaction = getReaction(beaker.substances);
    beaker.reaction = reaction;

    // Show reaction effect
    showReactionEffect(beakerNum, reaction);

    // Update progress
    updateProgress();

    // Show notification
    showNotification(`Beaker ${beakerNum} complete! ${reaction.name}`, 'success');

    // Mark beaker as complete
    const beakerElement = document.querySelector(`.beaker[data-beaker="${beakerNum}"]`);
    beakerElement.classList.add('complete');

    // Check if all beakers are complete
    if (gameState.completedBeakers === 6) {
        document.getElementById('proceedScene2').disabled = false;
        showNotification('All beakers complete! Transitioning to Scene 2 in 3 seconds...', 'success', 4000);

        // Auto transition to Scene 2 after 3 seconds
        setTimeout(() => {
            switchScene(2);
        }, 3000);
    }
}

// Get reaction based on substances
function getReaction(substances) {
    const key = substances.join('-');

    // Check for exact match
    if (reactionDatabase[key]) {
        return reactionDatabase[key];
    }

    // Check for permutations
    const sorted = substances.slice().sort().join('-');
    for (let dbKey in reactionDatabase) {
        const dbSorted = dbKey.split('-').sort().join('-');
        if (dbSorted === sorted) {
            return reactionDatabase[dbKey];
        }
    }

    // Return default
    return reactionDatabase['default'];
}

// Show reaction effect on beaker
function showReactionEffect(beakerNum, reaction) {
    const beakerElement = document.querySelector(`.beaker[data-beaker="${beakerNum}"]`);
    const effectElement = beakerElement.querySelector('.reaction-effect');
    const beakerGlass = beakerElement.querySelector('.beaker-glass');

    // Clear previous effects
    effectElement.innerHTML = '';
    effectElement.className = 'reaction-effect';

    // Create particles based on reaction type
    if (reaction.type === 'explosion') {
        createExplosionEffect(beakerGlass, effectElement);
    } else if (reaction.type === 'bubbles') {
        createBubblesEffect(beakerGlass, effectElement);
    } else if (reaction.type === 'steam') {
        createSteamEffect(beakerGlass, effectElement);
    } else if (reaction.type === 'glow') {
        createGlowEffect(beakerGlass, effectElement);
    } else if (reaction.type === 'freeze') {
        createFreezeEffect(beakerGlass, effectElement);
    } else {
        // Default emoji display for other types
        effectElement.textContent = reaction.emoji;
        effectElement.classList.add(`reaction-${reaction.type}`);
    }
}

// Create explosion effect with fire particles
function createExplosionEffect(container, effectElement) {
    let particleCount = 0;
    const maxParticles = 3; // Start with fewer particles

    const createFlame = () => {
        const flame = document.createElement('div');
        flame.className = 'flame-particle';
        flame.textContent = '🔥';
        flame.style.left = Math.random() * 70 + 15 + '%';
        flame.style.animationDelay = Math.random() * 0.3 + 's';
        flame.style.animationDuration = Math.random() * 1.5 + 2.5 + 's';
        flame.style.opacity = '0';
        effectElement.appendChild(flame);

        // Gradually fade in
        setTimeout(() => {
            flame.style.transition = 'opacity 0.5s ease-in';
            flame.style.opacity = '1';
        }, 50);

        setTimeout(() => flame.remove(), 4000);
    };

    // Gradually introduce flames
    let delay = 0;
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createFlame(), delay);
        delay += 300; // Stagger initial appearance
    }

    // Continue creating flames gradually
    const flameInterval = setInterval(() => {
        if (particleCount < 10) particleCount++;
        createFlame();
    }, 800);

    // Store interval to clear later if needed
    effectElement.flameInterval = flameInterval;
}

// Create bubbles effect
function createBubblesEffect(container, effectElement) {
    const maxParticles = 3; // Start with fewer particles

    const createBubble = () => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-particle';
        bubble.textContent = '○';
        const size = Math.random() * 15 + 10;
        bubble.style.fontSize = size + 'px';
        bubble.style.left = Math.random() * 80 + 10 + '%';
        bubble.style.animationDelay = Math.random() * 0.5 + 's';
        bubble.style.animationDuration = Math.random() * 2 + 2 + 's';
        bubble.style.opacity = '0';
        effectElement.appendChild(bubble);

        // Gradually fade in
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.5s ease-in';
            bubble.style.opacity = '1';
        }, 50);

        setTimeout(() => bubble.remove(), 4000);
    };

    // Gradually introduce bubbles
    let delay = 0;
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createBubble(), delay);
        delay += 300; // Stagger initial appearance
    }

    // Continue creating bubbles gradually
    const bubbleInterval = setInterval(() => {
        createBubble();
    }, 800);

    effectElement.bubbleInterval = bubbleInterval;
}

// Create steam/gas effect
function createSteamEffect(container, effectElement) {
    const maxParticles = 3; // Start with fewer particles

    const createSteam = () => {
        const steam = document.createElement('div');
        steam.className = 'steam-particle';
        steam.textContent = '💨';
        steam.style.left = Math.random() * 60 + 20 + '%';
        steam.style.animationDelay = Math.random() * 0.3 + 's';
        steam.style.animationDuration = Math.random() * 1.5 + 2 + 's';
        steam.style.opacity = '0';
        effectElement.appendChild(steam);

        // Gradually fade in
        setTimeout(() => {
            steam.style.transition = 'opacity 0.5s ease-in';
            steam.style.opacity = '1';
        }, 50);

        setTimeout(() => steam.remove(), 4000);
    };

    // Gradually introduce steam
    let delay = 0;
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createSteam(), delay);
        delay += 300; // Stagger initial appearance
    }

    // Continue creating steam gradually
    const steamInterval = setInterval(() => {
        createSteam();
    }, 800);

    effectElement.steamInterval = steamInterval;
}

// Create glow effect
function createGlowEffect(container, effectElement) {
    const maxParticles = 3; // Start with fewer particles

    const glow = document.createElement('div');
    glow.className = 'glow-particle';
    glow.textContent = '✨';
    glow.style.opacity = '0';
    effectElement.appendChild(glow);

    // Gradually fade in main glow
    setTimeout(() => {
        glow.style.transition = 'opacity 0.5s ease-in';
        glow.style.opacity = '1';
    }, 50);

    const createSparkle = () => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.textContent = '✨';
        sparkle.style.left = Math.random() * 80 + 10 + '%';
        sparkle.style.bottom = Math.random() * 60 + 20 + '%';
        sparkle.style.animationDelay = Math.random() * 0.5 + 's';
        sparkle.style.opacity = '0';
        effectElement.appendChild(sparkle);

        // Gradually fade in
        setTimeout(() => {
            sparkle.style.transition = 'opacity 0.5s ease-in';
            sparkle.style.opacity = '1';
        }, 50);

        setTimeout(() => sparkle.remove(), 2500);
    };

    // Gradually introduce sparkles
    let delay = 0;
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createSparkle(), delay);
        delay += 300; // Stagger initial appearance
    }

    // Continue creating sparkles gradually
    const sparkleInterval = setInterval(() => {
        createSparkle();
    }, 800);

    effectElement.sparkleInterval = sparkleInterval;
}

// Create freeze effect
function createFreezeEffect(container, effectElement) {
    const maxParticles = 3; // Start with fewer particles

    const createIce = () => {
        const ice = document.createElement('div');
        ice.className = 'ice-particle';
        ice.textContent = '❄️';
        ice.style.left = Math.random() * 80 + 10 + '%';
        ice.style.animationDelay = Math.random() * 0.5 + 's';
        ice.style.animationDuration = Math.random() * 1 + 2 + 's';
        ice.style.opacity = '0';
        effectElement.appendChild(ice);

        // Gradually fade in
        setTimeout(() => {
            ice.style.transition = 'opacity 0.5s ease-in';
            ice.style.opacity = '1';
        }, 50);

        setTimeout(() => ice.remove(), 3500);
    };

    // Gradually introduce ice crystals
    let delay = 0;
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createIce(), delay);
        delay += 300; // Stagger initial appearance
    }

    // Continue creating ice gradually
    const iceInterval = setInterval(() => {
        createIce();
    }, 800);

    effectElement.iceInterval = iceInterval;
}

// Clear selected beaker
function clearBeaker() {
    // Find a selected beaker or ask user to click one
    showNotification('Click on a beaker to clear it, or select a beaker first', 'info');

    // Add temporary click handler
    const beakers = document.querySelectorAll('.beaker');
    beakers.forEach(beaker => {
        beaker.style.cursor = 'pointer';
        beaker.style.transform = 'scale(1.05)';
    });

    const clearHandler = function(e) {
        const beakerElement = e.currentTarget;
        const beakerNum = beakerElement.getAttribute('data-beaker');

        // Clear beaker data
        gameState.beakers[beakerNum] = { substances: [], complete: false };

        if (gameState.beakers[beakerNum].complete) {
            gameState.completedBeakers--;
        }

        // Clear visual
        const layers = beakerElement.querySelectorAll('.liquid-layer');
        layers.forEach(layer => {
            layer.classList.remove('active');
            layer.style.background = 'transparent';
        });

        const statusElement = beakerElement.querySelector('.beaker-status');
        statusElement.textContent = '0/3';

        const effectElement = beakerElement.querySelector('.reaction-effect');

        // Clear all particle intervals
        if (effectElement.flameInterval) clearInterval(effectElement.flameInterval);
        if (effectElement.bubbleInterval) clearInterval(effectElement.bubbleInterval);
        if (effectElement.steamInterval) clearInterval(effectElement.steamInterval);
        if (effectElement.sparkleInterval) clearInterval(effectElement.sparkleInterval);
        if (effectElement.iceInterval) clearInterval(effectElement.iceInterval);

        effectElement.innerHTML = '';
        effectElement.className = 'reaction-effect';

        beakerElement.classList.remove('complete');

        // Remove handlers
        beakers.forEach(b => {
            b.removeEventListener('click', clearHandler);
            b.style.cursor = 'pointer';
            b.style.transform = '';
        });

        updateProgress();
        showNotification(`Beaker ${beakerNum} cleared!`, 'info');
    };

    beakers.forEach(beaker => {
        beaker.addEventListener('click', clearHandler, { once: true });
    });
}

// Update progress bar
function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const percentage = (gameState.completedBeakers / 6) * 100;

    progressFill.style.width = percentage + '%';
    progressText.textContent = `${gameState.completedBeakers}/6 Beakers Complete`;

    // Update proceed button
    if (gameState.completedBeakers === 6) {
        document.getElementById('proceedScene2').disabled = false;
    } else {
        document.getElementById('proceedScene2').disabled = true;
    }
}

// Switch between scenes
function switchScene(sceneNum) {
    if (sceneNum === 2 && gameState.completedBeakers < 6) {
        showNotification('Complete all 6 beakers first!', 'warning');
        return;
    }

    gameState.scene = sceneNum;

    const scene1 = document.getElementById('scene1');
    const scene2 = document.getElementById('scene2');

    if (sceneNum === 1) {
        // 3D transition from Scene 2 to Scene 1
        scene2.classList.add('exiting');
        setTimeout(() => {
            scene2.classList.remove('active', 'exiting');
            scene1.classList.add('active');
        }, 1200);
    } else {
        // 3D transition from Scene 1 to Scene 2
        scene1.classList.add('exiting');
        setTimeout(() => {
            scene1.classList.remove('active', 'exiting');
            scene2.classList.add('active');
            initializeScene2();
        }, 1200);
    }
}

// Initialize Scene 2
function initializeScene2() {
    gameState.pouredBeakers = [];
    updateScene2Progress();
}

// Pour beaker into distillation apparatus
function pourBeaker(beakerNum, btnElement) {
    if (gameState.pouredBeakers.includes(beakerNum)) {
        showNotification('This beaker has already been poured!', 'warning');
        return;
    }

    const beaker = gameState.beakers[beakerNum];
    if (!beaker.complete) {
        showNotification('This beaker is not complete!', 'warning');
        return;
    }

    // Add to poured list
    gameState.pouredBeakers.push(beakerNum);

    // Update branch visual
    updateBranchVisual(beakerNum, beaker);

    // Update button
    btnElement.disabled = true;
    btnElement.classList.add('poured');
    btnElement.textContent = `Beaker ${beakerNum} ✓`;

    // Update progress
    updateScene2Progress();

    showNotification(`Beaker ${beakerNum} poured! ${beaker.reaction.name}`, 'success');

    // Check if all poured
    if (gameState.pouredBeakers.length === 6) {
        document.getElementById('triggerReaction').disabled = false;
        showNotification('All beakers poured! Ready for final reaction!', 'success');
    }
}

// Update branch visual in distillation apparatus
function updateBranchVisual(beakerNum, beaker) {
    const branchFill = document.querySelector(`.branch-${beakerNum}`);

    // Calculate average color of the beaker
    const substances = beaker.substances;
    const avgColor = getAverageColor(substances);

    branchFill.setAttribute('fill', avgColor);
    branchFill.style.opacity = '0.8';

    // Animate
    branchFill.style.animation = 'fillUp 1s ease';
}

// Get average color from substances
function getAverageColor(substances) {
    if (substances.length === 0) return 'transparent';

    // Simple color mixing logic
    const lastSubstance = substances[substances.length - 1];
    return chemicalColors[lastSubstance].primary;
}

// Update Scene 2 progress
function updateScene2Progress() {
    const progressFill = document.querySelector('.progress-fill-scene2');
    const progressText = document.querySelector('.progress-text-scene2');
    const percentage = (gameState.pouredBeakers.length / 6) * 100;

    progressFill.style.width = percentage + '%';
    progressText.textContent = `${gameState.pouredBeakers.length}/6 Beakers Poured`;
}

// Trigger final reaction
function triggerFinalReaction() {
    if (gameState.pouredBeakers.length < 6) {
        showNotification('Pour all beakers first!', 'warning');
        return;
    }

    // Analyze all reactions
    const reactionTypes = [];
    for (let i = 1; i <= 6; i++) {
        reactionTypes.push(gameState.beakers[i].reaction.type);
    }

    // Determine final reaction
    const finalReaction = determineFinalReaction(reactionTypes);

    // Show final reaction
    showFinalReaction(finalReaction);

    // Update central liquid
    const centralLiquid = document.querySelector('.central-liquid');
    centralLiquid.setAttribute('fill', finalReaction.color);
    centralLiquid.style.opacity = '0.7';
}

// Determine final reaction based on all beaker reactions
function determineFinalReaction(reactionTypes) {
    const explosionCount = reactionTypes.filter(t => t === 'explosion').length;
    const bubbleCount = reactionTypes.filter(t => t === 'bubbles').length;
    const steamCount = reactionTypes.filter(t => t === 'steam').length;

    if (explosionCount >= 4) {
        return finalReactions['all-explosions'];
    } else if (bubbleCount >= 4) {
        return finalReactions['all-bubbles'];
    } else if (steamCount >= 4) {
        return finalReactions['all-steam'];
    } else if (explosionCount === 0 && bubbleCount === 0 && steamCount === 0) {
        return finalReactions['stable'];
    } else {
        return finalReactions['mixed'];
    }
}

// Show final reaction animation
function showFinalReaction(reaction) {
    const finalReactionElement = document.querySelector('.final-reaction');

    finalReactionElement.textContent = reaction.emoji;
    finalReactionElement.style.animation = 'explosion 2s ease-in-out';

    // Show message
    setTimeout(() => {
        showNotification(reaction.message, 'success', 5000);
    }, 500);

    // Confetti effect
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
            confetti.style.transition = 'all 3s ease-out';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.style.top = window.innerHeight + 'px';
                confetti.style.opacity = '0';
                confetti.style.transform = 'rotate(' + (Math.random() * 720) + 'deg)';
            }, 10);

            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Reset laboratory
function resetLaboratory() {
    if (!confirm('Are you sure you want to reset the entire laboratory?')) {
        return;
    }

    // Reset game state
    gameState.selectedChemical = null;
    gameState.completedBeakers = 0;
    gameState.pouredBeakers = [];

    for (let i = 1; i <= 6; i++) {
        gameState.beakers[i] = { substances: [], complete: false };
    }

    // Reset UI
    switchScene(1);

    // Clear all beakers
    document.querySelectorAll('.beaker').forEach(beaker => {
        const layers = beaker.querySelectorAll('.liquid-layer');
        layers.forEach(layer => {
            layer.classList.remove('active');
            layer.style.background = 'transparent';
        });

        const statusElement = beaker.querySelector('.beaker-status');
        statusElement.textContent = '0/3';

        const effectElement = beaker.querySelector('.reaction-effect');
        effectElement.textContent = '';
        effectElement.className = 'reaction-effect';

        beaker.classList.remove('complete');
    });

    // Reset selected chemical
    document.querySelectorAll('.chemical-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.getElementById('selectedChemical').textContent = 'None';

    // Reset buttons
    document.querySelectorAll('.pour-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('poured');
        const beakerNum = btn.getAttribute('data-beaker');
        btn.textContent = `Beaker ${beakerNum}`;
    });

    // Reset progress
    updateProgress();

    showNotification('Laboratory reset!', 'info');
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: bold;
        animation: slideDown 0.3s ease;
        max-width: 80%;
        text-align: center;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Update UI
function updateUI() {
    updateProgress();
}

// Add animations to style
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(styleSheet);
