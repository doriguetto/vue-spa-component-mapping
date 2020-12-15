/*!
* vue-spa-component-mapping
* Provide integration layer between vue and AEM SPA.
*
* @author   Gustavo Doriguetto
* @license  MIT
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueSPAComponentManager = exports.VueSPAAppMixin = exports.VueSPAComponentMixin = exports.CONSTANTS = void 0;

var _aemSpaPageModelManager = require("@adobe/aem-spa-page-model-manager");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _CONSTANTS = {
  CHILDREN: ':children',
  PATH: ':path',
  TYPE: ':type',
  ITEMS: ':items',
  JCR_CONTENT: 'jcr:content',
  SELECTOR: 'model',
  EXTENSION: '.json',
  ROUTE_EXTENSION: '.html'
};
exports.CONSTANTS = _CONSTANTS;
var VueSPAComponentMixin = {
  methods: {
    /**
     * Helper function to map given component resource type to vue component name
     * @param {Object} model - model object
     * @returns {string} name - component name
     */
    renderTo: function renderTo(model) {
      return VueSPAComponentManager.getByResourceType(model[_CONSTANTS.TYPE]).name;
    }
  },
  data: function data() {
    return {
      model: {}
    };
  },
  props: ['childModel', 'cqPath'],
  watch: {
    childModel: {
      immediate: true,
      handler: function handler(model) {
        var _this = this;

        this.model = Object.assign({}, this.model, model); //update child models after authoring

        var _loop = function _loop(item) {
          VueSPAComponentManager.registerInstance(_this.childPath + item);

          _aemSpaPageModelManager.ModelManager.removeListener(_this.childPath + item);

          _aemSpaPageModelManager.ModelManager.addListener(_this.childPath + item, function () {
            var vm = _this;

            _aemSpaPageModelManager.ModelManager.modelClient.fetch(vm.childPath + item + '.' + _CONSTANTS.SELECTOR + _CONSTANTS.EXTENSION).then(function (model) {
              vm.model[_CONSTANTS.ITEMS][item] = Object.assign({}, vm.model[_CONSTANTS.ITEMS][item], model);
            });
          });
        };

        for (var item in this.model[_CONSTANTS.ITEMS]) {
          _loop(item);
        }

        if (this.onModelChange) {
          this.onModelChange(model);
        }

        if (this.onModelLoaded) {
          VueSPAComponentManager.registerCallback(this.onModelLoaded);
        }

        VueSPAComponentManager.removeInstance(this.cqPath);
        VueSPAComponentManager.flushCallbacks();
      }
    }
  },
  computed: {
    childPath: function childPath() {
      return this.cqPath + '/';
    },
    allowedComponents: function allowedComponents() {
      return this.model.allowedComponents;
    },
    childrenModel: function childrenModel() {
      var data = _aemSpaPageModelManager.ModelManager.modelStore.getData();

      return data ? data[_CONSTANTS.CHILDREN] : {};
    },
    rootPath: function rootPath() {
      var data = _aemSpaPageModelManager.ModelManager.modelStore.getData();

      return data ? data[_CONSTANTS.PATH] + _CONSTANTS.ROUTE_EXTENSION : '';
    },
    CONSTANTS: function CONSTANTS() {
      return _CONSTANTS;
    },
    parSysPath: function parSysPath() {
      return this.cqPath + '/*';
    }
  }
};
exports.VueSPAComponentMixin = VueSPAComponentMixin;
var VueSPAAppMixin = {
  beforeMount: function beforeMount() {
    var _this2 = this;

    _aemSpaPageModelManager.ModelManager.initialize({
      path: this.$options.cmsPath
    }).then(function (model) {
      // Render the App content using the provided model
      _this2.setRootPath(model);

      if (_this2.onModelChange) {
        _this2.onModelChange(model);
      }
    });
  },
  data: function data() {
    return {
      cqPath: ''
    };
  },
  methods: {
    setRootPath: function setRootPath() {
      this.cqPath = _aemSpaPageModelManager.ModelManager.rootPath + '/' + _CONSTANTS.JCR_CONTENT;
    }
  }
};
exports.VueSPAAppMixin = VueSPAAppMixin;
var callbacks = [];
var componentStore = [];
var componentLibrary = [];
var VueSPAComponentManager = {
  registerInstance: function registerInstance(path) {
    componentStore.push(path);
  },
  removeInstance: function removeInstance(path) {
    componentStore = componentStore.filter(function (item) {
      return item !== path;
    });
  },
  registerCallback: function registerCallback(cb) {
    callbacks.push(cb);
  },
  flushCallbacks: function flushCallbacks() {
    if (componentStore.length === 0 && callbacks.length > 0) {
      callbacks.forEach(function (cb) {
        return cb();
      });
      callbacks = [];
    }
  },

  /**
   * Update component store with given component data
   *
   * @param {Object} component - Object containing the data to update the page model
   * @property {String} component.name - Relative data path in the PageModel which needs to be updated
   * @property {String} component.resourceType - Absolute page path corresponding to the page in the PageModel which needs to be updated
   *
   */
  set: function set(_ref) {
    var name = _ref.name,
        resourceType = _ref.resourceType;

    if (typeof name !== 'undefined' && typeof resourceType !== 'undefined') {
      componentLibrary = [{
        name: name,
        resourceType: resourceType
      }].concat(_toConsumableArray(componentLibrary.filter(function (item) {
        return resourceType !== item.resourceType;
      })));
    }
  },

  /**
   * lookup for component with specific name in component store
   * @param {string} name - component name
   * @returns {Object} component - return component in Json format with name and resorceType
   */
  getByName: function getByName(name) {
    var component = '';
    componentLibrary.forEach(function (item) {
      if (item.name === name) {
        component = item;
      }
    });
    return component;
  },

  /**
   * lookup for component with specific resource Type in component store
   * @param {string} resourceType - component resource type
   * @returns {Object} component - return component in Json format with name and resorceType
   */
  getByResourceType: function getByResourceType(resourceType) {
    var component = '';
    componentLibrary.forEach(function (item) {
      if (item.resourceType === resourceType) {
        component = item;
      }
    });
    return component;
  },

  /**
   * Helper function that map vue component to component store, and return given component again, just for sugar syntax.
   * @param component - Vue component containing the data to update component Store with name and resourceType
   * @returns component - Vue component
   */
  mapTo: function mapTo(component) {
    VueSPAComponentManager.set(component);
    return component;
  }
};
exports.VueSPAComponentManager = VueSPAComponentManager;