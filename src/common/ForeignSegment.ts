import Singleton from "@/Singleton";

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
			return JSON.parse(RawMemory.foreignSegment.data) as Data
		}
		else return null
	}

	public setSegmentPublic(index: number) {
		if (RawMemory.segments[index]?.length) {
			RawMemory.setPublicSegments([index]);
		}
	}
}