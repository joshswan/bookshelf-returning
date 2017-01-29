# bookshelf-returning
[![NPM Version][npm-image]][npm-url] [![Build Status][build-image]][build-url] [![Dependency Status][depstat-image]][depstat-url] [![Dev Dependency Status][devdepstat-image]][devdepstat-url]

Bookshelf plugin for PostgreSQL, MSSQL, and Oracle databases that allows for specifying a "returning" clause for insert and update queries. The model is updated with the updated values of the columns specified, giving you an updated representation of your model without needing a subsequent fetch.

## Installation

```javascript
npm install bookshelf-returning --save
```

## Usage

Apply the plugin:
```javascript
bookshelf.plugin('bookshelf-returning');
```

And use `returning` in your save options:
```javascript
const User = bookshelf.Model.extend({
  tableName: 'users',
});

const user = new User({ id: 1 }).save({ first_name: 'Josh' }, { returning: '*' })
  .then((updated) => {
    console.log(updated.get('first_name')); // Josh
  });
```

[build-url]: https://travis-ci.org/joshswan/bookshelf-returning
[build-image]: https://travis-ci.org/joshswan/bookshelf-returning.svg?branch=master
[depstat-url]: https://david-dm.org/joshswan/bookshelf-returning
[depstat-image]: https://david-dm.org/joshswan/bookshelf-returning.svg
[devdepstat-url]: https://david-dm.org/joshswan/bookshelf-returning#info=devDependencies
[devdepstat-image]: https://david-dm.org/joshswan/bookshelf-returning/dev-status.svg
[npm-url]: https://www.npmjs.com/package/bookshelf-returning
[npm-image]: https://badge.fury.io/js/bookshelf-returning.svg
