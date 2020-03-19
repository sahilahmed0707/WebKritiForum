# WebKritiForum



You have to know SQL, Javascript, HTML, CSS and a server-side language.

Simple forum generally consists of navigation links and data stored in a database. First you determine what database you want to use - I have experience with MySQL, but I advise you to try PostgreSQL first. Then you choose what language to use for back-end, e.g., Ruby on Rails, Grails, PHP…

Then you create your forum structure (navigation, directories, sections, forms) using HTML and CSS. I suppose you know that.

Create a user account system for registering and logging users. It must be safe from malicious input (SQL injections); create a system for making and displaying forum topics and sections.

When you have implemented topic system, make sure that users can’t post malicious code (cross-site scripting) - your chosen back-end language should have tools for that. Security always goes first.

You will have to implement user permission system - define user groups and what are they allowed to do on your forum.

Create a account recovery system - in case when user forgets his password. At this point you will need to choose and configure an email server or transfer agent - that would be a whole another topic to cover.

Then you should create a forum administration system - basically, webpages accessible only for forum staff which does important stuff, e.g., blocking users, IP addresses, changing group permissions, uploading files on the server.

These are the basics - you will need to do an extensive research on lots of things. But if you succeed, you will have a forum which you can fully control and not depending on some frameworks.
