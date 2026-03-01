import { EventManager } from "../EventManager.js";
import { WaitableDynamicTextManager } from "./WaitableDynamicTextManager.js";

/**
 * Speechの配列を読みこみ、順番に表示する
 */
export class TalkPanel extends WaitableDynamicTextManager {
    private namePanel: HTMLElement;
    private talk: Speech[] = [];
    private talkIndex: number = -1;
    private talkFinished: boolean = false;

    //イベントリスナー
    /**
     * @param write 次の文字が表示されるとき
     * @param finish 現在のSpeechの表示が終了したとき
     * @param displayNextSpeech 次のSpeechの表示が開始されたとき
     * @param resetTalk 表示状態がすべてリセットされたとき
     * @param finishTalk talkをすべて表示終了したとき
     */
    override readonly eventClassNames: string[] = ["write", "finish", "displayNextSpeech", "resetTalk", "finishTalk"];

    constructor(element?: HTMLElement, namePanel?: HTMLElement) {
        super(element);
        this.g$element.classList.add("talkPanel");
        this.g$element.style.display = "none";

        //namePanelの登録
        if (namePanel) {
            this.namePanel = namePanel;
        } else {
            this.namePanel = document.createElement("div");
        }
        this.namePanel.style.opacity = "0";
        this.namePanel.style.display = "none";
        this.namePanel.classList.add("namePanel");

        //clickまたはキーボードによる操作の受付
        const proceed = () => {
            if (this.g$hasFinishedTalk && !this.g$hasStarted) {
                return;
            }
            if (this.g$isStopped) {
                return;
            }
            if (this.g$hasFinished) {
                this.displayNextSpeech();
            } else {
                this.finish();
            }
        };

        this.g$element.addEventListener("click", () => {
            proceed();
        });
    }

    /**
     * 名前を表示する用の要素
     */
    get g$namePanel(): HTMLElement {
        return this.namePanel;
    }

    /**
     * talkが終了したか
     */
    get g$hasFinishedTalk(): boolean {
        return this.talkFinished;
    }

    /**
     * 表示されているtalkのindex　まだ表示が開始されていない場合は-1
     */
    get g$talkIndex(): number {
        return this.talkIndex;
    }

    /**
     * Speechの配列であるtalkを設定する
     * @param talk 設定したいspeechの配列
     */
    set s$talk(talk: Speech[]) {
        if (super.g$hasStarted) {
            throw new Error("すでにtalkを開始しているため変更できません");
        }
        this.talk = talk;
    }

    /**
     * @param namePanel namePanelとして使用したい要素
     */
    set s$namePanel(namePanel: HTMLElement) {
        if (super.g$hasStarted) {
            throw new Error("すでにtalkを開始しているため変更できません");
        }
        this.namePanel = namePanel;
    }

    override start(): void {
        super.start();
    }

    override stop(): void {
        super.stop();
    }

    pushTalk(talk: Speech[]) {
        if (this.talkFinished) {
            console.error("talkを終わってからの追加はできません");
            return;
        }
        this.talk.push(...talk);
    }

    /**
     * Speechの表示の開始前に戻す
     */
    resetTalk(): void {
        if (this.talkIndex == -1) {
            return;
        }
        super.reset();
        this.g$element.style.display = "none";
        this.namePanel.innerHTML = "";
        this.namePanel.style.display = "none";
        this.namePanel.style.opacity = "0";
        this.talkFinished = false;
        this.talkIndex = -1;
        super.s$willWait = true;
        EventManager.executeListeningEvents("resetTalk", this.eventIds);
    }

    //Speechの表示を開始する
    startTalk(): void {
        if (super.g$hasStarted) {
            return;
        }
        if (this.talk.length == 0) {
            return;
        }
        this.talkIndex = 0;
        this.g$element.style.display = "block";
        this.namePanel.style.display = "flex";
        this.readTalk(0);
        this.start();
    }

    /**
     * 次のSpeechを表示する
     */
    displayNextSpeech() {
        if (!super.g$hasStarted) {
            this.startTalk();
            return;
        }

        if (this.talkFinished) {
            return;
        }

        if (!super.g$hasFinished) {
            this.finish();
            return;
        }

        EventManager.executeListeningEvents("displayNextSpeech", this.eventIds);

        this.talkIndex++;
        if (this.talk.length <= this.talkIndex) {
            this.finishTalk();
            return;
        }

        super.reset();
        this.readTalk(this.talkIndex);
        this.start();
    }

    /**
     * talkからspeechを読みこむ
     * @param index 読み込みたいspeechのindex
     */
    private readTalk(index: number) {
        super.s$html = this.talk[index].g$content;
        super.s$writeFrequency = this.talk[index].g$writeFrequency;
        super.s$waitString = this.talk[index].g$waitString;
        const speakerName = this.talk[index].g$speakerName;
        if (speakerName == null) {
            this.namePanel.style.opacity = "0";
            this.namePanel.dataset.speaker = "";
            this.g$element.dataset.speaker = "";
        } else {
            this.namePanel.style.opacity = "1";
            this.namePanel.innerHTML = speakerName;
            this.namePanel.dataset.speaker = speakerName;
            this.g$element.dataset.speaker = speakerName;
        }
    }

    /**
     * Speechの表示を終了させる
     */
    finishTalk() {
        if (this.talkFinished) {
            return;
        }
        this.stop();
        this.talkFinished = true;
        this.g$element.style.display = "none";
        this.namePanel.style.display = "none";
        this.talkIndex = this.talk.length - 1;
        EventManager.executeListeningEvents("finishTalk", this.eventIds);
    }
}

/**
 * TalkPanel用の、出力内容を扱うためのクラス
 */
export class Speech {
    private speakerName: string | null = null;
    private content: string = "";
    private writeFrequency: number = 50;
    private waitString: string = "▼";

    static masterSetting = {
        speakerName: null,
        writeFrequency: 50,
        waitString: "▼",
    };

    constructor({
        speakerName = Speech.masterSetting.speakerName,
        content = "",
        writeFrequency = Speech.masterSetting.writeFrequency,
        waitString = Speech.masterSetting.waitString,
    }: {
        speakerName?: string | null;
        content?: string;
        writeFrequency?: number;
        waitString?: string;
    }) {
        [this.s$speakerName, this.s$content, this.s$writeFrequency, this.s$waitString] = [speakerName, content, writeFrequency, waitString];
    }

    //発言者の名前を設定する
    set s$speakerName(name: string | null) {
        this.speakerName = name;
    }

    //文字の表示頻度を設定する
    set s$writeFrequency(frequency: number) {
        //frequencyの値が不正な場合はエラー
        if (!Number.isSafeInteger(frequency) || frequency <= 0) {
            throw new Error("文字の表示頻度として不正な値が入力されました: " + frequency);
        }
        this.writeFrequency = frequency;
    }

    //表示内容を設定する
    set s$content(content: string) {
        this.content = content;
    }

    //待機文字を設定する
    set s$waitString(string: string) {
        this.waitString = string;
    }

    //発言者の名前を返す
    //発言者がいない場合はnullを返す
    get g$speakerName(): string | null {
        return this.speakerName;
    }

    //文字の表示頻度(ms)を返す
    get g$writeFrequency(): number {
        return this.writeFrequency;
    }

    //Speechの内容を返す
    get g$content(): string {
        return this.content;
    }

    //待機文字を返す
    get g$waitString(): string {
        return this.waitString;
    }
}
