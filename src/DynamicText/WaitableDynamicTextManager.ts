import { DynamicTextManager } from "./DynamicTextManager.js";
import { LoopManager } from "../LoopManager.js";

export class WaitableDynamicTextManager extends DynamicTextManager {
    private waitLoopManager: LoopManager = new LoopManager();
    private waitStringVisible: boolean = false;

    //待機設定
    private willWait: boolean = true;
    private waitString: string = "▼";
    private firstWaitStringVisible: boolean = true;

    /**
     * 初期設定
     * 個別の変更には影響を与えない
     */
    static override masterSetting = {
        writeFrequency: 50,
        rubyFastWriting: true,
        willWait: true,
        waitFrequency: 500,
        waitString: "▼",
        firstWaitStringVisible: true,
    };

    constructor(element?: HTMLElement | null, html?: string) {
        super(element, html);
        //待機状態の演出用
        this.waitLoopManager.addEvent(["loop"], () => {
            this.update();
        });

        //初期値の設定
        this.s$willWait = WaitableDynamicTextManager.masterSetting.willWait;
        this.s$waitFrequency = WaitableDynamicTextManager.masterSetting.waitFrequency;
        this.s$waitString = WaitableDynamicTextManager.masterSetting.waitString;
        this.s$firstWaitStringVisible = WaitableDynamicTextManager.masterSetting.firstWaitStringVisible;
    }

    /**
     * 表示処理中でなくて待機中でもないときtrue
     */
    override get g$isStopped(): boolean {
        return super.g$isStopped && !this.waitLoopManager.g$isLooping;
    }

    /**
     * 待機するかどうか
     */
    get g$willStandby(): boolean {
        return this.willWait;
    }

    /**
     * @param frequency 設定したい待機文字の更新頻度
     */
    set s$waitFrequency(frequency: number) {
        if (!Number.isSafeInteger(frequency) || frequency <= 0) {
            throw new Error("待機文字の表示頻度として不正な値が入力されました: " + frequency);
        }
        this.waitLoopManager.s$loopFrequency = frequency;
    }

    /**
     * @param visible 設定したい待機文字の最初の表示状態
     */
    set s$firstWaitStringVisible(visible: boolean) {
        if (this.g$hasStarted) {
            console.error("表示開始後に変更することはできません");
            return;
        }
        this.firstWaitStringVisible = visible;
    }

    /**
     * @param 設定したい待機文字
     */
    set s$waitString(string: string) {
        if (this.g$hasStarted) {
            console.error("表示開始後に変更することはできません");
            return;
        }
        this.waitString = string;
    }

    /**
     * @param willWait 待機するかどうか
     */
    set s$willWait(willWait: boolean) {
        if (this.g$hasStarted) {
            console.error("表示開始後に変更することはできません");
            return;
        }
        this.willWait = willWait;
    }

    override reset(): void {
        this.waitLoopManager.reset();
        this.waitStringVisible = false;
        super.reset();
    }

    override stop(): void {
        super.stop();
        this.waitLoopManager.stop();
    }

    override start(): void {
        super.start();
        if (this.g$hasFinished) {
            this.waitLoopManager.start();
        }
    }

    /**
     * 待機文字の更新
     */
    private update(): void {
        if (this.waitStringVisible) {
            this.g$element.innerHTML = this.g$element.innerHTML.slice(0, -this.waitString.length);
            this.waitStringVisible = false;
        } else {
            this.g$element.innerHTML = this.g$element.innerHTML + this.waitString;
            this.waitStringVisible = true;
        }
    }

    override finish(): void {
        if (this.g$hasFinished) {
            return;
        }
        super.finish();
        //待機状態を開始する
        if (this.willWait) {
            if (this.firstWaitStringVisible) {
                this.update();
            }
            this.waitLoopManager.start();
        }
    }
}
