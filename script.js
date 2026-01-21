// 効果音システム（オーディオプール使用で連続再生対応）
const POOL_SIZE = 3;  // 同時再生可能な数（軽量化のため削減）

// オーディオプールを作成
function createAudioPool(src, size) {
    const pool = [];
    for (let i = 0; i < size; i++) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0.5;
        pool.push(audio);
    }
    return pool;
}

// 各効果音のプール
const soundPools = {
    click: createAudioPool('SoundEffects/Click.mp3', POOL_SIZE),
    upgrade: createAudioPool('SoundEffects/Upgrade.mp3', 2),
    error: createAudioPool('SoundEffects/Error.mp3', 2)
};

// プール内のインデックス
const poolIndex = { click: 0, upgrade: 0, error: 0 };

// プールから音声を再生
function playFromPool(poolName) {
    const pool = soundPools[poolName];
    const audio = pool[poolIndex[poolName]];

    // 次のインデックスへ（ループ）
    poolIndex[poolName] = (poolIndex[poolName] + 1) % pool.length;

    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// クリック音を再生
function playClickSound() {
    playFromPool('click');
}

// 購入音を再生
function playPurchaseSound() {
    playFromPool('upgrade');
}

// 購入失敗音を再生
function playErrorSound() {
    playFromPool('error');
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
    playClickSound();

    let totalClickPower = gameState.clickPower + gameState.superClickPower;
    gameState.points += totalClickPower;
    updateDisplay();

    // 浮遊テキストのみ表示（波紋エフェクトは削除して軽量化）
    showFloatingText('+' + totalClickPower, x, y);
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

// 浮遊テキストを表示（CSSアニメーション使用で軽量化）
function showFloatingText(text, x, y) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.className = 'floating-text';
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';

    document.body.appendChild(floatingText);

    // アニメーション終了後に削除
    setTimeout(() => {
        floatingText.remove();
    }, 600);
}

// クリックパワー購入
elements.buyClickPower.addEventListener('click', (e) => {
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

// 購入成功アニメーション（CSSクラスで軽量化）
function purchaseAnimation(button) {
    button.classList.add('purchase-flash');
    setTimeout(() => {
        button.classList.remove('purchase-flash');
    }, 300);
}

// 自動クリックループ（1秒ごと）
setInterval(() => {
    const perSecond = gameState.autoGen + gameState.autoClicker * gameState.clickPower + gameState.megaGen * 10;
    if (perSecond > 0) {
        gameState.points += perSecond;
        updateDisplay();
    }
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

// 定期的に保存（10秒ごと - 軽量化）
setInterval(saveGame, 10000);
