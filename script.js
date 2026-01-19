// 効果音システム（音声ファイル使用）
const sounds = {
    click: new Audio('SoundEffects/Click.mp3'),
    upgrade: new Audio('SoundEffects/Upgrade.mp3'),
    error: new Audio('SoundEffects/Error.mp3')
};

// 音声ファイルをプリロード
sounds.click.preload = 'auto';
sounds.upgrade.preload = 'auto';
sounds.error.preload = 'auto';

// 効果音を初期化（音量設定など）
function initAudio() {
    sounds.click.volume = 0.5;
    sounds.upgrade.volume = 0.5;
    sounds.error.volume = 0.5;
}

// クリック音を再生
function playClickSound() {
    sounds.click.currentTime = 0;  // 最初から再生
    sounds.click.play().catch(e => console.log('Click sound error:', e));
}

// 購入音を再生
function playPurchaseSound() {
    sounds.upgrade.currentTime = 0;  // 最初から再生
    sounds.upgrade.play().catch(e => console.log('Upgrade sound error:', e));
}

// 購入失敗音を再生
function playErrorSound() {
    sounds.error.currentTime = 0;  // 最初から再生
    sounds.error.play().catch(e => console.log('Error sound error:', e));
}

// ゲームの状態
let gameState = {
    points: 0,
    clickPower: 1,
    clickPowerLevel: 0,
    clickPowerCost: 10,
    superClickPower: 0,
    superClickPowerLevel: 0,
    superClickPowerCost: 300,
    autoGen: 0,
    autoGenLevel: 0,
    autoGenCost: 50,
    autoClicker: 0,
    autoClickerLevel: 0,
    autoClickerCost: 100,
    megaGen: 0,
    megaGenLevel: 0,
    megaGenCost: 500,
};

// DOM要素の取得
const elements = {
    points: document.getElementById('points'),
    perSecond: document.getElementById('perSecond'),
    clickPower: document.getElementById('clickPower'),
    clickButton: document.getElementById('clickButton'),

    // クリックパワー
    clickPowerLevel: document.getElementById('clickPowerLevel'),
    clickPowerCost: document.getElementById('clickPowerCost'),
    buyClickPower: document.getElementById('buyClickPower'),

    // スーパークリックパワー
    superClickPowerLevel: document.getElementById('superClickPowerLevel'),
    superClickPowerCost: document.getElementById('superClickPowerCost'),
    buySuperClickPower: document.getElementById('buySuperClickPower'),

    // 自動クリッカー
    autoGenLevel: document.getElementById('autoGenLevel'),
    autoGenCost: document.getElementById('autoGenCost'),
    buyAutoGen: document.getElementById('buyAutoGen'),

    // スーパー自動クリッカー
    autoClickerLevel: document.getElementById('autoClickerLevel'),
    autoClickerCost: document.getElementById('autoClickerCost'),
    buyAutoClicker: document.getElementById('buyAutoClicker'),

    // ハイパー自動クリッカー
    megaGenLevel: document.getElementById('megaGenLevel'),
    megaGenCost: document.getElementById('megaGenCost'),
    buyMegaGen: document.getElementById('buyMegaGen')
};

// ローカルストレージから読み込み
function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) {
        const loadedState = JSON.parse(saved);
        // 新しい項目がない場合はデフォルト値を使用（後から追加された項目に対応）
        gameState = {
            points: loadedState.points ?? 0,
            clickPower: loadedState.clickPower ?? 1,
            clickPowerLevel: loadedState.clickPowerLevel ?? 0,
            clickPowerCost: loadedState.clickPowerCost ?? 10,
            superClickPower: loadedState.superClickPower ?? 0,
            superClickPowerLevel: loadedState.superClickPowerLevel ?? 0,
            superClickPowerCost: loadedState.superClickPowerCost ?? 300,
            autoGen: loadedState.autoGen ?? 0,
            autoGenLevel: loadedState.autoGenLevel ?? 0,
            autoGenCost: loadedState.autoGenCost ?? 50,
            autoClicker: loadedState.autoClicker ?? 0,
            autoClickerLevel: loadedState.autoClickerLevel ?? 0,
            autoClickerCost: loadedState.autoClickerCost ?? 100,
            megaGen: loadedState.megaGen ?? 0,
            megaGenLevel: loadedState.megaGenLevel ?? 0,
            megaGenCost: loadedState.megaGenCost ?? 500,
        };
        updateDisplay();
    }
}

// ローカルストレージに保存
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

