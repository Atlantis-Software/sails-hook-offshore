/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var modelHasNoDatastoreError = require('../constants/model-has-no-datastore.error');
var constructError = require('./construct-error');


/**
 * Merge defaults and normalize options for a particular model
 * definition.  Includes backwards compatibility adjustments as well
 * as implicit defaults.  Also validates the config.
 */

module.exports = function howto_validateModelDefinition (sails) {

  // Require and hydrate freeze-dried (context-free) modules using the sails app instance
  var validateDatastoreConfig = require('./validate-datastore-config')(sails);

  return function validateModelDefinition (modelDef, modelID) {

    // Rebuild model definition merging the following
    // (in descending order of precedence):
    //
    // • explicit model def
    // • sails.config.models
    // • implicit framework defaults
    var newModelDef = _.merge({
      identity: modelID,
      tableName: modelID
    }, sails.config.models);
    newModelDef = _.merge(newModelDef, modelDef);

    // Keep an eye on merge's behavior w/ arrays here...
    // just to be safe, do:
    _.each(modelDef, function (val,key){
      if (_.isArray(val)) {
        newModelDef[key] = val;
      }
    });


    // Merge in modelDef connection setting
    // (this is probably not necessary any more, see above-
    //  leaving it in for now to be safe)
    if (!newModelDef.connection && sails.config.models.connection) {
      newModelDef.connection = sails.config.models.connection;
    }

    // If this is production, force `migrate: safe`!!
    if (process.env.NODE_ENV === 'production' && newModelDef.migrate !== 'safe') {
      newModelDef.migrate = 'safe';
      sails.log.verbose(util.format('Forcing Waterline to use `migrate: "safe" strategy (since this is production)'));
    }

    // If no connection can be determined (even by using app-level defaults [config.models])
    // throw a fatal error.
    if (!newModelDef.connection) {
      // return Err.fatal.__ModelIsMissingConnection__(newModelDef.globalId);
      throw constructError(modelHasNoDatastoreError, {
        modelIdentity: modelID
      });
    }

    // Coerce `Model.connection` to an array
    if (!_.isArray(newModelDef.connection)) {
      newModelDef.connection = [newModelDef.connection];
    }

    // Iterate through each of this models' connections
    // -> Make sure the adapter specified has been required.
    // -> If invalid connection found, throw fatal error.
    newModelDef.connection = _.map(newModelDef.connection, function(connection) {
      validateDatastoreConfig(connection, modelID);
      return connection;
    });

    ////////////////////////////////////////////////////////////////////////
    // If it isn't set directly, set the model's `schema` property
    // based on the first adapter in its connections (left -> right)
    //
    // TODO: pull this out and into Waterline core
    // (this may already be the case- we need to try removing this and see
    //  if it still works)
    if (typeof newModelDef.schema === 'undefined') {
      var connection, schema;
      for (var i in newModelDef.connection) {
        connection = newModelDef.connection[i];
        // console.log('checking connection: ', connection);
        if (typeof connection.schema !== 'undefined') {
          schema = connection.schema;
          break;
        }
      }
      // console.log('trying to determine preference for schema setting..', newModelDef.schema, typeof modelDef.schema, typeof modelDef.schema !== 'undefined', schema);
      if (typeof schema !== 'undefined') {
        newModelDef.schema = schema;
      }
    }
    ////////////////////////////////////////////////////////////////////////

    // Ensure that the sails.model connection is an array
    if(!_.isArray(sails.models[modelID].connection)) {
      sails.models[modelID].connection = [sails.models[modelID].connection];
    }

    // Save rebuilt model definition back to sails.models
    sails.models[modelID] = _.merge(sails.models[modelID] || { }, newModelDef);

  };
};
