/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ProjectedPropertyView',
  extends: 'foam.u2.View',

  documentation: 'A view for ProjectedProperty-ies.',

  methods: [
    function initE() {
      /*
       * We simply use the view of the underlying property, but bind the data of
       * that view to the `value` property on the instance of
       * ProjectedPropertyImpl that's the real value of the projected property.
       * We do this because we want it to be as if we're editing the underlying
       * property directly.
       */
      this.tag(this.data.underlyingProperty, { data$: this.data.value$ });
    },

    function fromProperty(prop) {
      this.SUPER(this.data.underlyingProperty);
    }
  ]
});