// 表示を更新
function updateDisplay() {
    elements.points.textContent = Math.floor(gameState.points).toLocaleString();
    let totalClickPower = gameState.clickPower + gameState.superClickPower;
    elements.clickPower.textContent = totalClickPower;

    const perSecond = gameState.autoGen + gameState.autoClicker * gameState.clickPower + gameState.megaGen * 10;
    elements.perSecond.textContent = perSecond.toFixed(1);

    // クリックパワー
    elements.clickPowerLevel.textContent = gameState.clickPowerLevel;
    elements.clickPowerCost.textContent = gameState.clickPowerCost.toLocaleString();
    elements.buyClickPower.classList.toggle('insufficient', gameState.points < gameState.clickPowerCost);

    // スーパークリックパワー
    elements.superClickPowerLevel.textContent = gameState.superClickPowerLevel;
    elements.superClickPowerCost.textContent = gameState.superClickPowerCost.toLocaleString();
    elements.buySuperClickPower.classList.toggle('insufficient', gameState.points < gameState.superClickPowerCost);

     // 自動クリッカー
    elements.autoGenLevel.textContent = gameState.autoGenLevel;
    elements.autoGenCost.textContent = gameState.autoGenCost.toLocaleString();
    elements.buyAutoGen.classList.toggle('insufficient', gameState.points < gameState.autoGenCost);

    // スーパー自動クリッカー
    elements.autoClickerLevel.textContent = gameState.autoClickerLevel;
    elements.autoClickerCost.textContent = gameState.autoClickerCost.toLocaleString();
    elements.buyAutoClicker.classList.toggle('insufficient', gameState.points < gameState.autoClickerCost);

    // ハイパー自動クリッカー
    elements.megaGenLevel.textContent = gameState.megaGenLevel;
    elements.megaGenCost.textContent = gameState.megaGenCost.toLocaleString();
    elements.buyMegaGen.classList.toggle('insufficient', gameState.points < gameState.megaGenCost);
}

// クリック処理の共通関数
function handleClick(x, y) {
    // 効果音を初期化＆再生
    initAudio();
    playClickSound();

    let totalClickPower = gameState.clickPower + gameState.superClickPower;
    gameState.points += totalClickPower;
    updateDisplay();
    saveGame();

    // ボタンのパルスアニメーション
    anime({
        targets: elements.clickButton,
        scale: [1, 0.9, 1.1, 1],
        duration: 300,
        easing: 'easeOutElastic(1, .5)'
    });

    // クリックアニメーション（位置情報付き）
    const fakeEvent = { clientX: x, clientY: y };
    showFloatingText('+' + totalClickPower, fakeEvent);

    // 波紋エフェクト
    createRipple(fakeEvent);
}

// PC用クリック処理
elements.clickButton.addEventListener('click', (e) => {
    // タッチデバイスの場合はtouchstartで処理するのでスキップ
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) {
        return;
    }
    handleClick(e.clientX, e.clientY);
});

// スマホ用マルチタッチ処理
elements.clickButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // デフォルトの動作を防ぐ

    // 全てのタッチポイントに対してクリック処理を実行
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handleClick(touch.clientX, touch.clientY);
    }
}, { passive: false });

// 浮遊テキストを表示
function showFloatingText(text, event) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.className = 'floating-text';
    floatingText.style.position = 'fixed';

    // クリック位置を取得
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;

    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    floatingText.style.transform = 'translate(-50%, -50%)';
    floatingText.style.color = 'white';
    floatingText.style.fontSize = '2em';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.pointerEvents = 'none';
    floatingText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    floatingText.style.opacity = '0';
    floatingText.style.zIndex = '1000';

    document.body.appendChild(floatingText);

    // アニメーション
    anime({
        targets: floatingText,
        translateY: -100,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1],
        rotate: () => anime.random(-15, 15),
        duration: 1500,
        easing: 'easeOutExpo',
        complete: () => {
            document.body.removeChild(floatingText);
        }
    });
}

// 波紋エフェクトを作成
function createRipple(event) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.position = 'fixed';

    const x = event.clientX;
    const y = event.clientY;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '3px solid rgba(255, 255, 255, 0.8)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '999';

    document.body.appendChild(ripple);

    // 波紋アニメーション
    anime({
        targets: ripple,
        scale: [1, 15],
        opacity: [1, 0],
        duration: 800,
        easing: 'easeOutExpo',
        complete: () => {
            document.body.removeChild(ripple);
        }
    });
}

// クリックパワー購入
elements.buyClickPower.addEventListener('click', (e) => {
    initAudio();
    if (gameState.points >= gameState.clickPowerCost) {
        gameState.points -= gameState.clickPowerCost;
        gameState.clickPowerLevel++;
        gameState.clickPower++;
        gameState.clickPowerCost = Math.floor(gameState.clickPowerCost * 1.5);
        updateDisplay();
        saveGame();

        playPurchaseSound();
        purchaseAnimation(e.currentTarget);
    } else {
        playErrorSound();
    }
});

