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
