import { EventManager } from "../EventManager.js";
import { flagManager } from "../FlagManager.js";
import { pageManager } from "../PageManager.js";
import { TalkPanel, Speech } from "./TalkPanel.js";
import { qs } from "../Utils.js";

export const talkPanel = new TalkPanel(qs("#talkPanel"), qs("#namePanel"));

talkPanel.addEvent(["finishTalk"], () => {
    talkPanel.reset();
    pageManager.backPages(1);
});

export function requestTalk(talk: Speech[]): Promise<void> {
    if (talkPanel.g$hasStarted) {
        console.error("talk表示中に新たにリクエストされました");
        return new Promise((resolve) => {
            resolve();
        });
    } else {
        if (pageManager.g$currentPageId != "talk") {
            pageManager.setPage("talk");
        }
        talkPanel.resetTalk();
        talkPanel.s$talk = talk;
        talkPanel.startTalk();
        if (flagManager.has("invalid")) {
            talkPanel.stop();
        }
        return new Promise((resolve, reject) => {
            const eventId = talkPanel.addEvent(["finishTalk"], () => {
                EventManager.removeEvent(eventId);
                EventManager.removeEvent(eventId2);
                resolve();
            });
            const eventId2 = talkPanel.addEvent(["resetTalk"], () => {
                EventManager.removeEvent(eventId);
                EventManager.removeEvent(eventId2);
                reject();
            });
        });
    }
}
