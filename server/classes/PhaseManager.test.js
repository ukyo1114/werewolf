const EventEmitter = require('events');
const PhaseManager = require('./PhaseManager'); // あなたのPhaseManagerクラスのパスに変更

describe('PhaseManager', () => {
  let eventEmitter;
  let phaseManager;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    phaseManager = new PhaseManager(eventEmitter);
    
    // Jestのモックタイマーを使って時間制御
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('should start with the "pre" phase', () => {
    expect(phaseManager.currentPhase).toBe('pre');
  });

  test('should switch to "day" after "pre"', () => {
    phaseManager.startTimer();

    // タイマーを進める
    jest.runOnlyPendingTimers();

    expect(phaseManager.currentPhase).toBe('day');
  });

  test('should switch to "night" after "day"', () => {
    // 初期状態は "pre"
    phaseManager.currentPhase = 'day';
    phaseManager.startTimer();

    // タイマーを進める
    jest.runOnlyPendingTimers();

    expect(phaseManager.currentPhase).toBe('night');
  });

  test('should emit events for each phase', () => {
    const dayListener = jest.fn();
    const nightListener = jest.fn();

    eventEmitter.on('day', dayListener);
    eventEmitter.on('night', nightListener);

    // "pre" フェーズからタイマー開始
    phaseManager.currentPhase = 'pre';
    phaseManager.startTimer();
    jest.runOnlyPendingTimers(); // "pre" -> "day" へ

    // "day" フェーズに移行したら、リスナーが呼ばれるかを確認
    expect(dayListener).toHaveBeenCalledTimes(1);

    // "day" -> "night" へ移行
    phaseManager.currentPhase = 'day';
    phaseManager.startTimer();
    jest.runOnlyPendingTimers(); // "day" -> "night" へ

    // "night" フェーズに移行したら、リスナーが呼ばれるかを確認
    expect(nightListener).toHaveBeenCalledTimes(1);
  });

  test('should end the game when result is not "running"', () => {
    // 終了条件テスト
    eventEmitter.on('day', (data, callback) => {
      callback('finished'); // "finished" のシグナルを送る
    });

    phaseManager.currentPhase = 'pre';
    phaseManager.startTimer();
    jest.runOnlyPendingTimers(); // "pre" -> "day" へ

    // "finished" フェーズになっていることを確認
    expect(phaseManager.currentPhase).toBe('finished');
  });
});
