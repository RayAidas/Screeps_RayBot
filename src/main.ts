import App from "./App";
import { customMove } from "./common/customMove";

App.init.initGameData();
App.glb.initGlobal();
Creep.prototype.customMove = customMove;
PowerCreep.prototype.customMove = customMove;
export const loop = function () {
    App.autoPlanner.run();
    App.logistics.checkTask();
    App.init.runInLoop();
    App.init.autoSell();
    App.init.runS();
}