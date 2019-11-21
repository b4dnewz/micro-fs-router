module.exports.get = ({
    query: { name = "test" }
}) => `Hello, ${name}`;

module.exports.post = ({ body }) => body;