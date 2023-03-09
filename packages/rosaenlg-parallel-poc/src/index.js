/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const cluster = require('cluster');
const os = require('os');

let loops = 100; // default value
if (process.argv.length >= 3) {
  const argLoops = parseInt(process.argv[2]);
  if (argLoops) {
    loops = argLoops;
  }
}

let maxCpus = 999; // default value is using all CPUs available
if (process.argv.length >= 4) {
  const argMaxCpus = parseInt(process.argv[3]);
  if (argMaxCpus) {
    maxCpus = argMaxCpus;
  }
}
console.log(`using ${maxCpus} max. with ${loops} loop`);

const showTexts = false;

// first let's generate some data

const existingFruits = [
  'Apple',
  'Chinese',
  'Chokeberry',
  'Cocky',
  'Eastern',
  'Hawthorn',
  'Jagua',
  'Loquat',
  'Lovi-lovi',
  'Medlar',
  'Pear',
  'Quince',
  'Ramontchi',
  'Rose',
  'Rowan',
  'Sapodilla',
  'Serviceberry',
  'Shipova',
  'Sorb',
  'Southern',
  'Toyon',
  'Açaí',
  'Acerola',
  'African',
  'African',
  'African',
  'Ambarella',
  'American',
  'American',
  'Apricot',
  'Bambangan',
  'Beach',
  'Bignay',
  'Binjai',
  'Black',
  'Bolivian',
  'Brush',
  'Bush',
  'Casimiroa',
  'Cedar',
  'Changunga',
  'Cherry',
  'Cherry',
  'Cherry',
  'Chinese',
  'Choke',
  'Cocoplum',
  'Coconut',
  'Cornelian',
  'Country-almond',
  'Creek',
  'Curry',
  'Damson',
  'Date',
  'Desert',
  'Emblic',
  'Emu',
  'Fibrous',
  'Flatwoods',
  'Gomortega',
  'Greengage',
  'Green',
  'Guavaberry',
  'Gubinge',
  'Hairless',
  'Jambolan',
  'Jelly',
  'Jocote',
  'Jujube',
  'King',
  'Korlan',
  'Little',
  'Longan',
  'Lychee',
  'Malay',
  'Mamey',
  'Mango',
  'Maprang',
  'Marula',
  'Miracle',
  'Moriche',
  'Nectarine',
  'Neem',
  'Nepali',
  'Nutmeg',
  'Otaheite',
  'Peach',
  'Peanut',
  'Pequi',
  'Pigeon',
  'Pili',
  'Pitanga',
  'Plum',
  'Pulasan',
  'Rambutan',
  'Red',
  'Riberry',
  'Sageretia',
  'Saw',
  'Sea',
  'Silver',
  'Sloe',
  'Spanish',
  'Spanish',
  'Tamarind-plum',
  'Velvet',
  'Velvet',
  'Watery',
  'Wax',
  'Wild',
  'Wongi',
  'Yangmei',
  'Yellow',
  'Zwetschge',
  'African',
  'Amanatsu',
  'Balady',
  'Bergamot',
  'Bitter',
  'Blood',
  "Buddha's hand",
  'Calamondin',
  'Cam',
  'Centennial',
  'Citron',
  'Clementine',
  'Corsican',
  'Desert',
  'Etrog',
  'Finger',
  'Florentine',
  'Grapefruit',
  'Greek',
  'Hyuganatsu',
  'Ichang',
  'Iyokan',
  'Jiangsu',
  'Kabosu',
  'Kaffir',
  'Key',
  'Kinnow',
  'Kiyomi',
  'Kumquat',
  'Lemon',
  'Lime',
  'Limequat',
  'Mandarin',
  'Mangshanyegan',
  'Meyer',
  'Moroccan',
  'Myrtle-leaved',
  'Ōgonkan',
  'Orange',
  'Oroblanco',
  'Oval',
  'Persian',
  'Pomelo',
  'Ponderosa',
  'Rangpur',
  'Round',
  'Satsuma',
  'Shangjuan',
  'Shonan',
  'Sudachi',
  'Sweet',
  'Taiwan',
  'Tangelo',
  'Tangerine',
  'Tangor',
  'Ugli',
  'Yuzu',
];

const datasets = [];

for (let i = 0; i < loops; i++) {
  const index = i % (existingFruits.length - 3);
  const dataset = [existingFruits[index], existingFruits[index + 1], existingFruits[index + 2]];
  datasets.push(dataset);
}

// and then do the rendering

if (cluster.isMaster) {
  const rosaenlgPug = require('rosaenlg');

  const NS_PER_SEC = 1e9;
  const NS_PER_MS = 1e6;

  console.log(`number of items: ${datasets.length}`);

  const compiled = rosaenlgPug.compileFileClient('src/fruits.pug', {
    language: 'en_US',
    compileDebug: false,
  });

  // console.log(compiled.toString());

  const start = process.hrtime.bigint();

  // prepare the cluster

  const cpus = Math.min(maxCpus, os.cpus().length);
  console.log(`Forking for ${cpus} CPUs`);

  // var workersFollowUp = {};
  const leftEltsToSend = datasets.slice();

  for (let i = 0; i < cpus; i++) {
    const worker = cluster.fork();

    // console.log( worker.id );

    worker.send({ compiled: compiled.toString() });

    worker.on('message', function (msg) {
      if (msg.rendered != null) {
        // console.log(`received result from worker ${this.id} for ${msg.taskId}`);

        if (showTexts) {
          process.stdout.write(msg.rendered);
        }

        // launch the next rendering
        const eltToSend = leftEltsToSend.pop();
        if (eltToSend === undefined) {
          console.log(`all done for worker ${this.id}`);
          this.destroy();
        } else {
          this.send({
            taskId: leftEltsToSend.length,
            data: eltToSend,
          });
        }
      } else {
        console.log(`unknown msg from worker: ${msg}`);
      }
    });
  }

  // initial request
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    worker.send({
      taskId: leftEltsToSend.length,
      data: leftEltsToSend.pop(),
    });
  }

  let finishDone = false;
  cluster.on('exit', function (_worker) {
    if (Object.keys(cluster.workers).length === 0 && !finishDone) {
      console.log('do the finish');

      const diff = new Number(process.hrtime.bigint() - start);
      console.log(`Took ${diff / NS_PER_SEC} s - ${diff / NS_PER_MS / datasets.length} ms per item`);

      finishDone = true;
    }
  });

  console.log(`finished.`);
} else if (cluster.isWorker) {
  const NlgLib = require('rosaenlg-lib').NlgLib;

  let compiledFct;

  console.log(`I'm a new worker ${process.pid}`);

  process.on('message', (msg) => {
    if (msg.compiled != null) {
      // console.log('ok, received compiled fct'); //  + msg.compiled

      compiledFct = new Function('params', `${msg.compiled}; return template(params);`);
      //console.log( compiledFct );
    } else if (msg.taskId != null) {
      // console.log(`${process.pid} received generate request for ${msg.taskId}`);
      const params = {
        language: 'en_US',
        util: new NlgLib({ language: 'en_US' }),
        data: msg.data,
      };

      const rendered = compiledFct(params);

      // console.log(rendered);

      process.send({
        taskId: msg.taskId,
        rendered: rendered,
      });

      // console.log(`${process.pid} sent result for ${msg.taskId}`);

      // console.log(rendered);
    } else {
      console.log('unknown message: ' + JSON.stringify(msg));
    }
  });
}
