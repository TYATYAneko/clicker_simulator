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

// ゲーム設定（バランス調整用の定数）
const GAME_CONFIG = {
    // アップグレードの基本コストとコスト倍率
    clickPower: { baseCost: 10, costMultiplier: 1.5 },
    superClickPower: { baseCost: 300, costMultiplier: 1.5 },
    autoClicker: { baseCost: 50, costMultiplier: 1.5 },
    superAutoClicker: { baseCost: 100, costMultiplier: 1.5 },
    hyperAutoClicker: { baseCost: 500, costMultiplier: 1.5 },
    // リボーン設定
    reborn: {
        baseCost: 1000000,
        costMultiplier: 2.5,
        multiplierBonus: 0.5  // リボーンごとに増える倍率
    }
};

// ゲームの状態（初期値はGAME_CONFIGから取得）
let gameState = {
    points: 0,
    clickPower: 1,
    clickPowerLevel: 0,
    clickPowerCost: GAME_CONFIG.clickPower.baseCost,
    superClickPower: 0,
    superClickPowerLevel: 0,
    superClickPowerCost: GAME_CONFIG.superClickPower.baseCost,
    autoClicker: 0,
    autoClickerLevel: 0,
    autoClickerCost: GAME_CONFIG.autoClicker.baseCost,
    superAutoClicker: 0,
    superAutoClickerLevel: 0,
    superAutoClickerCost: GAME_CONFIG.superAutoClicker.baseCost,
    hyperAutoClicker: 0,
    hyperAutoClickerLevel: 0,
    hyperAutoClickerCost: GAME_CONFIG.hyperAutoClicker.baseCost,
    // リボーン関連
    rebornCount: 0,
    clickMultiplier: 1,
    rebornCost: GAME_CONFIG.reborn.baseCost,
};

// DOM要素（後で初期化）
let elements = {};

// レベルからコストを計算
function calculateCost(baseCost, costMultiplier, level) {
    return Math.floor(baseCost * Math.pow(costMultiplier, level));
}

// リボーン回数から倍率を計算
function calculateMultiplier(rebornCount) {
    return 1 + (GAME_CONFIG.reborn.multiplierBonus * rebornCount);
}

// リボーン回数からリボーンコストを計算
function calculateRebornCost(rebornCount) {
    return Math.floor(GAME_CONFIG.reborn.baseCost * Math.pow(GAME_CONFIG.reborn.costMultiplier, rebornCount));
}

// ローカルストレージから読み込み
function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) {
        const loadedState = JSON.parse(saved);

        // レベルと回数のみをセーブデータから取得（旧変数名からの移行も対応）
        const clickPowerLevel = loadedState.clickPowerLevel ?? 0;
        const superClickPowerLevel = loadedState.superClickPowerLevel ?? 0;
        const autoClickerLevel = loadedState.autoClickerLevel ?? loadedState.autoGenLevel ?? 0;
        const superAutoClickerLevel = loadedState.superAutoClickerLevel ?? loadedState.autoClickerLevel ?? 0;
        const hyperAutoClickerLevel = loadedState.hyperAutoClickerLevel ?? loadedState.megaGenLevel ?? 0;
        const rebornCount = loadedState.rebornCount ?? 0;

        // コストと倍率は現在の設定から再計算
        gameState = {
            points: loadedState.points ?? 0,

            // クリックパワー
            clickPower: 1 + clickPowerLevel,  // 1 + レベル数
            clickPowerLevel: clickPowerLevel,
            clickPowerCost: calculateCost(GAME_CONFIG.clickPower.baseCost, GAME_CONFIG.clickPower.costMultiplier, clickPowerLevel),

            // スーパークリックパワー
            superClickPower: superClickPowerLevel * 5,  // レベル × 5
            superClickPowerLevel: superClickPowerLevel,
            superClickPowerCost: calculateCost(GAME_CONFIG.superClickPower.baseCost, GAME_CONFIG.superClickPower.costMultiplier, superClickPowerLevel),

            // 自動クリッカー（旧autoGenから移行）
            autoClicker: loadedState.autoClicker ?? loadedState.autoGen ?? autoClickerLevel,
            autoClickerLevel: autoClickerLevel,
            autoClickerCost: calculateCost(GAME_CONFIG.autoClicker.baseCost, GAME_CONFIG.autoClicker.costMultiplier, autoClickerLevel),

            // スーパー自動クリッカー（旧autoClickerから移行）
            superAutoClicker: loadedState.superAutoClicker ?? superAutoClickerLevel,
            superAutoClickerLevel: superAutoClickerLevel,
            superAutoClickerCost: calculateCost(GAME_CONFIG.superAutoClicker.baseCost, GAME_CONFIG.superAutoClicker.costMultiplier, superAutoClickerLevel),

            // ハイパー自動クリッカー（旧megaGenから移行）
            hyperAutoClicker: loadedState.hyperAutoClicker ?? loadedState.megaGen ?? hyperAutoClickerLevel,
            hyperAutoClickerLevel: hyperAutoClickerLevel,
            hyperAutoClickerCost: calculateCost(GAME_CONFIG.hyperAutoClicker.baseCost, GAME_CONFIG.hyperAutoClicker.costMultiplier, hyperAutoClickerLevel),

            // リボーン関連（回数から再計算）
            rebornCount: rebornCount,
            clickMultiplier: calculateMultiplier(rebornCount),
            rebornCost: calculateRebornCost(rebornCount),
        };
    }
}

