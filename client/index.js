Contacts = new Meteor.Collection("contacts");
Groups   = new Meteor.Collection("groups");

// var event_perform_search = function() {
//   console.log("event perform-search");
// };

// var event_view_index = function() {
//   console.log("event view index");
// };

// var event_view_visual = function() {
//   console.log("event view visual");
// };

// var event_view_stats = function() {
//   console.log("event view stats");
// };


// var event_add_contact = function() {
//   console.log("event add contact");
// };

// var event_edit_contact = function() {
//   console.log("event edit contact");
// };

// var event_view_contact = function() {
//   console.log("event view contact");
// };

// var event_view_group = function() {
//   console.log("event view group");
// };



// Template.contact_groups.group_name = function () {
//   return "ninjas";
// };

Template.main.contacts = function () {
  return Contacts.find({}, {sort: {name: 1}});
};


// Template.add_contact.events({
//   'click .add-contact' : event_add_contact
// });

// Template.contact.events({
//   'click .edit-contact' : event_edit_contact,
//   'click .view-contact' : event_view_contact,
//   'click .view-group' : event_view_group
// });

// Template.navigation.events({
//   'click .perform-search' : event_perform_search,
//   'click .view-index' : event_view_index,
//   'click .view-visual' : event_view_visual,
//   'click .view-stats' : event_view_stats
// });
