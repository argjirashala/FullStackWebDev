describe("Bloglist app", function () {
  const user = {
    name: "Miri Shala",
    username: "miri",
    password: "miri1234",
  };

  beforeEach(function () {
    cy.request("POST", `http://localhost:3003/api/testing/reset`);
    cy.request("POST", `http://localhost:3003/api/users`, user);
    cy.visit("http://localhost:5173");
  });

  it("Login form is shown", function () {
    cy.contains("Log in to application").should("be.visible");

    cy.get('input[name="Username"]').should("be.visible");
    cy.get('input[name="Password"]').should("be.visible");

    cy.contains("button", "Login").should("be.visible");
  });

  describe("Login", function () {
    it("succeeds with correct credentials", function () {
      cy.get('input[name="Username"]').type("miri");
      cy.get('input[name="Password"]').type("miri1234");
      cy.get("#login-button").click();

      cy.contains(`${user.name} logged in`);
    });

    it("fails with wrong credentials", function () {
      cy.get('input[name="Username"]').type("miri");
      cy.get('input[name="Password"]').type("wrongpassword");
      cy.get("#login-button").click();

      cy.contains("Wrong username or password")
        .should("have.css", "color", "rgb(255, 0, 0)")
        .and("have.css", "background-color", "rgb(248, 215, 218)");
    });
  });
  describe("When logged in", function () {
    const newBlog = {
      title: "New Blog",
      author: "Author 1",
      url: "http://newBlog.com",
      likes: 0,
    };

    beforeEach(function () {
      cy.login({
        username: "miri",
        password: "miri1234",
      });
    });

    it("a blog can be created", function () {
      cy.contains("new blog").click();

      cy.get('input[placeholder="Enter title"]').type("New Blog");
      cy.get('input[placeholder="Enter author"]').type("Author 1");
      cy.get('input[placeholder="Enter URL"]').type("http://newBlog.com");
      cy.contains("button", "create").click();

      cy.contains(`A new blog "New Blog" by Author 1 added`);
      cy.contains("New Blog Author 1");
    });

    it("a blog can be liked", function () {
      cy.createBlog(newBlog);
      cy.contains(newBlog.title)
        .parent()
        .find("button")
        .contains("view")
        .click();
      cy.contains("like").click();
      cy.contains("likes 1");
    });
    it("a blog can be deleted by the creator", function () {
      cy.createBlog(newBlog);
      cy.contains(newBlog.title)
        .parent()
        .find("button")
        .contains("view")
        .click();
      cy.contains("button", "remove").click();
      cy.contains("New Blog Author 1").should("not.exist");
    });

    it("only the creator can see the remove button", function () {
      cy.createBlog(newBlog);

      cy.contains(newBlog.title)
        .parent()
        .find("button")
        .contains("view")
        .click();
      cy.contains("button", "remove").should("be.visible");

      const testUser = {
        name: "User",
        username: "user",
        password: "password",
      };

      cy.request("POST", `http://localhost:3003/api/users`, testUser);

      cy.login({
        username: "user",
        password: "password",
      });

      cy.contains("New Blog").parent().find("button").contains("view").click();
      cy.contains("button", "remove").should("not.exist");
    });
    it("blogs are ordered by likes in descending order", function () {
      const blogOne = {
        title: "Example Blog One",
        author: "Example Author One",
        url: "http://exampleblog1.com",
        likes: 1,
      };
      const blogTwo = {
        title: "Example Blog Two",
        author: "Example Author Two",
        url: "http://exampleblog2.com",
        likes: 2,
      };
      const blogThree = {
        title: "Example Blog Three",
        author: "Example Author Three",
        url: "http://exampleblog3.com",
        likes: 3,
      };

      const blogFour = {
        title: "Example Blog Four",
        author: "Example Author Four",
        url: "http://exampleblog4.com",
        likes: 4,
      };

      cy.createBlog(blogOne);
      cy.createBlog(blogTwo);
      cy.createBlog(blogThree);
      cy.createBlog(blogFour);

      cy.get(".blog")
        .eq(0)
        .should("contain", "Example Blog Four Example Author Four");
      cy.get(".blog")
        .eq(1)
        .should("contain", "Example Blog Three Example Author Three");
      cy.get(".blog")
        .eq(2)
        .should("contain", "Example Blog Two Example Author Two");
      cy.get(".blog")
        .eq(3)
        .should("contain", "Example Blog One Example Author One");

      cy.get(".blog").eq(1).find("button").contains("view").click();
      cy.contains("like").click();
      cy.contains("like").click();
      cy.contains("likes 4");

      cy.get(".blog")
        .eq(0)
        .should("contain", "Example Blog Three Example Author Three");
      cy.get(".blog")
        .eq(1)
        .should("contain", "Example Blog Four Example Author Four");
      cy.get(".blog")
        .eq(2)
        .should("contain", "Example Blog Two Example Author Two");
      cy.get(".blog")
        .eq(3)
        .should("contain", "Example Blog One Example Author One");
    });
  });
});
