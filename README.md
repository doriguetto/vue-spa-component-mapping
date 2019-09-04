# vue-spa-component-mapping

This module provide a set of mixin allowing integration between AEM SPA module and vue application.

Installation
----------------------
```
npm install vue-spa-component-mapping
```

VueSPAAppMixin mixin
---------------------------
VueSPAAppMixin works as a wrapper initializing the AEM model within your App. 

```
  import { VueSPAAppMixin } from 'vue-spa-component-mapping'

  export default {
    el: '#app',
    mixins: [ VueSPAAppMixin ]
    methods: {
        onModelChange(model) {
          //i can do something cool when my App model init
        }
    }
  };

```

#### methods
##### `onModelChange(model)`
Hook method triggered after model change/init


VueSPAComponentMixin mixin
---------------------------
VueSPAComponentMixin is meant to be used among general components. It uses the component name and 
resource type to map and the vue component to AEM model.

```
    import { VueSPAComponentMixin , VueSPAComponentManager } from 'vue-spa-component-mapping'
  
    export default VueSPAComponentManager.mapTo({
      name: 'AppText',
      resourceType: 'myApp/components/content/text',
      mixins: [ VueSPAComponentMixin ],
      methods: {
        onModelChange(model) {
          //i can do something cool when my App model init or change
        }   
      }
    })

```
#### Methods
##### `renderTo(model)`
Helper function to map given component resource type to vue component name

##### `onModelChange(model)`
Hook method triggered after model change/init

VueSPAComponentManager API
------------------------

#### methods
##### `getByName(name)`
Helper function to retrieve component by name from a component store - Object with name and resource type

##### `getByResourceType(resourceType)`
Helper function to retrieve component by resource type from a component store - Object with name and resource type

##### `mapTo(component)`
Helper function to add component to component store

## Dependencies
This module has a dependency on [cq-spa-page-model-manager](https://www.npmjs.com/package/@adobe/cq-spa-page-model-manager)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
