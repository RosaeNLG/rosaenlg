/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports.getEvent = function (user) {
  return {
    requestContext: {
      authorizer: {
        principalId: 'RAPID_API',
      },
    },
    headers: {
      'X-RapidAPI-User': user,
    },
  };
};
