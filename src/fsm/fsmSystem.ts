import Singleton from "@/Singleton";

export class FsmSystem extends Singleton {
  /**
   * 跳转状态机的状态
   * @param state 
   */
  public changeState(creep: Creep, state: string) {
    creep.memory.state = state;
  }
}