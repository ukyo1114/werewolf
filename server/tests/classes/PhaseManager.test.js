const PhaseManager = require('../../classes/PhaseManager');
const { EventEmitter } = require('events');

// Jest のタイマーをモック
jest.useFakeTimers();

describe('PhaseManager クラスのテスト', () => {
  let phaseManager;
  let eventEmitter;
  let result;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    result = { value: 'running' };

    // メソッドの呼び出しを監視するためにスパイを設定
    jest.spyOn(PhaseManager.prototype, 'registerListeners');
    jest.spyOn(PhaseManager.prototype, 'startTimer');

    phaseManager = new PhaseManager(eventEmitter, result);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  // 1. constructor のテスト
  describe('constructor', () => {
    it('プロパティが正しく初期化されていること', () => {
      expect(phaseManager.currentDay).toBe(0);
      expect(phaseManager.currentPhase).toBe('pre');
      expect(phaseManager.changedAt).toBeInstanceOf(Date);
      expect(phaseManager.eventEmitter).toBe(eventEmitter);
      expect(phaseManager.result).toBe(result);
    });

    it('registerListeners と startTimer が呼び出されていること', () => {
      expect(PhaseManager.prototype.registerListeners).toHaveBeenCalledTimes(1);
      expect(PhaseManager.prototype.startTimer).toHaveBeenCalledTimes(1);
    });
  });

  // 2. registerListeners メソッドのテスト
  describe('registerListeners', () => {
    it('processCompleted イベントが発生した際に正しく処理されること', () => {
      const spyNextPhase = jest.spyOn(phaseManager, 'nextPhase');
      const spyStartTimer = jest.spyOn(phaseManager, 'startTimer');
      const spyEmit = jest.spyOn(eventEmitter, 'emit');

      // processCompleted イベントを発火
      eventEmitter.emit('processCompleted');

      expect(spyNextPhase).toHaveBeenCalledTimes(1);
      expect(spyStartTimer).toHaveBeenCalledTimes(2); // コンストラクタと合わせて2回
      expect(spyEmit).toHaveBeenCalledWith('phaseSwitched');
    });
  });

  // 3. startTimer メソッドのテスト
  describe('startTimer', () => {
    it('現在のフェーズに応じたタイマーが設定されること', () => {
      // コンストラクタでのタイマー設定をクリア
      jest.clearAllTimers();

      const spySetTimeout = jest.spyOn(global, 'setTimeout');
      const spyEmit = jest.spyOn(eventEmitter, 'emit');

      phaseManager.startTimer();

      const timerDuration =
        PhaseManager.phaseDurations[phaseManager.currentPhase] * 1000;

      expect(spySetTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        timerDuration
      );

      // タイマーを進める
      jest.advanceTimersByTime(timerDuration);

      expect(spyEmit).toHaveBeenCalledWith('timerEnd');

      spySetTimeout.mockRestore();
    });
  });

  // 4. nextPhase メソッドのテスト
  describe('nextPhase', () => {
    it('result.value が "running" でない場合、currentPhase が "finished" になること', () => {
      phaseManager.result.value = 'gameOver';
      phaseManager.currentPhase = 'day';

      phaseManager.nextPhase();

      expect(phaseManager.currentPhase).toBe('finished');
    });

    it('currentPhase が "day" の場合、"night" に変更されること', () => {
      phaseManager.currentPhase = 'day';

      phaseManager.nextPhase();

      expect(phaseManager.currentPhase).toBe('night');
    });

    it('currentPhase が "day" 以外の場合、currentDay が増加し、currentPhase が "day" になること', () => {
      phaseManager.currentPhase = 'night';
      phaseManager.currentDay = 1;

      phaseManager.nextPhase();

      expect(phaseManager.currentPhase).toBe('day');
      expect(phaseManager.currentDay).toBe(2);
    });

    it('changedAt が現在の日時に更新されること', () => {
      const before = phaseManager.changedAt;

      // タイマーを進めて時間を経過させる
      jest.advanceTimersByTime(1000);

      phaseManager.nextPhase();

      expect(phaseManager.changedAt).not.toEqual(before);
      expect(phaseManager.changedAt.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  // 5. フェーズの遷移に関する統合テスト
  describe('フェーズの遷移のテスト', () => {
    it('フェーズが正しく遷移すること', () => {
      expect(phaseManager.currentPhase).toBe('pre');
      expect(phaseManager.currentDay).toBe(0);

      // processCompleted イベントを発火してフェーズを進める
      eventEmitter.emit('processCompleted');

      expect(phaseManager.currentPhase).toBe('day');
      expect(phaseManager.currentDay).toBe(1);

      eventEmitter.emit('processCompleted');

      expect(phaseManager.currentPhase).toBe('night');
      expect(phaseManager.currentDay).toBe(1);

      eventEmitter.emit('processCompleted');

      expect(phaseManager.currentPhase).toBe('day');
      expect(phaseManager.currentDay).toBe(2);
    });

    it('result.value が "running" でない場合、フェーズが "finished" になること', () => {
      phaseManager.result.value = 'gameOver';

      eventEmitter.emit('processCompleted');

      expect(phaseManager.currentPhase).toBe('finished');
    });
  });
});
