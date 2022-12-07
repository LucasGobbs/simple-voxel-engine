const NUMWORKERS = 5;
export class WorkerWrapper {

  private instance: Worker;
  private resolve: any;
  constructor(filePath: string, public id: number) {
    this.instance = new Worker(filePath, {type: 'module'});
    this.instance.onmessage = (e) => {
      this.onMessage(e);
    };
    this.resolve = null;
  }

  onMessage(e: any) {
    const resolve = this.resolve;
    this.resolve = null;
    resolve(e.data);
  }


  postMessage(s: any, resolve: any) {
    this.resolve = resolve;
    this.instance.postMessage(s);
  }
}

export class WorkerPool  {
  private workers: WorkerWrapper[] = [];
  private free: WorkerWrapper[] = [];
  private busy: any = {};
  private queue: any[] = [];

  constructor(filePath: string, sz: number = NUMWORKERS) {
    for (let i = 0; i < sz; i++){
      this.workers.push(new WorkerWrapper(filePath, i))
    }
    this.free = [...this.workers];   
  }

  get length() {
    return this.workers.length;
  }

  get Busy() {
    return this.queue.length > 0 || Object.keys(this.busy).length > 0;
  }

  enqueue(workItem: any, resolve: any) {
    this.queue.push([workItem, resolve]);
    this.pumpQueue();
  }

  pumpQueue() {
    while (this.free.length > 0 && this.queue.length > 0) {
      const w = this.free.pop()!;
      this.busy[w.id] = w;

      const [workItem, workResolve] = this.queue.shift();

      w.postMessage(workItem, (v: any) => {
        delete this.busy[w.id];

        this.free.push(w);
        workResolve(v);
        this.pumpQueue();
      });
    }
  }
}