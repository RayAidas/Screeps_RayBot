import Singleton from "@/Singleton";
import { MoSaSa, MoSaSa_PUBLIC_SEGMENTS_ID } from "./Constant";

interface Data {
	resource: ResourceConstant,
	num: number,
	roomName: string,
	shard: string,
	state?: number,
	des?: string
}

export default class ForeignSegment extends Singleton {
	public getSegment(id: number): Data {
		return JSON.parse(RawMemory.segments[id]);
	}

	public setSegment(id: number, data: Data) {
		RawMemory.segments[id] = JSON.stringify(data)
	}

	public getForeignSegment(): null | Data {
		if (RawMemory.foreignSegment.data) {
			let data: Data;
			try {
				data = JSON.parse(RawMemory.foreignSegment.data) as Data;
			} catch (error) {
				data = null;
				console.log("data error")
			}
			return data;
		}
	}

	public setSegmentPublic(index: number) {
		if (RawMemory.segments[index]?.length) {
			RawMemory.setPublicSegments([index]);
		}
	}

	public update() {
		RawMemory.setActiveForeignSegment(MoSaSa, MoSaSa_PUBLIC_SEGMENTS_ID);
		let data = this.getForeignSegment();
		if (data) {
			global.sendTask(data.roomName, data.resource, data.num);
		}
	}
}