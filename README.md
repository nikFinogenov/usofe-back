<p align="center">
  <a href="" rel="noopener">
    <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p>

<h1 align="center">Muffin</h1>
<h3 align="center">Q&A Forum</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center">A platform where users can ask questions and provide answers on various topics.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

Muffin is a Q&A forum designed to facilitate discussions and knowledge sharing on various topics. Users can ask questions, provide answers, and engage with each other in a supportive community. The project aims to create an easy-to-use platform that encourages learning and collaboration.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will help you set up a local development environment for Muffin.

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A database (Postgres)

### Installing

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/muffin.git
    ```

2. Navigate to the project directory:

    ```bash
    cd muffin
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file based on the `.env.example` and fill in your environment variables.

5. Start the application:

    ```bash
    npm run dev
    ```

Now, your application should be running on `http://localhost:3306`.

## 🔧 Running the tests <a name = "tests"></a>

To run the automated tests for this project, use the following command:

```bash
npm test
