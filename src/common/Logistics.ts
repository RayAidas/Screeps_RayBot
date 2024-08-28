import Singleton from "@/Singleton";
import { colorful } from "./utils";

export default class Logistics extends Singleton {
	public createTask(roomName: string, res: ResourceConstant, num: number, type: "lab" | "factory" | 'power' | 'nuker') {
		if (!Game.rooms[roomName].terminal?.my) return;
		let taskName = `${roomName}-${res}`;
		if (!global.demand) global.demand = {};
		if (global.demand[taskName]) return;
		global.demand[taskName] = {
			roomName: roomName,
			res: res,
			num: num,
			taskRoom: null,
			type: type,
		}
	}

	public deleteTask(taskName: string) {
		console.log(colorful('delete', 'red'), taskName);
		delete global.demand[taskName];
	}

	public checkTask() {
		if (!global.demand) return;
		if (Object.keys(global.demand).length) {
			for (let i in global.demand) {
				let task = global.demand[i];
				let room = Game.rooms[task.roomName];
				task.taskRoom = null;
				if (room.terminal?.store[task.res] >= task.num) this.deleteTask(i);
			}
		}
	}
}
