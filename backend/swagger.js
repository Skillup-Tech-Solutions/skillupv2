const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'API Documentation',
  },
  host: 'localhost:5000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your bearer token in the format **Bearer &lt;your-token&gt;**',
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
