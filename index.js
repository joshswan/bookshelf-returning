/*!
 * Bookshelf-Returning
 *
 * Copyright 2016-2017 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/bookshelf-returning/blob/master/LICENSE
 */

const Promise = require('bluebird');
const assign = require('lodash/assign');
const extend = require('lodash/extend');

module.exports = (bookshelf) => {
  const BaseModel = bookshelf.Model;

  bookshelf.Model = BaseModel.extend({
    initialize() {
      this.on('saving', (model, attrs, options) => {
        if (options.returning) {
          options.query.returning(options.returning);
        }
      });

      this.on('saved', (model, resp, options) => {
        if (options.returning) {
          // Throw NoRowsUpdatedError for updates with require option and nothing returned
          if (options.method === 'update' && options.require !== false && !resp.length) {
            throw new this.constructor.NoRowsUpdatedError('No Rows Updated');
          }

          if (typeof resp[0] === 'object') {
            // Assign returned values to attributes
            assign(this.attributes, this.parse(resp[0]));

            // Update model's ID
            this.id = this.attributes.id || null;
          }
        }
      });
    },
    // Override sync insert method to respect options.returning
    sync(...args) {
      const sync = BaseModel.prototype.sync.apply(this, args);

      sync.insert = Promise.method(function syncInsert() {
        const syncing = this.syncing;
        const attributes = syncing.format(extend(Object.create(null), syncing.attributes));

        return this.query.insert(attributes, this.options.returning || syncing.idAttribute);
      });

      return sync;
    },
  });
};
