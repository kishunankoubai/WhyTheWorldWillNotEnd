import { BGM } from "./BGM";
import { talkPanel } from "./DynamicText/TalkManager";
import { flagManager } from "./FlagManager";
import { pageManager } from "./PageManager";
import { ScreenInteractionSetting } from "./ScreenInteraction";
import { Sound } from "./Sound";
import { qsAddEvent } from "./Utils";

export let se: Sound[];
let bgm = -1;

export function soundsInit() {
    BGM.init();
    Sound.init();
    se = [
        new Sound({ src: "assets/sounds/Pentamond3-ボタン.mp3", volume: 0.4 }),
        new Sound({ src: "assets/sounds/WhyTheWorldWillNotEnd-フォーカス.mp3", volume: 0.2 }),
        new Sound({ src: "assets/sounds/モンド右回転音.m4a", volume: 0.3 }),
        new Sound({ src: "assets/sounds/モンド滑り移動音.m4a", volume: 0.2 }),
        new Sound({ src: "assets/sounds/正解のときの音.mp3", volume: 0.4 }),
    ];
}

qsAddEvent("#pageStart", "click", () => {
    se[0].play();
});

qsAddEvent("button", "click", () => {
    se[0].play();
});

qsAddEvent("[data-mapping]", "focus", (element) => {
    if (element.id == "talkPanel") {
        return;
    }
    se[1].play();
});

pageManager.addEvent(["pageChanged-correctAnswer"], async () => {
    se[4].play();
});

pageManager.addEvent(
    [
        "pageChanged-ending0",
        "pageChanged-ending1",
        "pageChanged-ending2",
        "pageChanged-ending3",
        //
    ],
    async () => {
        se[0].play();
    },
);

pageManager.addEvent(["pageChanged-pageStart"], async () => {
    if (bgm != -1) {
        pageManager.s$valid = false;
        ScreenInteractionSetting.operable = false;
        if (BGM.isPlaying()) {
            await BGM.pause();
        }
        bgm = -1;
        pageManager.s$valid = true;
        ScreenInteractionSetting.operable = true;
    }
});

pageManager.addEvent(["pageChanged-title"], async () => {
    if (bgm != 0) {
        pageManager.s$valid = false;
        ScreenInteractionSetting.operable = false;
        await BGM.pause();
        await BGM.fetch({ src: "/assets/musics/今日未明、隣町にて.mp3", sourceVolume: 1 });
        await BGM.play();
        bgm = 0;
        pageManager.s$valid = true;
        ScreenInteractionSetting.operable = true;
    }
});

pageManager.addEvent(
    [
        "pageChanged-scene0",
        "pageChanged-scene1-1",
        "pageChanged-scene2",
        "pageChanged-scene3",
        "pageChanged-scene4",
        "pageChanged-scene5",
        //
    ],
    async () => {
        if (bgm != 1) {
            pageManager.s$valid = false;
            ScreenInteractionSetting.operable = false;
            await BGM.pause();
            await BGM.fetch({ src: "/assets/musics/ただの誤謬.mp3", sourceVolume: 1 });
            await BGM.play();
            bgm = 1;
            pageManager.s$valid = true;
            ScreenInteractionSetting.operable = true;
        }
    },
);

pageManager.addEvent(["pageChanged-scene6"], async () => {
    if (bgm != -1) {
        pageManager.s$valid = false;
        ScreenInteractionSetting.operable = false;
        if (BGM.isPlaying()) {
            await BGM.pause();
        }
        bgm = -1;
        pageManager.s$valid = true;
        ScreenInteractionSetting.operable = true;
    }
});

//ローディング画面
pageManager.addEvent(["pageBecomeValid"], () => {
    flagManager.remove("invalid");
    if (pageManager.g$currentPageId == "talk") {
        talkPanel.start();
    }
});

pageManager.addEvent(["pageBecomeInvalid"], () => {
    flagManager.add("invalid");
});

//設定関連
qsAddEvent("#bgmVolume", "input", (element) => {
    const value: number = parseInt((element as HTMLInputElement).value);
    BGM.setVolume(value / 10);
});

qsAddEvent("#seVolume", "input", (element) => {
    console.log("se");
    const value: number = parseInt((element as HTMLInputElement).value);
    Sound.setWholeVolume(value / 10);
});

qsAddEvent('input[type="range"]', "input", () => {
    se[0].play();
});

//talkのse
talkPanel.addEvent(["write"], () => {
    if (flagManager.has("invalid")) {
        talkPanel.stop();
        talkPanel.reset();
    } else {
        se[2].play();
    }
});

talkPanel.addEvent(["displayNextSpeech"], () => {
    se[3].play();
});
