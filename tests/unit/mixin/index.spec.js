import { mount, shallowMount } from '@vue/test-utils'
import { VueSPAAppMixin, VueSPAComponentManager, VueSPAComponentMixin } from '@/mixin'
import { ModelManager as ModelManagerMock } from '@adobe/cq-spa-page-model-manager'

const { mapTo, getByName, getByResourceType, set} = VueSPAComponentManager

var resolver;
jest.mock('@adobe/cq-spa-page-model-manager', () => ({
  ModelManager: {
    promise: new Promise(function (resolve) {
      resolver = resolve
    }),
    initialize: function() {
      return this.promise;
    },
    rootPath: '/content/sample'
  }
}));

describe('VueSPAcomponentManger', () => {

  it("set: should set component properly", () => {
    set({ name: 'componentA', resourceType: '/vue-spa/components/content/componentA' })
    set({ name: 'componentB'})
    set({ resourceType: '/vue-spa/components/content/componentC' })
    const componentA = getByName('componentA')
    const componentB = getByName('componentB')
    const componentC = getByName('componentC')
    expect(componentA).toBeDefined()
    expect(componentB).toBe('')
    expect(componentC).toBe('')
  })

  it("getByName: should return component by name ", () => {
    set({ name: 'componentD', resourceType: '/vue-spa/components/content/componentD'})
    set({ name: 'componentE', resourceType: '/vue-spa/components/content/componentE'})
    const componentD = getByName('componentD')
    const componentE = getByName('componentE')
    const componentF = getByName('componentF')
    expect(componentD).toBeDefined()
    expect(componentE).toBeDefined()
    expect(componentF).toBe('')
  })

  it("getByResourceType: should return component by resourceType ", () => {
    set({ name: 'componentG', resourceType: '/vue-spa/components/content/componentG'})
    set({ name: 'componentH', resourceType: '/vue-spa/components/content/componentH'})
    const componentG = getByResourceType('/vue-spa/components/content/componentG')
    const componentH = getByResourceType('/vue-spa/components/content/componentH')
    const componentJ = getByResourceType('/vue-spa/components/content/componentJ')
    expect(componentG).toBeDefined()
    expect(componentH).toBeDefined()
    expect(componentJ).toBe('')
  })

  it("mapTo: should map component properly", () => {
    let cmpK = shallowMount(mapTo({
      name: 'componentK',
      resourceType: '/vue-spa/components/content/componentK',
      render: h => h ()
    }))
    let cmpL = shallowMount(mapTo({
      name: 'componentL',
      render: h => h ()
    }))
    let cmpM = shallowMount(mapTo({
      resourceType: '/vue-spa/components/content/componentM',
      render: h => h ()
    }))
    const componentK = getByName('componentK')
    const componentL = getByName('componentL')
    const componentM = getByName('componentM')
    expect(componentK).toBeDefined()
    expect(componentL).toBe('')
    expect(componentM).toBe('')
    expect(cmpK.isVueInstance()).toBeTruthy()
    expect(cmpL.isVueInstance()).toBeTruthy()
    expect(cmpM.isVueInstance()).toBeTruthy()
  })
})

describe('VueSPAAppMixin', () => {

  let cmp
  const component = {
    name: 'componentA',
    mixins: [ VueSPAAppMixin ],
    cmsPath: '/content/sample',
    render: h => h (),
  }

  beforeEach(() => {
    cmp = mount(component, {
      sync: false
    })
  })

  it("should create vue instance properly", () => {
    expect(cmp.isVueInstance()).toBeTruthy()
  })
  it("should start with cqPath empty ", () => {
    expect(cmp.vm.$data.cqPath).toBe('')
  })

  it("should create vue instance properly", () => {
    expect(cmp.vm.$data.cqPath).toBe('')
    resolver()
    ModelManagerMock.promise.then(function() {
      expect(cmp.vm.$data.cqPath).toBe('/content/sample/jcr:content')
    })
  })

})

describe('VueSPAComponentMixin', () => {

  let cmp
  const component = {
    name: 'componentB',
    resourceType: '/app/myApp/componentB',
    mixins: [ VueSPAComponentMixin ],
    render: h => h (),
  }

  beforeEach(() => {
    cmp = shallowMount(VueSPAComponentManager.mapTo(component), {
      sync: false,
      propsData: {
        cqPath: '/content/mySite/home/jcr:content/componentB',
        childModel: {
          ':type': '/app/myApp/componentB',
          allowedComponents: [
            'componentA',
            'componentD'
          ]
        }
      }
    })
  })

  it("should create vue instance properly", () => {
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it("should render properly", () => {
    expect(cmp.vm.renderTo(cmp.vm.$props.childModel)).toBe('componentB')
  })

  it("should return parSys property", () => {
    expect(cmp.vm.parSysPath).toBe('/content/mySite/home/jcr:content/componentB/*')
  })

  it("should return allowedComponents property", () => {
    expect(cmp.vm.allowedComponents.length).toBe(2)
    expect(cmp.vm.allowedComponents[0]).toBe('componentA')
    expect(cmp.vm.allowedComponents[1]).toBe('componentD')
  })

})
