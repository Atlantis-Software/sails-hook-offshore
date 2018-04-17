# sails-hook-orm-offshore

[![npm version](https://badge.fury.io/js/sails-hook-orm-offshore.svg)](https://www.npmjs.com/sails-hook-orm-offshore)
[![Build Status](https://travis-ci.org/Atlantis-Software/sails-hook-orm-offshore.svg?branch=master)](https://travis-ci.org/Atlantis-Software/sails-hook-orm-offshore)
[![Coverage Status](https://coveralls.io/repos/github/Atlantis-Software/sails-hook-orm-offshore/badge.svg?branch=master)](https://coveralls.io/github/Atlantis-Software/sails-hook-orm-offshore?branch=master)
[![NSP Status](https://nodesecurity.io/orgs/atlantis/projects/5ec8481e-08b5-44ad-8f2c-fdea01ba58a6/badge)](https://nodesecurity.io/orgs/atlantis/projects/5ec8481e-08b5-44ad-8f2c-fdea01ba58a6)
[![Dependencies Status](https://david-dm.org/Atlantis-Software/sails-hook-orm-offshore.svg)](https://david-dm.org/Atlantis-Software/sails-hook-orm-offshore)

Implements support for Offshore ORM in Sails.

> You can override or disable it using your sailsrc file or environment variables.  See http://sailsjs.org/documentation/concepts/configuration for more information.

## Install

Install this hook with:

```sh
$ npm install sails-hook-orm-offshore --save
```

## Configuration

`.sailsrc`
````
{
  "hooks": {
    "orm": false,
    "pubsub": false
  }
}
```


## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable



## Dependencies

In order for this hook to load, the following other hooks must have already finished loading:

- moduleloader
- userconfig


## Dependents

If this hook is disabled, in order for Sails to load, the following other hooks must also be disabled:

- [sails-hook-blueprints-offshore](https://github.com/Atlantis-Software/sails-hook-blueprints-offshore)
- [sails-hook-pubsub-offshore](https://github.com/Atlantis-Software/sails-hook-pubsub-offshore)


## Purpose

This hook's responsibilities are:


##### Load adapters

When Sails loads, this hook calls out to `sails.modules.loadAdapters()` (exposed by the `moduleloader`), loading any custom adapters defined within the app.  It also loads adapters which are installed as dependencies of the app itself (i.e. in its `node_modules/` folder).  These adapters are used when instantiating Waterline.


##### Load and hydrate models, then expose them as `sails.models.*`
When Sails loads, this hook calls out to `sails.modules.loadModels()` (exposed by the `moduleloader`), loading model files from the app's models folder.

##### Prompt about auto-migration
Since instantiating Waterline currently has the effect of auto-migrating existing data (dependending on the `migrate` configuration), the orm hook shows a prompt before instantiating Waterline if no `migrate` setting is explicitly configured.


##### Instantiate Waterline
As mentioned above, since all configuration, models, and adapters are loaded, this hook can safely instantiate Waterline.


##### Expose hydrated models as `sails.models`
It then passes them to Waterline to turn them into Model instances with all the expected methods like `.create()`, and then exposes them as `sails.models`.  Conventionally this models folder is `api/models/`, but it can be configured in `sails.config.paths`.

- Note that the set of hydrated models in the `sails.models` also includes Waterline models which were implicitly created as junctors (i.e. for any `collection` associations whose `via` does not point at a `model` association).
- Also note that models are exposed on `sails.models` are keyed by their identities.  That is, if you have a model file `Wolf.js`, it will be available as `sails.models.wolf`.


##### Expose global variable for each model
If enabled (`sails.config.globals.models` set to true), use the inferred `globalId` of each model to expose it as a global variable.



## Implicit Defaults
This hook sets the following implicit default configuration on `sails.config`:


| Property                                       | Type          | Default          |
|------------------------------------------------|:-------------:|------------------|
| `sails.config.globals.models`                  | ((boolean))   | `true`           |
| `sails.config.models.connection`               | ((string))    | `default`        |
| `sails.config.connections.default.adapter`     | ((string))    | `offshore-memory`|


i.e.

```javascript
{
  globals: {
    adapters: true,
    models: true
  },

  // Default model properties
  models: {

    // This default connection (i.e. datasource) for the app
    // will be used for each model unless otherwise specified.
    connection: 'default'
  },


  // Connections to data sources, web services, and external APIs.
  // Can be attached to models and/or accessed directly.
  connections: {

    default: {
      adapter: 'offshore-memory'
    }
  }
}
```


## Events

##### `hook:orm-offshore:loaded`

Emitted when this hook has been automatically loaded by Sails core, and triggered the callback in its `initialize` function.


##### `hook:orm-offshore:reload`

This event is no longer emitted by this hook.  This event will likely be replaced by making `.reload()` a public function.

> This event is experimental and is likely to change in a future release.


##### `hook:orm-offshore:reloaded`

Emitted when a reload is complete.  This event will likely be replaced by expecting a callback in `.reload()`.

> This event is experimental and is likely to change in a future release.




## Methods

#### sails.hooks['orm-offshore'].reload()

Reload the ORM hook, reloading models and adapters from disk, and reinstantiating Waterline.

- Note that **this does not automatically reload dependent hooks** (such as blueprints).
- Also note that there is currently no callback.

```javascript
sails.hooks['orm-offshore'].reload();
```


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.
> - If you would like to see a version of this method made public and its API stabilized, please open a [proposal](https://github.com/balderdashy/sails/blob/master/CONTRIBUTING.md#v-proposing-features-and-enhancements).




#### sails.hooks['orm-offshore'].teardown()

Call the `teardown()` method for adapters which have one, and which were previously loaded by the ORM hook.

```javascript
sails.hooks['orm-offshore'].teardown(cb);
```


###### Usage


|     |          Argument           | Type                | Details
| --- | --------------------------- | ------------------- | ----------------------------------------------------------------------------------
| 1   |        **cb**               | ((function))        | Optional. Fires when the teardown process for the hook is complete.


> ##### API: Private
> - Please do not use this method in userland (i.e. in your app or even in a custom hook or other type of Sails plugin).
> - Because it is a private API of a core hook, if you use this method in your code it may stop working or change without warning, at any time.



## FAQ

> If you have a question about this hook that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer, a core maintainer will merge your PR and add an answer as soon as possible)

#### What is this?

This repo contains a hook, one of the building blocks Sails is made out of.

#### What version of Sails is this for?

This hook is a dependency of Sails core as of v0.12.


## License

MIT
