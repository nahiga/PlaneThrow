document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Səhnə Tənzimləmələri
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x64B5F6); // Daha canlı səma rəngi
    scene.fog = new THREE.Fog(0x64B5F6, 50, 600); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // İşıq
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(100, 150, 50);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x707070));

    // 2. Ətraf Mühit (Environment & Flow)
    
    // Torpaq
    const groundGeo = new THREE.PlaneGeometry(4000, 4000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Çay (River Flow)
    const riverGeo = new THREE.PlaneGeometry(40, 4000);
    const riverMat = new THREE.MeshLambertMaterial({ color: 0x2980B9, transparent: true, opacity: 0.8 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-60, 0.1, -1500); // Sol tərəfdən axan çay
    scene.add(river);

    // Buludlar (Səmada asılı qalanlar)
    const clouds = [];
    const cloudGeo = new THREE.DodecahedronGeometry(8, 0);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 40; i++) {
        let cloud = new THREE.Mesh(cloudGeo, cloudMat);
        cloud.position.set((Math.random() - 0.5) * 400, 60 + Math.random() * 40, -Math.random() * 2000);
        cloud.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.5, 1 + Math.random());
        scene.add(cloud);
        clouds.push(cloud);
    }

    // Dekorativ Ağaclar (Low Poly Şam ağacları)
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.5, 3);
    const leavesGeo = new THREE.ConeGeometry(3, 8, 5);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });

    for (let i = 0; i < 300; i++) {
        let tree = new THREE.Group();
        let trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        let leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 6;
        tree.add(trunk);
        tree.add(leaves);
        
        let zPos = -Math.random() * 3000;
        let xPos = (Math.random() - 0.5) * 300;
        // Mərkəzi uçuş zolağını çox doldurmamaq üçün
        if (Math.abs(xPos) < 20) xPos += (xPos > 0 ? 30 : -30);
        
        tree.position.set(xPos, 0, zPos);
        scene.add(tree);
    }

    // Katapult
    const postGeo = new THREE.CylinderGeometry(0.4, 0.4, 6);
    const postMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-3, 3, 0);
    scene.add(leftPost);
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(3, 3, 0);
    scene.add(rightPost);

    // --- MANEƏLƏR (Seyrəldilmiş) ---
    const obstacles = [];
    const obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);

    const buildingGeo = new THREE.BoxGeometry(10, 120, 10); 
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0x7F8C8D });
    const wallGeo = new THREE.BoxGeometry(30, 60, 4); 
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xA0522D });
    const rockGeo = new THREE.DodecahedronGeometry(8, 0); 
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

    // Cəmi 100 maneə, daha geniş aralıqlarla
    for (let i = 0; i < 100; i++) {
        // Maneələr əvvəl 30 metrdən bir idi, indi 80-120 metr arası seyrəldilib
        let zPos = -200 - (i * 90) - (Math.random() * 40); 
        let xPos = (Math.random() - 0.5) * 120; 
        
        let type = Math.random();
        let obs;
        
        if (type < 0.33) {
            obs = new THREE.Mesh(buildingGeo, buildingMat);
            obs.position.set(xPos, 60, zPos); 
        } else if (type < 0.66) {
            obs = new THREE.Mesh(wallGeo, wallMat);
            obs.position.set(xPos, 30, zPos);
        } else {
            obs = new THREE.Mesh(rockGeo, rockMat);
            obs.position.set(xPos, 6, zPos);
            obs.rotation.set(Math.random(), Math.random(), Math.random());
        }
        
        obstacleGroup.add(obs);
        obstacles.push(obs);
    }

    // --- TƏYYARƏ (Plane) ---
    const planeGroup = new THREE.Group();
    planeGroup.position.set(0, 3.5, 0);
    scene.add(planeGroup);

    const planeGeo = new THREE.BoxGeometry(1.2, 1, 3.5);
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xD84315 });
    const body = new THREE.Mesh(planeGeo, planeMat);
    planeGroup.add(body);

    const wingGeo = new THREE.BoxGeometry(7, 0.1, 1.2);
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.visible = false; 
    planeGroup.add(wings);

    const tailGeo = new THREE.BoxGeometry(2.5, 0.1, 0.6);
    const tail = new THREE.Mesh(tailGeo, wingMat);
    tail.position.set(0, 0.5, 1.4);
    tail.visible = false;
    planeGroup.add(tail);
    
    const vTailGeo = new THREE.BoxGeometry(0.1, 1.2, 0.8);
    const vTail = new THREE.Mesh(vTailGeo, planeMat);
    vTail.position.set(0, 1, 1.3);
    vTail.visible = false;
    planeGroup.add(vTail);

    const engineGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6);
    const engineMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(0, 0, -1.8);
    engine.visible = false;
    planeGroup.add(engine);

    // Dəyişənlər
    let gameState = 'BUILD';
    let isDragging = false;
    let dragStartY = 0;
    let pullDistance = 0;
    let velocity = new THREE.Vector3(0, 0, 0);

    let totalMoney = 0;
    let upgrades = { wings: false, tail: false, engine: false };

    // YENİ FİZİKA
    let baseGravity = 0.035; // Sürət yavaşladığı üçün qravitasiyanı da bir az yumşaltdıq
    let currentGravity = baseGravity;
    let currentDrag = 0.985; 

    const keys = { a: false, d: false, w: false, s: false };
    window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

    // Atış (Daha Yavaş)
    document.getElementById('game-container').addEventListener('mousedown', (e) => {
        if (gameState === 'BUILD') {
            isDragging = true;
            dragStartY = e.clientY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging && gameState === 'BUILD') {
            let dy = e.clientY - dragStartY;
            pullDistance = Math.max(0, Math.min(dy * 0.06, 18)); 
            planeGroup.position.z = pullDistance;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging && gameState === 'BUILD') {
            isDragging = false;
            if (pullDistance > 2) {
                // ATIŞ GÜCÜ YAVAŞLADILDI (0.9-dan 0.55-ə salındı)
                velocity.z = -pullDistance * 0.55; 
                velocity.y = pullDistance * 0.06; 
                gameState = 'FLY';
            } else {
                planeGroup.position.z = 0; 
            }
        }
    });

    function endFlight(reason) {
        gameState = 'END';
        velocity.set(0, 0, 0);
        
        let distance = Math.abs(Math.floor(planeGroup.position.z));
        let earnedMoney = Math.floor(distance * 2); 
        totalMoney += earnedMoney;
        
        document.querySelector('#shop-panel h2').innerText = reason === 'CRASH' ? "Qəza Etdin!" : "Uçuş Bitdi!";
        document.getElementById('rewardText').innerText = distance;
        document.getElementById('earnedMoneyText').innerText = earnedMoney;
        document.getElementById('coinText').innerText = totalMoney;
        
        checkShopButtons();
        document.getElementById('shop-panel').classList.remove('hidden');
    }

    // Əsas Dövr
    function animate() {
        requestAnimationFrame(animate);

        // Buludları yavaşca hərəkət etdirək
        clouds.forEach(c => {
            c.position.z += 0.1;
            if (c.position.z > 100) c.position.z = -2000; // Ekrandan çıxanda geri qaytar
        });

        if (gameState === 'FLY') {
            velocity.y -= currentGravity;
            velocity.z *= currentDrag;
            velocity.x *= currentDrag;

            let turnSpeed = upgrades.tail ? 0.06 : 0.02;
            if (keys.a) velocity.x -= turnSpeed;
            if (keys.d) velocity.x += turnSpeed;
            
            let pitchSpeed = upgrades.wings ? 0.04 : 0.01;
            if (keys.w) velocity.y -= pitchSpeed; 
            if (keys.s) velocity.y += pitchSpeed; 

            if (upgrades.engine) {
                velocity.z -= 0.04; 
            }

            planeGroup.position.add(velocity);
            
            planeGroup.rotation.x = velocity.y * 0.5;
            planeGroup.rotation.z = -velocity.x * 0.6;

            const planeBox = new THREE.Box3().setFromObject(planeGroup);
            for (let obs of obstacles) {
                if (Math.abs(obs.position.z - planeGroup.position.z) < 25) { 
                    const obsBox = new THREE.Box3().setFromObject(obs);
                    if (planeBox.intersectsBox(obsBox)) {
                        endFlight('CRASH');
                        break;
                    }
                }
            }

            if (gameState === 'FLY' && planeGroup.position.y <= 0.6) {
                planeGroup.position.y = 0.6;
                endFlight('LANDING');
            }

            document.getElementById('distanceText').innerText = Math.abs(Math.floor(planeGroup.position.z));
        }

        camera.position.x = planeGroup.position.x;
        camera.position.y = planeGroup.position.y + 6;
        camera.position.z = planeGroup.position.z + 18; 
        camera.lookAt(planeGroup.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mağaza
    function checkShopButtons() {
        document.getElementById('upgradeWingsBtn').disabled = (totalMoney < 100);
        document.getElementById('upgradeTailBtn').disabled = (totalMoney < 300);
        document.getElementById('upgradeEngineBtn').disabled = (totalMoney < 800);
    }

    document.getElementById('upgradeWingsBtn').addEventListener('click', () => {
        if (totalMoney >= 100) {
            totalMoney -= 100;
            upgrades.wings = true;
            wings.visible = true; 
            currentGravity = baseGravity * 0.35; 
            currentDrag = 0.995;
            
            document.getElementById('coinText').innerText = totalMoney;
            document.getElementById('upgradeWingsBtn').classList.add('hidden');
            document.getElementById('upgradeTailBtn').classList.remove('hidden'); 
            checkShopButtons();
        }
    });

    document.getElementById('upgradeTailBtn').addEventListener('click', () => {
        if (totalMoney >= 300) {
            totalMoney -= 300;
            upgrades.tail = true;
            tail.visible = true;
            vTail.visible = true;
            
            document.getElementById('coinText').innerText = totalMoney;
            document.getElementById('upgradeTailBtn').classList.add('hidden');
            document.getElementById('upgradeEngineBtn').classList.remove('hidden');
            checkShopButtons();
        }
    });

    document.getElementById('upgradeEngineBtn').addEventListener('click', () => {
        if (totalMoney >= 800) {
            totalMoney -= 800;
            upgrades.engine = true;
            engine.visible = true;
            
            document.getElementById('coinText').innerText = totalMoney;
            document.getElementById('upgradeEngineBtn').classList.add('hidden');
        }
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        planeGroup.position.set(0, 3.5, 0);
        planeGroup.rotation.set(0, 0, 0);
        velocity.set(0, 0, 0);
        pullDistance = 0;
        
        document.getElementById('distanceText').innerText = '0';
        document.getElementById('shop-panel').classList.add('hidden');
        gameState = 'BUILD';
    });
});