/*!
 * Bookshelf-Returning
 *
 * Copyright 2016-2018 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/bookshelf-returning/blob/master/LICENSE
 */

const Promise = require('bluebird');
const assign = require('lodash/assign');
const extend = require('lodash/extend');
const filter = require('lodash/filter');

function handleResponse(resp, syncing, options) {
  if (options.returning) {
    // Check for require option and empty result, return 0 to trigger NoRows__Error
    if (options.method !== 'insert' && options.require !== false && !resp.length) return 0;

    // Save previous attributes
    // eslint-disable-next-line no-underscore-dangle
    options.previousAttributes = syncing._previousAttributes = syncing.attributes;

    if (typeof resp[0] === 'object') {
      // Assign returned values to attributes
      syncing.attributes = assign({}, syncing.parse(syncing.attributes), syncing.parse(resp[0]));

      // Update model's ID
      syncing.id = syncing.attributes[syncing.idAttribute] || syncing.id;
    }
  }

  // Return raw database result
  return resp;
}

module.exports = (bookshelf) => {
  const ModelBase = bookshelf.Model;

  bookshelf.Model = ModelBase.extend({
    // Override sync insert & update methods to implement options.returning
    sync(...args) {
      const sync = ModelBase.prototype.sync.apply(this, args);

      sync.insert = Promise.method(function syncInsert() {
        const {
          options,
          query,
          syncing,
        } = this;

        const attributes = syncing.format(extend(Object.create(null), syncing.attributes));

        return query.insert(attributes, options.returning || syncing.idAttribute)
          .then(resp => handleResponse(resp, syncing, options));
      });

      sync.update = Promise.method(function syncUpdate(attrs) {
        const {
          options,
          query,
          syncing,
        } = this;

        if (syncing.id != null) query.where(syncing.format({ [syncing.idAttribute]: syncing.id }));

        // eslint-disable-next-line no-underscore-dangle
        if (filter(query._statements, { grouping: 'where' }).length === 0) {
          throw new Error('A model cannot be updated without a "where" clause or an idAttribute.');
        }

        const attributes = syncing.format(extend(Object.create(null), attrs));

        return query.update(attributes, options.returning || null)
          .then(resp => handleResponse(resp, syncing, options));
      });

      sync.del = Promise.method(function syncDelete() {
        const {
          options,
          query,
          syncing,
        } = this;

        if (syncing.id != null) query.where(syncing.format({ [syncing.idAttribute]: syncing.id }));

        // eslint-disable-next-line no-underscore-dangle
        if (filter(query._statements, { grouping: 'where' }).length === 0) {
          throw new Error('A model cannot be destroyed without a "where" clause or an idAttribute.');
        }

        return query.del(options.returning || null)
          .then(resp => handleResponse(resp, syncing, options));
      });

      return sync;
    },
  });
};
