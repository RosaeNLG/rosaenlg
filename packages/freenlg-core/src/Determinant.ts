
export function getDet(lang: string, det: string, obj: any, params: any): string {
  if (lang=='en_US') {
    return "TODO_DET_en_US";
  } else if (lang=='de_DE') {
    return "TODO_DET_de_DE";

  } else if (lang=='fr_FR') {

    return `${det} `;
  }
}
