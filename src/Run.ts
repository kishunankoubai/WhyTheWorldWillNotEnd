import { pageManager } from "./PageManager";
import { qs, qsAddEvent, qsAll, sleep } from "./Utils";
import "./ScreenInteraction";
import { se, soundsInit } from "./SoundProcessing";
import { Speech } from "./DynamicText/TalkPanel";
import { requestTalk } from "./DynamicText/TalkManager";

//不正なページ遷移の防止
document.addEventListener("keydown", (e) => {
    if (["Tab", "Space", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});

qsAll("button").forEach((button) => {
    button.tabIndex = -1;
});
qsAll("input").forEach((button) => {
    button.tabIndex = -1;
});
qsAll("div[data-mapping]").forEach((button) => {
    button.tabIndex = 0;
});

//クリックによる開始
qsAddEvent("#pageStart", "click", () => {
    pageManager.setPage("title");
});

let nosave = false;

//起動時処理
document.addEventListener("DOMContentLoaded", async () => {
    pageManager.init();
    soundsInit();
    Promise.race([document.fonts.load('1em "Shippori Mincho B1"', "あ押始世界滅設定"), sleep(7000)]).then(() => {
        // console.log("font has been loaded");
        pageManager.setPage("pageStart");
    });
    const searchParams = new URLSearchParams(new URL(window.location.href).search);
    //セーブしない設定
    if (searchParams.get("nosave")) {
        nosave = true;
    }
    Speech.masterSetting.waitString = "◆";
});

function removeAllData() {
    localStorage.removeItem("whyTheWorldWon'tEnd-stage");
}

pageManager.addEvent(["setPage-dataSetting"], () => {
    const dataSize = new Blob([localStorage.getItem("whyTheWorldWon'tEnd-stage") ?? ""]).size;
    qs("#dataInformation").innerHTML = `全データの容量：${dataSize} B`;
});

pageManager.addEvent(["setPage-allDataDeleteAlert"], () => {
    const confirmButton = qs("#allDataDeleteConfirmButton") as HTMLButtonElement;
    confirmButton.disabled = true;
    confirmButton.style.opacity = "0";
    sleep(1500).then(() => {
        confirmButton.disabled = false;
        confirmButton.style.opacity = "1";
    });
});

qsAddEvent("#allDataDeleteConfirmButton", "click", () => {
    removeAllData();
    pageManager.backPages(2, { eventIgnore: true });
    pageManager.setPage("dataSetting");
});

pageManager.addEvent(["pageChanged-title"], () => {
    if (stage == 6) {
        qs("#specialButton").style.display = "";
    }
});

let stage = 0;
let answer: string[] = [];
let playerAnswer: string[] = [];
let words: string[] = [];
let selectingAnswerBox: HTMLButtonElement | null = null;
const reasonText = qs("#reasonText");
const goalText = qs("#goalText");
const wordListText = qs("#wordListText");
const wordSelectContainer = qs("#wordSelect .container");
const confirmButton = qs("#reasonCheckButton");

qsAddEvent("#startButton", "click", () => {
    if (nosave) {
        pageManager.setPage("scene0");
    } else {
        loadData();
    }
});

pageManager.addEvent(["setPage-scene0"], () => {
    stage = 0;
    saveData();
    requestTalk([
        new Speech({
            content: "もうすぐ今日が来る。",
        }),
        new Speech({
            content: "どうしてだろう、昨日は去ったのに。",
        }),
        new Speech({
            content: "今、私は生きている。",
        }),
        new Speech({
            content: "どうしてだろう、ソクラテスは死んだのに。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'>人間は<button data-mapping='[0,0]'></button></font><br />" + 
        "2.　<font style='color: #4444ff'>ソクラテスは<button data-mapping='[0,1]'></button>である</font>";
        goalText.innerText = "1,2よりソクラテスは死ぬ";
        confirmButton.dataset.mapping = "[1,2]";

        words = ["人間", "死ぬ"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});

pageManager.addEvent(["setPage-scene1-2"], () => {
    stage = 1;
    saveData();
    requestTalk([
        new Speech({
            content: "目が覚めた。よって、今日は来た。",
        }),
        new Speech({
            content: "眼前に広がるのは私のいつもの部屋だ。",
        }),
        new Speech({
            content: "いや、本当は<ruby>瞼<rt>まぶた</rt></ruby>の裏なのかもしれない。",
        }),
        new Speech({
            content: "私の目は開いているのだろうか。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'>私は寝ているか起きている</button></font><br />" + 
        "2.　<font style='color: #4444ff'>私は寝ていない</font><br />" + 
        "3.　1,2より私は<button data-mapping='[0,1]'></button><br />" + 
        "4.　<font style='color: #4444ff'>私が<button data-mapping='[0,2]'></button>ならば目が<button data-mapping='[1,2]'></button></font>"
        goalText.innerText = "3,4より私の目は開いている";
        confirmButton.dataset.mapping = "[2,3]";

        words = ["開いている", "開いていない", "起きている"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});

pageManager.addEvent(["setPage-scene2"], () => {
    stage = 2;
    saveData();
    requestTalk([
        new Speech({
            content: "私はベットから早々に出た。おお、寒い。",
        }),
        new Speech({
            content: "身支度をし靴を履こうとする。",
        }),
        new Speech({
            content: "しかし靴は無く、靴箱の上には写真立てのみが置かれている。",
        }),
        new Speech({
            content: "あれ、写真立ては靴だったっけ。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'>この家にあるものは私が買ったものだ</font><br />" + 
        "2.　<font style='color: #4444ff'>私は<button data-mapping='[0,1]'></button>を買ったことがない</font><br />" + 
        "3.　1,2より靴が<button data-mapping='[0,2]'></button>とすると矛盾<br />" + 
        "4.　3より<button data-mapping='[0,3]'></button>は<button data-mapping='[1,3]'></button><br />" + 
        "5.　<font style='color: #4444ff'>写真立ては<button data-mapping='[0,4]'></button></font><br />"+
        "6.　4,5より写真立てが<button data-mapping='[0,5]'></button>であるとすると矛盾"
        goalText.innerText = "6より写真立ては靴ではない";
        confirmButton.dataset.mapping = "[2,6]";

        words = ["この家にある", "この家にない", "靴", "写真立て"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});

pageManager.addEvent(["setPage-scene3"], () => {
    stage = 3;
    saveData();
    requestTalk([
        new Speech({
            content: "家を出た。やはり殺風景な町だ。",
        }),
        new Speech({
            content: "裸足で歩くには<ruby>些<rt>いささ</rt></ruby>か冷たい。",
        }),
        new Speech({
            content: "向かいの家の前には、昨日までは無かった花が咲いている。",
        }),
        new Speech({
            content: "少し弱々しいが、主張するように咲いている。",
        }),
        new Speech({
            content: "……あの花は生きているのだろうか。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'><button data-mapping='[0,0]'></button>は白色だ</font><br />" + 
        "2.　<font style='color: #4444ff'>白色のものは<button data-mapping='[0,1]'></button>だ</font><br />" + 
        "3.　1,2より<button data-mapping='[0,2]'></button>は綺麗だ<br />" + 
        "4.　<font style='color: #4444ff'><button data-mapping='[0,3]'></button>は<button data-mapping='[1,3]'></button>ではない</font><br />"+
        "5.　4より綺麗であるならば<button data-mapping='[0,4]'></button>ではない"
        goalText.innerText = "3,5よりこの花は枯れていない";
        confirmButton.dataset.mapping = "[2,5]";

        words = ["この花", "珍しい花", "枯れた花", "綺麗", "白色"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});

pageManager.addEvent(["setPage-scene4"], () => {
    stage = 4;
    saveData();
    requestTalk([
        new Speech({
            content: "少し歩いた。この町はどこか無機質に思え、その<ruby>佇<rt>たたず</rt></ruby>まいからは生気が感じられない。",
        }),
        new Speech({
            content: "コンクリートの心は荒んでいる。",
        }),
        new Speech({
            content: "それとは対照的な、<ruby>赫々<rt>かくかく</rt></ruby>とした火球がどんどん沈んでいく。",
        }),
        new Speech({
            content: "それは、月とは違う激しい怒り。",
        }),
        new Speech({
            content: "それは、太陽とは違う<ruby>揺蕩<rt>たゆた</rt></ruby>うささくれ。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'><button data-mapping='[0,0]'></button>以外はずっと眠たい</font><br />" + 
        "2.　<font style='color: #4444ff'><button data-mapping='[0,1]'></button>は眠たくない</font><br />" + 
        "3.　1,2より今は<button data-mapping='[0,2]'></button>である<br />" + 
        "4.　<font style='color: #4444ff'>今、あの火球が遠くに<button data-mapping='[0,3]'></button></font><br />"+
        "5.　<font style='color: #4444ff'>太陽は夜には見えない</font><br />" + 
        "6.　3,5より<button data-mapping='[0,4]'></button>は太陽は<button data-mapping='[1,4]'></button><br />" + 
        "7.　4,6よりあの火球が太陽であるとすると矛盾"
        goalText.innerText = "7よりあの火球は太陽ではない";
        confirmButton.dataset.mapping = "[2,5]";

        words = ["昼", "今", "夜", "見える", "見えない"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});

pageManager.addEvent(["setPage-scene5"], () => {
    stage = 5;
    saveData();
    requestTalk([
        new Speech({
            content: "もうすぐ<ruby>赫<rt>あか</rt></ruby>が降る。",
        }),
        new Speech({
            content: "どうしてだろう、みんなはここにいないのに。",
        }),
        new Speech({
            content: "今、私は生きている。",
        }),
        new Speech({
            content: "どうしてだろう、世界は滅ばないのに。",
        }),
    ]).then(() => {
        //prettier-ignore
        reasonText.innerHTML = 
        "1.　<font style='color: #4444ff'>明日は楽しみなテレビがある</font><br />" + 
        "2.　1より明日は<button data-mapping='[0,0]'></button><br />" + 
        "3.　<font style='color: #4444ff'>明日は<button data-mapping='[0,1]'></button>テストがある</font><br />" + 
        "4.　3より明日は<button data-mapping='[0,2]'></button><br />" + 
        "5.　2より明日は<button data-mapping='[0,3]'></button>、または世界は<button data-mapping='[1,3]'></button>"
        goalText.innerText = "4,5より世界は滅ばない";
        confirmButton.dataset.mapping = "[2,4]";

        words = ["来てほしい", "来てほしくない", "難しい", "滅ぶ", "滅ばない"];
        setAnswerBox();
        setWordList();
        pageManager.setPage("play");
    });
});
pageManager.addEvent(["setPage-scene6"], () => {
    stage = 6;
    saveData();
    requestTalk([
        new Speech({
            content: "ソクラテスは生きていた。",
        }),
        new Speech({
            content: "写真立ては靴に変容し、花はただ黒々と咲く。",
        }),
        new Speech({
            content: "今、私の目は開いている。",
        }),
    ]).then(async () => {
        pageManager.setPage("ending0");
        await sleep(3000);
        pageManager.setPage("ending1");
        await sleep(3000);
        pageManager.setPage("ending2");
        await sleep(3000);
        pageManager.setPage("ending3");
        await sleep(5000);
        pageManager.backPages(5);
    });
});

qsAddEvent("#reasonCheckButton", "click", () => {
    switch (stage) {
        case 0:
            answer = ["死ぬ", "人間"];
            break;
        case 1:
            answer = ["起きている", "起きている", "開いている"];
            break;
        case 2:
            answer = ["靴", "この家にある", "靴", "この家にない", "この家にある", "靴"];
            break;
        case 3:
            answer = ["この花", "綺麗", "この花", "枯れた花", "綺麗", "枯れた花"];
            break;
        case 4:
            answer = ["夜", "今", "夜", "見える", "今", "見えない"];
            break;
        case 5:
            answer = ["来てほしい", "難しい", "来てほしくない", "来てほしい", "滅ばない"];
            break;
    }
    getPlayerAnswer();
    if (playerAnswer.every((word, i) => word == answer[i])) {
        pageManager.setPage("correctAnswer");
        sleep(1500).then(() => {
            pageManager.backPages(3, { eventIgnore: true });
            if (stage == 0) {
                pageManager.setPage("scene1-1");
                sleep(1000).then(() => {
                    pageManager.backPages(1, { eventIgnore: true });
                    pageManager.setPage("scene1-2");
                });
            } else {
                pageManager.setPage(`scene${stage + 1}`);
            }
        });
    } else {
        if (stage == 5 && ["来てほしい", "難しい", "来てほしくない", "来てほしい", "滅ぶ"].every((word, i) => word == playerAnswer[i])) {
            pageManager.setPage("denyAnswer");
        } else {
            pageManager.setPage("incorrectAnswer");
        }
    }
});

function getPlayerAnswer() {
    playerAnswer = [];
    reasonText.querySelectorAll("button").forEach((button) => {
        playerAnswer.push(button.innerText);
    });
}
function setAnswerBox() {
    reasonText.querySelectorAll("button").forEach((button) => {
        button.classList.add("answerBox");
        button.addEventListener("click", () => {
            selectingAnswerBox = button;
            pageManager.setPage("wordSelect");
            se[0].play();
        });
        button.addEventListener("mouseover", () => {
            button.focus();
        });
        button.addEventListener("mouseleave", () => {
            if (document.activeElement == button) {
                (button as HTMLElement).blur();
            }
        });
        button.addEventListener("focus", () => {
            se[1].play();
        });
    });
}

function setWordList() {
    wordListText.innerHTML = words.join("<br />");
    wordSelectContainer.innerHTML = "";
    words.forEach((word, i) => {
        const wordButton = document.createElement("button");
        wordButton.classList.add("wordButton");
        wordButton.dataset.mapping = `[${i},0]`;
        wordButton.innerText = word;
        wordSelectContainer.appendChild(wordButton);
        wordButton.addEventListener("click", () => {
            selectingAnswerBox!.innerText = word;
            pageManager.backPages(1);
            se[0].play();
            selectingAnswerBox!.focus();
        });
        wordButton.addEventListener("focus", () => {
            se[1].play();
        });
        wordButton.addEventListener("mouseover", () => {
            wordButton.focus();
        });
        wordButton.addEventListener("mouseleave", () => {
            if (document.activeElement == wordButton) {
                (wordButton as HTMLElement).blur();
            }
        });
    });
    qs("#wordSelect .back").onclick = () => {
        selectingAnswerBox!.focus();
    };
}

function saveData() {
    if (nosave) {
        return;
    }
    localStorage.setItem("whyTheWorldWon'tEnd-stage", stage + "");
}

function loadData() {
    stage = Number.parseInt(localStorage.getItem("whyTheWorldWon'tEnd-stage") || "0");
    if (stage == 1) {
        pageManager.setPage(`scene1-1`);
        sleep(1000).then(() => {
            pageManager.backPages(1, { eventIgnore: true });
            pageManager.setPage("scene1-2");
        });
    } else {
        pageManager.setPage(`scene${stage}`);
    }
}
