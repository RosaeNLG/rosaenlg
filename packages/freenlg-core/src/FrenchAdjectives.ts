/*
fr_FR
accord des adjectifs

Actuellement implémenté via des règles et des listes d'exceptions. Les règles sont nombreuses avec plein d'exceptions. 
L'implémentation faite actuellement a une bonne couverture, mais quelques impasses, et certainement quelques bugs.

On pourrait utiliser le LEFFF, qui est souvent bon, ex. :
  châtain	adj	châtain	s
  châtains	adj	châtain	p
mais il y a des erreurs :
  pâlote	adj	pâlot	fs
et des manques : 
  kaki

*/


const ajd_invariables = [
  // ces trois adjectifs employés dans la langue courante: chic, super, sympa
  'chic', 'super', 'sympa',

  // Les adjectifs qualificatifs utilisant des noms de fleurs, de fruits, de pierres précieuses, etc. 
  // ne s'accordent ni en genre ni en nombre :
  'orange', 'émeraude', 'marron', 'ébène',
  'crème', 'moutarde', 'saumon', 'ocre', 'pervenche',

  // https://fr.wiktionary.org/wiki/Cat%C3%A9gorie:Adjectifs_invariables_en_fran%C3%A7ais
  'abricot', 'absinthe', 'acajou', 'aigue-marine', 'amande', 'amarante', 'ambre', 'améthyste', 
  'anthracite', 'antibruit', 'anticrise', 'antifeu', 'antihausse', 'antirejet', 'ardoise', 
  'argent', 'argile', 'aubergine', 'auburn', 'audio', 'aurore', 'avocat', 'azur', 'banane', 
  'beurre', 'bisque', 'bordeaux', 'brique', 'bronze', 'bulle', 'café', 'canari', 'capucine', 
  'caramel', 'carotte', 'cascher', 'cassis', 'cawcher', 'céladon', 'centum', 'cerise', 'chair', 
  'chamois', 'champagne', 'châtaigne', 'chocolat', 'cinabre', 'cinq', 'cinquante', 'citron', 
  'citrouille', 'clean', 'coquelicot', 'corail', 'crème', 'cuivre', 'de longue date', 'debout', 
  'dégueu', 'deux', 'dix', 'douze', 'ébène', 'émeraude', 'enfant', 'est', 'étain', 'ex-ante', 
  'feu', 'feuille-morte', 'filasse', 'fraise', 'framboise', 'fuchsia', 'furax', 'garance', 
  'grand-boutiste', 'gratis', 'grenadine', 'grenat', 'groggy', 'groseille', 'huit', 'in', 
  'indigo', 'indiqué', 'infolio', 'isabelle', 'jade', 'kascher', 'laser', 'lavande', 'lilas', 
  'maïs', 'marron', 'mastic', 'mastoc', 'melon', 'miel', 'mille', 'moutarde', 'nacarat', 'nankin', 
  'nature', 'neuf', 'noisette', 'nord', 'ocre', 'olive', 'onze', 'or', 'orange', 'ouest', 'out', 
  'outremer', 'paille', 'parme', 'pastel', 'pêche', 'perle', 'pie', 'pistache', 'pivoine', 
  'platine', 'ponceau', 'prune', 'puce', 'quatorze', 'quatre', 'queue-de-renard', 'queue-de-vache', 
  'quinze', 'raglan', 'ras-la-moule', 'ras-le-bonbon', 'ras-les-fesses', 'rosat', 'rouille', 'rubis', 
  'sable', 'safran', 'safre', 'sang', 'saphir', 'sarcelle', 'satem', 'saumon', 'sépia', 'sept', 'sexy', 
  'shocking', 'six', 'six-cents', 'soixante', 'soufre', 'souris', 'sud', 'super', 'tabac', 'tanacross', 
  'taupe', 'thé', 'tilleul', 'tomate', 'topaze', 'treize', 'trendy', 'trente', 'turquoise', 'vanille', 
  'vermillon', 'vidéo', 'zéro',

  // les adjectifs de couleur formés par emprunt lexical d'un mot venant d'une langue autre que le français
  // sont invariables
  'abricot', 'absinthe', 'acajou', 'aigue-marine', 'albâtre', 'amadou', 'amande', 'amarante', 'ambre', 
  'améthyste', 'andrinople', 'anthracite', 'ardoise', 'argent', 'argile', 'aubergine', 'auburn', 
  'aurore', 'avocat', 'azur', 'basane', 'banane', 'bistre', 'bitume', 'bourgogne', 'brique', 'bronze', 
  'bulle', 'cacao', 'cachou', 'café', 'café au lait', 'canari', 'cannelle', 'capucine', 'caramel', 
  'carmélite', 'carmin', 'carotte', 'céladon', 'cerise', 'chair', 'chamois', 'champagne', 'châtaigne', 
  'chaudron', 'chocolat', 'citron', 'cognac', 'coquelicot', 'corail', 'corbeau', 'crème', 'crevette', 
  'cuivre', 'cyclamen', 'ébène', 'émeraude', 'étain', 'feuille morte', 'filasse', 'fraise', 'framboise', 
  'fuchsia', 'garance', 'grenat', 'groseille', 'havane', 'indigo', 'isabelle', 'ivoire', 'jade', 'jonquille', 
  'kaki', 'lavande', 'lilas', 'magenta', 'maïs', 'marine', 'marengo', 'marron', 'mastic', 'melon', 'miel', 
  'moutarde', 'muscade', 'nacarat', 'nacre', 'noisette', 'noyer', 'ocre', 'olive', 'or', 'orange', 'paille', 
  'parme', 'pastel', 'pastèque', 'pêche', 'perle', 'pervenche', 'pie', 'pistache', 'pivoine', 'ponceau', 
  'porto', 'prune', 'puce', 'réséda', 'rouille', 'rubis', 'sable', 'safran', 'saphir', 'saumon', 'sépia', 
  'serin', 'soufre', 'tabac', 'tango', 'taupe', 'thé', 'tilleul', 'tomate', 'topaze', 'turquoise', 
  'vermillon', 'violette'
];


