import { MyEventListener, EventId, EventManager } from "../EventManager.js";
import { LoopManager } from "../LoopManager.js";

/**
 * div要素に動的にHTMLを表示できる
 */
export class DynamicTextManager implements MyEventListener {
    private element: HTMLElement;
    private temporaryPanel: HTMLDivElement = document.createElement("div");
    private temporaryPanel2: HTMLDivElement = document.createElement("div");
    private loopManager: LoopManager = new LoopManager();
    private progress: number = 0;
    private hasFinished: boolean = false;
    private rubyFastWriting: boolean = true;

    /**
     * 初期設定
     * 個別の変更には影響を与えない
     */
    static masterSetting = {
        writeFrequency: 50,
        rubyFastWriting: true,
    };

    /**
     * @param write 次の文字が表示されるとき
     * @param finish 表示が終了したとき
     */
    readonly eventClassNames: string[] = ["write", "finish"];
    eventIds: EventId[] = [];
    addEvent(classNames: string[], handler: Function): EventId {
        const eventId = EventManager.addEvent({ classNames: classNames.filter((className) => this.eventClassNames.includes(className)), handler });
        this.eventIds.push(eventId);
        return eventId;
    }

    /**
     * @param element HTMLを表示するHTMLElement
     * @param html 表示するHTML
     */
    constructor(element?: HTMLElement | null, html?: string) {
        if (element) {
            this.element = element;
        } else {
            this.element = document.createElement("div");
        }
        this.element.classList.add("dynamicText");

        //ループ内容の定義
        this.loopManager.addEvent(["loop"], () => {
            this.write();
        });

        //初期値の設定
        if (html) {
            this.s$html = html;
        }
        this.s$writeFrequency = DynamicTextManager.masterSetting.writeFrequency;
        this.s$rubyFastWriting = DynamicTextManager.masterSetting.rubyFastWriting;
    }

    /**
     * 管理している要素
     */
    get g$element(): HTMLElement {
        return this.element;
    }

    /**
     * 表示開始しているか
     */
    get g$hasStarted(): boolean {
        return this.progress > 0 || this.hasFinished;
    }

    /**
     * 表示終了しているか
     */
    get g$hasFinished(): boolean {
        return this.hasFinished;
    }

    /**
     * 文字の表示頻度(ms)
     */
    get g$writeFrequency(): number {
        return this.loopManager.s$loopFrequency;
    }

    /**
     * 表示するHTML
     */
    get g$html() {
        return this.temporaryPanel2.innerHTML;
    }

    /**
     * 表示処理中以外ならtrue
     */
    get g$isStopped() {
        return !this.loopManager.g$isLooping;
    }

    set s$element(element: HTMLElement) {
        if (this.g$hasStarted) {
            console.error("表示開始後にelementを変更できません");
            return;
        }
        this.element = element;
    }

    /**
     * 表示開始後に変更はできない
     * @param html 表示するHTML
     */
    set s$html(html: string) {
        if (this.g$hasStarted) {
            console.error("表示開始後にHTMLを変更できません");
            return;
        }
        this.temporaryPanel.innerHTML = html;
        this.temporaryPanel2.innerHTML = this.temporaryPanel.innerHTML;
        if (this.rubyFastWriting) {
            this.temporaryPanel.innerHTML = this.temporaryPanel.innerHTML.replace(/<rt>[^(<\/rt>)]*<\/rt>/g, "");
        }
    }

    /**
     * @param frequency 文字の表示頻度(ms)
     */
    set s$writeFrequency(frequency: number) {
        this.loopManager.s$loopFrequency = frequency;
    }

    /**
     * falseならルビも一文字ずつ表示する
     * @param rubyFastWriting ルビをすぐに表示するかどうか
     */
    set s$rubyFastWriting(rubyFastWriting: boolean) {
        if (this.g$hasStarted) {
            console.error("表示開始後にrubyFastWritingを設定できません");
            return;
        }
        this.rubyFastWriting = rubyFastWriting;
        if (this.rubyFastWriting) {
            this.temporaryPanel.innerHTML = this.temporaryPanel.innerHTML.replace(/<rt>[^(<\/rt>)]*<\/rt>/g, "");
        }
    }

    /**
     * 表示開始前に戻す
     */
    reset(): void {
        this.loopManager.reset();
        this.hasFinished = false;
        this.progress = 0;
        this.element.innerHTML = "";
    }

    /**
     * 表示を開始する
     */
    start(): void {
        if (this.g$hasFinished) {
            return;
        }
        this.loopManager.start();
    }

    /**
     * 表示を停止する
     */
    stop(): void {
        this.loopManager.stop();
    }

    /**
     * 表示を強制的に完了させる
     */
    finish(): void {
        if (this.hasFinished) {
            return;
        }
        this.loopManager.stop();
        this.element.innerHTML = this.g$html;
        const text = this.temporaryPanel.textContent || this.temporaryPanel.innerText || "";
        this.progress = text.length;
        this.hasFinished = true;
        EventManager.executeListeningEvents("finish", this.eventIds);
    }

    /**
     * 次の文字を表示する
     */
    private write(): void {
        //すでに終わっている場合はreturn
        if (this.hasFinished) {
            return;
        }
        const text = this.temporaryPanel.textContent || this.temporaryPanel.innerText || "";
        //次の文字のindexを取得する
        let charIndex = this.g$html.indexOf(text[this.progress]);
        while (this.element.innerHTML.includes(this.g$html.substring(0, charIndex + 1))) {
            const temporaryCharIndex = this.g$html.indexOf(text[this.progress], charIndex + 1);
            if (temporaryCharIndex == -1) {
                break;
            } else {
                charIndex = temporaryCharIndex;
            }
        }
        //次の文字を表示する
        //ルビをすぐに表示する場合
        if (this.rubyFastWriting) {
            //表示するのが最後の文字でない場合
            if (this.progress < text.length - 1) {
                //さらに次の文字のindexを取得する
                let nextCharIndex = this.g$html.indexOf(text[this.progress + 1]);
                while (this.g$html.substring(0, charIndex + 1).includes(this.g$html.substring(0, nextCharIndex + 1))) {
                    const temporaryCharIndex = this.g$html.indexOf(text[this.progress + 1], nextCharIndex + 1);
                    if (temporaryCharIndex == -1) {
                        break;
                    } else {
                        nextCharIndex = temporaryCharIndex;
                    }
                }
                //表示する文字の次の文字の一つ前まで表示する
                this.element.innerHTML = this.g$html.substring(0, nextCharIndex);
                //表示するのが最後の文字の場合
            } else {
                this.element.innerHTML = this.g$html;
                this.progress = text.length;
            }
            //ルビも一文字ずつ表示する場合
        } else {
            this.element.innerHTML = this.g$html.substring(0, charIndex + 1);
        }
        this.progress++;
        EventManager.executeListeningEvents("write", this.eventIds);
        //すべて表示し終わった場合は処理を終了させる
        if (text.length <= this.progress) {
            this.finish();
        }
    }
}
