// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Groups = new Meteor.Collection("groups");
Contacts = new Meteor.Collection("contacts");

// ID of currently selected group
Session.set('group_id', null);

// Name of currently selected tag for filtering
Session.set('tag_filter', null);

// When adding tag to a contact, ID of the contact
Session.set('editing_addtag', null);

// When editing a group name, ID of the group
Session.set('editing_groupname', null);

// When editing contact text, ID of the contact
Session.set('editing_itemname', null);

// Subscribe to 'groups' collection on startup.
// Select a group once data has arrived.
Meteor.subscribe('groups', function () {
  if (!Session.get('group_id')) {
    var group = Groups.findOne({}, {sort: {name: 1}});
    if (group)
      Router.setGroup(group._id);
  }
});

// Always be subscribed to the contacts for the selected group.
Meteor.autosubscribe(function () {
  var group_id = Session.get('group_id');
  if (group_id)
    Meteor.subscribe('contacts', group_id);
});


////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

////////// Groups //////////

Template.groups.groups = function () {
  return Groups.find({}, {sort: {name: 1}});
};

Template.groups.events({
  'mousedown .group': function (evt) { // select group
    Router.setGroup(this._id);
  },
  'click .group': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },
  'dblclick .group': function (evt, tmpl) { // start editing group name
    Session.set('editing_groupname', this._id);
    Meteor.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#group-name-input"));
  },
  'click .destroy_group': function () {
    Groups.remove(this._id);
  },
});

// Attach events to keydown, keyup, and blur on "New group" input box.
Template.groups.events(okCancelEvents(
  '#new-group',
  {
    ok: function (text, evt) {
      var id = Groups.insert({name: text});
      Router.setGroup(id);
      evt.target.value = "";
    }
  }));

Template.groups.events(okCancelEvents(
  '#group-name-input',
  {
    ok: function (value) {
      Groups.update(this._id, {$set: {name: value}});
      Session.set('editing_groupname', null);
    },
    cancel: function () {
      Session.set('editing_groupname', null);
    }
  }));

Template.groups.selected = function () {
  return Session.equals('group_id', this._id) ? 'selected' : '';
};

Template.groups.name_class = function () {
  return this.name ? '' : 'empty';
};

Template.groups.editing = function () {
  return Session.equals('editing_groupname', this._id);
};

////////// Contacts //////////

Template.contacts.any_group_selected = function () {
  return !Session.equals('group_id', null);
};

Template.contacts.events(okCancelEvents(
  '#new-contact',
  {
    ok: function (text, evt) {
      var tag = Session.get('tag_filter');
      Contacts.insert({
        text: text,
        group_id: Session.get('group_id'),
        done: false,
        timestamp: (new Date()).getTime(),
        tags: tag ? [tag] : []
      });
      evt.target.value = '';
    }
  }));

Template.contacts.contacts = function () {
  // Determine which contacts to display in main pane,
  // selected based on group_id and tag_filter.

  var group_id = Session.get('group_id');
  if (!group_id)
    return {};

  var sel = {group_id: group_id};
  var tag_filter = Session.get('tag_filter');
  if (tag_filter)
    sel.tags = tag_filter;

  return Contacts.find(sel, {sort: {timestamp: 1}});
};

Template.contact_item.tag_objs = function () {
  var contact_id = this._id;
  return _.map(this.tags || [], function (tag) {
    return {contact_id: contact_id, tag: tag};
  });
};

Template.contact_item.done_class = function () {
  return this.done ? 'done' : '';
};

Template.contact_item.done_checkbox = function () {
  return this.done ? 'checked="checked"' : '';
};

Template.contact_item.editing = function () {
  return Session.equals('editing_itemname', this._id);
};

Template.contact_item.adding_tag = function () {
  return Session.equals('editing_addtag', this._id);
};

Template.contact_item.events({
  'click .check': function () {
    Contacts.update(this._id, {$set: {done: !this.done}});
  },

  'click .destroy': function () {
    Contacts.remove(this._id);
  },

  'click .addtag': function (evt, tmpl) {
    Session.set('editing_addtag', this._id);
    Meteor.flush(); // update DOM before focus
    activateInput(tmpl.find("#edittag-input"));
  },

  'dblclick .display .contact-text': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Meteor.flush(); // update DOM before focus
    activateInput(tmpl.find("#contact-input"));
  },

  'click .remove': function (evt) {
    var tag = this.tag;
    var id = this.contact_id;

    evt.target.parentNode.style.opacity = 0;
    // wait for CSS animation to finish
    Meteor.setTimeout(function () {
      Contacts.update({_id: id}, {$pull: {tags: tag}});
    }, 300);
  }
});

Template.contact_item.events(okCancelEvents(
  '#contact-input',
  {
    ok: function (value) {
      Contacts.update(this._id, {$set: {text: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.contact_item.events(okCancelEvents(
  '#edittag-input',
  {
    ok: function (value) {
      Contacts.update(this._id, {$addToSet: {tags: value}});
      Session.set('editing_addtag', null);
    },
    cancel: function () {
      Session.set('editing_addtag', null);
    }
  }));

////////// Tag Filter //////////

// Pick out the unique tags from all contacts in current group.
Template.tag_filter.tags = function () {
  var tag_infos = [];
  var total_count = 0;

  Contacts.find({group_id: Session.get('group_id')}).forEach(function (contact) {
    _.each(contact.tags, function (tag) {
      var tag_info = _.find(tag_infos, function (x) { return x.tag === tag; });
      if (! tag_info)
        tag_infos.push({tag: tag, count: 1});
      else
        tag_info.count++;
    });
    total_count++;
  });

  tag_infos = _.sortBy(tag_infos, function (x) { return x.tag; });
  tag_infos.unshift({tag: null, count: total_count});

  return tag_infos;
};

Template.tag_filter.tag_text = function () {
  return this.tag || "All items";
};

Template.tag_filter.selected = function () {
  return Session.equals('tag_filter', this.tag) ? 'selected' : '';
};

Template.tag_filter.events({
  'mousedown .tag': function () {
    if (Session.equals('tag_filter', this.tag))
      Session.set('tag_filter', null);
    else
      Session.set('tag_filter', this.tag);
  }
});

////////// Tracking selected group in URL //////////

var ContactsRouter = Backbone.Router.extend({
  routes: {
    ":group_id": "main"
  },
  main: function (group_id) {
    Session.set("group_id", group_id);
    Session.set("tag_filter", null);
  },
  setGroup: function (group_id) {
    this.navigate(group_id, true);
  }
});

Router = new ContactsRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
