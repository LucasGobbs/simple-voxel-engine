export class WorkerWrapper {
  private instance: Worker;
  private resolve: any;

  constructor(filePath: string, public id: number) {
    this.instance = new Worker(filePath, { type: 'module' });
    this.instance.onmessage = (e) => this.onMessage(e);
    this.resolve = null;
  }

  onMessage(response: any) {
    const resolve = this.resolve;
    this.resolve = null;
    resolve(response.data);
  }


  postMessage(s: any, resolve: any) {
    this.resolve = resolve;
    this.instance.postMessage(s);
  }
}

export type WorkerSchedule = {
  status: 'BUSY' | 'FREE'
  instance: WorkerWrapper
}
export type Work = {
  data: any
  callback: (x: any) => any
}
