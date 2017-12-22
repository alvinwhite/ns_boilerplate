const path = require('path');

module.exports = ({ file, options, env }) => ({
    plugins: {
        'postcss-flexbugs-fixes': {},
        'autoprefixer': {
            flexbox: 'no-2009'
        },
        'cssnano': env === 'production' ? {} : false,
    }
})