/**
 * Module dependencies
 */

var initialize = require('./lib/initialize');
var reload = require('./lib/reload');
var teardown = require('./lib/teardown');



/**
 * ORM hook
 *
 * @param  {SailsApp} sails
 * @return {Dictionary} [hook definition]
 */
module.exports = function (sails) {

  /**
   * Build the hook definition.
   * (this is returned below)
   *
   * @type {Dictionary}
   */
  return {


    /**
     * defaults
     *
     * The implicit configuration defaults merged into `sails.config` by this hook.
     *
     * @type {Dictionary}
     */
    defaults: {

      globals: {
        adapters: true,
        models: true
      },


      // Default model/adapter definitions to automatically attach
      // to `sails.hooks['orm-offshore'].adapters` and/or `sails.hooks['orm-offshore'].models`.
      orm: {

        // By default, relevant warnings are shown when NODE_ENV is "production".
        skipProductionWarnings: false,

        //================================================================
        // Experimental
        // (may change at any time!)
        //================================================================
        moduleDefinitions: {
          models: {},
          adapters: {
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // TODO: get rid of this once we pass it in directly below
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            'offshore-memory': require('offshore-memory')
          },
        }
        //================================================================

      },


      // Default model properties
      models: {

        // This default connection (i.e. datasource) for the app
        // will be used for each model unless otherwise specified.
        connection: 'memory'

      },


      // Connections to data sources, web services, and external APIs.
      // Can be attached to models and/or accessed directly.
      connections: {

        // Built-in disk persistence
        // (by default, creates the file: `.tmp/localDiskDb.db`)
        memory: {
          adapter: 'offshore-memory'
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // TODO: change this to:
          // `adapter: require('sails-disk')`
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        }

      }

    },



    /**
     * configure()
     *
     * @type {Function}
     */
    configure: function() {

      // Ensure `hook.models` exists, at least as an empty dictionary, very early
      // in the loading process (i.e. before `initialize()` is called).
      //
      // (This particular timing-- before initialize()-- is for backwards compatibility.
      //  Originally it was so that other hooks could mix in models/adapters. Note that
      //  this behavior may change in a future version of Sails.)
      if (!sails.hooks['orm-offshore'].models) {
        sails.hooks['orm-offshore'].models = {};
        // Expose a reference to `hook.models` as `sails.models`
        sails.models = sails.hooks['orm-offshore'].models;
      }
      if (!sails.hooks['orm-offshore'].adapters) {
        sails.hooks['orm-offshore'].adapters = {};
        // Expose a reference to `hook.adapters` as `sails.adapters`
        sails.adapters = sails.hooks['orm-offshore'].adapters;
      }

      // Listen for reload events
      sails.on('hook:orm:reload', sails.hooks['orm-offshore'].reload);
      sails.on('hook:orm-offshore:reload', sails.hooks['orm-offshore'].reload);

      // Listen for lower event, and tear down all of the adapters
      sails.once('lower', sails.hooks['orm-offshore'].teardown);
    },



    /**
     * initialize()
     *
     * Logic to run when this hook loads.
     */
    initialize: function (next) {
      // console.log('>>>>>> sails.hooks['orm-offshore'].initialize() called.');
      // var _ = require('lodash');
      // console.log(
      //   'Currently there are %d models, %d datastores, and %d adapters:',
      //   _.keys(sails.hooks['orm-offshore'].models).length,
      //   _.keys(sails.hooks['orm-offshore'].datastores).length,
      //   _.keys(sails.hooks['orm-offshore'].adapters).length,
      //   _.keys(sails.hooks['orm-offshore'].models),
      //   _.keys(sails.hooks['orm-offshore'].datastores),
      //   _.keys(sails.hooks['orm-offshore'].adapters)
      // );
      return initialize(sails.hooks["orm-offshore"], sails, next);
    },



    /**
     * sails.hooks['orm-offshore'].reload()
     */
    reload: function (next) {
      return reload(sails.hooks["orm-offshore"], sails, next);
    },



    /**
     * sails.hooks['orm-offshore'].teardown()
     */
    teardown: function (next) {
      // console.log('>>>>>> sails.hooks['orm-offshore'].teardown() called.');
      return teardown(sails.hooks["orm-offshore"], sails, next);
    }


  };
};