// ローカルストレージに保存
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

// 実際のクリックパワーを計算（リボーンボーナス込み）
function getEffectiveClickPower() {
    let totalClickPower = gameState.clickPower + gameState.superClickPower;
    return totalClickPower * gameState.clickMultiplier;
}

// 数値を小数点第一位まで表示（整数の場合は.0を付ける）
function formatNumber(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// 表示を更新
function updateDisplay() {
    elements.points.textContent = Math.floor(gameState.points).toLocaleString();
    let effectiveClickPower = getEffectiveClickPower();
    elements.clickPower.textContent = formatNumber(effectiveClickPower);

    // リボーン回数を表示
    const rebornDisplay = document.getElementById('rebornCount');
    if (rebornDisplay) {
        rebornDisplay.textContent = gameState.rebornCount;
    }

    // 倍率を表示
    const multiplierDisplay = document.getElementById('multiplierDisplay');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = 'x' + gameState.clickMultiplier.toFixed(1);
    }

    // リボーンコストを表示
    const rebornCostDisplay = document.getElementById('rebornCost');
    if (rebornCostDisplay) {
        rebornCostDisplay.textContent = gameState.rebornCost.toLocaleString();
    }

    // 確認ボタンの状態を更新（モーダル内）
    const confirmBtn = document.getElementById('confirmReborn');
    if (confirmBtn) {
        confirmBtn.classList.toggle('insufficient', gameState.points < gameState.rebornCost);
    }

    // 毎秒の獲得量を計算（リボーン倍率適用）
    const perSecond = (gameState.autoClicker * 1 + gameState.superAutoClicker * 5 + gameState.hyperAutoClicker * 10) * gameState.clickMultiplier;
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
    elements.autoClickerLevel.textContent = gameState.autoClickerLevel;
    elements.autoClickerCost.textContent = gameState.autoClickerCost.toLocaleString();
    elements.buyAutoClicker.classList.toggle('insufficient', gameState.points < gameState.autoClickerCost);

    // スーパー自動クリッカー
    elements.superAutoClickerLevel.textContent = gameState.superAutoClickerLevel;
    elements.superAutoClickerCost.textContent = gameState.superAutoClickerCost.toLocaleString();
    elements.buySuperAutoClicker.classList.toggle('insufficient', gameState.points < gameState.superAutoClickerCost);

    // ハイパー自動クリッカー
    elements.hyperAutoClickerLevel.textContent = gameState.hyperAutoClickerLevel;
    elements.hyperAutoClickerCost.textContent = gameState.hyperAutoClickerCost.toLocaleString();
    elements.buyHyperAutoClicker.classList.toggle('insufficient', gameState.points < gameState.hyperAutoClickerCost);
}

