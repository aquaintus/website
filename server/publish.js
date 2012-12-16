// Groups -- {name: String}
Groups = new Meteor.Collection("groups");

// Publish complete set of groups to all clients.
Meteor.publish('groups', function () {
  return Groups.find();
});


// Contacts -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           group_id: String,
//           timestamp: Number}
Contacts = new Meteor.Collection("contacts");

// Publish all items for requested group_id.
Meteor.publish('contacts', function (group_id) {
  return Contacts.find({group_id: group_id});
});