// スーパークリックパワー購入
elements.buySuperClickPower.addEventListener('click', (e) => {
    initAudio();
    if (gameState.points >= gameState.superClickPowerCost) {
        gameState.points -= gameState.superClickPowerCost;
        gameState.superClickPowerLevel++;
        gameState.superClickPower += 5;  // +5 クリックパワー
        gameState.superClickPowerCost = Math.floor(gameState.superClickPowerCost * 1.5);
        updateDisplay();
        saveGame();

        playPurchaseSound();
        purchaseAnimation(e.currentTarget);
    } else {
        playErrorSound();
    }
});

// 自動クリッカー購入
elements.buyAutoGen.addEventListener('click', (e) => {
    initAudio();
    if (gameState.points >= gameState.autoGenCost) {
        gameState.points -= gameState.autoGenCost;
        gameState.autoGenLevel++;
        gameState.autoGen++;
        gameState.autoGenCost = Math.floor(gameState.autoGenCost * 1.5);
        updateDisplay();
        saveGame();

        playPurchaseSound();
        purchaseAnimation(e.currentTarget);
    } else {
        playErrorSound();
    }
});

// スーパー自動クリッカー購入
elements.buyAutoClicker.addEventListener('click', (e) => {
    initAudio();
    if (gameState.points >= gameState.autoClickerCost) {
        gameState.points -= gameState.autoClickerCost;
        gameState.autoClickerLevel++;
        gameState.autoClicker++;
        gameState.autoClickerCost = Math.floor(gameState.autoClickerCost * 1.5);
        updateDisplay();
        saveGame();

        playPurchaseSound();
        purchaseAnimation(e.currentTarget);
    } else {
        playErrorSound();
    }
});

// ハイパー自動クリッカー購入
elements.buyMegaGen.addEventListener('click', (e) => {
    initAudio();
    if (gameState.points >= gameState.megaGenCost) {
        gameState.points -= gameState.megaGenCost;
        gameState.megaGenLevel++;
        gameState.megaGen++;
        gameState.megaGenCost = Math.floor(gameState.megaGenCost * 1.5);
        updateDisplay();
        saveGame();

        playPurchaseSound();
        purchaseAnimation(e.currentTarget);
    } else {
        playErrorSound();
    }
});

// 購入成功アニメーション
function purchaseAnimation(button) {
    // ボタンのフラッシュアニメーション
    anime({
        targets: button,
        scale: [1, 1.1, 1],
        backgroundColor: ['#667eea', '#4ade80', '#667eea'],
        duration: 500,
        easing: 'easeInOutQuad'
    });

    // キラキラエフェクト
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkle(button);
        }, i * 50);
    }
}

// キラキラエフェクトを作成
function createSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.position = 'fixed';

    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = '1.5em';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '1001';

    document.body.appendChild(sparkle);

    // ランダムな方向に飛ばす
    const angle = anime.random(0, 360);
    const distance = anime.random(50, 100);
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;

    anime({
        targets: sparkle,
        translateX: tx,
        translateY: ty,
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: anime.random(-180, 180),
        duration: 1000,
        easing: 'easeOutExpo',
        complete: () => {
            document.body.removeChild(sparkle);
        }
    });
}

// 自動クリックループ（1秒ごと）
setInterval(() => {
    const perSecond = gameState.autoGen + gameState.autoClicker * gameState.clickPower + gameState.megaGen * 10;
    gameState.points += perSecond;
    updateDisplay();
    saveGame();
}, 1000);

// 初期化
loadGame();
updateDisplay();

// アニメーションの初期化
function initializeAnimations() {
    // Anime.jsが読み込まれているか確認
    if (typeof anime === 'undefined') {
        console.error('Anime.js is not loaded!');
        // アニメーションなしで即座に表示
        document.querySelectorAll('.logo-container, h1, .stats, .click-button, .upgrade-card').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

    // ロゴクリックでバウンスアニメーション
    const logo = document.querySelector('.game-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            anime({
                targets: logo,
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                duration: 800,
                easing: 'easeInOutQuad'
            });
        });
    }

    // ページ読み込み時のアニメーション
    anime({
        targets: '.logo-container',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
    });

    anime({
        targets: 'h1',
        scale: [0.5, 1],
        opacity: [0, 1],
        duration: 800,
        delay: 200,
        easing: 'easeOutBack'
    });

    anime({
        targets: '.stats',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 400,
        easing: 'easeOutExpo'
    });

    anime({
        targets: '.click-button',
        scale: [0, 1],
        opacity: [0, 1],
        duration: 1000,
        delay: 600,
        easing: 'easeOutElastic(1, .6)'
    });

    anime({
        targets: '.upgrade-card',
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(100, {start: 800}),
        easing: 'easeOutExpo'
    });
}

// アニメーションを実行（少し遅延させて確実に実行）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
    // DOMが既に読み込まれている場合は即座に実行
    setTimeout(initializeAnimations, 50);
}

// 定期的に保存（5秒ごと）
setInterval(saveGame, 5000);
