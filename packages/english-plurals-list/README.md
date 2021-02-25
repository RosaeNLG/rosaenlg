<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# English Irregular Plurals

Plain JSON file containing a list of irregular English nouns with their irregular plural. Derived from WordNet.

Most plurals are just built adding `s` or `es`. This list contains (or should contain) all the other ones: `wolf` => `wolves`, `tomato` => `tomatoes`, `cactus` => `cacti` etc.

Use the singular word as the key.


- Some irregular plurals, where the plural is simply rule based, is not present in the list, for instance
`bus` => `buses` or `chef` => `chefs`. 
- Moreover, some obvious ones, like `woman` => `women`, is not in the Wordnet exceptions (while `man` => `men` is here - hum).
- Even more, `bus` => `busses` is generally considered as incorrect.

The list is kept as is. See `english-plurals` for helper functions on this module which correct the issues.

  
## dependencies and licences

WordNet 3.0 license:

WordNet Release 3.0 This software and database is being provided to you, the LICENSEE, by Princeton University under the following license. By obtaining, using and/or copying this software and database, you agree that you have read, understood, and will comply with these terms and conditions.: Permission to use, copy, modify and distribute this software and database and its documentation for any purpose and without fee or royalty is hereby granted, provided that you agree to comply with the following copyright notice and statements, including the disclaimer, and that the same appear on ALL copies of the software, database and documentation, including modifications that you make for internal use or for distribution. WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT- ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS. The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to distribution of the software and/or database. Title to copyright in this software, database and any associated documentation shall at all times remain with Princeton University and LICENSEE agrees to preserve same.
