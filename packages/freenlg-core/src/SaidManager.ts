
export class SaidManager {
  has_said: any;
  spy: Spy;

  constructor() {
    this.has_said = {};
  }

  recordSaid(key: string): void {
    if (key==null) {
      console.log('ERROR: recordSaid with null arg!');
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
      console.log('ERROR: hasSaid with null arg!');
    }
    return this.has_said[key] || false;
  }
  
  dumpHasSaid(): void {
    console.log(JSON.stringify(this.has_said));
  }

}
