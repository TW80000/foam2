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
  name: 'GroupBySearchView',
  extends: 'foam.u2.View',

  documentation: `
    Specification:
      - Display a list of all values for some property.
      - Display the count of objects in the DAO that have that value for that
        property.
      - Hovering on a list item will update the predicate, but only while the
        mouse is over that list item. When the mouse leaves, the predicate will
        no longer use the value associated with that list item to filter the
        view.
      - Clicking on a list item will update the predicate. Removing the mouse
        from the list item after clicking will not reset the predicate.
  `,

  requires: [
    'foam.dao.mdao',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy'
  ],

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by.`,
      required: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: ``, // TODO
      required: true,
    },
    {
      name: 'groupedDAO',
      factory: function(dao) {
        return this.MDAO.create();
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      expression: function(property) {
        return property.name;
      }
    },
    {
      name: 'predicate',
      documentation: ``,
      factory: function() {
        return this.True.create();
      }
    },
    {
      name: 'list',
      documentation: `` // TODO
    }
  ],

  methods: [
    function clear() {
      // TODO
    },

    function init() {
      this.dao$proxy.listen();
    },

    function initE() {
      var groupBySink = this.GroupBy.create({
        arg1: this.property,
        arg2: this.Count.create()
      });

      this
        .addClass(this.myClass())
        .selectSink(this.dao$proxy.select(groupBySink), function() {

        });
      
      this.dao.select(sink).then((result) => {
        var keys = result.sortedKeys();
        var groups = result.groups;
        keys.forEach((key) => {
          this.start('div')
            .addClass('list-item')
            .start('span').add(key).end()
            .start('span').add('(', groups[key].value, ')').end()
          .end();
        });
      });
    }
  ]
});
