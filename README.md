<p align="center">
  <a href="" rel="noopener">
    <img src="assets/muf.png" alt="Project logo"></a>
</p>

<div align="center">
<h3 align="center">Ask.Discuss.Answer</h3>

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/nikFinogenov/usofe-back.svg)](https://github.com/nikFinogenov/usofe-back/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/nikFinogenov/usofe-back.svg)](https://github.com/nikFinogenov/usofe-back/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center" style="font-size: 25px;">
    <b>A platform where users can ask questions and provide answers on various topics.</b>
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Built Using](#built_using)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

Muffin is a Q&A forum designed to facilitate discussions and knowledge sharing on various topics. Users can ask questions, provide answers, and engage with each other in a supportive community. The project aims to create an easy-to-use platform that encourages learning and collaboration.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will help you set up a local development environment for Muffin.

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v20 or higher)
- npm (Node Package Manager)
- A database (Postgres)
You can verify the installation and versions by running:

```bash
node -v
npm -v
psql --version
```

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/nikFinogenov/usofe-back
   ```

2. Navigate to the project directory:

   ```bash
   cd usofe-back
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file and fill in your environment variables.

   You need to set up these variables:

   > **These are necessary variables, server won't start without them**
   >
   > > - JWT_SECRET - secret for token
   > > - EMAIL_USER - email from which confirmations will be sent
   > > - EMAIL_PASS - password for EMAIL_USER (Not password for account, need [App password](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237))

   ***

   > **These are variables for database init. Add them only if default values does not work for you.**
   >
   > > - PG_USER - role name of postgres (default value is `postgres`)
   > > - PG_PASS - password for PG_USER (default value is `null`)
   > > - PG_HOST - postgres host address (default value is `localhost`)
   > > - PG_PORT - database port (default value is `5432`)

5. Start the application:

   ```bash
   npm start
   ```

Now, API should be running on `http://localhost:3306`.

## ⛏️ Built Using <a name = "built_using"></a>

- [PostgreSQL](https://www.postgresql.org) - Database
- [Sequelize](https://sequelize.org) - ORM
- [Express](https://expressjs.com/) - Server Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment
- [Postman](https://www.postman.com) - API testing Software
- [AdminJS](https://adminjs.co) - Admin panel

## ✍️ Authors <a name = "authors"></a>

- [@nikFinogenov](https://github.com/nikFinogenov) - Idea & Initial work

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Why project is named Muffin will be revealed in front end part.
