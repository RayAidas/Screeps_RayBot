import App from "./App";
import { customMove } from "./common/customMove";
import { errorMapper } from './modules/errorMapper.js'

App.init.initGameData();
App.glb.initGlobal();
Creep.prototype.customMove = customMove;
PowerCreep.prototype.customMove = customMove;

export const loop = errorMapper(() => {
    App.autoPlanner.run();
    App.logistics.checkTask();
    App.init.runInLoop();
    App.init.autoSell();
})