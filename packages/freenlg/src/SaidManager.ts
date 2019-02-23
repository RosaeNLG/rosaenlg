
export class SaidManager {
  has_said: any;
  spy: Spy;

  constructor() {
    this.has_said = {};
  }

  recordSaid(key: string): void {
    if (key==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'recordSaid has null arg';
      throw err;      
    }
    this.has_said[key] = true;
  }
  

  deleteSaid(key: string): void {
    if (this.hasSaid(key)) {
      this.has_said[key] = null;   
    }
  }
  
  hasSaid(key: string): boolean {
    if (key==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'hasSaid has null arg';
      throw err;      
    }
    return this.has_said[key] || false;
  }
  
  getDumpHasSaid(): string {
    return JSON.stringify(this.has_said);
  }

  /* istanbul ignore next */
  dumpHasSaid(): void {
    console.log(this.getDumpHasSaid());
  }

}
