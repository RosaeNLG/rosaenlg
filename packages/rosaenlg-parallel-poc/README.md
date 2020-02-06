# RosaeNLG Parallel POC

Server side NLG in parallel (multi core) using RosaeNLG.

This technical POC shows how to generate texts in parallel on a multi core server with RosaeNLG.

The process is the following:

* Compilation of the template occurs only once.
* The result of the compilation is send to the workers.
* The data is sent to a worker, it generates texts and sends the result back to the master, who sends more data etc.

## Usage

Run using `npm run test`. In the code:

* with `loops` indicate the number of texts to be generated
* use `maxCpus` to change the max number of cores; put 1 to keep only one, put 999 to maximize the parallel processing (it will max top `os.cpus().length` anyway)
* enable / disable `showTexts` to see the output


## Some results

On my laptop, for 100000:

* on 1 worker: 0.54 ms per item
* on max worker: 0.28 ms per item

It takes consumes time to communicate with the workers. Gains are more important when the texts are more complex.
