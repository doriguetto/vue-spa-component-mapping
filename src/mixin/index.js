import { ModelManager } from '@adobe/cq-spa-page-model-manager';

export const CONSTANTS = {
  CHILDREN : ':children',
  PATH : ':path',
  TYPE: ':type',
  ITEMS: ':items',
  JCR_CONTENT: 'jcr:content',
  SELECTOR: 'model',
  EXTENSION: '.json',
  ROUTE_EXTENSION: '.html'
}

export const VueSPAComponentMixin = {
  methods: {

    /**
     * Helper function to map given component resource type to vue component name
     * @param {Object} model - model object
     * @returns {string} name - component name
     */

    renderTo(model) {
      return VueSPAComponentManager.getByResourceType(model[CONSTANTS.TYPE]).name
    }
  },
  data() {
    return {
      model: {}
    }
  },
  props: [
    'childModel',
    'cqPath',
  ],
  watch: {
    childModel: {
      immediate: true,
      handler(model) {
        this.model = Object.assign({}, this.model, model);

        //update child models after authoring
        for(let item in this.model[CONSTANTS.ITEMS]) {
          ModelManager.removeListener(this.childPath + item)
          ModelManager.addListener(this.childPath + item, () => {
            let vm = this
            ModelManager.modelClient.fetch(vm.childPath + item + '.' + CONSTANTS.SELECTOR + CONSTANTS.EXTENSION)
              .then( model => {
                vm.model[CONSTANTS.ITEMS][item] = Object.assign({}, vm.model[CONSTANTS.ITEMS][item], model);
              })
          })
        }
        if (this.onModelChange) {
          this.onModelChange(model)
        }
      }
    },
  },
  computed: {
    childPath() {
      return this.cqPath + '/'
    },
    allowedComponents() {
      return this.model.allowedComponents
    },
    childrenModel() {
      const data = ModelManager.modelStore.getData()
      return (data? data[CONSTANTS.CHILDREN] : {})
    },
    rootPath() {
      const data = ModelManager.modelStore.getData()
      return (data? data[CONSTANTS.PATH] + CONSTANTS.ROUTE_EXTENSION : '')
    },
    CONSTANTS() {
      return CONSTANTS
    },
    parSysPath() {
      return this.cqPath + '/*'
    }
  },
}

export const VueSPAAppMixin = {
  beforeMount() {
    ModelManager.initialize({path: this.$options.cmsPath }).then((model) => {
      // Render the App content using the provided model
      this.setRootPath(model)
      if (this.onModelChange) {
        this.onModelChange(model)
      }
    });
  },
  data() {
    return {
      cqPath: '',
    }
  },
  methods: {
    setRootPath() {
      this.cqPath = ModelManager.rootPath + '/' + CONSTANTS.JCR_CONTENT
    },
  },
}

let componentStore = []
export const VueSPAComponentManager = {

  /**
   * Update component store with given component data
   *
   * @param {Object} component - Object containing the data to update the page model
   * @property {String} component.name - Relative data path in the PageModel which needs to be updated
   * @property {String} component.resourceType - Absolute page path corresponding to the page in the PageModel which needs to be updated
   *
   */

  set: ({name, resourceType}) => {
    if (typeof name !== 'undefined' &&
      typeof resourceType !== 'undefined') {
      componentStore = [
        {
          name,
          resourceType
        },
        ...componentStore.filter((item) => resourceType !== item.resourceType)
      ]
    }
  },
  /**
   * lookup for component with specific name in component store
   * @param {string} name - component name
   * @returns {Object} component - return component in Json format with name and resorceType
   */

  getByName : (name) => {
    let component = '';
    componentStore.forEach((item) => {
      if (item.name === name) {
        component = item
      }
    })
    return component
  },
  /**
   * lookup for component with specific resource Type in component store
   * @param {string} resourceType - component resource type
   * @returns {Object} component - return component in Json format with name and resorceType
   */

  getByResourceType : (resourceType) => {
    let component = '';
    componentStore.forEach((item) => {
      if (item.resourceType === resourceType) {
        component = item
      }
    })
    return component
  },

  /**
   * Helper function that map vue component to component store, and return given component again, just for sugar syntax.
   * @param component - Vue component containing the data to update component Store with name and resourceType
   * @returns component - Vue component
   */

  mapTo: (component) => {
    VueSPAComponentManager.set(component)
    return component
  },

};