export class FrenchAdjectives {

  getAgreeAdj(adjective: string, gender: string, number: string): string {
    let withGender: string = gender=='F' ? this.getAdjFeminine(adjective) : adjective;
    let withNumber: string = number=='P' ? this.getAdjPlural(withGender) : withGender;
    return withNumber;
  }


  getAdjFeminine(adjective: string): string {

    if (ajd_invariables.indexOf(adjective)!=-1) return adjective;

    // Si la forme basique (masc. sg.) de l’adjectif a déjà une terminaison en e, la forme reste la
    // même au masculin et au féminin (on n’ajoute pas de nouvelle terminaison).
    // facile, sobre
    if (adjective.endsWith('e')) {
      return adjective;
    }
    // Les adjectifs qui se terminent en -ique, -oire, -ile s'écrivent pareil au masculin ou au feminin
    /*
      if (adjective.endsWith('ique') || adjective.endsWith('oire') || adjective.endsWith('ile')) {
        return adjective;
      }
    */

    const exceptions = {
      // s'accorde uniquement au pluriel
      'châtain': 'châtain',

      // Les adjectifs masculins qui changent carrément leurs terminaisons au féminin :
      'bénin': 'bénigne',
      'blanc': 'blanche',
      'doux': 'douce',
      'faux': 'fausse',
      'frais': 'fraîche',
      'grec': 'grecque',
      'hâtif': 'hâtive',
      'malin': 'maligne',
      'précieux': 'précieuse',
      'turc': 'turque',

      // Les sept adjectifs suivants ne suivent pas la règle générale puisque le s est doublé :
      'bas': 'basse',
      'épais': 'épaisse',
      'exprès': 'expresse',
      'gras': 'grasse',
      'gros': 'grosse',
      'las': 'lasse',
      'métis': 'métisse',
      
      // encore des exceptions
      'tiers': 'tierce',
      //'frais': 'fraîche',
      'dissous': 'dissoute',
      'absous': 'absoute',

      // Pour les adjectifs en -an, il n'y a pas de règle générale :
      // A COMPLETER
      'paysan': 'paysanne',
      'persan': 'persanne',

      // Pour les autres adjectifs terminés en -l, il n'y a pas de règle générale :
      // A COMPLETER
      'nul': 'nulle',
      'seul': 'seule',
      'gentil': 'gentille',

      // exceptions qui se terminent en -ique, -oire, -ile
      'civil': 'civile',
      'noir': 'noire',
      'public': 'publique',
      'puéril': 'puérile',
      'subtil': 'subtile',
      'vil': 'vile',
      'viril': 'virile',
      'volatil': 'volatile',

      // Les adjectifs qui se terminent par -et au masculin, se terminent en -tte au féminin.
      // Cependant, quelques-uns font exception
      'désuet': 'désuète',
      'replet': 'replète',
      'secret': 'secrète',
      'concret': 'concrète',
      'complet': 'complète',
      'incomplet': 'incomplète',
      'discret': 'discrète',
      'indiscret': 'indiscrète',
      'quiet': 'quiète',
      'inquiet': 'inquiète',

      // Exceptions doublement du n
      'lapon': 'laponne',
      'nippon': 'nippone', // - Le doublement du n de nippon est facultatif. <= no comment

      // Les adjectifs fou, foufou et mou forment leur féminin en -olle.
      'fou': 'folle',
      'mou': 'molle',

      // Les formes féminines des adjectifs chou et chouchou sont choute et chouchoute.
      'chou': 'choute',
      'chouchou': 'chouchou',

      // Féminin en -otte
      'jeunot': 'jeunotte', 
      'pâlot': 'pâlotte', 
      'vieillot': 'vieillotte', 
      'sot': 'sotte',

      // Féminin en -ote 
      'bigot': 'bigote',
      'dévot': 'dévote', 
      'fiérot': 'fiérote',
      'idiot': 'idiote',
      'loupiot': 'loupiote', 
      'manchot': 'manchote',
      'petiot': 'petiote',
      'poivrot': 'poivrote',

      // Exception : chérot est invariable.
      'chérot': 'chérot',

      'enchanteur': 'enchanteresse',
      'enchanteresse': 'désenchanteresse',
      'vengeur': 'vengeresse',
      // Certains adjectifs en -teur font leur féminin en -trice : 
      // TODO COMPLETER http://la-conjugaison.nouvelobs.com/regles/grammaire/les-adjectifs-en-teur-206.php
      'protecteur': 'protectrice',
      'dévastateur': 'dévastatrice',
      'libérateur': 'libératrice',
      'créateur': 'créatrice',

      //'faux': 'fausse',
      'roux': 'rousse',
      //'doux': 'douce',

      //'grec': 'grecque',
      'sec': 'sèche'
    };
    if (exceptions[adjective]!=null) {
      return exceptions[adjective];
    }


    // Certains adjectifs finissant en -eur font leur féminin en -eure :
    if ([ 'antérieur', 'extérieur', 'inférieur', 'intérieur', 
          'majeur', 'meilleur', 'mineur', 'postérieur', 
          'supérieur', 'ultérieur'].indexOf(adjective)!=-1 ) {
      return adjective.replace(/eur$/, 'eure');          
    }

    const terminaisons = {
      // Les adjectifs qualificatifs finissant par -eau forment leur féminin en -elle.
      // nouveau nouvelle / beau belle
      'eau': 'elle',
      // Les adjectifs finissant en -ier ou -iet prennent un accent grave sur le e et un e final.
      // printanier printanière / inquiet inquiète
      'ier': 'ière',
      'iet': 'iète',

      // Lorsque l’adjectif se termine en –gu, le e du féminin prend un tréma :
      // ambigu ambigüe
      'gu': 'güe',
      
      // Les adjectifs finissant par -ul, -el, -eil ou -iel doublent leur -l et prennent un e final.
      //  vermeil / vermeille
      //  habituel / habituelle, traditionnel
      // nul nulle, officiel officielle
      'ul': 'ulle',
      'el': 'elle',
      'eil': 'eille',
      'iel': 'ielle',

      // long longue, oblong oblongue
      'g': 'gue',

      // finissant par -ien, -en ou -on doublent leur n et prennent un e final
      // californien californienne / vendéen vendéenne / bon bonne
      'ien': 'ienne',
      'en': 'enne',
      'on': 'onne',
      
      // Les adjectifs qui se terminent en -al au masculin, se terminent en -ale au féminin :
      //  national / nationale
      'al': 'ale',

      // Pour le féminin des adjectifs en -in, -un, il n'y a pas de doublement du n :
      // - fin, fine ; brun, brune ; plein, pleine.
      'in': 'ine',
      'un': 'une',
    
      // Les adjectifs qui se terminent par -eux au masculin, se terminent en -se au féminin.
      // peureux -> peureuse, luxueux -> luxueuse
      'eux': 'euse',

      // Les adjectifs qui se terminent par -er au masculin, se terminent en -ère au féminin.
      // premier première
      'er': 'ère',

      // Les adjectifs qui se terminent par -et au masculin, se terminent en -tte au féminin.
      // maigrelet / maigrelette
      'et': 'ette',

      // Les adjectifs se terminant en -teur font leur féminin en -teuse quand le participe présent du verbe dont ils sont dérivés se termine par -tant.
      'teur': 'teuse',

      // La plupart des adjectifs qualificatifs finissant en -eur font leur féminin en -euse.
      // rêveur rêveuse / songeur songeuse
      'eur': 'euse',

      // finissant par la lettre x se terminent généralement par -se au féminin.
      // jaloux jalouse
      'x': 'se',

      // blanc blanche, franc franche (NB : Le féminin de franc est franque quand il signifie "du peuple franc" et franche quand il signifie "sincère".)
      'c': 'che',

      // sportif sportive, neuf neuve
      'f': 've'
    };

    for (let term in terminaisons){
      if (adjective.endsWith(term)) {
        return adjective.replace( new RegExp(term + '$'), terminaisons[term]);
      }
    }

    // En général on ajoute un e à la forme écrite du masculin pour former le féminin des adjectifs.
    return adjective + 'e';
  }


  getAdjPlural(adjective: string): string {

    if (ajd_invariables.indexOf(adjective)>-1) {
      return adjective;
    }

    const exceptions = {
      // Exception : l'adjectif bleu prend un s au pluriel
      'bleu': 'bleus'
    }
    if (exceptions[adjective]!=null) {
      return exceptions[adjective];
    }
    
    // Exceptions : bancal, fatal, final, natal, naval et banal prennent un -s au pluriel 
    if (['bancal', 'fatal', 'final', 'natal', 'naval', 'banal'].indexOf(adjective)>-1) {
      return adjective + 's';
    }

    // se terminant par s ou x sont invariables en nombre
    // heureux, obtus
    if (adjective.endsWith('x') || adjective.endsWith('s')) {
      return adjective;
    }

    const terminaisons = {
      // royal royaux
      'al': 'aux',
      
      // beau beaux
      'eau': 'eaux',

      // hébreu hébreux
      'eu': 'eux'
    }
    for (let term in terminaisons){
      if (adjective.endsWith(term)) {
        return adjective.replace( new RegExp(term + '$'), terminaisons[term]);
      }
    }

    return adjective + 's';
  }

}
