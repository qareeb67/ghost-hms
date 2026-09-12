const swaggerJsdoc = require("swagger-jsdoc");

const publicApiUrl = String(
    process.env.PUBLIC_API_URL ||
    "http://localhost:5000"
)
    .trim()
    .replace(/\/$/, "");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hospital Management System API",
            version: "1.0.0",
            description: "Hospital Management System API Documentation"
        },
        servers: [
            {
                url: publicApiUrl
            }
        ]
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
