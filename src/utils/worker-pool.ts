import { WorkerSchedule, Work, WorkerWrapper } from "./worker";
const whenIsFree = (x: WorkerSchedule) => x.status === 'FREE'

export class WorkerPool  {
  private workers: WorkerSchedule[] = []
  private workQueue: Work[] = [];
  private maxWorkers = 5 

  constructor(filePath: string) {
    for (let id = 0; id < this.maxWorkers; id++){
      this.workers.push({
        status: 'FREE',
        instance: new WorkerWrapper(filePath, id)
      })
    }
  }


  pushWork(work: Work) {
    this.workQueue.push(work);
    this.allocateWorkers();
  }

  allocateWorkers() {
    while (this.haveFreeWorkers() && this.haveWork()) {
      const worker = this.findFreeWorker()

      const { data, callback } = this.workQueue.shift()!;

      worker.postMessage(data, (result: any) => {
        this.releaseWorker(worker.id)
        callback(result);
        this.allocateWorkers();
      });
    }
  }

  releaseWorker(id: number) {
    this.workers[id].status = 'FREE'
  }
  
  findFreeWorker(): WorkerWrapper{
    const freeWorkerSchedule = this.workers.find(whenIsFree)!
    freeWorkerSchedule.status = 'BUSY';
    return freeWorkerSchedule.instance
  }

  freeWorkers(): WorkerSchedule[]  { return this.workers.filter(whenIsFree) } 
  
  haveFreeWorkers():  boolean  {  return this.freeWorkers().length > 0 } 
  haveWork():  boolean  {  return this.workQueue.length > 0 } 
}