# sails-hook-graphql

Hook for [sails](http://sailsjs.org/), which add [graphql](http://graphql.org/) interface by [sails-graphql-adapter](https://github.com/arvitaly/sails-graphql-adapter).

[![Build Status](https://travis-ci.org/arvitaly/sails-hook-graphql.svg?branch=master)](https://travis-ci.org/arvitaly/sails-hook-graphql)
[![Coverage Status](https://coveralls.io/repos/github/arvitaly/sails-hook-graphql/badge.svg?branch=master)](https://coveralls.io/github/arvitaly/sails-hook-graphql?branch=master)
[![npm version](https://badge.fury.io/js/sails-hook-graphql.svg)](https://badge.fury.io/js/sails-hook-graphql)
[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

# Install

    npm install sails-hook-graphql --save

# Configure

    //Create and edit file /config/graphql.js

    module.exports = {
        url: "/graphqlSome"
    }

# Tests

    npm install
    npm test