// クリック処理の共通関数
function handleClick(x, y) {
    playClickSound();

    let effectiveClickPower = getEffectiveClickPower();
    gameState.points += effectiveClickPower;
    updateDisplay();

    // 浮遊テキストのみ表示（波紋エフェクトは削除して軽量化）
    showFloatingText('+' + formatNumber(effectiveClickPower), x, y);
}

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

// 購入成功アニメーション（CSSクラスで軽量化）
function purchaseAnimation(button) {
    button.classList.add('purchase-flash');
    setTimeout(() => {
        button.classList.remove('purchase-flash');
    }, 300);
}

// 次のリボーン倍率を計算（設定から取得）
function getNextMultiplier() {
    return gameState.clickMultiplier + GAME_CONFIG.reborn.multiplierBonus;
}

// アニメーションの初期化
function initializeAnimations() {
    if (typeof anime === 'undefined') {
        console.error('Anime.js is not loaded!');
        document.querySelectorAll('.logo-container, h1, .stats, .click-button, .upgrade-card').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

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

// ゲーム初期化（DOMが読み込まれた後に実行）
function initializeGame() {
    // DOM要素の取得
    elements = {
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
        autoClickerLevel: document.getElementById('autoClickerLevel'),
        autoClickerCost: document.getElementById('autoClickerCost'),
        buyAutoClicker: document.getElementById('buyAutoClicker'),

        // スーパー自動クリッカー
        superAutoClickerLevel: document.getElementById('superAutoClickerLevel'),
        superAutoClickerCost: document.getElementById('superAutoClickerCost'),
        buySuperAutoClicker: document.getElementById('buySuperAutoClicker'),

        // ハイパー自動クリッカー
        hyperAutoClickerLevel: document.getElementById('hyperAutoClickerLevel'),
        hyperAutoClickerCost: document.getElementById('hyperAutoClickerCost'),
        buyHyperAutoClicker: document.getElementById('buyHyperAutoClicker')
    };

    // リボーン関連のDOM要素
    const rebornModal = document.getElementById('rebornModal');
    const rebornButton = document.getElementById('rebornButton');
    const confirmReborn = document.getElementById('confirmReborn');
    const cancelReborn = document.getElementById('cancelReborn');

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

    // クリックパワー購入
    elements.buyClickPower.addEventListener('click', (e) => {
        if (gameState.points >= gameState.clickPowerCost) {
            gameState.points -= gameState.clickPowerCost;
            gameState.clickPowerLevel++;
            gameState.clickPower++;
            gameState.clickPowerCost = calculateCost(
                GAME_CONFIG.clickPower.baseCost,
                GAME_CONFIG.clickPower.costMultiplier,
                gameState.clickPowerLevel
            );
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
            gameState.superClickPower += 5;
            gameState.superClickPowerCost = calculateCost(
                GAME_CONFIG.superClickPower.baseCost,
                GAME_CONFIG.superClickPower.costMultiplier,
                gameState.superClickPowerLevel
            );
            updateDisplay();
            saveGame();

            playPurchaseSound();
            purchaseAnimation(e.currentTarget);
        } else {
            playErrorSound();
        }
    });

    // 自動クリッカー購入
    elements.buyAutoClicker.addEventListener('click', (e) => {
        if (gameState.points >= gameState.autoClickerCost) {
            gameState.points -= gameState.autoClickerCost;
            gameState.autoClickerLevel++;
            gameState.autoClicker++;
            gameState.autoClickerCost = calculateCost(
                GAME_CONFIG.autoClicker.baseCost,
                GAME_CONFIG.autoClicker.costMultiplier,
                gameState.autoClickerLevel
            );
            updateDisplay();
            saveGame();

            playPurchaseSound();
            purchaseAnimation(e.currentTarget);
        } else {
            playErrorSound();
        }
    });

    // スーパー自動クリッカー購入
    elements.buySuperAutoClicker.addEventListener('click', (e) => {
        if (gameState.points >= gameState.superAutoClickerCost) {
            gameState.points -= gameState.superAutoClickerCost;
            gameState.superAutoClickerLevel++;
            gameState.superAutoClicker++;  // 1レベルずつ増加（毎秒計算で×5される）
            gameState.superAutoClickerCost = calculateCost(
                GAME_CONFIG.superAutoClicker.baseCost,
                GAME_CONFIG.superAutoClicker.costMultiplier,
                gameState.superAutoClickerLevel
            );
            updateDisplay();
            saveGame();

            playPurchaseSound();
            purchaseAnimation(e.currentTarget);
        } else {
            playErrorSound();
        }
    });

    // ハイパー自動クリッカー購入
    elements.buyHyperAutoClicker.addEventListener('click', (e) => {
        if (gameState.points >= gameState.hyperAutoClickerCost) {
            gameState.points -= gameState.hyperAutoClickerCost;
            gameState.hyperAutoClickerLevel++;
            gameState.hyperAutoClicker++;
            gameState.hyperAutoClickerCost = calculateCost(
                GAME_CONFIG.hyperAutoClicker.baseCost,
                GAME_CONFIG.hyperAutoClicker.costMultiplier,
                gameState.hyperAutoClickerLevel
            );
            updateDisplay();
            saveGame();

            playPurchaseSound();
            purchaseAnimation(e.currentTarget);
        } else {
            playErrorSound();
        }
    });

    // モーダルを開く（常に開ける）
    rebornButton.addEventListener('click', () => {
        document.getElementById('currentMultiplier').textContent = 'x' + gameState.clickMultiplier.toFixed(1);
        document.getElementById('nextMultiplier').textContent = 'x' + getNextMultiplier().toFixed(1);
        document.getElementById('rebornCostModal').textContent = gameState.rebornCost.toLocaleString();

        // 確認ボタンの状態を更新
        const confirmBtn = document.getElementById('confirmReborn');
        confirmBtn.classList.toggle('insufficient', gameState.points < gameState.rebornCost);

        rebornModal.classList.add('show');
    });

    // リボーン実行
    confirmReborn.addEventListener('click', () => {
        if (gameState.points < gameState.rebornCost) {
            playErrorSound();
            return;
        }

        gameState.rebornCount++;
        gameState.clickMultiplier = calculateMultiplier(gameState.rebornCount);
        gameState.rebornCost = calculateRebornCost(gameState.rebornCount);

        // アップグレードとポイントをリセット（GAME_CONFIGから基本値を取得）
        gameState.points = 0;
        gameState.clickPower = 1;
        gameState.clickPowerLevel = 0;
        gameState.clickPowerCost = GAME_CONFIG.clickPower.baseCost;
        gameState.superClickPower = 0;
        gameState.superClickPowerLevel = 0;
        gameState.superClickPowerCost = GAME_CONFIG.superClickPower.baseCost;
        gameState.autoClicker = 0;
        gameState.autoClickerLevel = 0;
        gameState.autoClickerCost = GAME_CONFIG.autoClicker.baseCost;
        gameState.superAutoClicker = 0;
        gameState.superAutoClickerLevel = 0;
        gameState.superAutoClickerCost = GAME_CONFIG.superAutoClicker.baseCost;
        gameState.hyperAutoClicker = 0;
        gameState.hyperAutoClickerLevel = 0;
        gameState.hyperAutoClickerCost = GAME_CONFIG.hyperAutoClicker.baseCost;

        saveGame();
        updateDisplay();

        rebornModal.classList.remove('show');

        playPurchaseSound();
    });

    // キャンセル
    cancelReborn.addEventListener('click', () => {
        rebornModal.classList.remove('show');
    });

    // モーダル外クリックで閉じる
    rebornModal.addEventListener('click', (e) => {
        if (e.target === rebornModal) {
            rebornModal.classList.remove('show');
        }
    });

    // セーブデータ読み込み
    loadGame();
    updateDisplay();

    // 自動クリックループ（1秒ごと）
    setInterval(() => {
        const perSecond = (gameState.autoClicker * 1 + gameState.superAutoClicker * 5 + gameState.hyperAutoClicker * 10) * gameState.clickMultiplier;
        if (perSecond > 0) {
            gameState.points += perSecond;
            updateDisplay();
        }
    }, 1000);

    // 定期的に保存（10秒ごと - 軽量化）
    setInterval(saveGame, 10000);

    // アニメーションを実行
    setTimeout(initializeAnimations, 50);
}

// DOMが読み込まれたら初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
