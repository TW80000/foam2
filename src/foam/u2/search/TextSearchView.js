/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'TextSearchView',
  extends: 'foam.u2.View',

  requires: [
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False',
    'foam.parse.QueryParser',
    'foam.u2.tag.Input'
  ],

  imports: [
    'filterController'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'richSearch',
      value: false
    },
    {
      class: 'Boolean',
      name: 'keywordSearch',
      value: false
    },
    {
      name: 'queryParser',
      factory: function() {
        return this.QueryParser.create({ of: this.of });
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 47
    },
    'property',
    {
      name: 'predicate',
      factory: function() { return this.True.create(); }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.tag.Input' }
    },
    {
      name: 'view'
    },
    {
      name: 'label',
      expression: function(property) {
        return property && property.label ? property.label : 'Search';
      }
    },
    {
      // All search views (in the SearchManager) need a name.
      // This defaults to 'query'.
      name: 'name',
      value: 'query'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag(this.viewSpec, { alwaysFloatLabel: true, label$: this.label$ }, this.view$);

      this.view.data$.sub(this.updateValue);
    },

    function clear() {
      this.view.data = '';
      this.predicate = this.True.create();
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      code: function() {
        var value = this.view.data;

        if ( ! value ) {
          this.predicate = this.True.create();
          return;
        }

        if ( this.richSearch ) {
          this.predicate = this.filterController.filters
            .map((name) => this.of.getAxiomByName(name))
            .filter((property) => foam.core.String.isInstance(property))
            .reduce(
              (acc, property) => this.OR(
                this.CONTAINS_IC(property, value),
                acc || this.False.create()
              ),
              this.queryParser.parseString(value)
            );
          return;
        }

        this.predicate = this.CONTAINS_IC(this.property, value);
      }
    }
  ]
});
