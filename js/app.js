document.addEventListener('DOMContentLoaded', function() {
  var User = Backbone.Model.extend({
    defaults: {
      active: false
    }
  });
  var UserView = Backbone.View.extend({
    tagName: 'li',
    model: User,
    initialize: function() {
      this.model.on('change', this.render, this);
      this.render();
    },
    render: function() {
      var source = $('#NavItemTemplate').html();
      var template = Handlebars.compile(source);
      var html = template(this.model.toJSON());
      if(this.model.get('active')) {
        this.$el.addClass('active');
      } else {
        this.$el.removeClass('active');
      }
      this.$el.html(html);
      return this;
    }
  })

  var userList = new(Backbone.Collection.extend({
    model: User,
    url: '/data.json'
  }));

  var appModel = new(Backbone.Model.extend({
    defaults: {
      'currentItem': undefined,
      'currentItemIndex': undefined,
      'userList': userList
    }
  }));

  var UserListView = Backbone.View.extend({
    el: $('.nav').first(),
    collection: userList,
    initialize: function() {
      this.collection.on('reset', this.render, this);
      this.render();
    },
    render: function() {
      this.$el.empty();
      var self = this;
      this.collection.each(function(user) {
        var userView = new UserView({
          model: user
        });
        self.$el.append(userView.el);
      });
    }
  });

  var SidebarView = Backbone.View.extend({
    el: $('.sidebar').first(),
    model: appModel,
    initialize: function() {
      this.model.on('change', this.render, this);
    },
    render: function() {
      var source = $('#SidebarTemplate').html();
      var template = Handlebars.compile(source);
      var html = template(this.model.get('currentItem').toJSON());
      this.$el.html(html);
    }
  });

  var MainContentView = Backbone.View.extend({
    el: $('.main_content').first(),
    model: appModel,
    initialize: function() {
      this.model.on('change', this.render, this);
    },
    render: function() {
      var source = $('#MainContentTemplate').html();
      var template = Handlebars.compile(source);
      var html = template(this.model.get('currentItem').toJSON());
      this.$el.html(html);
    }
  });

  var ControlsView = Backbone.View.extend({
    el: $('.controls').first(),
    model: appModel,
    initialize: function() {
      this.model.on('change', this.render, this);
    },
    render: function() {
      var source = $('#ControlsTemplate').html();
      var template = Handlebars.compile(source);

      var index = this.model.get('currentItemIndex');
      var userList = this.model.get('userList').toJSON();
      //Навигация по карточкам
      var obj = {
        next: index + 1 < userList.length ? userList[index+1].id : false,
        current: index + 1,
        prev: index > 0 ? userList[index - 1].id : false
      };
      var html = template(obj);
      this.$el.html(html);
    }
  });

  var App = Backbone.Router.extend({
    initialize: function() {
      appModel.get('userList').fetch({
        success: function() {
          new UserListView();
          new ControlsView();
          new SidebarView();
          new MainContentView();
          Backbone.history.start();
        }
      });
    },
    routes: {
      "": "start",
      "id:id": "show"
    },
    start: function() {
      // По условиям, по умолчанию активен должен быть второй элемент, его и выбираем
      var el = appModel.get('userList').toJSON()[1];
      this.navigate("id" + el.id, {
        trigger: true
      });
    },
    show: function(id) {
      var prevItem;
      if (prevItem = appModel.get('currentItem')) {
        prevItem.set('active', false)
      }
      var userList = appModel.get('userList');
      var currentItem = userList.findWhere({
        id: +id
      });
      var currentItemIndex = userList.indexOf(currentItem);
      currentItem.set('active', true);
      appModel.set({
        currentItem: currentItem,
        currentItemIndex: currentItemIndex
      });
    }
  });
  var app = new App();
});
