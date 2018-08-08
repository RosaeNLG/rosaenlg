import { GenderNumberManager } from "./GenderNumberManager";
import { RandomManager } from "./RandomManager";
import { SaveRollbackManager } from "./SaveRollbackManager";

export class NextRef {
  valueForDebug: string;
  REPRESENTANT: string;  
  gender: string;
  number: string;
  rndNextPos: number;
  
  constructor(params: any) {
    this.valueForDebug = params.valueForDebug;

    // we don't care about what will be triggered, but only if it has been triggered before
    this.REPRESENTANT = params.REPRESENTANT;
    this.gender = params.gender;
    this.number = params.number;
    this.rndNextPos = params.rndNextPos;
  }
}

  

export class RefsManager {

  // could be replaced by a List? but maybe less efficient as we lookup in it
  triggered_refs: Map<any, boolean>;
  next_refs: Map<any, NextRef>;

  // todo: more fine typing
  saveRollbackManager: SaveRollbackManager;
  genderNumberManager: GenderNumberManager;
  randomManager: RandomManager;
  spy: Spy;


  constructor(params: any) {
    this.saveRollbackManager = params.saveRollbackManager;
    this.genderNumberManager = params.genderNumberManager;
    this.randomManager = params.randomManager;
  
    this.triggered_refs = new Map();
    this.next_refs = new Map();  
  }

  getNextRef(obj: any): NextRef {
    return this.next_refs.get(obj);
  }

  setNextRef(obj: any, nextRef: NextRef) {
    this.next_refs.set(obj, nextRef);
  }

  getNextRep(obj: any, params): NextRef {
    //console.log('GET NEXT REF');
  
    // there's already one planned
    if (this.getNextRef(obj)!=null) {
      //console.log('already one planned');
      return this.getNextRef(obj);
    }
  
    if (obj==null) {
      console.log('ERROR: getNextRep called on null object!');
    }
  
    // simulate
    let rndNextPosBefore: number = this.randomManager.rndNextPos;
    this.saveRollbackManager.saveSituation({context:'nextRep'});
    let hadRefBefore: boolean = this.hasTriggeredRef(obj);
    //console.log('hadRefBefore: ' + hadRefBefore);
    let lengthBefore: number = this.spy.getPugHtml().length;
  
    // cross dependency prevents from calling the function directly
    this.spy.getPugMixins().value(obj, params);
  
    // record the result before rollback

    let nextRef: NextRef = new NextRef({
      valueForDebug: this.spy.getPugHtml().substring(lengthBefore),
      // we don't care about what will be triggered, but only if it has been triggered before
      REPRESENTANT: hadRefBefore ? 'refexpr' : 'ref',
      gender: this.genderNumberManager.getRefGender(obj),
      number: this.genderNumberManager.getRefNumber(obj),
      rndNextPos: rndNextPosBefore
    });
    //console.log("getNextRep will be:" + JSON.stringify(nextRef));
  
    // rollback
    // pug_html = html_before;
    this.saveRollbackManager.rollback();
  
    // register the result
    this.genderNumberManager.setRefGenderNumber(nextRef, nextRef.gender, nextRef.number);
  
    // save the nextRef for use when it will actually be triggered
    this.setNextRef(obj, nextRef);
  
  
    return nextRef;
  }
    
  resetRep(obj: any): void {
    this.triggered_refs.delete(obj);
    // if we had asked for a next ref
    this.next_refs.delete(obj);
  }
  
  hasTriggeredRef(obj: any): boolean {
    return this.triggered_refs.get(obj)==true ? true : false;
  }
  
  setTriggeredRef(obj: any): void {
    this.triggered_refs.set(obj, true);
  }
  
    
  deleteNextRef(obj: any): void {
    this.next_refs.delete(obj);
  }
  
  
}
