/*!
 * Bookshelf-Returning
 *
 * Copyright 2016-2017 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/bookshelf-returning/blob/master/LICENSE
 */

const assign = require('lodash/assign');

module.exports = (bookshelf) => {
  const Model = bookshelf.Model.extend({
    initialize() {
      this.on('saving', (model, attrs, options) => {
        if (options.returning) {
          options.query.returning(options.returning);
        }
      });

      this.on('saved', (model, resp, options) => {
        if (options.returning && typeof resp[0] === 'object') {
          assign(this.attributes, this.parse(resp[0]));
        }
      });
    },
  });

  bookshelf.Model = Model;
};
